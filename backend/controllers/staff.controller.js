import crypto       from "crypto";
import nodemailer   from "nodemailer";
import User         from "../models/user.model.js";
import StaffInvite  from "../models/staffInvite.model.js";
import { createAuditLog } from "../middlewares/auth.middleware.js";

export const DEFAULT_PERMISSIONS = {
  order:    { viewOrder: false, updateOrderStatus: false, addInternalNotes: false },
  payments: { contactCustomers: false },
  delivery: { confirmDelivery: false },
  products: { viewProducts: false, addProducts: false, editProducts: false, deleteProducts: false },
  customers:{ viewCustomers: false, viewContactInfo: false },
  confirmPaymentStatus: false,
};

// ── Mailer helper ─────────────────────────────────────────────────────────────
const sendInviteEmail = async ({ to, inviteUrl, invitedByName }) => {
  const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from:    `"Aby Gadgets" <${process.env.SMTP_USER}>`,
    to,
    subject: "You've been invited to join Aby Gadgets Admin",
    // Plain-text fallback — shown if HTML fails to render
    text: `
You're invited!

${invitedByName} has invited you to join the Aby Gadgets admin team as a staff member.

Click the link below to set up your password and activate your account:

${inviteUrl}

This link expires in 48 hours. If you didn't expect this, ignore this email.
    `.trim(),
    // HTML version
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>You're invited!</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#7c3aed;padding:28px 32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#ffffff;border-radius:8px;width:36px;height:36px;text-align:center;vertical-align:middle;">
                    <span style="color:#7c3aed;font-weight:900;font-size:16px;line-height:36px;">Ab</span>
                  </td>
                  <td style="padding-left:10px;">
                    <span style="color:#ffffff;font-size:18px;font-weight:700;">Aby Gadgets</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 0 32px;">
              <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#111827;">
                You're invited! 🎉
              </h1>
              <p style="margin:0 0 16px 0;font-size:15px;color:#4b5563;line-height:1.6;">
                <strong>${invitedByName}</strong> has invited you to join the
                <strong>Aby Gadgets</strong> admin team as a staff member.
              </p>
              <p style="margin:0 0 28px 0;font-size:15px;color:#4b5563;line-height:1.6;">
                Click the button below to set up your password and activate your account.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="border-radius:10px;background:#7c3aed;">
                    
                      href="${inviteUrl}"
                      target="_blank"
                      style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;background:#7c3aed;"
                    >
                      Accept Invitation →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:0 0 8px 0;font-size:12px;color:#9ca3af;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 28px 0;font-size:12px;color:#7c3aed;word-break:break-all;">
                ${inviteUrl}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px 28px 32px;border-top:1px solid #f3f4f6;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;">
                This invite link expires in <strong>48 hours</strong>.<br/>
                If you didn't expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };

  await transporter.sendMail(mailOptions);
};
// ── GET all staff ─────────────────────────────────────────────────────────────
export const getAllStaff = async (req, res) => {
  try {
    const staff = await User.find(
      { role: "staff" },
      "-hashed_password -salt -resetPasswordToken -resetPasswordExpires"
    ).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, staff });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to fetch staff." });
  }
};

// ── GET single staff ──────────────────────────────────────────────────────────
export const getStaffById = async (req, res) => {
  try {
    const staff = await User.findOne(
      { _id: req.params.id, role: "staff" },
      "-hashed_password -salt -resetPasswordToken -resetPasswordExpires"
    );
    if (!staff) return res.status(404).json({ success: false, error: "Staff member not found." });
    return res.status(200).json({ success: true, staff });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to fetch staff member." });
  }
};

// ── INVITE staff (admin only) — sends email, no password set by admin ─────────
export const inviteStaff = async (req, res) => {
  try {
    const { email, staffPermissions } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ success: false, error: "A valid email is required." });
    }

    // Check if already a user
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "A user with this email already exists.",
      });
    }

    // Invalidate any previous unused invite for this email
    await StaffInvite.deleteMany({ email: email.toLowerCase(), used: false });

    // Create invite token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    await StaffInvite.create({
      email:            email.toLowerCase(),
      token:            hashedToken,
      invitedBy:        req.user._id,
      expiresAt:        new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
      staffPermissions: staffPermissions ?? DEFAULT_PERMISSIONS,
    });

    const inviteUrl = `${process.env.FRONTEND_URL}/accept-invite/${rawToken}`;
    const inviterName = req.user.name ?? req.user.username ?? "An admin";

    await sendInviteEmail({ to: email, inviteUrl, invitedByName: inviterName });

    await createAuditLog({
      action:     "INVITE_STAFF",
      userId:     req.user._id,
      targetModel:"User",
      details: { invitedEmail: email },
    });

    return res.status(200).json({
      success: true,
      message: `Invite sent to ${email}. The link expires in 48 hours.`,
    });
  } catch (error) {
    console.error("[inviteStaff]", error);
    return res.status(500).json({ success: false, error: "Failed to send invite." });
  }
};

