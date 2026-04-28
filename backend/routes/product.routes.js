import { Router } from "express";
import {
  getProducts, getProductBySlug,
  createProduct, updateProduct, patchProduct, deleteProduct,
} from "../controllers/product.controllers.js";
import {
  isAuthenticated, isAdmin, isAdminOrStaff, checkPermission,
} from "../middlewares/auth.middleware.js";

const productRouter = Router();

// ── Public reads ──────────────────────────────────────────────────────────────
productRouter.get("/",      getProducts);        // storefront listing
productRouter.get("/:slug", getProductBySlug);   // storefront detail

// ── Admin + staff with product permissions ────────────────────────────────────
productRouter.post(
  "/",
  isAuthenticated,
  isAdminOrStaff,
  checkPermission("products", "addProducts"),
  createProduct
);

productRouter.put(
  "/:id",
  isAuthenticated,
  isAdminOrStaff,
  checkPermission("products", "editProducts"),
  updateProduct
);

productRouter.patch(
  "/:id",
  isAuthenticated,
  isAdminOrStaff,
  checkPermission("products", "editProducts"),
  patchProduct
);

productRouter.delete(
  "/:id",
  isAuthenticated,
  isAdminOrStaff,
  checkPermission("products", "deleteProducts"),
  deleteProduct
);

export default productRouter;