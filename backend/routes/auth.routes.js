import { Router } from "express";
import {
  loginController,
  RegisterController,
} from "../controllers/auth.controllers.js";

export const authRouter = Router();

authRouter.post("/login", loginController);

authRouter.post("/register", RegisterController);
