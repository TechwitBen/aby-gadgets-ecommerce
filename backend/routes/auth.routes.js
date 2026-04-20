import { Router } from "express";

import {
  loginController,
  RegisterController,
  forgotPassword,
  resetPassword,
  getCurrentUserController,
  // bootstrapAdmin,
  promoteToAdmin,
  getAllUsersController,
  deleteUserController,
  logoutController,
} from "../controllers/auth.controllers.js";

import {
  googleAuth,
  googleCallback,
} from "../controllers/google-auth.controllers.js";

import { facebookAuth, facebookAuthCallback } from "../controllers/facebook.auth.js";



import { isAuthenticated, isAdmin } from "../middlewares/auth.middleware.js";

export const authRouter = Router();

// ─── Public ─────────────────────────────────────────────
authRouter.post("/register", RegisterController);
authRouter.post("/login", loginController);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:token", resetPassword);

// ─── Google OAuth ──────────────────────────────────────
authRouter.get("/google", googleAuth);
authRouter.get("/google/callback", googleCallback);

// ─── Authenticated ─────────────────────────────────────
authRouter.get("/me", isAuthenticated, getCurrentUserController);
authRouter.post("/logout", isAuthenticated, logoutController);

// ─── Admin Management ──────────────────────────────────

// bootstrap first admin (one-time)
// authRouter.post("/bootstrap-admin", bootstrapAdmin);

// promote user → admin
authRouter.post("/promote", isAuthenticated, isAdmin, promoteToAdmin);

// get all users (admin only)
authRouter.get("/users", isAuthenticated, isAdmin, getAllUsersController);

// delete user (admin only)
authRouter.delete("/:id", isAuthenticated, isAdmin, deleteUserController);


authRouter.get("/facebook", facebookAuth);
authRouter.get("/facebook/callback", facebookAuthCallback);