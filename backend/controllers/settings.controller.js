import Settings from "../models/settings.model.js";
import { createAuditLog } from "../middlewares/auth.middleware.js";

// ── GET settings (admin only) ─────────────────────────────────────────────────
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ singleton: true });
    if (!settings) settings = await Settings.create({ singleton: true });
    return res.status(200).json({ success: true, settings });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch settings." });
  }
};

// ── GET delivery zones (authenticated users — needed by checkout) ─────────────
export const getDeliveryZones = async (req, res) => {
  try {
    let settings = await Settings.findOne({ singleton: true });
    if (!settings) settings = await Settings.create({ singleton: true });
    return res.status(200).json({
      success: true,
      zones:           settings.deliveryZones,
      enablePickup:    settings.enablePickup,
      enableDelivery:  settings.enableDelivery,
      pickupAddress:   settings.pickupAddress,
      pickupHours:     settings.pickupHours,
      pickupInstructions: settings.pickupInstructions,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch delivery zones." });
  }
};

// ── UPDATE settings (admin only) ─────────────────────────────────────────────
export const updateSettings = async (req, res) => {
  try {
    const allowedFields = [
      // Business info
      "storeName", "businessEmail", "businessPhone", "currency",
      "operatingCity", "storeAddress",
      // Bank
      "bankName", "accountName", "accountNumber",
      // Payment methods
      "bankTransfer", "payOnDelivery", "onlinePayment",
      // Fulfillment toggles
      "enablePickup", "enableDelivery",
      // Pickup info
      "pickupAddress", "pickupHours", "pickupInstructions",
      // Delivery zones (entire array replaced)
      "deliveryZones",
    ];

    const updates = {};
    allowedFields.forEach((f) => {
      if (f in req.body) updates[f] = req.body[f];
    });

    const settings = await Settings.findOneAndUpdate(
      { singleton: true },
      { $set: updates },
      { new: true, upsert: true },
    );

    await createAuditLog({
      action:     "UPDATE_SETTINGS",
      userId:     req.user._id,
      targetModel:"Settings",
      details:    updates,
    });

    return res.status(200).json({ success: true, settings });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update settings." });
  }
};