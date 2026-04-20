import { Router } from "express";
import {
  getReviewsByProduct,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/review.controllers.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.middleware.js";

const reviewRouter = Router();

reviewRouter.get("/product/:productId", getReviewsByProduct); // GET /api/reviews/product/:productId
reviewRouter.post("/", isAuthenticated, createReview); // POST /api/reviews
reviewRouter.put("/:id", isAuthenticated, updateReview); // PUT /api/reviews/:id
// reviewRouter.delete("/:id", isAuthenticated, deleteReview);
reviewRouter.delete("/:id", isAuthenticated, isAdmin, deleteReview); // DELETE /api/reviews/:id

export default reviewRouter;
