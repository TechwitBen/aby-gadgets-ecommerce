import axios from "axios";
import crypto from "crypto";
import mongoose from "mongoose";
import Payment from "../models/payment.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import { generatePaymentNumber } from "../helpers/Idgenerator.helper.js";
import { createPaymentNotification } from "../helpers/notification.helper.js";

console.log("Paystack key loaded:", !!process.env.PAYSTACK_SECRET_KEY);

const paystack = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

// ── Helper: check if user has payment alerts enabled ──────────────────────────
const userWantsPaymentAlerts = async (userId) => {
  try {
    const user = await User.findById(userId)
      .select("notificationPreferences")
      .lean();
    // If prefs not set yet, default to true
    return user?.notificationPreferences?.paymentAlerts !== false;
  } catch {
    return true; // fail open — don't suppress notifications on error
  }
};

/**
 * @desc    Initialize a Paystack payment for an existing order
 * @route   POST /api/v1/payment/initialize
 * @access  Private
 */
export const initializePayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId } = req.body;

    if (!orderId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Order ID is required" });
    }

    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Order not found" });
    }

    if (!order.user || !req.user._id) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (order.payment_status !== "unpaid") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Order already paid" });
    }

    // Gateway reference (used for Paystack verification — never changes)
    const reference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Human-readable payment number (atomic, rolls back if transaction fails)
    const payment_number = await generatePaymentNumber(session);

    const payment = await Payment.create(
      [
        {
          payment_number,
          order:  orderId,
          user:   req.user._id,
          amount: order.total,
          reference,
        },
      ],
      { session },
    );

    const paystackResponse = await paystack.post("/transaction/initialize", {
      email:        req.user.email,
      amount:       order.total * 100, // Paystack expects kobo
      reference,
      callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
      metadata: {
        order_id:         orderId,
        user_id:          String(req.user._id),
        payment_number,
        fulfillment_type: order.fulfillment_type ?? "delivery",
      },
    });

    if (!paystackResponse.data.status) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ message: "Failed to initialize payment with Paystack" });
    }

    payment[0].paystack_reference = paystackResponse.data.data.reference;
    await payment[0].save({ session });

    await session.commitTransaction();
    session.endSession();

    // ── Fire "Payment Pending" notification (non-blocking) ────────────────────
    if (await userWantsPaymentAlerts(req.user._id)) {
      createPaymentNotification(req.user._id, {
        status:      "pending",
        amount:      order.total,
        reference,
        orderId:     order._id,
        orderNumber: order.order_number,
      }).catch(() => {});
    }

    res.status(200).json({
      authorization_url: paystackResponse.data.data.authorization_url,
      reference,
      payment_number,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      message: "Failed to initialize payment",
      error:   error.message,
    });
  }
};

/**
 * @desc    Verify a Paystack payment by reference
 *          Called by the frontend after Paystack redirects back.
 * @route   GET /api/v1/payment/verify/:reference
 * @access  Private
 */
export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    // Find the payment record — include order details for the response
    const payment = await Payment.findOne({ reference }).populate(
      "order",
      "status payment_status order_number fulfillment_type total user",
    );
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // If already confirmed (e.g. webhook arrived first), return cached result
    if (payment.status === "success") {
      return res.status(200).json({ message: "Payment already verified", payment });
    }

    // Ask Paystack for the authoritative status
    const paystackResponse = await paystack.get(`/transaction/verify/${reference}`);

    if (!paystackResponse.data.status) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const { status: psStatus, reference: paystackRef } = paystackResponse.data.data;

    if (psStatus === "success") {
      // ── Mark payment as successful ─────────────────────────────────────────
      payment.status             = "success";
      payment.paystack_reference = paystackRef;
      payment.payment_method     = paystackResponse.data.data.channel ?? payment.payment_method;
      await payment.save();

      // ── Update linked order ────────────────────────────────────────────────
      const orderDoc = await Order.findById(payment.order._id ?? payment.order);
      if (orderDoc) {
        orderDoc.payment_status    = "paid";
        orderDoc.payment_reference = reference;
        // Automatically advance order status for Paystack-paid orders if still pending
        if (orderDoc.status === "pending") orderDoc.status = "confirmed";
        await orderDoc.save();
      }

      // ── Payment success notification (non-blocking) ────────────────────────
      const orderUserId = orderDoc?.user ?? payment.order?.user;
      if (orderUserId && await userWantsPaymentAlerts(orderUserId)) {
        createPaymentNotification(orderUserId, {
          status:      "success",
          amount:      payment.amount,
          reference,
          orderId:     orderDoc?._id,
          orderNumber: orderDoc?.order_number,
        }).catch(() => {});
      }

      return res.status(200).json({ message: "Payment verified successfully", payment });
    }

    // ── Payment failed / abandoned ─────────────────────────────────────────────
    const failStatus = psStatus === "abandoned" ? "cancelled" : "failed";
    payment.status   = failStatus;
    await payment.save();

    // ── Payment failed notification (non-blocking) ────────────────────────────
    const orderUserId = payment.order?.user;
    if (orderUserId && await userWantsPaymentAlerts(orderUserId)) {
      createPaymentNotification(orderUserId, {
        status:      failStatus,          // "failed" | "cancelled"
        amount:      payment.amount,
        reference,
        orderId:     payment.order?._id,
        orderNumber: payment.order?.order_number,
      }).catch(() => {});
    }

    return res.status(400).json({ message: `Payment ${payment.status}` });
  } catch (error) {
    res.status(500).json({ message: "Failed to verify payment", error: error.message });
  }
};

