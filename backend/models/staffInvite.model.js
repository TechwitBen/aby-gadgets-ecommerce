import mongoose from "mongoose";
const { Schema } = mongoose;

const StaffInviteSchema = new Schema(
  {
    email:     { type: String, required: true, lowercase: true, trim: true },
    token:     { type: String, required: true, unique: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },
    used:      { type: Boolean, default: false },
    // Pre-set permissions the admin chose before sending the invite
    staffPermissions: { type: Schema.Types.Mixed, default: {} },
  },
  { collection: "staff_invites", timestamps: true }
);

const StaffInvite =
  mongoose.models.StaffInvite || mongoose.model("StaffInvite", StaffInviteSchema);

export default StaffInvite;