
import axios from "axios";

// Base matches your router mount point — confirm in your server.js/app.js
// Example: app.use("/api/v1/payment", paymentRouter)
const BASE = "http://localhost:3000/api/v1/payment";

/**
 * IMPORTANT 🔥
 * If you're using session auth (passport + express-session),
 * you MUST send cookies with requests or you'll get 401 Unauthorized.
 */
const api = axios.create({
  baseURL: BASE,
  withCredentials: true, // 👈 FIXES YOUR 401 ISSUE
});

// ── TYPES ─────────────────────────────────────────────────────────────────────

export type PaymentStatus = "pending" | "success" | "failed" | "cancelled";

export interface PaymentDoc {
  _id: string;
  order: string;
  user: string;
  amount: number;
  currency: string; // "NGN"
  status: PaymentStatus;
  reference: string; // PAY-timestamp-random
  paystack_reference?: string;
  payment_method?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface InitializePaymentPayload {
  orderId: string;
}

export interface InitializePaymentResponse {
  authorization_url: string;
  reference: string;
}

// ── SERVICE METHODS ──────────────────────────────────────────────────────────

export const paymentService = {
  /**
   * POST /initialize
   * Creates payment + returns Paystack checkout URL
   */
  initializePayment: async (
    payload: InitializePaymentPayload
  ): Promise<InitializePaymentResponse> => {
    const { data } = await api.post("/initialize", payload);
    return data;
  },

  /**
   * GET /verify/:reference
   * Verifies payment after Paystack redirect
   */
  verifyPayment: async (
    reference: string
  ): Promise<{ message: string; payment: PaymentDoc }> => {
    const { data } = await api.get(`/verify/${reference}`);
    return data;
  },

  /**
   * GET /status/:reference
   * Poll payment status (useful for UI loading screens)
   */
  getPaymentStatus: async (reference: string): Promise<PaymentDoc> => {
    const { data } = await api.get(`/status/${reference}`);
    return data;
  },

  getAllPayments:async():Promise<PaymentDoc[]>=>{
    const {data} = await api.get("/all");
    return data;
  }
  // NOTE:
  // POST /webhook is NOT called from frontend.
  // Paystack calls it directly from their servers.
};