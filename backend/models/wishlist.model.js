import mongoose from "mongoose";

const { Schema } = mongoose;

const WishlistItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const WishlistSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: {
      type: [WishlistItemSchema],
      default: [],
    },
  },
  {
    collection: "wishlists",
    timestamps: true,
  }
);

// Prevent duplicate products
WishlistSchema.index({ user: 1, "items.product": 1 });

const Wishlist =
  mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema);

export default Wishlist;