import { Router } from "express";
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controllers.js";
import { isAdmin } from "../middlewares/auth.middleware.js";

const productRouter = Router();

productRouter.get("/", getProducts); // GET /api/products?category=phone&page=1
productRouter.get("/:slug", getProductBySlug); // GET /api/products/iphone-15-pro
productRouter.post("/", isAdmin, createProduct); // POST /api/products
productRouter.put("/:id", isAdmin, updateProduct); // PUT /api/products/:id
productRouter.delete("/:id", isAdmin, deleteProduct); // DELETE /api/products/:id

export default productRouter;
