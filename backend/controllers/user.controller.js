/**
 * User controller
 *
 * CHANGE: profilePhoto has been removed entirely.
 * Avatars are now generated on the frontend from the user's name/username/email initials.
 *
 * CHANGE: full_name and phone have been removed from the address sub-document.
 * When a shipping label or delivery contact is needed, callers should read
 * `user.name` and `user.phone` from the parent user document instead.
 */

import User from "../models/user.model.js";

// ── GET /user/profile ─────────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-hashed_password -salt -resetPasswordToken -resetPasswordExpires",
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
};

// ── PATCH /user/profile ───────────────────────────────────────────────────────
// Only name and phone are updatable — profilePhoto has been removed.
export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updates = {};
    if (name  !== undefined) updates.name  = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      {
        new: true,
        select: "-hashed_password -salt -resetPasswordToken -resetPasswordExpires",
      },
    );
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

// ── PATCH /user/change-password ───────────────────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both passwords are required" });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const valid = await user.comparePassword(currentPassword);
    if (!valid) return res.status(401).json({ success: false, message: "Current password is incorrect" });

    user.hashed_password = await user.hashPassword(newPassword);
    await user.save();
    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to change password" });
  }
};

// ── GET /user/addresses ───────────────────────────────────────────────────────
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("addresses");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json(user.addresses);
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch addresses" });
  }
};

// ── POST /user/addresses ──────────────────────────────────────────────────────
export const addAddress = async (req, res) => {
  try {
    const { label, street, city, state, country, postal_code, isDefault } = req.body;

    if (!street || !city) {
      return res.status(400).json({ success: false, message: "Street and city are required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (isDefault) {
      user.addresses.forEach((a) => { a.isDefault = false; });
    }

    user.addresses.push({
      label:       label       ?? "Home",
      street:      street.trim(),
      city:        city.trim(),
      state:       state       ?? "Lagos",
      country:     country     ?? "Nigeria",
      postal_code: postal_code ?? "",
      isDefault:   isDefault   ?? false,
    });

    // Auto-default first address
    if (user.addresses.length === 1) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    return res.status(201).json(user.addresses);
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to add address" });
  }
};

// ── PUT /user/addresses/:addrId ───────────────────────────────────────────────
export const updateAddress = async (req, res) => {
  try {
    const { addrId } = req.params;
    const { label, street, city, state, country, postal_code, isDefault } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const addr = user.addresses.id(addrId);
    if (!addr) return res.status(404).json({ success: false, message: "Address not found" });

    if (isDefault) {
      user.addresses.forEach((a) => { a.isDefault = false; });
    }

    if (label       !== undefined) addr.label       = label;
    if (street      !== undefined) addr.street      = street.trim();
    if (city        !== undefined) addr.city        = city.trim();
    if (state       !== undefined) addr.state       = state;
    if (country     !== undefined) addr.country     = country;
    if (postal_code !== undefined) addr.postal_code = postal_code;
    if (isDefault   !== undefined) addr.isDefault   = isDefault;

    await user.save();
    return res.status(200).json(user.addresses);
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to update address" });
  }
};

// ── DELETE /user/addresses/:addrId ────────────────────────────────────────────
export const deleteAddress = async (req, res) => {
  try {
    const { addrId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const addr = user.addresses.id(addrId);
    if (!addr) return res.status(404).json({ success: false, message: "Address not found" });

    const wasDefault = addr.isDefault;
    addr.deleteOne();

    // Promote first remaining address to default if the deleted one was default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    return res.status(200).json(user.addresses);
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to delete address" });
  }
};

// ── PATCH /user/addresses/:addrId/default ────────────────────────────────────
export const setDefaultAddress = async (req, res) => {
  try {
    const { addrId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const addr = user.addresses.id(addrId);
    if (!addr) return res.status(404).json({ success: false, message: "Address not found" });

    user.addresses.forEach((a) => { a.isDefault = false; });
    addr.isDefault = true;

    await user.save();
    return res.status(200).json(user.addresses);
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to set default address" });
  }
};

// ── GET /user/notification-preferences ───────────────────────────────────────
export const getNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("notificationPreferences");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json(user.notificationPreferences);
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch preferences" });
  }
};

// ── PATCH /user/notification-preferences ─────────────────────────────────────
export const updateNotificationPreferences = async (req, res) => {
  try {
    const { orderUpdates, emailNotifications, paymentAlerts } = req.body;
    const updates = {};
    if (orderUpdates       !== undefined) updates["notificationPreferences.orderUpdates"]       = orderUpdates;
    if (emailNotifications !== undefined) updates["notificationPreferences.emailNotifications"] = emailNotifications;
    if (paymentAlerts      !== undefined) updates["notificationPreferences.paymentAlerts"]      = paymentAlerts;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, select: "notificationPreferences" },
    );
    return res.status(200).json(user.notificationPreferences);
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to update preferences" });
  }
};