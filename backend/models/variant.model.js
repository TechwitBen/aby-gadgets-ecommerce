import mongoose from "mongoose";

const { Schema } = mongoose;

const VariantSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    color: { type: String },
    storage: { type: String },
    ram: { type: String },
    image: { type: String }, // ← ADD THIS
    price: { type: Number, required: true },
    compare_at_price: { type: Number },
    stock: { type: Number, default: 0 },
    sku: { type: String, unique: true },
    is_active: { type: Boolean, default: true },
  },
  { collection: "variants", timestamps: true },
);
VariantSchema.index({ product: 1 });

const Variant =
  mongoose.models.Variant || mongoose.model("Variant", VariantSchema);
export default Variant;
