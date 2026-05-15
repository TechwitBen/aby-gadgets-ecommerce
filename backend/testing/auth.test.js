import request from "supertest";
import { describe, it, expect, beforeEach } from "@jest/globals";
import express from "express";
import session from "express-session";
import passport from "passport";
import mongoose from "mongoose";
import crypto from "crypto";

import User from "../models/user.model.js";
import { authRouter } from "../routes/auth.routes.js";

// ── Build a minimal Express app for auth testing ──────────────────────────────
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

  app.use("/api/v1/auth", authRouter);
  return app;
};

// ── Helper: create a test user directly in DB ─────────────────────────────────
const createTestUser = async ({
  username = "testuser",
  email = "test@example.com",
  password = "password123",
  role = "user",
} = {}) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hashedPassword = await new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 310000, 32, "sha256", (err, hash) => {
      if (err) reject(err);
      else resolve(hash.toString("hex"));
    });
  });

  return User.create({
    username,
    email,
    hashed_password: hashedPassword,
    salt,
    role,
  });
};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("Auth — Register", () => {
  it("should register a new user successfully", async () => {
    const app = buildApp();
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ username: "newuser", email: "new@example.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Signup successful");
  });

  it("should reject registration with missing fields", async () => {
    const app = buildApp();
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ username: "newuser" }); // missing email and password

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject duplicate username", async () => {
    await createTestUser({ username: "existing", email: "existing@example.com" });
    const app = buildApp();

    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ username: "existing", email: "different@example.com", password: "password123" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/username already exists/i);
  });

  it("should reject duplicate email", async () => {
    await createTestUser({ username: "user1", email: "same@example.com" });
    const app = buildApp();

    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ username: "user2", email: "same@example.com", password: "password123" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/email already exists/i);
  });

  it("should always register as role user — never admin", async () => {
    const app = buildApp();
    await request(app)
      .post("/api/v1/auth/register")
      .send({ username: "hacker", email: "hacker@example.com", password: "password123", role: "admin" });

    const user = await User.findOne({ username: "hacker" });
    expect(user.role).toBe("user"); // role from body must be ignored
  });
});

describe("Auth — Login", () => {
  beforeEach(async () => {
    await createTestUser({ username: "loginuser", email: "login@example.com", password: "correctpassword" });
  });

  it("should login successfully with correct credentials", async () => {
    const app = buildApp();
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: "loginuser", password: "correctpassword" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.username).toBe("loginuser");
    expect(res.body.data.hashed_password).toBeUndefined(); // never expose password
  });

  it("should login with email instead of username", async () => {
    const app = buildApp();
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: "login@example.com", password: "correctpassword" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should reject wrong password", async () => {
    const app = buildApp();
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: "loginuser", password: "wrongpassword" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject non-existent user", async () => {
    const app = buildApp();
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: "nobody", password: "password123" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("Auth — Get Current User", () => {
  it("should return 401 when not logged in", async () => {
    const app = buildApp();
    const res = await request(app).get("/api/v1/auth/current-user");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return user when logged in", async () => {
    await createTestUser({ username: "sessionuser", email: "session@example.com", password: "password123" });
    const app = buildApp();
    const agent = request.agent(app); // agent keeps cookies between requests

    await agent
      .post("/api/v1/auth/login")
      .send({ username: "sessionuser", password: "password123" });

    const res = await agent.get("/api/v1/auth/current-user");
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe("sessionuser");
  });
});

describe("Auth — Logout", () => {
  it("should logout successfully", async () => {
    await createTestUser({ username: "logoutuser", email: "logout@example.com", password: "password123" });
    const app = buildApp();
    const agent = request.agent(app);

    await agent
      .post("/api/v1/auth/login")
      .send({ username: "logoutuser", password: "password123" });

    const res = await agent.post("/api/v1/auth/logout");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Confirm session is gone
    const check = await agent.get("/api/v1/auth/current-user");
    expect(check.status).toBe(401);
  });
});

describe("Auth — Password Reset", () => {
  it("should return 200 even if email does not exist — no email enumeration", async () => {
    const app = buildApp();
    const res = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: "doesnotexist@example.com" });

    expect(res.status).toBe(200); // must not reveal if email exists
  });

  it("should reject reset with token that does not exist", async () => {
    const app = buildApp();
    const res = await request(app)
      .post("/api/v1/auth/reset-password/faketokenvalue")
      .send({ password: "newpassword123" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid or has expired/i);
  });

  it("should reject reset with password shorter than 8 characters", async () => {
    const app = buildApp();
    const res = await request(app)
      .post("/api/v1/auth/reset-password/anytoken")
      .send({ password: "short" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/8 characters/i);
  });
});