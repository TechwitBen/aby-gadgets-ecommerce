import mongoose from "mongoose";

const { Schema } = mongoose;

const SpecSchema = new Schema(
  {
    // Shared
    brand: { type: String, required: true },
    model: { type: String, required: true },
    color: [{ type: String }],
    storage: [{ type: String }], // e.g. ["128GB", "256GB"]
    ram: [{ type: String }], // e.g. ["8GB", "16GB"]

    // Phone-specific
    screen_size: { type: String }, // e.g. "6.7 inches"
    battery: { type: String }, // e.g. "5000mAh"
    camera: { type: String }, // e.g. "108MP"
    network: { type: String }, // e.g. "5G"

    // Laptop-specific
    processor: { type: String }, // e.g. "Intel Core i7"
    graphics: { type: String }, // e.g. "NVIDIA RTX 3060"
    display_resolution: { type: String },
    os: { type: String }, // e.g. "Windows 11"
    battery_life: { type: String }, // e.g. "10 hours"
  },
  { _id: false },
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: { type: String, enum: ["phone", "laptop"], required: true },
    description: { type: String },
    specs: { type: SpecSchema },
    images: [{ type: String }], // array of image URLs
    is_active: { type: Boolean, default: true },
  },
  { collection: "products", timestamps: true },
);

ProductSchema.index({ slug: 1 });
ProductSchema.index({ category: 1 });

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
export default Product;

/* design decisions:

Product + Variant split — one product (e.g. "Samsung Galaxy S24") has multiple variants (128GB/Black, 256GB/White), each with its own price and stock
Specs are flexible — phone and laptop fields coexist in one schema; unused fields are just null
compare_at_price on variants lets you show strikethrough/sale prices
payment_reference on orders is where you store the transaction ID from Paystack, Flutterwave, etc */
