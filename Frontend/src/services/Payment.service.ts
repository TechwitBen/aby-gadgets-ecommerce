import axios from "axios";

const api = axios.create({
  baseURL:         "http://localhost:3000/api/v1/payment",
  withCredentials: true,
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type PaymentStatus = "pending" | "success" | "failed" | "cancelled";

export interface PaymentDoc {
  _id:                  string;
  order:                string;
  user:                 string;
  amount:               number;
  currency:             string;
  status:               PaymentStatus;
  payment_number?:      string;
  reference:            string;
  paystack_reference?:  string;
  payment_method?:      string;
  metadata?:            Record<string, unknown>;
  createdAt:            string;
  updatedAt:            string;
}

export interface InitializePaymentPayload  { orderId: string; }
export interface InitializePaymentResponse {
  authorization_url: string;
  reference:         string;
  payment_number?:   string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const paymentService = {
  /**
   * POST /initialize
   * Creates a Payment record and returns the Paystack checkout URL.
   */
  initializePayment: async (
    payload: InitializePaymentPayload,
  ): Promise<InitializePaymentResponse> => {
    const { data } = await api.post("/initialize", payload);
    return data;
  },

  /**
   * GET /verify/:reference
   * Verifies a payment after Paystack redirects back.
   * Also marks order.payment_status = "paid" and advances order.status.
   * Idempotent — safe to call multiple times for the same reference.
   */
  verifyPayment: async (
    reference: string,
  ): Promise<{ message: string; payment: PaymentDoc }> => {
    const { data } = await api.get(`/verify/${reference}`);
    return data;
  },

  /**
   * GET /status/:reference
   * Polls for the current payment status without triggering a Paystack API call.
   * Use this for lightweight status checks (e.g. on the PaymentCallback page
   * while waiting for the webhook to arrive).
   */
  getPaymentStatus: async (reference: string): Promise<PaymentDoc> => {
    const { data } = await api.get(`/status/${reference}`);
    return data;
  },

  /**
   * GET /all  (admin only)
   * Returns all Paystack payment records, paginated.
   * POD orders are merged on the frontend in PaymentsPage.
   */
  getAllPayments: async (): Promise<PaymentDoc[]> => {
    const { data } = await api.get("/all");
    // Backend returns { payments, total, page, limit }
    return Array.isArray(data) ? data : (data?.payments ?? []);
  },

  /**
   * Polls getPaymentStatus until the payment is no longer "pending"
   * or the timeout elapses.
   *
   * Used by PaymentCallback to handle the race between the Paystack redirect
   * and the webhook arriving — whichever confirms first wins.
   *
   * @param reference   - Paystack/internal reference
   * @param intervalMs  - polling interval (default 2 000 ms)
   * @param timeoutMs   - give up after this many ms (default 30 000 ms)
   */
  pollUntilConfirmed: (
    reference:  string,
    intervalMs = 2_000,
    timeoutMs  = 30_000,
  ): Promise<PaymentDoc> => {
    return new Promise((resolve, reject) => {
      const deadline = Date.now() + timeoutMs;

      const tick = async () => {
        try {
          const payment = await paymentService.getPaymentStatus(reference);

          if (payment.status !== "pending") {
            resolve(payment);
            return;
          }

          if (Date.now() >= deadline) {
            reject(new Error("Payment confirmation timed out"));
            return;
          }

          setTimeout(tick, intervalMs);
        } catch (err) {
          reject(err);
        }
      };

      tick();
    });
  },
};