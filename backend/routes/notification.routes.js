import { Router } from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendAdminMessage,
} from "../controllers/notification.controller.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.middleware.js";

const notificationRouter = Router();

notificationRouter.get("/",                 isAuthenticated, getNotifications);
notificationRouter.get("/unread-count",     isAuthenticated, getUnreadCount);
notificationRouter.patch("/read-all",       isAuthenticated, markAllAsRead);
notificationRouter.patch("/:id/read",       isAuthenticated, markAsRead);
notificationRouter.delete("/:id",           isAuthenticated, deleteNotification);
notificationRouter.post("/admin-message",   isAuthenticated, isAdmin, sendAdminMessage);

export default notificationRouter;