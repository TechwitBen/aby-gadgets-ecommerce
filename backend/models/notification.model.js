import mongoose from "mongoose";
const { Schema } = mongoose;

const NotificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // Category
    type: {
      type: String,
      enum: ["order", "payment", "account", "admin_message"],
      required: true,
    },

    title:   { type: String, required: true },
    message: { type: String, required: true },
    icon:    { type: String, default: "🔔" },

    isRead: { type: Boolean, default: false, index: true },

    // Optional links
    orderId:     { type: Schema.Types.ObjectId, ref: "Order" },
    orderNumber: { type: String },

    // What the CTA button does: null = no button
    actionType: {
      type: String,
      enum: ["view_order", "track_order", "view_orders", null],
      default: null,
    },
    actionId: { type: String }, // orderId string for deep-link

    // Extra payload (pickup code, payment ref, etc.)
    data: { type: Schema.Types.Mixed },
  },
  { collection: "notifications", timestamps: true },
);

NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, isRead: 1 });

const Notification =
  mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

export default Notification;