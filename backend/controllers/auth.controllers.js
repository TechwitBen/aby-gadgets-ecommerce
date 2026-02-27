import crypto from "crypto";
import passport from "passport";
import LocalStrategy from "passport-local";
import User from "../models/user.model.js";

passport.use(
  new LocalStrategy(async function verify(username, password, cb) {
    try {
      const user = await User.findOne({ where: { username } });
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
              hashedPassword
            )
          ) {
            return cb(null, false, {
              success: false,
              message: "Incorrect username or password.",
            });
          }
          return cb(null, user);
        }
      );
    } catch (err) {
      return cb(err);
    }
  })
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
          });
        });
      });
    })(req, res, next);
  } catch (error) {
    console.log(error);
  }
};

export const RegisterController = async (req, res, next) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        error: "Username, email and password are required.",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "A user with that username already exists.",
      });
    }

    const existingEmail = await User.findOne({ where: { email } });
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
      }
    );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error." });
  }
};
