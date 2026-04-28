import Notification from "../models/notification.model.js";

/**
 * Fire-and-forget notification creator.
 * Never throws — failures are logged and swallowed so they never break the
 * calling controller's transaction.
 */
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  icon = "🔔",
  orderId,
  orderNumber,
  actionType = null,
  actionId,
  data,
}) => {
  try {
    await Notification.create({
      user: userId,
      type,
      title,
      message,
      icon,
      orderId,
      orderNumber,
      actionType,
      actionId,
      data,
    });
  } catch (err) {
    console.error("[notification] Failed to create notification:", err.message);
  }
};

// ── Order-specific shortcuts ──────────────────────────────────────────────────

const ORDER_NOTIFICATION_CONFIG = {
  pending: {
    title: "Order Placed",
    message: (num) => `Your order ${num} has been placed and is awaiting confirmation.`,
    icon: "🛍️",
    actionType: "view_orders",
  },
  confirmed: {
    title: "Order Confirmed",
    message: (num) => `Great news! Your order ${num} has been confirmed and is being prepared.`,
    icon: "✅",
    actionType: "track_order",
  },
  shipped: {
    title: "Order Shipped",
    message: (num) => `Your order ${num} is on its way! Track it to see real-time updates.`,
    icon: "📦",
    actionType: "track_order",
  },
  out_for_delivery: {
    title: "Out for Delivery",
    message: (num) => `Your order ${num} is out for delivery. Please keep your phone handy!`,
    icon: "🚚",
    actionType: "track_order",
  },
  delivered: {
    title: "Order Delivered 🎉",
    message: (num) => `Your order ${num} has been delivered successfully. Enjoy your purchase!`,
    icon: "🎉",
    actionType: "view_order",
  },
  ready_for_pickup: {
    title: "Ready for Pickup",
    message: (num, data) =>
      `Your order ${num} is ready for pickup. Show code ${data?.pickupCode ?? ""} at the store.`,
    icon: "🏪",
    actionType: "track_order",
  },
  collected: {
    title: "Order Collected",
    message: (num) => `Your order ${num} has been collected from our store. Thank you!`,
    icon: "✅",
    actionType: "view_order",
  },
  cancelled: {
    title: "Order Cancelled",
    message: (num) => `Your order ${num} has been cancelled.`,
    icon: "❌",
    actionType: "view_orders",
  },
  refunded: {
    title: "Refund Issued",
    message: (num) => `A refund has been issued for your order ${num}. Please allow 3–5 business days.`,
    icon: "💸",
    actionType: "view_orders",
  },
};

export const createOrderNotification = async (userId, order, newStatus) => {
  const cfg = ORDER_NOTIFICATION_CONFIG[newStatus];
  if (!cfg) return;

  const displayNum = order.order_number ? `#${order.order_number}` : `#${String(order._id).slice(-8).toUpperCase()}`;
  const data = newStatus === "ready_for_pickup" ? { pickupCode: order.pickup_code } : undefined;

  await createNotification({
    userId,
    type: "order",
    title: cfg.title,
    message: cfg.message(displayNum, data),
    icon: cfg.icon,
    orderId: order._id,
    orderNumber: order.order_number,
    actionType: cfg.actionType,
    actionId: String(order._id),
    data,
  });
};

// ── Payment-specific shortcuts ────────────────────────────────────────────────

export const createPaymentNotification = async (userId, { status, amount, reference, orderId, orderNumber }) => {
  const displayNum = orderNumber ? `#${orderNumber}` : "";
  const fmt = (n) => `₦${Number(n).toLocaleString()}`;

  const configs = {
    success: {
      title: "Payment Successful",
      message: `Your payment of ${fmt(amount)} for order ${displayNum} was successful.`,
      icon: "💳",
    },
    failed: {
      title: "Payment Failed",
      message: `Payment for order ${displayNum} failed. Please try again from your Orders page.`,
      icon: "⚠️",
    },
    cancelled: {
      title: "Payment Cancelled",
      message: `Payment for order ${displayNum} was cancelled. Visit your Orders page to retry.`,
      icon: "❌",
    },
    pending: {
      title: "Payment Pending",
      message: `We're waiting for payment confirmation for order ${displayNum}.`,
      icon: "⏳",
    },
    refunded: {
      title: "Refund Issued",
      message: `A refund of ${fmt(amount)} has been issued for order ${displayNum}.`,
      icon: "💸",
    },
  };

  const cfg = configs[status];
  if (!cfg) return;

  await createNotification({
    userId,
    type: "payment",
    title: cfg.title,
    message: cfg.message,
    icon: cfg.icon,
    orderId,
    orderNumber,
    actionType: "view_orders",
    data: { reference, amount },
  });
};

// ── Account-specific shortcuts ────────────────────────────────────────────────

export const createAccountNotification = async (userId, eventType, extra = {}) => {
  const configs = {
    password_changed: {
      title: "Password Changed",
      message: "Your account password was changed successfully. If this wasn't you, contact support immediately.",
      icon: "🔐",
    },
    email_updated: {
      title: "Email Updated",
      message: `Your email address has been updated to ${extra.email ?? "a new address"}.`,
      icon: "📧",
    },
    profile_updated: {
      title: "Profile Updated",
      message: "Your profile information has been updated successfully.",
      icon: "👤",
    },
    new_login: {
      title: "New Login Detected",
      message: "A new login was detected on your account. If this wasn't you, please change your password immediately.",
      icon: "🔑",
    },
  };

  const cfg = configs[eventType];
  if (!cfg) return;

  await createNotification({
    userId,
    type: "account",
    title: cfg.title,
    message: cfg.message,
    icon: cfg.icon,
    data: extra,
  });
};