import { Router } from "express";
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controllers.js";
import { isAdmin } from "../middleware/auth.middleware.js";

const productRouter = Router();

router.get("/", getProducts); // GET /api/products?category=phone&page=1
router.get("/:slug", getProductBySlug); // GET /api/products/iphone-15-pro
router.post("/", isAdmin, createProduct); // POST /api/products
router.put("/:id", isAdmin, updateProduct); // PUT /api/products/:id
router.delete("/:id", isAdmin, deleteProduct); // DELETE /api/products/:id

export default productRouter;
