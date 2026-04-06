import mongoose from "mongoose";

const { Schema } = mongoose;

const CartItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variant: { type: Schema.Types.ObjectId, ref: "Variant", required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unit_price: { type: Number, required: true, min: 0 },
    total_price: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const CartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: { type: [CartItemSchema], default: [] },
    subtotal: { type: Number, required: true, default: 0, min: 0 },
    total_items: { type: Number, required: true, default: 0, min: 0 },
    updated_at: { type: Date, default: Date.now },
  },
  {
    collection: "carts",
    timestamps: true,
  },
);

CartSchema.pre("save", function () {
  this.total_items = this.items.reduce(
    (count, item) => count + item.quantity,
    0,
  );
  this.subtotal = this.items.reduce((sum, item) => sum + item.total_price, 0);
  this.updated_at = new Date();
});

const Cart = mongoose.models.Cart || mongoose.model("Cart", CartSchema);

export default Cart;
