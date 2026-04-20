import Review from "../models/review.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import mongoose from "mongoose";

// ── Helper: recompute + persist aggregate rating on the product ───────────────
const refreshProductRating = async (productId) => {
  const [stat] = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId.toString()) } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  await Product.findByIdAndUpdate(productId, {
    rating: stat ? Number(stat.avgRating.toFixed(1)) : 0,
    reviews: stat ? stat.count : 0,
  });
};

// ─────────────────────────────────────────────────────────────────────────────

export const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const reviews = await Review.find({ product: productId })
      .populate("user", "name username")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews === 0
        ? 0
        : Number(
            (
              reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
            ).toFixed(1),
          );

    res.status(200).json({ reviews, totalReviews, averageRating });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews", error: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({ message: "Product ID and rating are required" });
    }

    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    // Check for verified purchase (Delivered or Shipped)
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      "items.product": productId,
      status: { $in: ["delivered", "shipped"] },
    });

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      comment,
      verified_purchase: !!hasPurchased,
    });

    // Refresh denormalised rating cache on product
    await refreshProductRating(productId);

    // Return populated review so the frontend can display the user name immediately
    const populated = await review.populate("user", "name username");
    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }
    res.status(500).json({ message: "Failed to create review", error: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update your own review" });
    }

    const { rating, comment } = req.body;
    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    const updated = await review.save();

    await refreshProductRating(review.product);

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update review", error: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdminUser = req.user.role === "admin";

    if (!isOwner && !isAdminUser) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    const productId = review.product;
    await review.deleteOne();

    // Refresh denormalised rating cache
    await refreshProductRating(productId);

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete review", error: error.message });
  }
};