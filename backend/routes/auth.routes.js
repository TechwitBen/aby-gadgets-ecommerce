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



import { isAuthenticated, isAdmin, isAdminOrStaff,checkPermission } from "../middlewares/auth.middleware.js";

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

authRouter.get(
  "/users",
  isAuthenticated,
  isAdminOrStaff,
  checkPermission("customers", "viewCustomers"),
  getAllUsersController
);
// delete user (admin only)
authRouter.delete("/users/:id", isAuthenticated, isAdmin, deleteUserController);


authRouter.get("/facebook", facebookAuth);
authRouter.get("/facebook/callback", facebookAuthCallback);