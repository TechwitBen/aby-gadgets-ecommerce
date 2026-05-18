import "./configs/.env.configs.js";


const required = [
  "MONGODB_URI",
  "SESSION_SECRET",
  "PAYSTACK_SECRET_KEY",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import helmet from "helmet";
import MongoStore from "connect-mongo";
import rateLimit from "express-rate-limit";

import { authRouter } from "./routes/auth.routes.js";
import orderRouter from "./routes/orders.routes.js";
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";
import checkoutRouter from "./routes/checkout.routes.js";
import reviewRouter from "./routes/review.routes.js";
import variantRouter from "./routes/variant.routes.js";
import wishlistRouter from "./routes/wishlist.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import contactRouter from "./routes/contact.routes.js";
import staffRouter from "./routes/staff.routes.js";
import auditRouter from "./routes/auditLog.routes.js";
import settingsRouter from "./routes/settings.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import userRouter from "./routes/user.routes.js";

import { connect } from "./db.js";
import User from "./models/user.model.js";

const app = express();

const startServer = async () => {
  await connect();

  // =========================
  // 1. SECURITY HEADERS
  // =========================
  app.use(helmet());

  // =========================
  // 2. CORS
  // =========================
  const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim().replace(/\/$/, ""))
  : ["http://localhost:5173", "http://localhost:8080"];
  app.use(cors({ origin: allowedOrigins, credentials: true }));

  // =========================
  // 3. RATE LIMITING
  // =========================
  app.set("trust proxy", 1);

  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later." },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many login attempts, please try again later." },
  });

  app.use("/api/v1/", generalLimiter);
  app.use("/api/v1/auth/login", authLimiter);
  app.use("/api/v1/auth/register", authLimiter);

  // =========================
  // 4. BODY PARSERS
  // =========================
  app.use(express.json({
    verify: (req, res, buf) => { req.rawBody = buf; },
  }));
  app.use(express.urlencoded({ extended: true }));

  // =========================
  // 5. SESSION
  // =========================
  app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: "connect.sid",
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "sessions",   // optional, defaults to "sessions"
    ttl: 60 * 60,                 // matches your cookie maxAge (1 hour, in seconds)
    autoRemove: "native",         // lets MongoDB TTL index handle cleanup
  }),
  cookie: {
    maxAge: 60 * 60 * 1000,       // 1 hour in ms
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  },
}));
  // =========================
  // 6. PASSPORT
  // =========================
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).lean();
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // =========================
  // 7. ROUTES
  // =========================
  app.get("/", (req, res) => res.send("server side is working"));

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/products", productRouter);
  app.use("/api/v1/orders", orderRouter);
  app.use("/api/v1/cart", cartRouter);
  app.use("/api/v1/payment", paymentRouter);
  app.use("/api/v1/reviews", reviewRouter);
  app.use("/api/v1/checkout", checkoutRouter);
  app.use("/api/v1/wishlist", wishlistRouter);
  app.use("/api/v1/variants", variantRouter);
  app.use("/api/v1/contact", contactRouter);
  app.use("/api/v1/staff", staffRouter);
  app.use("/api/v1/audit", auditRouter);
  app.use("/api/v1/settings", settingsRouter);
  app.use("/api/v1/notifications", notificationRouter);
  app.use("/api/v1/user", userRouter);

  // =========================
  // 8. GLOBAL ERROR HANDLER
  // =========================
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      success: false,
      message: process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
    });
  });

  // =========================
  // 9. START SERVER
  // =========================
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();