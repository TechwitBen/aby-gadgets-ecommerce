import mongoose from "mongoose";

const { Schema } = mongoose;

const OrderItemSchema = new Schema(
  {
    variant: { type: Schema.Types.ObjectId, ref: "Variant", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    unit_price: { type: Number, required: true },
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [OrderItemSchema],
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    shipping_address: {
      full_name: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      country: String,
      postal_code: String,
    },
    payment_status: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    // CORRECT:
payment_method: { 
  type: String, 
  required: true,
  enum: ["paystack", "pod"], // ✅ Matches frontend
  default: "pod", // Example options
    },
    payment_reference: { type: String }, // from Paystack/Flutterwave etc.
    subtotal: { type: Number, required: true },
    shipping_fee: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  { collection: "orders", timestamps: true },
);

OrderSchema.index({ user: 1 });
OrderSchema.index({ status: 1 });

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
export default Order;
