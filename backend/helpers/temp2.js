import Notification from "../models/notification.model.js";

/**
 * Fire-and-forget notification creator.
 * Never throws — failures are logged and swallowed so they never break
 * the calling controller's transaction or response.
 */
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  icon = "bell",
  orderId,
  orderNumber,
  actionType = null,
  actionId,
  data,
}) => {
  try {
    await Notification.create({
      user:        userId,
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

// ─────────────────────────────────────────────────────────────────────────────
// ORDER NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
const ORDER_NOTIFICATION_CONFIG = {
  pending: {
    title:      "Order Placed",
    message:    (num) => `Your order ${num} has been placed and is awaiting confirmation.`,
    icon:       "order-placed",
    actionType: "view_orders",
  },
  confirmed: {
    title:      "Order Confirmed",
    message:    (num) => `Your order ${num} has been confirmed and is being prepared.`,
    icon:       "order-confirmed",
    actionType: "track_order",
  },
  shipped: {
    title:      "Order Shipped",
    message:    (num) => `Your order ${num} is on its way. Track it for real-time updates.`,
    icon:       "order-shipped",
    actionType: "track_order",
  },
  out_for_delivery: {
    title:      "Out for Delivery",
    message:    (num) => `Your order ${num} is out for delivery. Please keep your phone handy!`,
    icon:       "order-delivery",
    actionType: "track_order",
  },
  delivered: {
    title:      "Order Delivered",
    message:    (num) => `Your order ${num} has been delivered successfully. Enjoy your purchase!`,
    icon:       "order-delivered",
    actionType: "view_order",
  },
  ready_for_pickup: {
    title:      "Ready for Pickup",
    message:    (num, data) =>
      `Your order ${num} is ready for pickup.${
        data?.pickupCode ? ` Show code ${data.pickupCode} at the store.` : ""
      }`,
    icon:       "order-pickup-ready",
    actionType: "track_order",
  },
  collected: {
    title:      "Order Collected",
    message:    (num) => `Your order ${num} has been collected from our store. Thank you!`,
    icon:       "order-collected",
    actionType: "view_order",
  },
  cancelled: {
    title:      "Order Cancelled",
    message:    (num) => `Your order ${num} has been cancelled.`,
    icon:       "order-cancelled",
    actionType: "view_orders",
  },
  refunded: {
    title:      "Refund Issued",
    message:    (num) =>
      `A refund has been issued for your order ${num}. Please allow 3–5 business days.`,
    icon:       "order-refunded",
    actionType: "view_orders",
  },
};

export const createOrderNotification = async (userId, order, newStatus) => {
  const cfg = ORDER_NOTIFICATION_CONFIG[newStatus];
  if (!cfg) return;

  const displayNum = order.order_number
    ? `#${order.order_number}`
    : `#${String(order._id).slice(-8).toUpperCase()}`;

  const data =
    newStatus === "ready_for_pickup"
      ? { pickupCode: order.pickup_code }
      : undefined;

  await createNotification({
    userId,
    type:        "order",
    title:       cfg.title,
    message:     cfg.message(displayNum, data),
    icon:        cfg.icon,
    orderId:     order._id,
    orderNumber: order.order_number,
    actionType:  cfg.actionType,
    actionId:    String(order._id),
    data,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
export const createPaymentNotification = async (
  userId,
  { status, amount, reference, orderId, orderNumber }
) => {
  const displayNum = orderNumber ? `#${orderNumber}` : "";
  const fmtAmount  = (n) => `₦${Number(n).toLocaleString()}`;

  const configs = {
    success: {
      title:      "Payment Successful",
      message:    `Your payment of ${fmtAmount(amount)} for order ${displayNum} was successful. Your order is now confirmed.`,
      icon:       "payment-success",
      actionType: "view_order",
    },
    pending: {
      title:      "Payment Processing",
      message:    `We are waiting for payment confirmation for order ${displayNum}. This usually resolves within a minute.`,
      icon:       "payment-pending",
      actionType: "view_orders",
    },
    failed: {
      title:      "Payment Failed",
      message:    `Your payment of ${fmtAmount(amount)} for order ${displayNum} was declined by your bank or card. Tap to retry with a different method.`,
      icon:       "payment-failed",
      // IMPORTANT: track_order so the customer lands on the retry banner
      actionType: "track_order",
    },
    cancelled: {
      title:      "Payment Cancelled",
      message:    `Your payment for order ${displayNum} was cancelled or abandoned. Tap to complete your payment.`,
      icon:       "payment-cancelled",
      // IMPORTANT: track_order so the customer lands on the retry banner
      actionType: "track_order",
    },
    refunded: {
      title:      "Refund Issued",
      message:    `A refund of ${fmtAmount(amount)} has been issued for order ${displayNum}. Please allow 3–5 business days.`,
      icon:       "payment-refunded",
      actionType: "view_orders",
    },
  };

  const cfg = configs[status];
  if (!cfg) {
    console.warn(`[notification] Unknown payment status: ${status}`);
    return;
  }

  // FIX: Deduplicate "Payment Processing" notifications.
  //
  // `initializePayment` is called on every retry attempt, which previously
  // created a new "Payment Processing" notification each time.
  // Three retries → three identical notifications in the user's feed.
  //
  // Guard: before inserting a `pending` notification, check if one already
  // exists for the same user + order. If so, skip silently.
  //
  // All other statuses (success, failed, cancelled, refunded) represent real
  // state transitions and are always inserted regardless of duplicates.
  if (status === "pending" && orderId) {
    const alreadyExists = await Notification.exists({
      user:    userId,
      type:    "payment",
      orderId,
      title:   cfg.title, // "Payment Processing"
    });
    if (alreadyExists) return;
  }

  await createNotification({
    userId,
    type:        "payment",
    title:       cfg.title,
    message:     cfg.message,
    icon:        cfg.icon,
    orderId,
    orderNumber,
    actionType:  cfg.actionType,
    // actionId = the orderId so "track_order" links to /track-order/:orderId
    actionId:    orderId ? String(orderId) : undefined,
    data:        { reference, amount },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
export const createAccountNotification = async (userId, eventType, extra = {}) => {
  const configs = {
    password_changed: {
      title:   "Password Changed",
      message: "Your account password was changed successfully. If this wasn't you, contact support immediately.",
      icon:    "account-security",
    },
    email_updated: {
      title:   "Email Updated",
      message: `Your email address has been updated to ${extra.email ?? "a new address"}.`,
      icon:    "account-email",
    },
    profile_updated: {
      title:   "Profile Updated",
      message: "Your profile information has been updated successfully.",
      icon:    "account-profile",
    },
    new_login: {
      title:   "New Login Detected",
      message: "A new login was detected on your account. If this wasn't you, please change your password immediately.",
      icon:    "account-login",
    },
  };

  const cfg = configs[eventType];
  if (!cfg) {
    console.warn(`[notification] Unknown account event: ${eventType}`);
    return;
  }

  await createNotification({
    userId,
    type:    "account",
    title:   cfg.title,
    message: cfg.message,
    icon:    cfg.icon,
    data:    extra,
  });
};