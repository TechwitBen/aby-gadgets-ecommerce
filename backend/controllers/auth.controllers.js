import crypto from "crypto";
import passport from "passport";
import nodemailer from "nodemailer";
import LocalStrategy from "passport-local";
import User from "../models/user.model.js";

// ─── Passport Local Strategy ──────────────────────────────────────────────────
passport.use(
  new LocalStrategy(async function verify(username, password, cb) {
    try {
      // Accept either username or email in the username field
      const user = await User.findOne({
        $or: [{ username }, { email: username }],
      });

      if (!user) {
        return cb(null, false, {
          success: false,
          message: "Incorrect username or password.",
        });
      }

      crypto.pbkdf2(
        password,
        user.salt,
        310000,
        32,
        "sha256",
        function (err, hashedPassword) {
          if (err) return cb(err);

          if (
            !crypto.timingSafeEqual(
              Buffer.from(user.hashed_password, "hex"),
              hashedPassword,
            )
          ) {
            return cb(null, false, {
              success: false,
              message: "Incorrect username or password.",
            });
          }

          return cb(null, user);
        },
      );
    } catch (err) {
      return cb(err);
    }
  }),
);

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginController = (req, res, next) => {
  try {
    passport.authenticate("local", (err, user, info) => {

      console.log("AUTH RESULT USER:", user); // 👈 log from passport
      console.log("AUTH INFO:", info);

      if (err) {
        return res
          .status(500)
          .json({ success: false, error: "Internal server error." });
      }

      if (!user) {
        const errorMsg = info?.message || "Username or password is incorrect.";
        return res.status(400).json({ success: false, error: errorMsg });
      }

      req.logIn(user, (err) => {

        console.log("LOGGING IN USER:", user); // 👈 before session

        if (err) {
          return res
            .status(500)
            .json({ success: false, error: "Failed to log in user." });
        }

        req.session.save(() => {

          console.log("SESSION USER:", req.user); // 👈 THIS IS THE IMPORTANT ONE

          return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    staffStatus: user.staffStatus,
    staffPermissions: user.staffPermissions,
  },
          });
        });
      });
    })(req, res, next);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error." });
  }
};

// ─── Register ─────────────────────────────────────────────────────────────────
// SECURITY: role is NOT accepted from req.body — all public registrations
// are always created as "user". Use /auth/bootstrap-admin or /auth/promote
// to assign the admin role.
export const RegisterController = async (req, res) => {
  try {
    const { username, password, email } = req.body; // role intentionally excluded

    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        error: "Username, email and password are required.",
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "A user with that username already exists.",
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: "A user with that email already exists.",
      });
    }

    const salt = crypto.randomBytes(16).toString("hex");

    crypto.pbkdf2(
      password,
      salt,
      310000,
      32,
      "sha256",
      async (err, hashedPassword) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, error: "Error hashing password." });
        }

        try {
          const user = await User.create({
            username,
            email,
            hashed_password: hashedPassword.toString("hex"),
            salt,
            role: "user", // always hardcoded — never from request body
          });

          req.logIn(user, (err) => {
            if (err) {
              return res
                .status(500)
                .json({ success: false, error: "Failed to log in user." });
            }

            req.session.save(() => {
              return res
                .status(200)
                .json({ success: true, message: "Signup successful" });
            });
          });
        } catch (createErr) {
          console.error(createErr);
          return res
            .status(500)
            .json({ success: false, error: "Error creating user." });
        }
      },
    );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error." });
  }
};

// ─── Get Current User ─────────────────────────────────────────────────────────
export const getCurrentUserController = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: "Not authenticated" });
  }
  return res.status(200).json({ success: true, user: req.user });
};

// ─── Bootstrap Admin ──────────────────────────────────────────────────────────
// ONE-TIME use endpoint to create your very first admin account.
// Requires ADMIN_BOOTSTRAP_SECRET from .env — keep this secret and
// DELETE or DISABLE this route once your first admin account exists.
//
// Usage:
//   POST /api/v1/auth/bootstrap-admin
//   Body: { "secret": "your_secret_from_env", "email": "admin@example.com" }
// export const bootstrapAdmin = async (req, res) => {
//   try {
//     const { secret, email } = req.body;

