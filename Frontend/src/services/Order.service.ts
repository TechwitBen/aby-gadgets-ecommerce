import axios from "axios";

// ✅ Create a dedicated instance that always sends cookies
const api = axios.create({
  baseURL: "http://localhost:3000/api/v1/orders",
  withCredentials: true,   // ← THIS is the fix; session cookie gets sent on every call
});



// ── Types ─────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus  = "unpaid" | "paid" | "refunded";
export type PaymentMethod  =  "pod" | "paystack";

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

/** Populated product inside an order item */
export interface OrderItemProduct {
  _id:       string;
  name:      string;
  images:    string[];
  condition?: string;
}

/** Populated variant inside an order item */
export interface OrderItemVariant {
  _id:      string;
  color?:   string;
  storage?: string;
  ram?:     string;
  sku:      string;
  price:    number;
}

/**
 * One line item in a stored order.
 * { _id: false } on OrderItemSchema — no _id on items.
 * product and variant are populated by the backend when fetching.
 */
export interface OrderItemDoc {
  product:    OrderItemProduct | string;   // populated when fetched, raw id otherwise
  variant:    OrderItemVariant | string;   // populated when fetched, raw id otherwise
  quantity:   number;
  unit_price: number;
}

export interface OrderDoc {
  _id:                string;
  user:               string;
  items:              OrderItemDoc[];
  status:             OrderStatus;
  shipping_address:   ShippingAddress;
  payment_status:     PaymentStatus;
  payment_method:     PaymentMethod;
  payment_reference?: string;
  subtotal:           number;
  shipping_fee:       number;
  total:              number;
  createdAt:          string;
  updatedAt:          string;
}

export interface CreateOrderPayload {
  orderItems:       OrderItemInput[];
  shipping_address: ShippingAddress;
  paymentMethod:    PaymentMethod;
}

// ── UI display helpers ────────────────────────────────────────────────────────

/** Map backend OrderStatus values to human-readable labels */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending:   "Pending",
  confirmed: "Processing",
  shipped:   "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded:  "Refunded",
  out_for_delivery: "Out for Delivery", // ← NEW
};

/** Map backend PaymentStatus values to UI-friendly labels */
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid:   "Awaiting Confirmation",
  paid:     "Confirmed",
  refunded: "Refunded",
};

/** Reverse map: UI label → backend value */
export const PAYMENT_LABEL_TO_STATUS: Record<string, PaymentStatus> = {
  "Awaiting Confirmation": "unpaid",
  "Confirmed":             "paid",
  "Refunded":              "refunded",
};

/** Map payment_method to display label */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  paystack: "Online Payment",
  pod:      "Pay On Delivery",
};

// ── Type guard helpers ────────────────────────────────────────────────────────

export const isPopulatedProduct = (p: OrderItemProduct | string): p is OrderItemProduct =>
  typeof p === "object" && p !== null;

export const isPopulatedVariant = (v: OrderItemVariant | string): v is OrderItemVariant =>
  typeof v === "object" && v !== null;

// ── Service ───────────────────────────────────────────────────────────────────

export const orderService = {
  /**
   * POST /api/orders
   */
  createOrder:          (payload: CreateOrderPayload) =>
    api.post<OrderDoc>("", payload).then(r => r.data),

  /**
   * GET /api/orders/my-orders
   */
  getMyOrders:          () =>
    api.get<OrderDoc[]>("/my-orders").then(r => r.data),
  /**
   * GET /api/orders/:id
   */
  getOrderById:         (id: string) =>
    api.get<OrderDoc>(`/${id}`).then(r => r.data),
  /**
   * GET /api/orders  (admin only)
   */
  getAllOrders:          () =>
    api.get<OrderDoc[]>("").then(r => r.data),

  /**
   * PATCH /api/orders/:id/status  (admin only)
   * Updates the delivery/fulfilment status of an order.
   */
  updateStatus:         (id: string, status: OrderStatus) =>
    api.patch<OrderDoc>(`/${id}/status`, { status }).then(r => r.data),

  /**
   * PATCH /api/orders/:id/payment-status  (admin only)
   * Updates the payment status manually.
   * Requires adding the route + controller to your backend — see updateOrderPaymentStatus.js
   */
  updatePaymentStatus:  (id: string, payment_status: PaymentStatus) =>
    api.patch<OrderDoc>(`/${id}/payment-status`, { payment_status }).then(r => r.data),

 deleteOrder:          (id: string) =>
    api.delete<{ message: string; stockRestored: boolean }>(`/${id}`).then(r => r.data),

}