import mongoose from "mongoose";
import slugify from "slugify";

const { Schema } = mongoose;

const SpecSchema = new Schema(
  {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    color: [{ type: String }],
    storage: [{ type: String }],
    ram: [{ type: String }],
    screen_size: { type: String },
    battery: { type: String },
    camera: { type: String },
    network: { type: String },
    processor: { type: String },
    graphics: { type: String },
    display_resolution: { type: String },
    os: { type: String },
    battery_life: { type: String },
  },
  { _id: false },
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    category: {
      type: String,
      enum: ["phone", "laptop", "tablets", "accessory", "gadget", "weareable"],
      required: true,
    },
    tags: [{ type: String }],
    description: { type: String },
    specs: {
      type: new Schema(
        {
          brand: { type: String, required: true },
          model: { type: String, required: true },
        },
        { _id: false, strict: false },
      ),
    },
    images: [{ type: String }],
    is_active: { type: Boolean, default: true },
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
