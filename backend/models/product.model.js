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

    // ─── Computed / denormalised — DO NOT set manually ───────────────────────
    // These are maintained automatically by the review controllers whenever a
    // review is created or deleted. They exist here purely as a cache to allow
    // DB-level sorting by rating / popularity without a costly $lookup on every
    // product listing query.
    rating:  { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    // ─────────────────────────────────────────────────────────────────────────
  },
  { collection: "products", timestamps: true },
);

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