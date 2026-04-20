// facebook.auth.js  —  drop this file next to your existing auth.controller.js
// and wire up the routes shown at the bottom.
//
// Required env vars (add these to your .env):
//   FACEBOOK_APP_ID=<your Facebook App ID>
//   FACEBOOK_APP_SECRET=<your Facebook App Secret>
//   FRONTEND_URL=http://localhost:5173   (already used by forgotPassword)
//
// Install the strategy if you haven't:
//   npm install passport-facebook

import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import User from "../models/user.model.js";

// ─── Passport serialise / deserialise ────────────────────────────────────────
// These are shared with your local strategy — only register them once.
// If you already have them in your main passport config file, remove them here.
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// ─── Facebook Strategy ────────────────────────────────────────────────────────
passport.use(
  new FacebookStrategy(
    {
      clientID:     process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      // This must match the "Valid OAuth Redirect URI" you set in the
      // Facebook App dashboard under Facebook Login > Settings.
      callbackURL: `${process.env.BACKEND_URL || "http://localhost:3000"}/api/v1/auth/facebook/callback`,
      // Ask for the email permission — the user must grant it.
      // Facebook only returns an email when the user has one attached
      // to their account AND grants the permission.
      profileFields: ["id", "displayName", "email", "name"],
      // Pass req into the verify callback so we can support
      // "connect to existing account" flows later if needed.
      passReqToCallback: false,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        // 1. Already signed up with Facebook?
        const existingFbUser = await User.findOne({ facebook_id: profile.id });
        if (existingFbUser) {
          return done(null, existingFbUser);
        }

        // 2. Facebook may or may not return an email.
        //    When it does, check whether that email is already on a local account.
        const email = profile.emails?.[0]?.value ?? null;

        if (email) {
          const existingEmailUser = await User.findOne({ email });

          if (existingEmailUser) {
            // The user previously signed up with a different method (local / Google).
            // Attach the Facebook ID to their existing account so both methods work.
            existingEmailUser.facebook_id = profile.id;

            // Only upgrade the provider field if the account has no password,
            // otherwise keep "local" so credential login still works.
            if (!existingEmailUser.hashed_password) {
              existingEmailUser.provider = "facebook";
            }

            await existingEmailUser.save();
            return done(null, existingEmailUser);
          }
        }

        // 3. Brand-new user — create a Facebook account.
        //    When Facebook doesn't provide an email we generate a placeholder.
        const fallbackEmail = email ?? `fb_${profile.id}@facebook-noemail.local`;

        // Build a unique username from the display name or Facebook ID.
        const baseUsername = (profile.displayName ?? `fb_${profile.id}`)
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "")
          .slice(0, 30);

        // Ensure the username doesn't already exist.
        let username = baseUsername;
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
          username = `${baseUsername}_${Date.now().toString(36)}`;
        }

        const newUser = await User.create({
          facebook_id: profile.id,
          provider:    "facebook",
          email:       fallbackEmail,
          username,
          name:        profile.displayName ?? username,
          role:        "user",
        });

        return done(null, newUser);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

// ─── Route handlers ───────────────────────────────────────────────────────────

/**
 * GET /api/v1/auth/facebook
 * Kicks off the Facebook OAuth flow.
 * The `email` scope is requested — the user can deny it, so always
 * code defensively (see the strategy above).
 */
export const facebookAuth = passport.authenticate("facebook", {
  scope: ["email"],
});

/**
 * GET /api/v1/auth/facebook/callback
 * Facebook redirects here after the user grants (or denies) permission.
 */
export const facebookAuthCallback = (req, res, next) => {
  passport.authenticate("facebook", (err, user, _info) => {
    if (err) {
      console.error("[facebook-auth] strategy error:", err);
      // Redirect to the signup page with a generic error flag
      return res.redirect(
        `${process.env.FRONTEND_URL}/signup?error=facebook`,
      );
    }

    if (!user) {
      // User denied the permission dialog or something went wrong
      return res.redirect(
        `${process.env.FRONTEND_URL}/signup?error=facebook`,
      );
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error("[facebook-auth] login error:", loginErr);
        return res.redirect(
          `${process.env.FRONTEND_URL}/signup?error=facebook`,
        );
      }

      req.session.save(() => {
        // Send the user back to wherever they were trying to go.
        // You can pass a ?redirect= param through the initial /auth/facebook
        // call and persist it in the session if you need deep-link support.
        return res.redirect(`${process.env.FRONTEND_URL}/`);
      });
    });
  })(req, res, next);
};

