import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controllers.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", isAuthenticated, createOrder); // POST /api/orders
router.get("/my-orders", isAuthenticated, getMyOrders); // GET /api/orders/my-orders
router.get("/:id", isAuthenticated, getOrderById); // GET /api/orders/:id
router.get("/", isAdmin, getAllOrders); // GET /api/orders (admin)
router.patch("/:id/status", isAdmin, updateOrderStatus); // PATCH /api/orders/:id/status

export default router;
