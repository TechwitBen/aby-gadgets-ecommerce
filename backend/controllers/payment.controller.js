import axios from "axios";
import crypto from "crypto";
import mongoose from "mongoose";
import Payment from "../models/payment.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import { generatePaymentNumber } from "../helpers/Idgenerator.helper.js";
import { createPaymentNotification } from "../helpers/notification.helper.js";

const paystack = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

const userWantsPaymentAlerts = async (userId) => {
  try {
    const user = await User.findById(userId).select("notificationPreferences").lean();
    return user?.notificationPreferences?.paymentAlerts !== false;
  } catch {
    return true;
  }
};

/**
 * @desc    Initialize a Paystack payment for an existing order.
 *          Handles all existing Payment doc states correctly:
 *            - No doc:        create fresh doc + Paystack transaction
 *            - pending doc:   re-initialize (re-verify with Paystack first;
 *                             if still genuinely pending, create new ref)
 *            - failed/cancelled doc: create new Payment doc + new reference
 *            - success doc:   reject — already paid
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

    if (!req.user?._id) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({ message: "User not authenticated" });
    }

    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Already fully paid — nothing to do
    if (order.payment_status === "paid") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "This order has already been paid." });
    }

    // ── Check for existing Payment docs ───────────────────────────────────────
    // Get the MOST RECENT payment doc for this order
    const existingPayment = await Payment.findOne({ order: orderId })
      .sort({ createdAt: -1 })
      .session(session);

    if (existingPayment) {
      // Already successfully processed
      if (existingPayment.status === "success") {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "This order has already been paid." });
      }

      // If there's a pending doc, check with Paystack whether it's actually still pending
      // (webhook may not have arrived yet). If Paystack says success → update & return.
      if (existingPayment.status === "pending") {
        try {
          const psCheck = await paystack.get(
            `/transaction/verify/${existingPayment.reference}`
          );
          const psStatus = psCheck.data?.data?.status;

          if (psStatus === "success") {
            // Webhook was just delayed — update now
            existingPayment.status = "success";
            existingPayment.paystack_reference = psCheck.data.data.reference;
            existingPayment.payment_method = psCheck.data.data.channel ?? existingPayment.payment_method;
            await existingPayment.save({ session });

            order.payment_status = "paid";
            order.payment_reference = existingPayment.reference;
            if (order.status === "pending") order.status = "confirmed";
            await order.save({ session });

            await session.commitTransaction();
            session.endSession();

            // Notify
            userWantsPaymentAlerts(req.user._id).then((wants) => {
              if (wants) {
                createPaymentNotification(req.user._id, {
                  status: "success",
                  amount: order.total,
                  reference: existingPayment.reference,
                  orderId: order._id,
                  orderNumber: order.order_number,
                }).catch(() => {});
              }
            });

            return res.status(200).json({
              alreadyPaid: true,
              message: "Payment was already confirmed. Your order is now active.",
            });
          }

          // psStatus is still "pending" / "abandoned" / "failed"
          // If abandoned or failed, fall through to create a new attempt below
          if (psStatus === "pending") {
            // Genuinely still in-flight — return the existing reference so the
            // frontend can poll verifyPayment instead of creating a duplicate
            await session.abortTransaction();
            session.endSession();
            return res.status(200).json({
              stillPending: true,
              reference: existingPayment.reference,
              message: "A payment is already in progress for this order.",
            });
          }

          // psStatus = "failed" / "abandoned" → mark the old doc and create new
          existingPayment.status = psStatus === "abandoned" ? "cancelled" : "failed";
          await existingPayment.save({ session });

        } catch (verifyErr) {
          // If we can't reach Paystack to verify, abort and tell the user to try later
          console.error("[initializePayment] Paystack verify error:", verifyErr.message);
          await session.abortTransaction();
          session.endSession();
          return res.status(503).json({
            message: "Could not reach the payment gateway. Please try again in a moment.",
          });
        }
      }

      // For failed/cancelled: existing doc has been noted (or was already failed/cancelled),
      // fall through to create a NEW payment attempt below.
    }

    // ── Create a fresh payment attempt ────────────────────────────────────────
    const reference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const payment_number = await generatePaymentNumber(session);

    const [payment] = await Payment.create(
      [{ payment_number, order: orderId, user: req.user._id, amount: order.total, reference }],
      { session }
    );

    const paystackResponse = await paystack.post("/transaction/initialize", {
      email: req.user.email,
      amount: Math.round(order.total * 100),
      reference,
      callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
      metadata: {
        order_id: orderId,
        user_id: String(req.user._id),
        payment_number,
        fulfillment_type: order.fulfillment_type ?? "delivery",
      },
    });

    if (!paystackResponse.data.status) {
      throw new Error("Paystack initialization failed: " + paystackResponse.data.message);
    }

    payment.paystack_reference = paystackResponse.data.data.reference;
    await payment.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Non-blocking pending notification
    userWantsPaymentAlerts(req.user._id).then((wants) => {
      if (wants) {
        createPaymentNotification(req.user._id, {
          status: "pending",
          amount: order.total,
          reference,
          orderId: order._id,
          orderNumber: order.order_number,
        }).catch(() => {});
      }
    });

    return res.status(200).json({
      authorization_url: paystackResponse.data.data.authorization_url,
      reference,
      payment_number,
    });

  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    session.endSession();

    console.error("❌ PAYMENT INITIALIZATION ERROR:", error.message);
    if (error.response) console.error("Paystack API Response:", error.response.data);
    console.error("Stack:", error.stack);

    return res.status(500).json({
      message: "Failed to initialize payment. Please try again.",
      error: error.message,
      details: error.response?.data?.message || null,
    });
  }
};

/**
 * @desc    Verify a Paystack payment by reference.
 *          Called by the /payment/callback page AND by the frontend after redirect.
 * @route   GET /api/v1/payment/verify/:reference
 * @access  Private
 */
