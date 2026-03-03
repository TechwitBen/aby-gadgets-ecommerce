import mongoose from "mongoose";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */

import mongoose from "mongoose";
import { Order } from "../models/order.model.js";
import Variant from "../models/variant.model.js";

export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "No order items provided" });
    }

    let totalPrice = 0;

    const populatedItems = [];

    for (const item of orderItems) {
      const variant = await Variant.findById(item.variant).session(session);

      if (!variant) {
        throw new Error("Variant not found");
      }

      if (!variant.is_active) {
        throw new Error("Variant is not available");
      }

      if (variant.stock < item.quantity) {
        throw new Error(`Insufficient stock for SKU: ${variant.sku}`);
      }

      // Reduce variant stock
      variant.stock -= item.quantity;
      await variant.save({ session });

      totalPrice += variant.price * item.quantity;

      populatedItems.push({
        variant: variant._id,
        quantity: item.quantity,
        price: variant.price, // snapshot price at time of order
      });
    }

    const order = await Order.create(
      [
        {
          user: req.user._id,
          orderItems: populatedItems,
          shippingAddress,
          paymentMethod,
          totalPrice,
          status: "Processing",
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(order[0]);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      message: error.message || "Failed to create order",
    });
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
      .populate("orderItems.product", "name price")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
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
      .populate("user", "name email")
      .populate("orderItems.product", "name price");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Prevent users from viewing other users' orders
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Admin
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

/**
 * @desc    Update order status
 * @route   PATCH /api/orders/:id/status
 * @access  Admin
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status || order.status;

    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
};
