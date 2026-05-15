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
import Cart from "../models/cart.model.js";
import cartRouter from "../routes/cart.routes.js";

// ── Build minimal app ─────────────────────────────────────────────────────────
const buildApp = () => {
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

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).lean();
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.use("/api/v1/cart", cartRouter);
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
    username: "cartuser",
    email: "cart@example.com",
    hashed_password: hashed,
    salt,
    role: "user",
  });
};

const createTestProduct = async () => {
  const product = await Product.create({
    name: "Test Phone",
    slug: "test-phone",
    description: "A test phone",
    category: "phones",
    images: ["test.jpg"],
  });

  const variant = await Variant.create({
    product: product._id,
    sku: "TEST-SKU-001",
    price: 50000,
    stock: 10,
    is_active: true,
    color: "Black",
    storage: "128GB",
  });

  return { product, variant };
};

// ── Log in and return agent with session ──────────────────────────────────────
const loginAgent = async (app) => {
  const agent = request.agent(app);
  // Manually set req.user by injecting a middleware shortcut for tests
  return agent;
};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("Cart — Get Cart", () => {
  it("should return 401 when not authenticated", async () => {
    const app = buildApp();
    const res = await request(app).get("/api/v1/cart");
    expect(res.status).toBe(401);
  });
});

describe("Cart — Add Item", () => {
  it("should reject missing product or variant", async () => {
    const app = buildApp();
    const user = await createTestUser();

    // Inject user into session manually
    app.use((req, res, next) => { req.user = user; next(); });

    const res = await request(app)
      .post("/api/v1/cart/add")
      .send({ quantity: 1 }); // missing product and variant

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  it("should reject invalid ObjectId", async () => {
    const app = buildApp();
    const user = await createTestUser();
    app.use((req, res, next) => { req.user = user; next(); });

    const res = await request(app)
      .post("/api/v1/cart/add")
      .send({ product: "notanid", variant: "alsonotanid", quantity: 1 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it("should reject quantity less than 1", async () => {
    const app = buildApp();
    const { product, variant } = await createTestProduct();
    const user = await createTestUser();
    app.use((req, res, next) => { req.user = user; next(); });

    const res = await request(app)
      .post("/api/v1/cart/add")
      .send({ product: product._id, variant: variant._id, quantity: 0 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/quantity/i);
  });

  it("should reject quantity exceeding stock", async () => {
    const app = buildApp();
    const { product, variant } = await createTestProduct(); // stock = 10
    const user = await createTestUser();
    app.use((req, res, next) => { req.user = user; next(); });

    const res = await request(app)
      .post("/api/v1/cart/add")
      .send({ product: product._id, variant: variant._id, quantity: 99 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/stock/i);
  });

  it("should add item to cart successfully", async () => {
    const app = buildApp();
    const { product, variant } = await createTestProduct();
    const user = await createTestUser();
    app.use((req, res, next) => { req.user = user; next(); });

    const res = await request(app)
      .post("/api/v1/cart/add")
      .send({ product: product._id, variant: variant._id, quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].quantity).toBe(2);
  });

  it("should accumulate quantity when adding same variant twice", async () => {
    const app = buildApp();
    const { product, variant } = await createTestProduct();
    const user = await createTestUser();
    app.use((req, res, next) => { req.user = user; next(); });

    await request(app)
      .post("/api/v1/cart/add")
      .send({ product: product._id, variant: variant._id, quantity: 2, brand: "Test Brand",});

    const res = await request(app)
      .post("/api/v1/cart/add")
      .send({ product: product._id, variant: variant._id, quantity: 3 });

    expect(res.status).toBe(200);
    expect(res.body.items[0].quantity).toBe(5); // 2 + 3
  });
});

describe("Cart — Update Item", () => {
  it("should update item quantity", async () => {
    const app = buildApp();
    const { product, variant } = await createTestProduct();
    const user = await createTestUser();
    app.use((req, res, next) => { req.user = user; next(); });

    // Add first
    await request(app)
      .post("/api/v1/cart/add")
      .send({ product: product._id, variant: variant._id, quantity: 2 });

    // Update
    const res = await request(app)
      .put("/api/v1/cart/update")
      .send({ variant: variant._id, quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body.items[0].quantity).toBe(5);
  });

  it("should reject update with quantity less than 1", async () => {
    const app = buildApp();
    const { variant } = await createTestProduct();
    const user = await createTestUser();
    app.use((req, res, next) => { req.user = user; next(); });

    const res = await request(app)
      .put("/api/v1/cart/update")
      .send({ variant: variant._id, quantity: 0 });

    expect(res.status).toBe(400);
  });
});

describe("Cart — Remove Item", () => {
  it("should remove item from cart", async () => {
    const app = buildApp();
    const { product, variant } = await createTestProduct();
    const user = await createTestUser();
    app.use((req, res, next) => { req.user = user; next(); });

    await request(app)
      .post("/api/v1/cart/add")
      .send({ product: product._id, variant: variant._id, quantity: 1 });

    const res = await request(app)
      .delete(`/api/v1/cart/remove/${variant._id}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(0);
  });

  it("should return 404 when removing item not in cart", async () => {
    const app = buildApp();
    const { variant } = await createTestProduct();
    const user = await createTestUser();
    app.use((req, res, next) => { req.user = user; next(); });

    const res = await request(app)
      .delete(`/api/v1/cart/remove/${variant._id}`);

    expect(res.status).toBe(404);
  });
});

describe("Cart — Clear Cart", () => {
  it("should clear all items from cart", async () => {
    const app = buildApp();
    const { product, variant } = await createTestProduct();
    const user = await createTestUser();
    app.use((req, res, next) => { req.user = user; next(); });

    await request(app)
      .post("/api/v1/cart/add")
      .send({ product: product._id, variant: variant._id, quantity: 2 });

    const res = await request(app).delete("/api/v1/cart/clear");

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(0);
  });
});