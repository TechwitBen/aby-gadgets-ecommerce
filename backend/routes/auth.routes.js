import { Router } from "express";
import {
  googleAuth,
  googleCallback,
  loginController,
  RegisterController,
} from "../controllers/auth.controllers.js";

export const authRouter = Router();

authRouter.post("/login", loginController);

authRouter.post("/register", RegisterController);

authRouter.get("/google", googleAuth);
authRouter.get("/google/callback", googleCallback);
