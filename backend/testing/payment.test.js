import request from "supertest";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import express from "express";
import session from "express-session";
import passport from "passport";
import mongoose from "mongoose";
import crypto from "crypto";

import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Payment from "../models/payment.model.js";
import Variant from "../models/variant.model.js";
import paymentRouter from "../routes/payment.routes.js";

// ── Build app ─────────────────────────────────────────────────────────────────
const buildApp = (user) => {
  const app = express();

  // Raw body needed for webhook signature verification
  app.use(express.json({
    verify: (req, res, buf) => { req.rawBody = buf; },
  }));

  app.use(session({
    secret: "test-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  if (user) {
    app.use((req, res, next) => { req.user = user; next(); });
  }

  app.use("/api/v1/payment", paymentRouter);
  return app;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const createTestUser = async () => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hashed = await new Promise((resolve, reject) => {
    crypto.pbkdf2("password123", salt, 310000, 32, "sha256", (err, hash) => {
      if (err) reject(err);
      else resolve(hash.toString("hex"));
    });
  });
  return User.create({
    username: `payuser_${Date.now()}`,
    email: `payuser_${Date.now()}@example.com`,
    hashed_password: hashed,
    salt,
    role: "user",
  });
};

const createTestOrder = async (userId, status = "pending") => {
  const variant = await Variant.create({
    product: new mongoose.Types.ObjectId(),
    sku: `SKU-PAY-${Date.now()}`,
    price: 50000,
    stock: 10,
    is_active: true,
  });

  return Order.create({
    order_number: `ORD-PAY-${Date.now()}`,
    user: userId,
    items: [{ variant: variant._id, product: variant.product, quantity: 1, unit_price: 50000 }],
    status,
    payment_status: "unpaid",
    payment_method: "paystack",
    subtotal: 50000,
    shipping_fee: 2000,
    total: 52000,
    fulfillment_type: "delivery",
  });
};

// ── Webhook signature helper ──────────────────────────────────────────────────
const signWebhookPayload = (payload, secret) => {
  return crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(payload))
    .digest("hex");
};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("Payment — Initialize", () => {
  it("should return 400 when orderId is missing", async () => {
    const user = await createTestUser();
    const app = buildApp(user);

    const res = await request(app)
      .post("/api/v1/payment/initialize")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/order id is required/i);
  });

  it("should return 404 when order does not exist", async () => {
    const user = await createTestUser();
    const app = buildApp(user);

    const res = await request(app)
      .post("/api/v1/payment/initialize")
      .send({ orderId: new mongoose.Types.ObjectId() });

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/order not found/i);
  });

  it("should return 403 when user tries to pay for another user's order", async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const order = await createTestOrder(user1._id);
    const app = buildApp(user2); // user2 tries to pay for user1's order

    const res = await request(app)
      .post("/api/v1/payment/initialize")
      .send({ orderId: order._id });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/unauthorized/i);
  });

  it("should return 400 when order is already paid", async () => {
    const user = await createTestUser();
    const order = await createTestOrder(user._id);

    // Mark as paid
    await Order.findByIdAndUpdate(order._id, { payment_status: "paid" });

    const app = buildApp(user);
    const res = await request(app)
      .post("/api/v1/payment/initialize")
      .send({ orderId: order._id });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already been paid/i);
  });
});

describe("Payment — Verify", () => {
  it("should return 404 for unknown reference", async () => {
    const user = await createTestUser();
    const app = buildApp(user);

    const res = await request(app)
      .get("/api/v1/payment/verify/FAKE-REF-999");

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  it("should return 403 when user tries to verify another user's payment", async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const order = await createTestOrder(user1._id);

    await Payment.create({
      payment_number: "PAY-001",
      order: order._id,
      user: user1._id,
      amount: 52000,
      reference: "TEST-REF-001",
      payment_method: "paystack",
      status: "pending",
    });

    const app = buildApp(user2); // user2 tries to verify user1's payment
    const res = await request(app)
      .get("/api/v1/payment/verify/TEST-REF-001");

    expect(res.status).toBe(403);
  });

  it("should return already confirmed for successful payment", async () => {
    const user = await createTestUser();
    const order = await createTestOrder(user._id);

    await Payment.create({
      payment_number: "PAY-002",
      order: order._id,
      user: user._id,
      amount: 52000,
      reference: "TEST-REF-002",
      payment_method: "paystack",
      status: "success", // already successful
    });

    const app = buildApp(user);
    const res = await request(app)
      .get("/api/v1/payment/verify/TEST-REF-002");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.message).toMatch(/already confirmed/i);
  });
});

