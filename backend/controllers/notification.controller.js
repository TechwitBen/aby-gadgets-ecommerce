import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { createNotification } from "../helpers/notification.helper.js";

/**
 * @desc  Get notifications for current user (paginated + filterable by type)
 * @route GET /api/v1/notifications
 */
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 30, type } = req.query;
    const filter = { user: req.user._id };
    if (type && type !== "all") filter.type = type;

    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ user: req.user._id, isRead: false }),
    ]);

    res
      .status(200)
      .json({ notifications, total, unreadCount, page: Number(page) });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch notifications", error: err.message });
  }
};

/**
 * @desc  Get unread notification count (lightweight, used by header badge)
 * @route GET /api/v1/notifications/unread-count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });
    res.status(200).json({ count });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get count", error: err.message });
  }
};

/**
 * @desc  Mark a single notification as read
 * @route PATCH /api/v1/notifications/:id/read
 */
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true },
    );
    if (!notification)
      return res.status(404).json({ message: "Notification not found" });
    res.status(200).json(notification);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to mark as read", error: err.message });
  }
};

/**
 * @desc  Mark ALL notifications as read for current user
 * @route PATCH /api/v1/notifications/read-all
 */
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true },
    );
    res.status(200).json({ message: "All marked as read" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to mark all as read", error: err.message });
  }
};

/**
 * @desc  Delete a single notification
 * @route DELETE /api/v1/notifications/:id
 */
export const deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    res.status(200).json({ message: "Notification deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete notification", error: err.message });
  }
};

/**
 * @desc  Admin → send a custom message to a specific user
 * @route POST /api/v1/notifications/admin-message
 * @access Admin
 */
export const sendAdminMessage = async (req, res) => {
  try {
    const { userId, title, message, orderId, orderNumber } = req.body;

    if (!userId || !title?.trim() || !message?.trim()) {
      return res
        .status(400)
        .json({ message: "userId, title, and message are required" });
    }

    const user = await User.findById(userId).select("_id");
    if (!user) return res.status(404).json({ message: "User not found" });

    await createNotification({
      userId,
      type: "admin_message",
      title: title.trim(),
      message: message.trim(),
      icon: "💬",
      orderId,
      orderNumber,
      actionType: orderId ? "view_order" : null,
      actionId: orderId ? String(orderId) : undefined,
    });

    res.status(200).json({ message: "Message sent to user" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to send admin message", error: err.message });
  }
};
