import mongoose from "mongoose";
import slugify from "slugify";

const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, unique: true, lowercase: true },
    category: {
      type: String,
      enum: ["phones", "laptops", "tablets", "accessories", "gadget", "wearable", "Others"],
      required: true,
    },
    brand:       { type: String, required: true },
    description: { type: String },
    condition:   { type: String },
    images:      [{ type: String }],
    features:    [{ type: String }],
    tags:        [{ type: String }],
    deliveryFee: { type: Number, default: 0 },
    section:     { type: String },
    type:        { type: String },
    is_active:   { type: Boolean, default: true },
    specs: {
      camera:     { type: String },
      battery:    { type: String },
      screenSize: { type: String },
      storage:    { type: String },
    },
    rating:  { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
  },
  { collection: "products", timestamps: true },
);

// ── Text index for search ─────────────────────────────────────────────────────
// Allows fast full-text search on name, brand, category and description.
// MongoDB uses this index when the search query param hits the controller.
// Without it every search does a full collection scan — slow at scale.
ProductSchema.index(
  { name: "text", brand: "text", category: "text", description: "text" },
  { weights: { name: 10, brand: 5, category: 3, description: 1 } }
);

// ── Other indexes ─────────────────────────────────────────────────────────────
// These speed up the most common filter/sort queries on the products page.
ProductSchema.index({ section: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ rating: -1 });
ProductSchema.index({ createdAt: -1 });

// ── Slug generation ───────────────────────────────────────────────────────────
ProductSchema.pre("save", async function () {
  if (!this.slug || this.isModified("name")) {
    this.slug =
      slugify(this.name, { lower: true, strict: true }) +
      "-" +
      this._id.toString().slice(-4);
  }
});

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;