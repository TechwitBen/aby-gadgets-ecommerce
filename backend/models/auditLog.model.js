import mongoose from "mongoose";
const { Schema } = mongoose;

const AuditLogSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
      // e.g. UPDATE_ORDER_STATUS, CONFIRM_DELIVERY, UPDATE_SETTINGS,
      //      CREATE_STAFF, UPDATE_STAFF_PERMISSIONS, DEACTIVATE_STAFF,
      //      DELETE_STAFF, UPDATE_PAYMENT_STATUS
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId, // order, staff, settings doc id
      default: null,
    },
    targetModel: {
      type: String, // "Order", "User", "Settings"
      default: null,
    },
    details: {
      type: Schema.Types.Mixed, // any extra context
      default: {},
    },
  },
  { collection: "audit_logs", timestamps: true }
);

AuditLogSchema.index({ performedBy: 1 });
AuditLogSchema.index({ createdAt: -1 });

const AuditLog =
  mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);

export default AuditLog;