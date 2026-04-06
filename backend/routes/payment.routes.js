import { Router } from "express";
import {
  initializePayment,
  verifyPayment,
  handleWebhook,
  getPaymentStatus,
} from "../controllers/payment.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const paymentRouter = Router();

paymentRouter.post("/initialize", isAuthenticated, initializePayment); // POST /api/v1/payment/initialize
paymentRouter.get("/verify/:reference", isAuthenticated, verifyPayment); // GET /api/v1/payment/verify/:reference
paymentRouter.post("/webhook", handleWebhook); // POST /api/v1/payment/webhook (no auth for webhooks)
paymentRouter.get("/status/:reference", isAuthenticated, getPaymentStatus); // GET /api/v1/payment/status/:reference

export default paymentRouter;