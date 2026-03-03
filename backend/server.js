import express from "express";
// import morgan from "morgan";
import { authRouter } from "./routes/auth.routes.js";
import productRouter from "./routes/product.routes.js";
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

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(passport.initialize());
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    }),
  );
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
        domain: "localhost",
      },
    }),
  );

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

  app.get("/", (req, res) => {
    res.send("server side is working");
  });

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/product", productRouter);

  app.listen(port, () => {
    console.log(`server is running on localhost ${port}`);
  });
};

startServer();
