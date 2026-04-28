import crypto from "crypto";
import User from "../models/user.model.js";
import { createAccountNotification } from "../helpers/notification.helper.js";

// ── GET Profile ───────────────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-hashed_password -salt -resetPasswordToken -resetPasswordExpires")
      .lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
};

// ── UPDATE Profile ────────────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, profilePhoto } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name !== undefined)         user.name         = name.trim();
    if (phone !== undefined)        user.phone        = phone.trim();
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;

    await user.save();

    // Account notification (fire-and-forget)
    createAccountNotification(user._id, "profile_updated").catch(() => {});

    const safe = user.toObject();
    delete safe.hashed_password;
    delete safe.salt;
    delete safe.resetPasswordToken;
    delete safe.resetPasswordExpires;

    res.status(200).json(safe);
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
};

// ── CHANGE Password ───────────────────────────────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "currentPassword and newPassword are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify current password
    await new Promise((resolve, reject) => {
      crypto.pbkdf2(currentPassword, user.salt, 310000, 32, "sha256", (err, hash) => {
        if (err) return reject(err);
        if (!crypto.timingSafeEqual(Buffer.from(user.hashed_password, "hex"), hash)) {
          return reject(new Error("WRONG_PASSWORD"));
        }
        resolve();
      });
    });

    // Hash new password
    const newSalt = crypto.randomBytes(16).toString("hex");
    await new Promise((resolve, reject) => {
      crypto.pbkdf2(newPassword, newSalt, 310000, 32, "sha256", async (err, hash) => {
        if (err) return reject(err);
        user.hashed_password = hash.toString("hex");
        user.salt            = newSalt;
        await user.save();
        resolve();
      });
    });

    createAccountNotification(user._id, "password_changed").catch(() => {});

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    if (err.message === "WRONG_PASSWORD") {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    res.status(500).json({ message: "Failed to change password", error: err.message });
  }
};

// ── GET Addresses ─────────────────────────────────────────────────────────────
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("addresses").lean();
    res.status(200).json(user?.addresses ?? []);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch addresses", error: err.message });
  }
};

// ── ADD Address ───────────────────────────────────────────────────────────────
export const addAddress = async (req, res) => {
  try {
    const { label, full_name, phone, street, city, state, country, postal_code, isDefault } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.addresses) user.addresses = [];

    // If this is the first address or marked as default, clear existing defaults
    if (isDefault || user.addresses.length === 0) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    user.addresses.push({
      label:      label      || "Home",
      full_name:  full_name  || "",
      phone:      phone      || "",
      street:     street     || "",
      city:       city       || "",
      state:      state      || "",
      country:    country    || "Nigeria",
      postal_code:postal_code|| "",
      isDefault:  isDefault || user.addresses.length === 0,
    });

    await user.save();
    res.status(201).json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: "Failed to add address", error: err.message });
  }
};

// ── UPDATE Address ────────────────────────────────────────────────────────────
export const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const addr = user.addresses?.id(req.params.addrId);
    if (!addr) return res.status(404).json({ message: "Address not found" });

    const { label, full_name, phone, street, city, state, country, postal_code, isDefault } = req.body;

    if (label       !== undefined) addr.label       = label;
    if (full_name   !== undefined) addr.full_name   = full_name;
    if (phone       !== undefined) addr.phone       = phone;
    if (street      !== undefined) addr.street      = street;
    if (city        !== undefined) addr.city        = city;
    if (state       !== undefined) addr.state       = state;
    if (country     !== undefined) addr.country     = country;
    if (postal_code !== undefined) addr.postal_code = postal_code;

    if (isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
      addr.isDefault = true;
    }

    await user.save();
    res.status(200).json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: "Failed to update address", error: err.message });
  }
};

// ── DELETE Address ────────────────────────────────────────────────────────────
export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses = user.addresses?.filter(
      (a) => a._id.toString() !== req.params.addrId,
    ) ?? [];

    // Ensure at least one default if any addresses remain
    if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.status(200).json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: "Failed to delete address", error: err.message });
  }
};

// ── SET Default Address ───────────────────────────────────────────────────────
export const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses?.forEach((a) => {
      a.isDefault = a._id.toString() === req.params.addrId;
    });

    await user.save();
    res.status(200).json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: "Failed to set default address", error: err.message });
  }
};

// ── GET Notification Preferences ──────────────────────────────────────────────
export const getNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("notificationPreferences").lean();
    res.status(200).json(user?.notificationPreferences ?? {
      orderUpdates:        true,
      emailNotifications:  true,
      paymentAlerts:       true,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch preferences", error: err.message });
  }
};

// ── UPDATE Notification Preferences ──────────────────────────────────────────
export const updateNotificationPreferences = async (req, res) => {
  try {
    const { orderUpdates, emailNotifications, paymentAlerts } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.notificationPreferences) {
      user.notificationPreferences = { orderUpdates: true, emailNotifications: true, paymentAlerts: true };
    }

    if (orderUpdates       !== undefined) user.notificationPreferences.orderUpdates       = Boolean(orderUpdates);
    if (emailNotifications !== undefined) user.notificationPreferences.emailNotifications = Boolean(emailNotifications);
    if (paymentAlerts      !== undefined) user.notificationPreferences.paymentAlerts      = Boolean(paymentAlerts);

    await user.save();
    res.status(200).json(user.notificationPreferences);
  } catch (err) {
    res.status(500).json({ message: "Failed to update preferences", error: err.message });
  }
};