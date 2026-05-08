import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";

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
import staffRouter    from "./routes/staff.routes.js";
import auditRouter    from "./routes/auditLog.routes.js";
import settingsRouter from "./routes/settings.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import userRouter         from "./routes/user.routes.js";


import { connect } from "./db.js";
import User from "./models/user.model.js";
import { SESSION_SECRET } from "./configs/.env.configs.js";

const app = express();
const port = 3000;

const startServer = async () => {
  await connect();

  // =========================
  // 1. CORS (ONLY ONCE)
  // =========================
  app.use(
    cors({
      origin: ["http://localhost:5173", "http://localhost:8080"],
      credentials: true,
    })
  );

  // =========================
  // 2. BODY PARSERS
  // =========================
  app.use(express.json({
    // This 'verify' function is the key. It captures the raw 
    // bytes before Express turns them into a JavaScript object.
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }));
  app.use(express.urlencoded({ extended: true }));

  // =========================
  // 3. SESSION
  // =========================
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      name: "connect.sid",
      cookie: {
        maxAge: 60 * 60 * 1000, // 1 hour
        sameSite: "lax",
        secure: false, // set true in production (HTTPS)
        httpOnly: true,
      },
    })
  );

  // =========================
  // 4. PASSPORT (ONLY ONCE)
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
  // 5. ROUTES
  // =========================
  app.get("/", (req, res) => {
    res.send("server side is working");
  });

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
  app.use("/api/v1/staff",    staffRouter);
app.use("/api/v1/audit",    auditRouter);
app.use("/api/v1/settings", settingsRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/user",          userRouter);
  // =========================
  // 6. START SERVER
  // =========================
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
};

startServer();