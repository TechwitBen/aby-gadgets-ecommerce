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
    provider: { type: String, enum: ["local", "google"], default: "local" },
    google_id: { type: String, unique: true, sparse: true },
    name: { type: String },
  },
  {
    collection: "users",
    timestamps: true,
  },
);

UserSchema.pre("save", function (next) {
  if (this.provider === "local") {
    if (!this.hashed_password || !this.salt || !this.username) {
      return next(
        new Error("Local users must have username, hashed_password, and salt"),
      );
    }
  }
  if (this.provider === "google" && !this.google_id) {
    return next(new Error("Google users must have google_id"));
  }
  return next();
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
