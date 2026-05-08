import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/payment`
    : "http://localhost:3000/api/v1/payment",
  withCredentials: true,
});

export type PaymentStatus = "pending" | "success" | "failed" | "cancelled";

export interface PaymentDoc {
  _id: string;
  payment_number?: string;
  order: string | { _id: string; order_number?: string; fulfillment_type?: string; status?: string; payment_status?: string; total?: number; shipping_fee?: number; delivery_city?: string };
  user: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  reference: string;
  paystack_reference?: string;
  payment_method?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InitializePaymentResponse {
  authorization_url?: string;
  reference?: string;
  payment_number?: string;
  alreadyPaid?: boolean;
  stillPending?: boolean;
  message?: string;
}

export interface VerifyPaymentResponse {
  status: PaymentStatus | "error";
  message: string;
  payment?: PaymentDoc;
  alreadyPaid?: boolean;
}

export const paymentService = {
  /** POST /initialize */
  initializePayment: (payload: { orderId: string }): Promise<InitializePaymentResponse> =>
    api.post<InitializePaymentResponse>("/initialize", payload).then((r) => r.data),

  /** GET /verify/:reference — checks Paystack and updates our DB */
  verifyPayment: (reference: string): Promise<VerifyPaymentResponse> =>
    api.get<VerifyPaymentResponse>(`/verify/${reference}`).then((r) => r.data),

  /** GET /order/:orderId — most recent payment doc for an order */
  getPaymentForOrder: (orderId: string): Promise<PaymentDoc> =>
    api.get<PaymentDoc>(`/order/${orderId}`).then((r) => r.data),

  /** GET /status/:reference */
  getPaymentStatus: (reference: string): Promise<PaymentDoc> =>
    api.get<PaymentDoc>(`/status/${reference}`).then((r) => r.data),

  /** GET /all — admin */
  getAllPayments: (): Promise<{ payments: PaymentDoc[]; total: number }> =>
    api.get("/all").then((r) => r.data),
};