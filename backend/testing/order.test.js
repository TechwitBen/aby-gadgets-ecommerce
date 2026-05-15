import request from "supertest";
import { describe, it, expect, beforeEach } from "@jest/globals";
import express from "express";
import session from "express-session";
import passport from "passport";
import mongoose from "mongoose";
import crypto from "crypto";

import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Variant from "../models/variant.model.js";
import Order from "../models/order.model.js";
import orderRouter from "../routes/orders.routes.js";

// ── Build app ─────────────────────────────────────────────────────────────────
const buildApp = (user) => {
  const app = express();
  app.use(express.json());
  app.use(session({
    secret: "test-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  // Inject user for all requests in tests
  if (user) {
    app.use((req, res, next) => { req.user = user; next(); });
  }

  app.use("/api/v1/orders", orderRouter);
  return app;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const createTestUser = async (role = "user") => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hashed = await new Promise((resolve, reject) => {
    crypto.pbkdf2("password123", salt, 310000, 32, "sha256", (err, hash) => {
      if (err) reject(err);
      else resolve(hash.toString("hex"));
    });
  });
  return User.create({
    username: `user_${Date.now()}`,
    email: `user_${Date.now()}@example.com`,
    hashed_password: hashed,
    salt,
    role,
  });
};

const createTestVariant = async (stock = 10) => {
  const product = await Product.create({
    name: "Test Phone",
    slug: `test-phone-${Date.now()}`,
    description: "A test product",
    category: "phones",
    images: ["test.jpg"],
  });

  const variant = await Variant.create({
    product: product._id,
    sku: `SKU-${Date.now()}`,
    price: 50000,
    stock,
    is_active: true,
    color: "Black",
    storage: "128GB",
  });

  return { product, variant };
};

const validShippingAddress = {
  full_name: "John Doe",
  phone: "08012345678",
  street: "123 Test Street",
  city: "Lagos",
  state: "Lagos",
  country: "Nigeria",
  postal_code: "",
};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("Orders — Create Order", () => {
  it("should reject order with no items", async () => {
    const user = await createTestUser();
    const app = buildApp(user);

    const res = await request(app)
      .post("/api/v1/orders")
      .send({
        orderItems: [],
        shipping_address: validShippingAddress,
        paymentMethod: "paystack",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/no order items/i);
  });

  it("should reject order when variant does not exist", async () => {
    const user = await createTestUser();
    const app = buildApp(user);

    const res = await request(app)
      .post("/api/v1/orders")
      .send({
        orderItems: [{ variant: new mongoose.Types.ObjectId(), quantity: 1 }],
        shipping_address: validShippingAddress,
        paymentMethod: "paystack",
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/variant not found/i);
  });

  it("should reject order when quantity exceeds stock", async () => {
    const user = await createTestUser();
    const { variant } = await createTestVariant(2); // only 2 in stock
    const app = buildApp(user);

    const res = await request(app)
      .post("/api/v1/orders")
      .send({
        orderItems: [{ variant: variant._id, quantity: 5 }], // requesting 5
        shipping_address: validShippingAddress,
        paymentMethod: "paystack",
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/insufficient stock/i);
  });

  it("should create order successfully and reduce stock", async () => {
    const user = await createTestUser();
    const { variant } = await createTestVariant(10);
    const app = buildApp(user);

    const res = await request(app)
      .post("/api/v1/orders")
      .send({
        orderItems: [{ variant: variant._id, quantity: 2 }],
        shipping_address: validShippingAddress,
        paymentMethod: "paystack",
        fulfillment_type: "delivery",
        delivery_city: "Lagos",
        shipping_fee: 2000,
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("pending");
    expect(res.body.payment_status).toBe("unpaid");

    // Verify stock was reduced
    const updatedVariant = await Variant.findById(variant._id);
    expect(updatedVariant.stock).toBe(8); // 10 - 2
  });

  it("should create pickup order with pickup code", async () => {
    const user = await createTestUser();
    const { variant } = await createTestVariant(10);
    const app = buildApp(user);

    const res = await request(app)
      .post("/api/v1/orders")
      .send({
        orderItems: [{ variant: variant._id, quantity: 1 }],
        shipping_address: { full_name: "John Doe", phone: "08012345678" },
        paymentMethod: "pod",
        fulfillment_type: "pickup",
        pickup_location: "Store Address, Lagos",
      });

    expect(res.status).toBe(201);
    expect(res.body.fulfillment_type).toBe("pickup");
    expect(res.body.pickup_code).toMatch(/^PKP-/); // pickup code generated
    expect(res.body.shipping_fee).toBe(0); // pickup is always free
  });
});

describe("Orders — Get My Orders", () => {
  it("should return only the logged in user's orders", async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const { variant } = await createTestVariant(10);

    // Create order for user1
    await Order.create({
      order_number: "ORD-001",
      user: user1._id,
      items: [{ variant: variant._id, product: variant.product, quantity: 1, unit_price: 50000 }],
      status: "pending",
      payment_status: "unpaid",
      payment_method: "paystack",
      subtotal: 50000,
      shipping_fee: 0,
      total: 50000,
      fulfillment_type: "pickup",
    });

    // user2 should not see user1's orders
    const app = buildApp(user2);
    const res = await request(app).get("/api/v1/orders/my-orders");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  it("should return user's own orders", async () => {
    const user = await createTestUser();
    const { variant } = await createTestVariant(10);

    await Order.create({
      order_number: "ORD-002",
      user: user._id,
      items: [{ variant: variant._id, product: variant.product, quantity: 1, unit_price: 50000 }],
      status: "pending",
      payment_status: "unpaid",
      payment_method: "paystack",
      subtotal: 50000,
      shipping_fee: 0,
      total: 50000,
      fulfillment_type: "pickup",
    });

    const app = buildApp(user);
    const res = await request(app).get("/api/v1/orders/my-orders");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].order_number).toBe("ORD-002");
  });
});

describe("Orders — Update Status (Admin)", () => {
  it("should update order status", async () => {
    const admin = await createTestUser("admin");
    const { variant } = await createTestVariant(10);

    const order = await Order.create({
      order_number: "ORD-003",
      user: admin._id,
      items: [{ variant: variant._id, product: variant.product, quantity: 1, unit_price: 50000 }],
      status: "pending",
      payment_status: "unpaid",
      payment_method: "paystack",
      subtotal: 50000,
      shipping_fee: 0,
      total: 50000,
      fulfillment_type: "delivery",
    });

    const app = buildApp(admin);
    const res = await request(app)
      .patch(`/api/v1/orders/${order._id}/status`)
      .send({ status: "confirmed" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("confirmed");
  });

  it("should restore stock when order is cancelled", async () => {
    const admin = await createTestUser("admin");
    const { variant } = await createTestVariant(10);

    const order = await Order.create({
      order_number: "ORD-004",
      user: admin._id,
      items: [{ variant: variant._id, product: variant.product, quantity: 3, unit_price: 50000 }],
      status: "confirmed",
      payment_status: "unpaid",
      payment_method: "paystack",
      subtotal: 150000,
      shipping_fee: 0,
      total: 150000,
      fulfillment_type: "delivery",
    });

    // Reduce stock manually to simulate it was already deducted
    await Variant.findByIdAndUpdate(variant._id, { stock: 7 }); // 10 - 3

    const app = buildApp(admin);
    await request(app)
      .patch(`/api/v1/orders/${order._id}/status`)
      .send({ status: "cancelled" });

    const updatedVariant = await Variant.findById(variant._id);
    expect(updatedVariant.stock).toBe(10); // stock restored
  });
});

describe("Orders — Get Order by ID", () => {
  it("should return 403 when user tries to view another user's order", async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const { variant } = await createTestVariant(10);

    const order = await Order.create({
      order_number: "ORD-005",
      user: user1._id,
      items: [{ variant: variant._id, product: variant.product, quantity: 1, unit_price: 50000 }],
      status: "pending",
      payment_status: "unpaid",
      payment_method: "paystack",
      subtotal: 50000,
      shipping_fee: 0,
      total: 50000,
      fulfillment_type: "pickup",
    });

    const app = buildApp(user2);
    const res = await request(app).get(`/api/v1/orders/${order._id}`);

    expect(res.status).toBe(403);
  });
});