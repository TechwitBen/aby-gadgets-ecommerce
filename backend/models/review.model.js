import mongoose from "mongoose";

const { Schema } = mongoose;

const ReviewSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
    verified_purchase: { type: Boolean, default: false },
  },
  { collection: "reviews", timestamps: true },
);

ReviewSchema.index({ product: 1 });
ReviewSchema.index({ product: 1, user: 1 }, { unique: true }); // one review per user per product

const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);
export default Review;