describe("Payment — Webhook", () => {
  const PAYSTACK_SECRET = "test-paystack-secret";

  beforeEach(() => {
    process.env.PAYSTACK_SECRET_KEY = PAYSTACK_SECRET;
  });

  it("should reject webhook with no signature header", async () => {
    const app = buildApp();

    const res = await request(app)
      .post("/api/v1/payment/webhook")
      .send({ event: "charge.success" });
      // No x-paystack-signature header

    expect(res.status).toBe(400);
    expect(res.text).toMatch(/missing signature/i);
  });

  it("should reject webhook with wrong signature", async () => {
    const app = buildApp();
    const payload = { event: "charge.success", data: { reference: "REF-001" } };

    const res = await request(app)
      .post("/api/v1/payment/webhook")
      .set("x-paystack-signature", "wrongsignature")
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.text).toMatch(/invalid signature/i);
  });

  it("should accept webhook with correct signature", async () => {
    const app = buildApp();
    const payload = { event: "charge.success", data: { reference: "REF-VALID" } };
    const signature = signWebhookPayload(payload, PAYSTACK_SECRET);

    const res = await request(app)
      .post("/api/v1/payment/webhook")
      .set("x-paystack-signature", signature)
      .send(payload);

    // Returns 200 immediately even if payment not found (async processing)
    expect(res.status).toBe(200);
  });

  it("should mark payment and order as paid on charge.success", async () => {
    const user = await createTestUser();
    const order = await createTestOrder(user._id);

    const payment = await Payment.create({
      payment_number: "PAY-HOOK-001",
      order: order._id,
      user: user._id,
      amount: 52000,
      reference: "WEBHOOK-REF-001",
      payment_method: "paystack",
      status: "pending",
    });

    const app = buildApp();
    const payload = {
      event: "charge.success",
      data: {
        reference: "WEBHOOK-REF-001",
        channel: "card",
      },
    };
    const signature = signWebhookPayload(payload, PAYSTACK_SECRET);

    await request(app)
      .post("/api/v1/payment/webhook")
      .set("x-paystack-signature", signature)
      .send(payload);

    // Give async processing a moment
    await new Promise((r) => setTimeout(r, 200));

    const updatedPayment = await Payment.findById(payment._id);
    const updatedOrder = await Order.findById(order._id);

    expect(updatedPayment.status).toBe("success");
    expect(updatedOrder.payment_status).toBe("paid");
    expect(updatedOrder.status).toBe("confirmed");
  });

  it("should mark payment as failed on charge.failed", async () => {
    const user = await createTestUser();
    const order = await createTestOrder(user._id);

    const payment = await Payment.create({
      payment_number: "PAY-HOOK-002",
      order: order._id,
      user: user._id,
      amount: 52000,
      reference: "WEBHOOK-REF-002",
      payment_method: "paystack",
      status: "pending",
    });

    const app = buildApp();
    const payload = {
      event: "charge.failed",
      data: { reference: "WEBHOOK-REF-002" },
    };
    const signature = signWebhookPayload(payload, PAYSTACK_SECRET);

    await request(app)
      .post("/api/v1/payment/webhook")
      .set("x-paystack-signature", signature)
      .send(payload);

    await new Promise((r) => setTimeout(r, 200));

    const updatedPayment = await Payment.findById(payment._id);
    expect(updatedPayment.status).toBe("failed");
  });

  it("should not process charge.success twice — idempotent", async () => {
    const user = await createTestUser();
    const order = await createTestOrder(user._id);

    await Payment.create({
      payment_number: "PAY-HOOK-003",
      order: order._id,
      user: user._id,
      amount: 52000,
      reference: "WEBHOOK-REF-003",
      payment_method: "paystack",
      status: "success", // already successful
    });

    const app = buildApp();
    const payload = {
      event: "charge.success",
      data: { reference: "WEBHOOK-REF-003", channel: "card" },
    };
    const signature = signWebhookPayload(payload, PAYSTACK_SECRET);

    const res = await request(app)
      .post("/api/v1/payment/webhook")
      .set("x-paystack-signature", signature)
      .send(payload);

    expect(res.status).toBe(200); // still accepts but does nothing
    // Order stays unpaid since webhook should have skipped processing
    const unchangedOrder = await Order.findById(order._id);
    expect(unchangedOrder.payment_status).toBe("unpaid");
  });
});

describe("Payment — Get Status", () => {
  it("should return 404 for unknown reference", async () => {
    const user = await createTestUser();
    const app = buildApp(user);

    const res = await request(app)
      .get("/api/v1/payment/status/UNKNOWN-REF");

    expect(res.status).toBe(404);
  });

  it("should return 403 when accessing another user's payment", async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const order = await createTestOrder(user1._id);

    await Payment.create({
      payment_number: "PAY-STATUS-001",
      order: order._id,
      user: user1._id,
      amount: 52000,
      reference: "STATUS-REF-001",
      payment_method: "paystack",
      status: "pending",
    });

    const app = buildApp(user2);
    const res = await request(app)
      .get("/api/v1/payment/status/STATUS-REF-001");

    expect(res.status).toBe(403);
  });
});