import { Router } from "express";
import {
  getReviewsByProduct,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/review.controllers.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/product/:productId", getReviewsByProduct); // GET /api/reviews/product/:productId
router.post("/", isAuthenticated, createReview); // POST /api/reviews
router.put("/:id", isAuthenticated, updateReview); // PUT /api/reviews/:id
// router.delete("/:id", isAuthenticated, deleteReview);
router.delete("/:id", isAuthenticated || isAdmin, deleteReview); // DELETE /api/reviews/:id

export default router;
