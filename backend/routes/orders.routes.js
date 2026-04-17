import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateOrderPaymentStatus,
  deleteOrder,
} from "../controllers/order.controllers.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.middleware.js";

const orderRouter = Router();

orderRouter.post("/", isAuthenticated, createOrder); // POST /api/orders
orderRouter.get("/my-orders", isAuthenticated, getMyOrders); // GET /api/orders/my-orders
// ✅ Static routes BEFORE dynamic /:id
orderRouter.get("/",            isAdmin,         getAllOrders);   // ← moved up
orderRouter.get("/:id",         isAuthenticated, getOrderById);  // ← now after

orderRouter.patch("/:id/status", isAdmin, updateOrderStatus); // PATCH /api/orders/:id/status


orderRouter.patch("/:id/payment-status", isAdmin, updateOrderPaymentStatus);
// 2. Add the delete route with admin protection
orderRouter.route("/:id").delete(isAuthenticated, isAdmin, deleteOrder);
export default orderRouter;
