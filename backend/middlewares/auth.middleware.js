import AuditLog from "../models/auditLog.model.js";

// ── Basic auth ────────────────────────────────────────────────────────────────
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ success: false, message: "Not authenticated" });
};

// ── Admin only ────────────────────────────────────────────────────────────────
export const isAdmin = (req, res, next) => {
  if (!req.isAuthenticated?.()) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied. Admins only." });
  }
  next();
};

// ── Admin or active staff ─────────────────────────────────────────────────────
export const isAdminOrStaff = (req, res, next) => {
  if (!req.isAuthenticated?.()) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  const { role, staffStatus } = req.user;
  if (role !== "admin" && role !== "staff") {
    return res.status(403).json({ success: false, message: "Access denied." });
  }
  if (role === "staff" && staffStatus !== "active") {
    return res.status(403).json({
      success: false,
      message: "Your account is inactive. Contact your administrator.",
    });
  }
  next();
};

// ── Staff permission check factory ───────────────────────────────────────────
// Usage: checkPermission("order", "viewOrder")
export const checkPermission = (category, permission) => (req, res, next) => {
  // Admin always passes
  if (req.user.role === "admin") return next();

  const perms = req.user.staffPermissions?.[category];
  if (!perms || !perms[permission]) {
    return res.status(403).json({
      success: false,
      message: `You don't have permission: ${category}.${permission}`,
    });
  }
  next();
};

// ── Audit log helper (call anywhere in controllers) ───────────────────────────
export const createAuditLog = async ({ action, userId, targetId = null, targetModel = null, details = {} }) => {
  try {
    await AuditLog.create({ action, performedBy: userId, targetId, targetModel, details });
  } catch (err) {
    console.error("[AuditLog] Failed to create entry:", err.message);
  }
};