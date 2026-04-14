import axios from "axios";

// Base matches your router mount point — confirm in your app.js/server.js
// e.g. app.use("/api/v1/payment", paymentRouter)
const BASE = "/api/v1/payment";

// ── Types ─────────────────────────────────────────────────────────────────────

export type PaymentStatus = "pending" | "success" | "failed" | "cancelled";

export interface PaymentDoc {
  _id:                 string;
  order:               string;
  user:                string;
  amount:              number;
  currency:            string;        // "NGN"
  status:              PaymentStatus;
  reference:           string;        // our internal ref  PAY-timestamp-random
  paystack_reference?: string;        // Paystack's own ref (set after verify)
  payment_method?:     string;
  metadata?:           Record<string, unknown>;
  createdAt:           string;
  updatedAt:           string;
}

export interface InitializePaymentPayload {
  orderId: string;
}

export interface InitializePaymentResponse {
  authorization_url: string;  // redirect the user here → Paystack checkout
  reference:         string;  // store to verify on callback
}

// ── Service — one method per route ────────────────────────────────────────────

export const paymentService = {
  /**
   * POST /api/v1/payment/initialize
   * Creates a Payment document and returns the Paystack authorization URL.
   * Call this AFTER orderService.createOrder, passing the new order's _id.
   */
  initializePayment: (payload: InitializePaymentPayload): Promise<InitializePaymentResponse> =>
    axios.post<InitializePaymentResponse>(`${BASE}/initialize`, payload).then((r) => r.data),

  /**
   * GET /api/v1/payment/verify/:reference
   * Verify a payment after the user returns from Paystack.
   * On success the backend:
   *   1. Marks payment.status = "success"
   *   2. Marks order.payment_status = "paid"
   *   3. Sets order.payment_reference = reference
   */
  verifyPayment: (reference: string): Promise<{ message: string; payment: PaymentDoc }> =>
    axios.get(`${BASE}/verify/${reference}`).then((r) => r.data),

  /**
   * GET /api/v1/payment/status/:reference
   * Poll for the current payment document (used on the callback / status page).
   * Returns the payment with its populated order.status and payment_status.
   */
  getPaymentStatus: (reference: string): Promise<PaymentDoc> =>
    axios.get<PaymentDoc>(`${BASE}/status/${reference}`).then((r) => r.data),

  // NOTE: The webhook route POST /api/v1/payment/webhook is called by Paystack's
  // servers directly — it is NOT called from the frontend. No service method needed.
};