import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} from "../configs/.env.configs.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/v1/auth/google/callback",
    },
    async function verify(accessToken, refreshToken, profile, cb) {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const name = profile.displayName;

        let user = await User.findOne({ email });

        if (!user) {
          user = new User({
            email,
            name,
            google_id: googleId,
            provider: "google",
          });
          await user.save();
        } else if (user.provider === "local") {
          user.google_id = googleId;
          user.provider = "google";
          await user.save();
        }

        return cb(null, user);
      } catch (err) {
        return cb(err);
      }
    },
  ),
);

export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleCallback = (req, res, next) => {
  passport.authenticate("google", (err, user, info) => {
    if (err) {
      return res.redirect("http://localhost:5173/login?error=google");
    }

    if (!user) {
      return res.redirect("http://localhost:5173/login?error=google");
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.redirect("http://localhost:5173/login?error=google");
      }

      req.session.save(() => {
        res.redirect("http://localhost:5173/");
      });
    });
  })(req, res, next);
};
