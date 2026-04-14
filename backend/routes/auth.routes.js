import { Router } from "express";
import {
  loginController,
  RegisterController,
  forgotPassword,
   resetPassword,
   getCurrentUserController
} from "../controllers/auth.controllers.js";
import {
  googleAuth,
  googleCallback,
} from "../controllers/google-auth.controllers.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";


export const authRouter = Router();

authRouter.post("/login", loginController);

authRouter.post("/register", RegisterController);

authRouter.post("/logout", (req, res) => {

   if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
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
// Add this line with the other routes
authRouter.get("/me", isAuthenticated, getCurrentUserController);

authRouter.get("/google", googleAuth);
authRouter.get("/google/callback", googleCallback);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:token", resetPassword);
