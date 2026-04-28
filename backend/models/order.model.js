import mongoose from "mongoose";

const { Schema } = mongoose;

const OrderItemSchema = new Schema(
  {
    variant:    { type: Schema.Types.ObjectId, ref: "Variant",  required: true },
    product:    { type: Schema.Types.ObjectId, ref: "Product",  required: true },
    quantity:   { type: Number, required: true, min: 1 },
    unit_price: { type: Number, required: true },
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    // ── Human-readable ID ─────────────────────────────────────────────────────
    order_number: {
      type:   String,
      unique: true,
      sparse: true,
      index:  true,
    },

    // ── Core fields ───────────────────────────────────────────────────────────
    user:  { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [OrderItemSchema],

    // ── Fulfillment ───────────────────────────────────────────────────────────
    // "delivery" — standard home/address delivery
    // "pickup"   — customer collects in-store
    fulfillment_type: {
      type:    String,
      enum:    ["delivery", "pickup"],
      default: "delivery",
    },

    // Delivery-specific
    delivery_city: { type: String }, // selected delivery zone (e.g. "Lekki Phase 1")

    // Pickup-specific
    pickup_code:     { type: String }, // e.g. "PKP-A3K9" shown to customer
    pickup_location: { type: String }, // store address copied at order time

    // ── Order status ──────────────────────────────────────────────────────────
    // Delivery flow:   pending → confirmed → shipped → out_for_delivery → delivered
    // Pickup flow:     pending → confirmed → ready_for_pickup → collected
    // Terminal:        cancelled | refunded
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "shipped",
        "out_for_delivery",    // ← was missing from original; now added
        "delivered",
        "cancelled",
        "refunded",
        "ready_for_pickup",    // ← new: pickup order is ready to collect
        "collected",           // ← new: customer collected in store
      ],
      default: "pending",
    },

    shipping_address: {
      full_name:   String,
      phone:       String,
      street:      String,
      city:        String,
      state:       String,
      country:     String,
      postal_code: String,
    },

    payment_status: {
      type:    String,
      enum:    ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },

    payment_method: {
      type:     String,
      required: true,
      enum:     ["paystack", "pod"],
      default:  "pod",
    },

    payment_reference: { type: String },

    subtotal:     { type: Number, required: true },
    shipping_fee: { type: Number, default: 0 },   // = delivery fee for delivery orders, 0 for pickup
    total:        { type: Number, required: true },
  },
  { collection: "orders", timestamps: true },
);

OrderSchema.index({ user:   1 });
OrderSchema.index({ status: 1 });

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
export default Order;