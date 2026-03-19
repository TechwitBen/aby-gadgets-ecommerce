import express from "express";
// import morgan from "morgan";
import { authRouter } from "./routes/auth.routes.js";
import orderRouter from "./routes/orders.routes.js";
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";
import checkoutRouter from "./routes/checkout.routes.js";
import reviewRouter from "./routes/review.routes.js";
import variantRouter from "./routes/variant.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import { connect } from "./db.js";
import User from "./models/user.model.js";
import passport from "passport";
import session from "express-session";
import cors from "cors";
import { SESSION_SECRET } from "./configs/.env.configs.js";

const app = express();

const port = 3000;

const startServer = async () => {
  await connect();

  // CRITICAL: Middleware order is important!
  
  // 1. CORS must come first (before session)
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );

  // 2. Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 3. Session MUST come before Passport
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      name: "connect.sid",
      cookie: {
        maxAge: 60 * 60 * 1000,
        sameSite: "lax",
        secure: false,
        httpOnly: true,
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    }),
  );

  // 4. Passport initialization (must come after session)
  app.use(passport.initialize());
  app.use(passport.session());

  // 5. Passport serialization
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

  // 6. Routes come last
  app.get("/", (req, res) => {
    res.send("server side is working");
  });

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/products", productRouter);
  app.use("/api/v1/orders", orderRouter);
  app.use("/api/v1/cart", cartRouter);
  app.use("/api/v1/payment", paymentRouter);
  app.use("/api/v1/review", reviewRouter);
  app.use("/api/v1/checkout", checkoutRouter);
  app.use("/api/v1/variant", variantRouter);

  app.listen(port, () => {
    console.log(`server is running on localhost ${port}`);
  });
};

startServer();