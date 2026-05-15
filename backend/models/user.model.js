import mongoose from "mongoose";
import crypto from "crypto";

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

const AddressSchema = new Schema(
  {
    label:       { type: String, default: "Home" },
    street:      { type: String, default: "" },
    city:        { type: String, default: "" },
    state:       { type: String, default: "" },
    country:     { type: String, default: "Nigeria" },
    postal_code: { type: String, default: "" },
    isDefault:   { type: Boolean, default: false },
  },
  { timestamps: true },
);

const NotificationPreferencesSchema = new Schema(
  {
    orderUpdates:       { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    paymentAlerts:      { type: Boolean, default: true },
  },
  { _id: false },
);

const UserSchema = new Schema(
  {
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

    name:  { type: String, default: "" },
    phone: { type: String, default: "" },
    // profilePhoto intentionally removed — UI generates initials avatars

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

    addresses: { type: [AddressSchema], default: [] },

    notificationPreferences: {
      type:    NotificationPreferencesSchema,
      default: () => ({
        orderUpdates:       true,
        emailNotifications: true,
        paymentAlerts:      true,
      }),
    },

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

// ── comparePassword — verify a plain password against the stored hash ─────────
UserSchema.methods.comparePassword = function (plainPassword) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      plainPassword,
      this.salt,
      310000,
      32,
      "sha256",
      (err, hash) => {
        if (err) return reject(err);
        resolve(
          crypto.timingSafeEqual(
            Buffer.from(this.hashed_password, "hex"),
            hash,
          ),
        );
      },
    );
  });
};

// ── hashPassword — hash a new plain password and return the hex string ────────
UserSchema.methods.hashPassword = function (plainPassword) {
  const newSalt = crypto.randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      plainPassword,
      newSalt,
      310000,
      32,
      "sha256",
      async (err, hash) => {
        if (err) return reject(err);
        this.salt = newSalt;
        resolve(hash.toString("hex"));
      },
    );
  });
};

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;