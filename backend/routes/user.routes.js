import { Router } from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const userRouter = Router();

// Profile
userRouter.get(   "/profile",                     isAuthenticated, getProfile);
userRouter.patch( "/profile",                     isAuthenticated, updateProfile);
userRouter.patch( "/change-password",             isAuthenticated, changePassword);

// Addresses
userRouter.get(   "/addresses",                   isAuthenticated, getAddresses);
userRouter.post(  "/addresses",                   isAuthenticated, addAddress);
userRouter.put(   "/addresses/:addrId",           isAuthenticated, updateAddress);
userRouter.delete("/addresses/:addrId",           isAuthenticated, deleteAddress);
userRouter.patch( "/addresses/:addrId/default",   isAuthenticated, setDefaultAddress);

// Notification preferences
userRouter.get(   "/notification-preferences",    isAuthenticated, getNotificationPreferences);
userRouter.patch( "/notification-preferences",    isAuthenticated, updateNotificationPreferences);

export default userRouter;