// ── GET invite info (validate token before showing the form) ──────────────────
export const getInviteInfo = async (req, res) => {
  try {
    const hashed = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const invite = await StaffInvite.findOne({
      token:     hashed,
      used:      false,
      expiresAt: { $gt: new Date() },
    });

    if (!invite) {
      return res.status(400).json({
        success: false,
        error: "This invite link is invalid or has expired.",
      });
    }

    return res.status(200).json({
      success: true,
      email: invite.email,
    });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to validate invite." });
  }
};

// ── ACCEPT invite (staff sets their own username + password) ──────────────────
export const acceptInvite = async (req, res) => {
  try {
    const { username, password, name } = req.body;
    const { token } = req.params;

    if (!username || !password || password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Username and a password of at least 8 characters are required.",
      });
    }

    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const invite = await StaffInvite.findOne({
      token:     hashed,
      used:      false,
      expiresAt: { $gt: new Date() },
    });

    if (!invite) {
      return res.status(400).json({
        success: false,
        error: "This invite link is invalid or has expired.",
      });
    }

    // Check username not taken
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        error: "That username is already taken. Please choose another.",
      });
    }

    // Hash password
    const salt = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, 310000, 32, "sha256", (err, derived) => {
        if (err) reject(err);
        else resolve(derived.toString("hex"));
      });
    });

    // Create the staff user
    const staff = await User.create({
      username,
      email:           invite.email,
      name:            name || username,
      hashed_password: hashedPassword,
      salt,
      role:            "staff",
      staffStatus:     "active",
      staffPermissions: invite.staffPermissions ?? DEFAULT_PERMISSIONS,
    });

    // Mark invite as used
    invite.used = true;
    await invite.save();

    await createAuditLog({
      action:     "STAFF_ACCEPTED_INVITE",
      userId:     staff._id,
      targetModel:"User",
      details: { email: staff.email },
    });

    // Log them in immediately
    req.logIn(staff, (err) => {
      if (err) return res.status(500).json({ success: false, error: "Account created but login failed." });
      req.session.save(() =>
        res.status(201).json({
          success: true,
          message: "Account activated! Welcome to Aby Gadgets.",
          data: req.user,
        })
      );
    });
  } catch (error) {
    console.error("[acceptInvite]", error);
    return res.status(500).json({ success: false, error: "Failed to activate account." });
  }
};

// ── UPDATE staff permissions (admin only) ─────────────────────────────────────
export const updateStaffPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    const staff = await User.findOne({ _id: req.params.id, role: "staff" });
    if (!staff) return res.status(404).json({ success: false, error: "Staff member not found." });

    staff.staffPermissions = { ...DEFAULT_PERMISSIONS, ...permissions };
    await staff.save();

    await createAuditLog({
      action:     "UPDATE_STAFF_PERMISSIONS",
      userId:     req.user._id,
      targetId:   staff._id,
      targetModel:"User",
      details: { updatedPermissions: permissions },
    });

    return res.status(200).json({
      success: true,
      message: "Permissions updated successfully.",
      staffPermissions: staff.staffPermissions,
    });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to update permissions." });
  }
};

// ── UPDATE staff status active/inactive (admin only) ─────────────────────────
export const updateStaffStatus = async (req, res) => {
  try {
    const { staffStatus } = req.body;
    if (!["active", "inactive"].includes(staffStatus)) {
      return res.status(400).json({ success: false, error: "staffStatus must be 'active' or 'inactive'." });
    }

    const staff = await User.findOne({ _id: req.params.id, role: "staff" });
    if (!staff) return res.status(404).json({ success: false, error: "Staff member not found." });

    staff.staffStatus = staffStatus;
    await staff.save();

    await createAuditLog({
      action:     staffStatus === "active" ? "ACTIVATE_STAFF" : "DEACTIVATE_STAFF",
      userId:     req.user._id,
      targetId:   staff._id,
      targetModel:"User",
      details: { staffEmail: staff.email },
    });

    return res.status(200).json({ success: true, message: `Staff member ${staffStatus}.` });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to update status." });
  }
};

// ── DELETE staff (admin only) ─────────────────────────────────────────────────
export const deleteStaff = async (req, res) => {
  try {
    const staff = await User.findOneAndDelete({ _id: req.params.id, role: "staff" });
    if (!staff) return res.status(404).json({ success: false, error: "Staff member not found." });

    await createAuditLog({
      action:     "DELETE_STAFF",
      userId:     req.user._id,
      targetId:   req.params.id,
      targetModel:"User",
      details: { deletedEmail: staff.email, deletedName: staff.name },
    });

    return res.status(200).json({ success: true, message: "Staff member deleted." });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to delete staff member." });
  }
};