import axios from "axios";
import crypto from "crypto";
import mongoose from "mongoose";
import Payment from "../models/payment.model.js";
import Order from "../models/order.model.js";


// top of payment.controller.js
console.log("Paystack key loaded:", !!process.env.PAYSTACK_SECRET_KEY);

const paystack = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
})

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

    // ADD SAFETY CHECK:
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

    const reference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    

    const payment = await Payment.create(
      [
        {
          order: orderId,
          user: req.user._id,
          amount: order.total,
          reference,
        },
      ],
      { session },
    );

    const paystackResponse = await paystack.post("/transaction/initialize", {
      email: req.user.email,
      amount: order.total * 100, // Paystack expects kobo
      reference,
      callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
      metadata: {
        order_id: orderId,
        user_id: req.user._id,
      },
    });

    if (!paystackResponse.data.status) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ message: "Failed to initialize payment" });
    }

    payment[0].paystack_reference = paystackResponse.data.data.reference;
    await payment[0].save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      authorization_url: paystackResponse.data.data.authorization_url,
      reference,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
  message: "Failed to initialize payment",
  error: error.message  // ← this tells you the real cause
  
});
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const payment = await Payment.findOne({ reference }).populate("order");
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const paystackResponse = await paystack.get(`/transaction/verify/${reference}`);

    if (!paystackResponse.data.status) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const { status, reference: paystackRef } = paystackResponse.data.data;

    if (status === "success") {
      payment.status = "success";
      payment.paystack_reference = paystackRef;
      await payment.save();

      payment.order.payment_status = "paid";
      payment.order.payment_reference = reference;
      await payment.order.save();

      res.status(200).json({ message: "Payment verified successfully", payment });
    } else {
      payment.status = "failed";
      await payment.save();

      res.status(400).json({ message: "Payment failed" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to verify payment",
      error: error.message,
    });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const secret = PAYSTACK_SECRET_KEY;
    const hash = crypto.createHmac("sha512", secret).update(JSON.stringify(req.body)).digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(400).send("Invalid signature");
    }

    const event = req.body;

    if (event.event === "charge.success") {
      const { reference } = event.data;

      const payment = await Payment.findOne({ reference }).populate("order");
      if (payment) {
        payment.status = "success";
        payment.paystack_reference = event.data.reference;
        await payment.save();

        payment.order.payment_status = "paid";
        payment.order.payment_reference = reference;
        await payment.order.save();
      }
    }

    res.status(200).send("Webhook received");
  } catch (error) {
    res.status(500).json({
      message: "Webhook processing failed",
      error: error.message,
    });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const { status, payment_method, search, page = 1, limit = 50 } = req.query;

    const filter = {};

    if (status && status !== "All") filter.status = status;
    if (payment_method && payment_method !== "All") filter.payment_method = payment_method;
    if (search) {
      filter.$or = [
        { reference: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate("order", "status payment_status")
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

export const getPaymentStatus = async (req, res) => {
  try {
    const { reference } = req.params;

    const payment = await Payment.findOne({ reference }).populate("order", "status payment_status");
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get payment status",
      error: error.message,
    });
  }
};