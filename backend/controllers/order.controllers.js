/**
 * ORDER CONTROLLER — with notification hooks
 *
 * Changes vs original:
 *  1. createOrder      → fires "order.pending" notification after commit
 *  2. updateOrderStatus → fires status-specific notification after save
 *
 * Everything else is identical to the original.
 */

import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Variant from "../models/variant.model.js";
import { createAuditLog } from "../middlewares/auth.middleware.js";
import { generateOrderNumber } from "../helpers/Idgenerator.helper.js";
import { sendOrderConfirmationEmail } from "../Service/Email.service.js";
import User from "../models/user.model.js";
import {
  createOrderNotification,
} from "../helpers/notification.helper.js"; // ← NEW

// ── Helper: generate a short pickup code ─────────────────────────────────────
const makePickupCode = () =>
  `PKP-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      orderItems,
      shipping_address,
      paymentMethod,
      fulfillment_type = "delivery",
      delivery_city,
      shipping_fee: reqShippingFee,
      pickup_location,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "No order items provided" });
    }

    let subtotal = 0;
    const itemsToSave = [];

    for (const item of orderItems) {
      const variant = await Variant.findById(item.variant).session(session);
      if (!variant)            throw new Error(`Variant not found for ID: ${item.variant}`);
      if (!variant.is_active)  throw new Error(`Variant ${variant.sku} is currently unavailable`);
      if (variant.stock < item.quantity) throw new Error(`Insufficient stock for SKU: ${variant.sku}`);

      variant.stock -= item.quantity;
      await variant.save({ session });
      subtotal += variant.price * item.quantity;

      itemsToSave.push({
        variant:    variant._id,
        product:    variant.product,
        quantity:   item.quantity,
        unit_price: variant.price,
      });
    }

    const isPickup    = fulfillment_type === "pickup";
    const shippingFee = isPickup ? 0 : Number(reqShippingFee) || 0;
    const total       = subtotal + shippingFee;
    const pickup_code = isPickup ? makePickupCode() : undefined;

    const order_number = await generateOrderNumber(session);

    const orderData = {
      order_number,
      user:            req.user._id,
      items:           itemsToSave,
      status:          "pending",
      fulfillment_type,
      payment_status:  "unpaid",
      payment_method:  paymentMethod,
      subtotal,
      shipping_fee:    shippingFee,
      total,
    };

    if (!isPickup) {
      orderData.delivery_city    = delivery_city;
      orderData.shipping_address = {
        full_name:   shipping_address?.full_name,
        phone:       shipping_address?.phone,
        street:      shipping_address?.street,
        city:        delivery_city || shipping_address?.city,
        state:       shipping_address?.state,
        country:     shipping_address?.country || "Nigeria",
        postal_code: shipping_address?.postal_code,
      };
    }

    if (isPickup) {
      orderData.pickup_code     = pickup_code;
      orderData.pickup_location = pickup_location || "";
      orderData.shipping_address = {
        full_name: shipping_address?.full_name,
        phone:     shipping_address?.phone,
        street:    "",
        city:      "Store Pickup",
        state:     "Lagos",
        country:   "Nigeria",
      };
    }

    const order = await Order.create([orderData], { session });
    await session.commitTransaction();
    session.endSession();

    const createdOrder = order[0];

    // ── Non-blocking: email + "Order Placed" notification ─────────────────
    const buyer = await User.findById(req.user._id).select("email username notificationPreferences").lean();

    if (buyer?.email) {
      sendOrderConfirmationEmail({
        to:       buyer.email,
        username: buyer.username,
        order:    createdOrder,
      }).catch((err) => console.error("[email] Order confirmation failed:", err.message));
    }

    // Only create notification if user has orderUpdates enabled (or prefs not set)
    if (buyer?.notificationPreferences?.orderUpdates !== false) {
      createOrderNotification(req.user._id, createdOrder, "pending").catch(() => {});
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message || "Failed to create order" });
  }
};

/**
 * @desc    Get logged-in user's orders
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name images")
      .populate("items.variant", "color storage ram price sku")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "name images condition")
      .populate("items.variant", "color storage ram price sku");

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order", error: error.message });
  }
};

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Admin
 */
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find({})
        .populate("user", "name email")
        .populate("items.product", "name images condition")
        .populate("items.variant", "color storage ram price sku")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(),
    ]);

    res.status(200).json({
      orders,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

/**
 * @desc    Update order status & handle stock restoration on cancellation
 * @route   PATCH /api/orders/:id/status
 * @access  Admin
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status: newStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (newStatus === "cancelled" && order.status !== "cancelled") {
      if (order.status !== "delivered" && order.status !== "collected") {
        for (const item of order.items) {
          await Variant.findByIdAndUpdate(item.variant, { $inc: { stock: item.quantity } });
        }
        console.log(`Order ${order._id} cancelled: Stock returned.`);
      }
    }

    order.status = newStatus || order.status;
    const updatedOrder = await order.save();

    await createAuditLog({
      action:      "UPDATE_ORDER_STATUS",
      userId:      req.user._id,
      targetId:    order._id,
      targetModel: "Order",
      details:     { from: order.status, to: newStatus },
    });

    // ── Fire notification to the order owner ──────────────────────────────
    // Fetch user prefs to respect their orderUpdates preference
    const orderUser = await User.findById(order.user).select("notificationPreferences").lean();
    if (orderUser?.notificationPreferences?.orderUpdates !== false) {
      createOrderNotification(order.user, updatedOrder, newStatus).catch(() => {});
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Failed to update order status", error: error.message });
  }
};

/**
 * @desc    Update order payment status (Admin only)
 * @route   PATCH /api/orders/:id/payment-status
 * @access  Admin
 */
export const updateOrderPaymentStatus = async (req, res) => {
  try {
    const { payment_status } = req.body;

    const validStatuses = ["unpaid", "paid", "refunded"];
    if (!payment_status || !validStatuses.includes(payment_status)) {
      return res.status(400).json({
        message: `payment_status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.payment_status = payment_status;
    const updatedOrder = await order.save();

    await createAuditLog({
      action:      "UPDATE_PAYMENT_STATUS",
      userId:      req.user._id,
      targetId:    order._id,
      targetModel: "Order",
      details:     { payment_status },
    });

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Failed to update payment status", error: error.message });
  }
};

/**
 * @desc    Delete order & conditionally restore stock
 * @route   DELETE /api/orders/:id
 * @access  Admin
 */
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const shouldRestoreStock =
      order.status !== "delivered" &&
      order.status !== "collected" &&
      order.status !== "cancelled";

    if (shouldRestoreStock) {
      for (const item of order.items) {
        await Variant.findByIdAndUpdate(item.variant, { $inc: { stock: item.quantity } });
      }
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Order deleted successfully", stockRestored: shouldRestoreStock });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete order", error: error.message });
  }
};