export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const payment = await Payment.findOne({ reference }).populate(
      "order",
      "status payment_status order_number fulfillment_type total user"
    );

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found for this reference." });
    }

    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Already in a terminal state — return as-is (idempotent)
    if (payment.status === "success") {
      return res.status(200).json({ status: "success", message: "Payment already confirmed.", payment });
    }
    if (payment.status === "failed") {
      return res.status(200).json({ status: "failed", message: "This payment failed.", payment });
    }
    if (payment.status === "cancelled") {
      return res.status(200).json({ status: "cancelled", message: "This payment was cancelled.", payment });
    }

    // Still pending — ask Paystack
    const paystackResponse = await paystack.get(`/transaction/verify/${reference}`);

    if (!paystackResponse.data.status) {
      return res.status(400).json({ message: "Payment verification failed. Please try again." });
    }

    const { status: psStatus, reference: paystackRef } = paystackResponse.data.data;

    if (psStatus === "success") {
      payment.status = "success";
      payment.paystack_reference = paystackRef;
      payment.payment_method = paystackResponse.data.data.channel ?? payment.payment_method;
      await payment.save();

      const orderDoc = await Order.findById(payment.order._id ?? payment.order);
      if (orderDoc) {
        orderDoc.payment_status = "paid";
        orderDoc.payment_reference = reference;
        if (orderDoc.status === "pending") orderDoc.status = "confirmed";
        await orderDoc.save();
      }

      const orderUserId = orderDoc?.user ?? payment.order?.user;
      if (orderUserId && (await userWantsPaymentAlerts(orderUserId))) {
        createPaymentNotification(orderUserId, {
          status: "success",
          amount: payment.amount,
          reference,
          orderId: orderDoc?._id,
          orderNumber: orderDoc?.order_number,
        }).catch(() => {});
      }

      return res.status(200).json({ status: "success", message: "Payment verified successfully.", payment });
    }

    // Failed or abandoned
    const failStatus = psStatus === "abandoned" ? "cancelled" : "failed";
    payment.status = failStatus;
    await payment.save();

    const orderUserId = payment.order?.user;
    if (orderUserId && (await userWantsPaymentAlerts(orderUserId))) {
      createPaymentNotification(orderUserId, {
        status: failStatus,
        amount: payment.amount,
        reference,
        orderId: payment.order?._id,
        orderNumber: payment.order?.order_number,
      }).catch(() => {});
    }

    return res.status(200).json({
      status: failStatus,
      message: failStatus === "cancelled"
        ? "Payment was cancelled or abandoned."
        : "Payment failed. Please try again.",
      payment,
    });

  } catch (error) {
    console.error("❌ VERIFY PAYMENT ERROR:", error.message);
    return res.status(500).json({ message: "Failed to verify payment.", error: error.message });
  }
};

