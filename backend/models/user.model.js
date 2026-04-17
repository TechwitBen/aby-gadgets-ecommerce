import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: { type: String, required: false, unique: true, sparse: true },
    hashed_password: { type: String },
    salt: { type: String },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    google_id: { type: String, unique: true, sparse: true },
    name: { type: String },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      // SECURITY: role is never set by user input — only by
      // bootstrapAdmin or promoteToAdmin controllers.
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  {
    collection: "users",
    timestamps: true,
  },
);

// Pre-save validation — only runs on local accounts
UserSchema.pre("save", function () {
  if (this.provider === "local") {
    if (!this.hashed_password || !this.salt || !this.username) {
      throw new Error(
        "Local users must have username, hashed_password, and salt",
      );
    }
  }
  if (this.provider === "google" && !this.google_id) {
    throw new Error("Google users must have google_id");
  }
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;