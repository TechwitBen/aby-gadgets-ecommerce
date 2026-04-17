import mongoose from "mongoose";
import slugify from "slugify";

const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, unique: true, lowercase: true },
    category: {
      type: String,
      enum: ["phones", "laptops", "tablets", "accessories", "gadget", "wearable",  "Others"],
      required: true,
    },
    brand:       { type: String, required: true },
    description: { type: String },
    condition:   { type: String },
    images:      [{ type: String }],
    features:    [{ type: String }],
    tags:        [{ type: String }],          // ← was missing, silent drop before
    deliveryFee: { type: Number },            // ← was missing, silent drop before
    section:     { type: String },
    type:        { type: String },
    rating:      { type: Number, default: 0 },
    reviews:     { type: Number, default: 0 },
    is_active:   { type: Boolean, default: true },
    specs: {
      camera:     { type: String },
      battery:    { type: String },
      screenSize: { type: String },
    },
  },
  { collection: "products", timestamps: true }
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