import Review from "../models/review.model.js";
import Order from "../models/order.model.js"; // optional for verified purchase
import mongoose from "mongoose";

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
        : (
            reviews.reduce((acc, review) => acc + review.rating, 0) /
            totalReviews
          ).toFixed(1);

    res.status(200).json({
      reviews,
      totalReviews,
      averageRating: Number(averageRating),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({
        message: "Product ID and rating are required",
      });
    }

    // Check duplicate review (schema enforces but we handle nicely)
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this product",
      });
    }

    // Optional: check verified purchase
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      "orderItems.product": productId,
      status: { $in: ["Delivered", "Shipped"] },
    });

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      comment,
      verified_purchase: !!hasPurchased,
    });

    res.status(201).json(review);
  } catch (error) {
    // Handle unique index error gracefully
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already reviewed this product",
      });
    }

    res.status(500).json({
      message: "Failed to create review",
      error: error.message,
    });
  }
};

export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only update your own review",
      });
    }

    const { rating, comment } = req.body;

    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    const updatedReview = await review.save();

    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update review",
      error: error.message,
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const isOwner = review.user.toString() === req.user._id.toString();

    const isAdminUser = req.user.role === "admin";

    if (!isOwner && !isAdminUser) {
      return res.status(403).json({
        message: "Not authorized to delete this review",
      });
    }

    await review.deleteOne();

    res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete review",
      error: error.message,
    });
  }
};