/**
 * @desc    Get payment status for an order (used by frontend polling / callback page)
 * @route   GET /api/v1/payment/order/:orderId
 * @access  Private
 */
export const getPaymentForOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const payment = await Payment.findOne({ order: orderId })
      .sort({ createdAt: -1 })
      .populate("order", "status payment_status order_number fulfillment_type total");

    if (!payment) {
      return res.status(404).json({ message: "No payment found for this order." });
    }

    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    return res.status(200).json(payment);
  } catch (error) {
    return res.status(500).json({ message: "Failed to get payment.", error: error.message });
  }
};

/**
 * @desc    Paystack webhook handler
 * @route   POST /api/v1/payment/webhook
 * @access  Public (verified via HMAC)
 */
export const handleWebhook = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error("[webhook] PAYSTACK_SECRET_KEY is not set!");
      return res.status(500).send("Server misconfiguration");
    }

    const hash = crypto
      .createHmac("sha512", secret)
      .update(req.rawBody)
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.warn("[webhook] Invalid Paystack signature");
      return res.status(400).send("Invalid signature");
    }

    res.status(200).send("Webhook received");

    const event = req.body;
    console.log(`[webhook] Event: ${event.event}`);

    if (event.event === "charge.success") {
      const { reference } = event.data;
      const payment = await Payment.findOne({ reference }).populate(
        "order", "_id status payment_status fulfillment_type user order_number"
      );

      if (!payment) {
        console.warn(`[webhook] No payment doc for ref: ${reference}`);
        return;
      }
      if (payment.status === "success") {
        console.log(`[webhook] Already confirmed: ${reference}`);
        return;
      }

      payment.status = "success";
      payment.paystack_reference = event.data.reference;
      payment.payment_method = event.data.channel ?? payment.payment_method;
      await payment.save();

      const order = await Order.findById(payment.order._id ?? payment.order);
      if (order) {
        order.payment_status = "paid";
        order.payment_reference = reference;
        if (order.status === "pending") order.status = "confirmed";
        await order.save();

        const userId = order.user;
        if (userId && (await userWantsPaymentAlerts(userId))) {
          createPaymentNotification(userId, {
            status: "success",
            amount: payment.amount,
            reference,
            orderId: order._id,
            orderNumber: order.order_number,
          }).catch(() => {});
        }
      }
    }

    if (event.event === "charge.failed") {
      const { reference } = event.data;
      const payment = await Payment.findOne({ reference }).populate(
        "order", "_id user order_number"
      );

      if (payment && payment.status === "pending") {
        payment.status = "failed";
        await payment.save();

        const userId = payment.order?.user;
        if (userId && (await userWantsPaymentAlerts(userId))) {
          createPaymentNotification(userId, {
            status: "failed",
            amount: payment.amount,
            reference,
            orderId: payment.order?._id,
            orderNumber: payment.order?.order_number,
          }).catch(() => {});
        }
      }
    }

    if (event.event === "refund.processed") {
      const { transaction_reference, amount } = event.data;
      const payment = await Payment.findOne({ reference: transaction_reference }).populate(
        "order", "_id user order_number"
      );

      if (payment) {
        const userId = payment.order?.user;
        if (userId && (await userWantsPaymentAlerts(userId))) {
          createPaymentNotification(userId, {
            status: "refunded",
            amount: amount / 100,
            reference: transaction_reference,
            orderId: payment.order?._id,
            orderNumber: payment.order?.order_number,
          }).catch(() => {});
        }
      }
    }

  } catch (error) {
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
    if (status && status !== "All") filter.status = status;
    if (payment_method && payment_method !== "All") filter.payment_method = payment_method;
    if (search) {
      filter.$or = [
        { reference: { $regex: search, $options: "i" } },
        { payment_number: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate("order", "status payment_status order_number fulfillment_type delivery_city shipping_fee")
        .populate("user", "name email")
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
      "order", "status payment_status order_number fulfillment_type"
    );
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: "Failed to get payment status", error: error.message });
  }
};