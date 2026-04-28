import mongoose from "mongoose";
const { Schema } = mongoose;

// ── Staff permissions sub-schema ──────────────────────────────────────────────
const StaffPermissionsSchema = new Schema(
  {
    order: {
      viewOrder:         { type: Boolean, default: false },
      updateOrderStatus: { type: Boolean, default: false },
      addInternalNotes:  { type: Boolean, default: false },
    },
    payments: {
      contactCustomers:  { type: Boolean, default: false },
    },
    delivery: {
      confirmDelivery:   { type: Boolean, default: false },
    },
    products: {
      viewProducts:      { type: Boolean, default: false },
      addProducts:       { type: Boolean, default: false },
      editProducts:      { type: Boolean, default: false },
      deleteProducts:    { type: Boolean, default: false },
    },
    customers: {
      viewCustomers:     { type: Boolean, default: false },
      viewContactInfo:   { type: Boolean, default: false },
    },
    confirmPaymentStatus: { type: Boolean, default: false },
  },
  { _id: false },
);

// ── Address sub-schema (NEW) ───────────────────────────────────────────────────
// Defined as a named sub-schema so Mongoose exposes the .id() helper
// on the parent array — required by updateAddress & setDefaultAddress.
const AddressSchema = new Schema(
  {
    label:       { type: String, default: "Home" },   // Home | Work | School | Other
    full_name:   { type: String, default: "" },
    phone:       { type: String, default: "" },
    street:      { type: String, default: "" },
    city:        { type: String, default: "" },
    state:       { type: String, default: "" },
    country:     { type: String, default: "Nigeria" },
    postal_code: { type: String, default: "" },
    isDefault:   { type: Boolean, default: false },
  },
  { timestamps: true },
  // _id is included by default — needed for .id() lookup
);

// ── Notification preferences sub-schema (NEW) ─────────────────────────────────
const NotificationPreferencesSchema = new Schema(
  {
    orderUpdates:       { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    paymentAlerts:      { type: Boolean, default: true },
  },
  { _id: false },
);

// ── Main User schema ──────────────────────────────────────────────────────────
const UserSchema = new Schema(
  {
    // ── Auth fields ───────────────────────────────────────────────────────────
    email: {
      type: String, required: true, unique: true, lowercase: true, trim: true,
    },
    username:        { type: String, required: false, unique: true, sparse: true },
    hashed_password: { type: String },
    salt:            { type: String },

    provider: {
      type:    String,
      enum:    ["local", "google", "facebook"],
      default: "local",
    },
    google_id:   { type: String, unique: true, sparse: true },
    facebook_id: { type: String, unique: true, sparse: true },

    // ── Profile fields ────────────────────────────────────────────────────────
    name:         { type: String, default: "" },
    phone:        { type: String, default: "" },

    // NEW — profile photo URL (can be a Cloudinary / S3 URL, or data URL for now)
    profilePhoto: { type: String, default: "" },

    // ── Role / staff ──────────────────────────────────────────────────────────
    role: {
      type:    String,
      enum:    ["user", "admin", "staff"],
      default: "user",
    },
    staffStatus: {
      type:    String,
      enum:    ["active", "inactive"],
      default: "active",
    },
    homeAddress:      { type: String },
    staffPermissions: {
      type:    StaffPermissionsSchema,
      default: undefined,
    },

    // ── NEW — Address book ────────────────────────────────────────────────────
    // Stored as a proper sub-document array so we can use .id() in controllers.
    addresses: { type: [AddressSchema], default: [] },

    // ── NEW — Notification preferences ───────────────────────────────────────
    notificationPreferences: {
      type:    NotificationPreferencesSchema,
      default: () => ({
        orderUpdates:       true,
        emailNotifications: true,
        paymentAlerts:      true,
      }),
    },

    // ── Password reset ────────────────────────────────────────────────────────
    resetPasswordToken:   { type: String },
    resetPasswordExpires: { type: Date },
  },
  { collection: "users", timestamps: true },
);

// ── Pre-save validation ───────────────────────────────────────────────────────
UserSchema.pre("save", function () {
  if (this.provider === "local") {
    if (!this.hashed_password || !this.salt || !this.username) {
      throw new Error("Local users must have username, hashed_password, and salt");
    }
  }
  if (this.provider === "google" && !this.google_id) {
    throw new Error("Google users must have google_id");
  }
  // Auto-seed default permissions when role is set to staff
  if (this.role === "staff" && !this.staffPermissions) {
    this.staffPermissions = {
      order:    {},
      payments: {},
      delivery: {},
      products: {},
      customers:{},
      confirmPaymentStatus: false,
    };
  }
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;