//     // 1. Validate the secret against the env var
//     const bootstrapSecret = process.env.BOOTSTRAP_ADMIN_SECRET;
//     if (!bootstrapSecret) {
//       return res.status(503).json({
//         success: false,
//         error: "Bootstrap is not configured on this server.",
//       });
//     }

//     // Timing-safe comparison to prevent timing attacks
//     const secretValid =
//       secret &&
//       bootstrapSecret.length === secret.length &&
//       crypto.timingSafeEqual(
//         Buffer.from(bootstrapSecret),
//         Buffer.from(secret),
//       );

//     if (!secretValid) {
//       return res.status(403).json({ success: false, error: "Invalid secret." });
//     }

//     // 2. Find the user by email
//     if (!email) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Email is required." });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         error: "No user found with that email. Register the account first.",
//       });
//     }

//     // 3. Already an admin? No-op
//     if (user.role === "admin") {
//       return res
//         .status(200)
//         .json({ success: true, message: "User is already an admin." });
//     }

//     // 4. Promote
//     user.role = "admin";
//     await user.save();

//     console.log(`[bootstrap-admin] Promoted ${email} to admin.`);

//     return res.status(200).json({
//       success: true,
//       message: `${email} has been promoted to admin.`,
//     });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ success: false, error: "Internal server error." });
//   }
// };



// ─── Promote User to Admin ────────────────────────────────────────────────────
// Allows an existing admin to promote any user by email.
// Protected by isAdmin middleware on the route.
//
// Usage:
//   POST /api/v1/auth/promote
//   Body: { "email": "someone@example.com" }
//   Cookie: must be logged in as admin
export const promoteToAdmin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, error: "Email is required." });
    }

    // Prevent an admin from accidentally demoting themselves
    if (req.user.email === email) {
      return res
        .status(400)
        .json({ success: false, error: "You cannot promote yourself." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "No user found with that email." });
    }

    if (user.role === "admin") {
      return res
        .status(200)
        .json({ success: true, message: "User is already an admin." });
    }

    user.role = "admin";
    await user.save();

    console.log(
      `[promote] ${req.user.email} promoted ${email} to admin.`,
    );

    return res.status(200).json({
      success: true,
      message: `${email} has been promoted to admin.`,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error." });
  }
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    // Always respond 200 so we don't leak which emails are registered
    if (!user)
      return res
        .status(200)
        .json({ message: "If that email exists, a reset link has been sent." });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashed;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"Gadget Store" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: "Reset your password",
      html: `
        <p>Hi ${user.name ?? user.username},</p>
        <p>Click the link below to reset your password. It expires in 1 hour.</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });

    res
      .status(200)
      .json({ message: "If that email exists, a reset link has been sent." });
  } catch (error) {
  console.error("FORGOT PASSWORD ERROR:");
  console.error(error);

  res.status(500).json({
    message: "Failed to send reset email",
    error: error.message,
  });
}
};

// ─── Reset Password ───────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(400)
        .json({ message: "Token is invalid or has expired" });

    // Re-hash with the same pbkdf2 approach used at registration
    const salt = crypto.randomBytes(16).toString("hex");

    crypto.pbkdf2(password, salt, 310000, 32, "sha256", async (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: "Error hashing password" });
      }

      user.hashed_password = hashedPassword.toString("hex");
      user.salt = salt;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.status(200).json({ message: "Password reset successfully" });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to reset password", error: error.message });
  }
};


export const logoutController = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: "Logout failed" });
    }

    req.session.destroy(() => {
      res.clearCookie("connect.sid");

      return res
        .status(200)
        .json({ success: true, message: "Logout successful" });
    });
  });
};


export const getAllUsersController = async (req, res) => {
  try {
    const users = await User.find(
      {},
      "-hashed_password -salt -resetPasswordToken -resetPasswordExpires"
    );

    // If the requester is staff without viewContactInfo permission,
    // strip email and any other contact fields from every user record
    const canViewContact =
      req.user.role === "admin" ||
      req.user.staffPermissions?.customers?.viewContactInfo === true;

    const safeUsers = users.map((u) => {
      const doc = u.toObject();
      if (!canViewContact) {
        delete doc.email;
        // add phone here too once you store it on customers
      }
      return doc;
    });

    return res.status(200).json({ success: true, users: safeUsers });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
};
export const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete user",
    });
  }
};