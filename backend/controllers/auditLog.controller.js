import AuditLog from "../models/auditLog.model.js";

// ── GET audit logs (admin only) ───────────────────────────────────────────────
export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action } = req.query;
    const filter = {};
    if (action) filter.action = action;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate("performedBy", "name username email role")
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit)),
      AuditLog.countDocuments(filter),
    ]);

    return res.status(200).json({ success: true, logs, total, page: Number(page) });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch audit logs." });
  }
};

// ── GET unread count (for bell badge) ────────────────────────────────────────
export const getUnreadCount = async (req, res) => {
  try {
    // Logs from the last 24h that the current user didn't perform
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const count = await AuditLog.countDocuments({
      createdAt: { $gte: since },
      performedBy: { $ne: req.user._id },
    });
    return res.status(200).json({ success: true, count });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch count." });
  }
};