/**
 * @desc    Paystack webhook handler
 *          Paystack calls this directly from their servers after every event.
 *          This is the primary confirmation mechanism — fires even if the
 *          user closes the browser mid-redirect.
 * @route   POST /api/v1/payment/webhook
 * @access  Public (Paystack servers only — verified via HMAC signature)
 */
export const handleWebhook = async (req, res) => {
  try {
    // ── 1. Verify the request is genuinely from Paystack ──────────────────────
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error("[webhook] PAYSTACK_SECRET_KEY is not set!");
      return res.status(500).send("Server misconfiguration");
    }

    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.warn("[webhook] Invalid Paystack signature — possible spoofed request");
      return res.status(400).send("Invalid signature");
    }

    // ── 2. Respond immediately so Paystack doesn't retry ─────────────────────
    res.status(200).send("Webhook received");

    // ── 3. Handle the event ───────────────────────────────────────────────────
    const event = req.body;
    console.log(`[webhook] Event received: ${event.event}`);

    // ── charge.success ────────────────────────────────────────────────────────
    if (event.event === "charge.success") {
      const { reference } = event.data;

      const payment = await Payment.findOne({ reference }).populate(
        "order",
        "_id status payment_status fulfillment_type user order_number",
      );

      if (!payment) {
        console.warn(`[webhook] Payment not found for reference: ${reference}`);
        return;
      }

      // Idempotency guard — already processed via verifyPayment endpoint
      if (payment.status === "success") {
        console.log(`[webhook] Payment ${reference} already confirmed, skipping`);
        return;
      }

      // Mark payment successful
      payment.status             = "success";
      payment.paystack_reference = event.data.reference;
      payment.payment_method     = event.data.channel ?? payment.payment_method;
      await payment.save();

      // Update linked order
      const order = await Order.findById(payment.order._id ?? payment.order);
      if (order) {
        order.payment_status    = "paid";
        order.payment_reference = reference;
        if (order.status === "pending") order.status = "confirmed";
        await order.save();

        console.log(
          `[webhook] Order ${order._id} (${order.order_number ?? ""}) ` +
          `→ payment_status=paid, status=${order.status}`,
        );

        // ── Payment success notification ─────────────────────────────────────
        const userId = order.user;
        if (userId && await userWantsPaymentAlerts(userId)) {
          createPaymentNotification(userId, {
            status:      "success",
            amount:      payment.amount,
            reference,
            orderId:     order._id,
            orderNumber: order.order_number,
          }).catch(() => {});
        }
      }
    }

    // ── charge.failed ─────────────────────────────────────────────────────────
    if (event.event === "charge.failed") {
      const { reference } = event.data;

      const payment = await Payment.findOne({ reference }).populate(
        "order",
        "_id user order_number",
      );

      if (payment && payment.status === "pending") {
        payment.status = "failed";
        await payment.save();
        console.log(`[webhook] Payment ${reference} marked as failed`);

        // ── Payment failed notification ───────────────────────────────────────
        const userId = payment.order?.user;
        if (userId && await userWantsPaymentAlerts(userId)) {
          createPaymentNotification(userId, {
            status:      "failed",
            amount:      payment.amount,
            reference,
            orderId:     payment.order?._id,
            orderNumber: payment.order?.order_number,
          }).catch(() => {});
        }
      }
    }

    // ── refund.processed ──────────────────────────────────────────────────────
    // Paystack fires this when a refund completes on their end.
    if (event.event === "refund.processed") {
      const { transaction_reference, amount } = event.data;

      const payment = await Payment.findOne({ reference: transaction_reference }).populate(
        "order",
        "_id user order_number",
      );

      if (payment) {
        const userId = payment.order?.user;
        if (userId && await userWantsPaymentAlerts(userId)) {
          createPaymentNotification(userId, {
            status:      "refunded",
            amount:      amount / 100, // Paystack sends kobo
            reference:   transaction_reference,
            orderId:     payment.order?._id,
            orderNumber: payment.order?.order_number,
          }).catch(() => {});
        }
      }
    }
  } catch (error) {
    // We already sent 200 above so Paystack won't retry — just log
    console.error("[webhook] Processing error:", error.message);
  }
};

/**
 * @desc    Get all payments (Admin)
 * @route   GET /api/v1/payment/all
 * @access  Admin
 */
export const getAllPayments = async (req, res) => {
  try {
    const { status, payment_method, search, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (status && status !== "All")                 filter.status         = status;
    if (payment_method && payment_method !== "All") filter.payment_method = payment_method;
    if (search) {
      filter.$or = [
        { reference:      { $regex: search, $options: "i" } },
        { payment_number: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate("order", "status payment_status order_number fulfillment_type delivery_city shipping_fee")
        .populate("user",  "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Payment.countDocuments(filter),
    ]);

    res.status(200).json({ payments, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payments", error: error.message });
  }
};

/**
 * @desc    Get payment status by reference
 * @route   GET /api/v1/payment/status/:reference
 * @access  Private
 */
export const getPaymentStatus = async (req, res) => {
  try {
    const { reference } = req.params;

    const payment = await Payment.findOne({ reference }).populate(
      "order",
      "status payment_status order_number fulfillment_type",
    );
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: "Failed to get payment status", error: error.message });
  }
};