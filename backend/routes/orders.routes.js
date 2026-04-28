import { Router } from "express";
import {
  createOrder, getMyOrders, getOrderById,
  getAllOrders, updateOrderStatus, updateOrderPaymentStatus, deleteOrder,
} from "../controllers/order.controllers.js";
import {
  isAuthenticated, isAdmin, isAdminOrStaff, checkPermission,
} from "../middlewares/auth.middleware.js";

const orderRouter = Router();

// ── Customer routes ───────────────────────────────────────────────────────────
orderRouter.post(      "/",          isAuthenticated,                                                  createOrder);
orderRouter.get(       "/my-orders", isAuthenticated,                                                  getMyOrders);

// ── Static before dynamic ─────────────────────────────────────────────────────
// GET all — admin always passes; staff needs viewOrder permission
orderRouter.get(
  "/",
  isAuthenticated,
  isAdminOrStaff,
  checkPermission("order", "viewOrder"),
  getAllOrders
);

// GET single — users can see their own (controller enforces ownership); staff needs viewOrder
orderRouter.get(
  "/:id",
  isAuthenticated,
  getOrderById  // ownership check is inside the controller
);

// PATCH status — staff needs updateOrderStatus permission
orderRouter.patch(
  "/:id/status",
  isAuthenticated,
  isAdminOrStaff,
  checkPermission("order", "updateOrderStatus"),
  updateOrderStatus
);

// PATCH payment status — admin only (financial action)
orderRouter.patch(
  "/:id/payment-status",
  isAuthenticated,
  isAdmin,
  updateOrderPaymentStatus
);

// DELETE — admin only
orderRouter.delete(
  "/:id",
  isAuthenticated,
  isAdmin,
  deleteOrder
);

export default orderRouter;