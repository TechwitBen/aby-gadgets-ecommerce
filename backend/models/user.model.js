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

/**
 * Address sub-schema.
 *
 * full_name and phone have been REMOVED.
 * The delivery name & phone are now always sourced from the parent user's
 * `name` and `phone` profile fields, eliminating the redundancy of asking
 * users to re-enter their own details for every address.
 *
 * When generating a shipping label or displaying delivery info, read:
 *   user.name   — recipient name
 *   user.phone  — recipient phone
 *   address.*   — delivery location
 */
const AddressSchema = new Schema(
  {
    label:       { type: String, default: "Home" },  // Home | Work | School | Other
    street:      { type: String, default: "" },
    city:        { type: String, default: "" },
    state:       { type: String, default: "" },
    country:     { type: String, default: "Nigeria" },
    postal_code: { type: String, default: "" },
    isDefault:   { type: Boolean, default: false },
  },
  { timestamps: true },
);

// ── Notification preferences sub-schema ──────────────────────────────────────
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
    // These are the canonical name & phone used on ALL delivery addresses.
    name:         { type: String, default: "" },
    phone:        { type: String, default: "" },
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

    // ── Address book ──────────────────────────────────────────────────────────
    addresses: { type: [AddressSchema], default: [] },

    // ── Notification preferences ──────────────────────────────────────────────
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