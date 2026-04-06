import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controllers.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.middleware.js";

const orderRouter = Router();

orderRouter.post("/", isAuthenticated, createOrder); // POST /api/orders
orderRouter.get("/my-orders", isAuthenticated, getMyOrders); // GET /api/orders/my-orders
orderRouter.get("/:id", isAuthenticated, getOrderById); // GET /api/orders/:id
orderRouter.get("/", isAdmin, getAllOrders); // GET /api/orders (admin)
orderRouter.patch("/:id/status", isAdmin, updateOrderStatus); // PATCH /api/orders/:id/status

export default orderRouter;
