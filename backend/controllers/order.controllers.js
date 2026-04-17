import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Variant from "../models/variant.model.js";


import { sendOrderConfirmationEmail } from "../Service/Email.service.js";
  import User from "../models/user.model.js";

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */

export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Destructuring using shipping_address as requested
    const { orderItems, shipping_address, paymentMethod } = req.body;


    // 1. Validation
    if (!orderItems || orderItems.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "No order items provided" });
    }

    let subtotal = 0;
    const itemsToSave = [];

    // 2. Loop through items to verify stock and grab Product IDs
    for (const item of orderItems) {
      const variant = await Variant.findById(item.variant).session(session);

      if (!variant) {
        throw new Error(`Variant not found for ID: ${item.variant}`);
      }

      if (!variant.is_active) {
        throw new Error(`Variant ${variant.sku} is currently unavailable`);
      }

      if (variant.stock < item.quantity) {
        throw new Error(`Insufficient stock for SKU: ${variant.sku}`);
      }

      // 3. Deduct stock from the variant
      variant.stock -= item.quantity;
      await variant.save({ session });

      // 4. Calculate prices
      subtotal += variant.price * item.quantity;

      // 5. Build the item according to OrderItemSchema
      itemsToSave.push({
        variant: variant._id,
        product: variant.product, // Required by your schema
        quantity: item.quantity,
        unit_price: variant.price,
      });
    }

    // 6. Create the Order in the database
    const order = await Order.create(
      [
        {
          user: req.user._id,
          items: itemsToSave,
          status: "pending",
          // Using the shipping_address variable from req.body
          shipping_address: {
            full_name: shipping_address.full_name,
            phone: shipping_address.phone,
            street: shipping_address.street,
            city: shipping_address.city,
            state: shipping_address.state,
            country: shipping_address.country,
            postal_code: shipping_address.postal_code,
          },
          payment_status: "unpaid",
         payment_method: paymentMethod,
          subtotal: subtotal,
          shipping_fee: 0, 
          total: subtotal, 
        },
      ],
      { session }
    );

    // 7. Commit the transaction
    await session.commitTransaction();
    session.endSession();
 
    const createdOrder = order[0];

      // 8. Send order-confirmation email (non-blocking – don't await in main flow)
    const buyer = await User.findById(req.user._id).select("email username").lean();
    if (buyer?.email) {
      sendOrderConfirmationEmail({
        to:       buyer.email,
        username: buyer.username,
        order:    createdOrder,
      }).catch((err) =>
        console.error("[email] Order confirmation failed:", err.message)
      );
    }
 
    res.status(201).json(createdOrder);

  } catch (error) {
    // If anything fails, abort the transaction to restore stock levels
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      message: error.message || "Failed to create order",
    });
  }
};;

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
      .populate("items.product", "name images condition")
     .populate("items.variant", "color storage ram price sku")

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Prevent users from viewing other users' orders
    if (
  order.user._id.toString() !== req.user._id.toString() &&
  req.user.role !== "admin"  // ✅ Matches user.model.js
) {
  return res.status(403).json({ message: "Not authorized to view this order" });
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
/**
 * @desc    Update order status & handle stock restoration on cancellation
 * @route   PATCH /api/orders/:id/status
 * @access  Admin
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status: newStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 1. Handle Stock Restoration if the order is being Cancelled
    // We check if the NEW status is 'cancelled' AND the CURRENT status is not already 'cancelled'
    if (newStatus === "cancelled" && order.status !== "cancelled") {
      
      // If the order was already delivered, we typically don't restore stock 
      // because the item is physically gone.
      if (order.status !== "delivered") {
        for (const item of order.items) {
          await Variant.findByIdAndUpdate(item.variant, {
            $inc: { stock: item.quantity },
          });
        }
        console.log(`Order ${order._id} cancelled: Stock returned to inventory.`);
      }
    }

    // 2. Update and Save
    order.status = newStatus || order.status;
    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
};;


/**
 * Add this function to your existing order.controllers.js
 *
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
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
 
    order.payment_status = payment_status;
    const updatedOrder = await order.save();
 
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update payment status",
      error: error.message,
    });
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

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
 // Log deletion for audit trail:
    console.log({
      action: "DELETE_ORDER",
      orderId: order._id,
      deletedBy: req.user._id,
      timestamp: new Date(),
      orderStatus: order.status,
      paymentStatus: order.payment_status,
      total: order.total,
    });

    /**
     * STOCK RESTORATION LOGIC
     * 1. If 'delivered': The item is gone. Do NOT restore.
     * 2. If 'cancelled': Stock should have been restored when the status changed. 
     * Do NOT restore again to avoid double-counting.
     */
    const shouldRestoreStock = order.status !== "delivered" && order.status !== "cancelled";

    if (shouldRestoreStock) {
      for (const item of order.items) {
        await Variant.findByIdAndUpdate(item.variant, {
          $inc: { stock: item.quantity },
        });
      }
      console.log(`Order ${order._id} deleted: Stock restored to inventory.`);
    } else {
      console.log(
        `Order ${order._id} deleted: No stock restored (Status: ${order.status}).`
      );
    }

    // Permanently remove the record from the database
    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
      message: "Order deleted successfully",
      stockRestored: shouldRestoreStock 
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete order",
      error: error.message,
    });
  }
};