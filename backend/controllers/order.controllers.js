import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Variant from "../models/variant.model.js";

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

    // Return the created order (first item in the array)
    res.status(201).json(order[0]);

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
