import { Router } from "express";
import {
  loginController,
  RegisterController,
} from "../controllers/auth.controllers.js";
import {
  googleAuth,
  googleCallback,
} from "../controllers/google-auth.controllers.js";

export const authRouter = Router();

authRouter.post("/login", loginController);

authRouter.post("/register", RegisterController);

authRouter.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logout successful" });
    });
  });
});

authRouter.get("/google", googleAuth);
authRouter.get("/google/callback", googleCallback);
