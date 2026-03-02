import { Router } from "express";
import {
  getVariantsByProduct,
  createVariant,
  updateVariant,
  deleteVariant,
} from "../controllers/variant.controllers.js";
import { isAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/product/:productId", getVariantsByProduct); // GET /api/variants/product/:productId
router.post("/", isAdmin, createVariant); // POST /api/variants
router.put("/:id", isAdmin, updateVariant); // PUT /api/variants/:id
router.delete("/:id", isAdmin, deleteVariant); // DELETE /api/variants/:id

export default router;
