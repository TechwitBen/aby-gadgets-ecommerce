import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/payment`,
  withCredentials: true,
});

export type PaymentStatus = "pending" | "success" | "failed" | "cancelled";

export interface PaymentDoc {
  _id: string;
  payment_number?: string;
  order:
    | string
    | {
        _id: string;
        order_number?: string;
        fulfillment_type?: string;
        status?: string;
        payment_status?: string;
        total?: number;
        shipping_fee?: number;
        delivery_city?: string;
      };
  user: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  reference: string;
  paystack_reference?: string;
  payment_method?: string;
  channel?: string | null;
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

export interface GetAllPaymentsResponse {
  payments: PaymentDoc[];
  total: number;
  page: number;
  limit: number;
}

export const paymentService = {
  initializePayment: (payload: {
    orderId: string;
  }): Promise<InitializePaymentResponse> =>
    api
      .post<InitializePaymentResponse>("/initialize", payload)
      .then((r) => r.data),

  verifyPayment: (reference: string): Promise<VerifyPaymentResponse> =>
    api.get<VerifyPaymentResponse>(`/verify/${reference}`).then((r) => r.data),

  getPaymentForOrder: (orderId: string): Promise<PaymentDoc> =>
    api.get<PaymentDoc>(`/order/${orderId}`).then((r) => r.data),

  getPaymentStatus: (reference: string): Promise<PaymentDoc> =>
    api.get<PaymentDoc>(`/status/${reference}`).then((r) => r.data),

  // ── getAllPayments ────────────────────────────────────────────────────────
  // The `params` object (e.g. { page: 1, limit: 50 }) is forwarded as
  // query strings: GET /payment/all?page=1&limit=50
  getAllPayments: (
    params: { page?: number; limit?: number } = {},
  ): Promise<GetAllPaymentsResponse> =>
    api
      .get<GetAllPaymentsResponse>("/all", { params })
      .then((r) => r.data),
};