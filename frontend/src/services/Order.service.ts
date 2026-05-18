import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1/orders`,
  withCredentials: true,
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "ready_for_pickup"   // ← pickup: order is ready to collect
  | "collected";          // ← pickup: customer collected in store

export type PaymentStatus  = "unpaid" | "paid" | "refunded";
export type PaymentMethod  = "pod" | "paystack";
export type FulfillmentType = "delivery" | "pickup";

export interface ShippingAddress {
  full_name:    string;
  phone:        string;
  street:       string;
  city:         string;
  state:        string;
  country:      string;
  postal_code?: string;
}

export interface OrderItemInput {
  variant:  string;
  quantity: number;
}

export interface OrderItemProduct {
  _id:        string;
  name:       string;
  images:     string[];
  condition?: string;
}

export interface OrderItemVariant {
  _id:      string;
  color?:   string;
  storage?: string;
  ram?:     string;
  sku:      string;
  price:    number;
}

export interface OrderItemDoc {
  product:    OrderItemProduct | string;
  variant:    OrderItemVariant | string;
  quantity:   number;
  unit_price: number;
}

export interface OrderDoc {
  _id:                string;
  order_number?:      string;
  user:               string;
  items:              OrderItemDoc[];
  status:             OrderStatus;
  // Fulfillment
  fulfillment_type?:  FulfillmentType;
  delivery_city?:     string;
  pickup_code?:       string;
  pickup_location?:   string;
  // Address
  shipping_address:   ShippingAddress;
  // Payment
  payment_status:     PaymentStatus;
  payment_method:     PaymentMethod;
  payment_reference?: string;
  // Financials
  subtotal:           number;
  shipping_fee:       number;
  total:              number;
  createdAt:          string;
  updatedAt:          string;
}

export interface CreateOrderPayload {
  orderItems:        OrderItemInput[];
  shipping_address?: ShippingAddress;
  paymentMethod:     PaymentMethod;
  fulfillment_type:  FulfillmentType;
  delivery_city?:    string;
  shipping_fee?:     number;     // delivery zone fee; 0 for pickup
  pickup_location?:  string;     // store address snapshot
}

// ── UI display helpers ────────────────────────────────────────────────────────

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending:           "Pending",
  confirmed:         "Processing",
  shipped:           "Shipped",
  out_for_delivery:  "Out for Delivery",
  delivered:         "Delivered",
  cancelled:         "Cancelled",
  refunded:          "Refunded",
  ready_for_pickup:  "Ready for Pickup",
  collected:         "Collected",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid:   "Awaiting Confirmation",
  paid:     "Confirmed",
  refunded: "Refunded",
};

export const PAYMENT_LABEL_TO_STATUS: Record<string, PaymentStatus> = {
  "Awaiting Confirmation": "unpaid",
  "Confirmed":             "paid",
  "Refunded":              "refunded",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  paystack: "Online Payment",
  pod:      "Pay On Delivery",
};

export const FULFILLMENT_LABELS: Record<FulfillmentType, string> = {
  delivery: "Delivery",
  pickup:   "Pickup",
};

// ── Type guard helpers ────────────────────────────────────────────────────────

export const isPopulatedProduct = (p: OrderItemProduct | string): p is OrderItemProduct =>
  typeof p === "object" && p !== null;

export const isPopulatedVariant = (v: OrderItemVariant | string): v is OrderItemVariant =>
  typeof v === "object" && v !== null;

// ── Service ───────────────────────────────────────────────────────────────────

export const orderService = {
  createOrder: (payload: CreateOrderPayload) =>
    api.post<OrderDoc>("", payload).then(r => r.data),

  getMyOrders: () =>
    api.get<OrderDoc[]>("/my-orders").then(r => r.data),

  getOrderById: (id: string) =>
    api.get<OrderDoc>(`/${id}`).then(r => r.data),

 // In Order.service.ts:
getAllOrders: async (params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const res = await api.get(`/orders?${query.toString()}`);
  return res.data;
},

  updateStatus: (id: string, status: OrderStatus) =>
    api.patch<OrderDoc>(`/${id}/status`, { status }).then(r => r.data),

  updatePaymentStatus: (id: string, payment_status: PaymentStatus) =>
    api.patch<OrderDoc>(`/${id}/payment-status`, { payment_status }).then(r => r.data),

  deleteOrder: (id: string) =>
    api.delete<{ message: string; stockRestored: boolean }>(`/${id}`).then(r => r.data),
};