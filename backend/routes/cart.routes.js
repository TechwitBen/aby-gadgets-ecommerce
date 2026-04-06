import { Router } from "express";
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controllers.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const cartRouter = Router();

cartRouter.get("/", isAuthenticated, getCart); // GET /api/v1/cart
cartRouter.post("/", isAuthenticated, addCartItem); // POST /api/v1/cart
cartRouter.patch("/", isAuthenticated, updateCartItem); // PATCH /api/v1/cart
cartRouter.delete("/:variantId", isAuthenticated, removeCartItem); // DELETE /api/v1/cart/:variantId
cartRouter.delete("/", isAuthenticated, clearCart); // DELETE /api/v1/cart

export default cartRouter;
