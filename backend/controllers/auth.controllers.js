import crypto from "crypto";
import passport from "passport";
import nodemailer from "nodemailer";
import LocalStrategy from "passport-local";
import User from "../models/user.model.js";

passport.use(
  new LocalStrategy(async function verify(username, password, cb) {
    try {
      const user = await User.findOne({
  $or: [{ username }, { email: username }]  // accept either
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
          if (err) {
            return cb(err);
          }
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

export const loginController = (req, res, next) => {
  try {
    passport.authenticate("local", (err, user, info) => {
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
        if (err) {
          return res.status(500).json({
            success: false,
            error: "Failed to log in user.",
          });
        }

        req.session.save(() => {
          return res.status(200).json({
            success: true,
            message: "Login successful",
            data: req.user,
          });
        });
      });
    })(req, res, next);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
};

export const RegisterController = async (req, res, next) => {
  try {
    const { username, password, email, role } = req.body;

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

    // Generate salt
    const salt = crypto.randomBytes(16).toString("hex");

    // Hash password
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
            role,
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
          console.log(createErr);
          return res
            .status(500)
            .json({ success: false, error: "Error creating user." });
        }
      },
    );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error." });
  }
};


export const getCurrentUserController = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: "Not authenticated" });
  }
  return res.status(200).json({ success: true, user: req.user });
};


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    // Always respond 200 so you don't leak which emails exist
    if (!user) return res.status(200).json({ message: "If that email exists, a reset link has been sent." });

    const rawToken  = crypto.randomBytes(32).toString("hex");
    const hashed    = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken   = hashed;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   Number(process.env.SMTP_PORT),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from:    `"Gadget Store" <${process.env.SMTP_USER}>`,
      to:      user.email,
      subject: "Reset your password",
      html: `
        <p>Hi ${user.name},</p>
        <p>Click the link below to reset your password. It expires in 1 hour.</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });

    res.status(200).json({ message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    res.status(500).json({ message: "Failed to send reset email", error: error.message });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { token }    = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken:   hashed,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Token is invalid or has expired" });

    user.password             = password; // assumes pre-save bcrypt hook on model
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to reset password", error: error.message });
  }
};