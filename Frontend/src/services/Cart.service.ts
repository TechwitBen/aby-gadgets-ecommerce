import axios from "axios";

const BASE = "/api/v1/cart";

// ── Types matching the Cart model exactly ─────────────────────────────────────

/**
 * The populated shape of items.variant after
 * .populate("items.variant", "sku price stock color storage ram")
 */
export interface CartVariant {
  _id: string;
  sku: string;
  price: number;
  stock: number;
  color?: string;
  storage?: string;
  ram?: string;
}

/**
 * The populated shape of items.product after
 * .populate("items.product", "name category images")
 */
export interface CartProduct {
  _id: string;
  name: string;
  category: string;
  images: string[];
}

/**
 * One entry in the cart items array.
 *
 * NOTE: CartItemSchema uses { _id: false } so there is NO _id on each item.
 * Items are identified by their variant reference, not by an item id.
 */
export interface CartItemDoc {
  // no _id — the schema explicitly sets { _id: false }
  product:     CartProduct;
  variant:     CartVariant;
  quantity:    number;
  unit_price:  number;  // snapshot of variant.price at time of adding
  total_price: number;  // unit_price × quantity
}

/**
 * The full cart document returned by the API.
 *
 * subtotal and total_items are computed by the pre("save") hook —
 * they are always up to date and you never need to calculate them yourself.
 */
export interface CartDoc {
  _id:         string;
  user:        string;
  items:       CartItemDoc[];
  subtotal:    number;       // sum of all item.total_price — maintained by hook
  total_items: number;       // sum of all item.quantity   — maintained by hook
  updated_at:  string;
  createdAt:   string;
  updatedAt:   string;
}

// ── Payload types (what the frontend sends UP) ────────────────────────────────

export interface AddCartItemPayload {
  product:   string;    // product _id
  variant:   string;    // variant _id
  quantity?: number;    // defaults to 1 on the backend
}

export interface UpdateCartItemPayload {
  variant:  string;    // variant _id — used to find the cart line
  quantity: number;    // new quantity; backend recalculates total_price
}

// ── Cart service ──────────────────────────────────────────────────────────────

export const cartService = {
  /** GET /api/v1/cart */
  getCart: (): Promise<CartDoc> =>
    axios.get<CartDoc>(BASE).then((r) => r.data),

  /** POST /api/v1/cart — add or increment a variant */
  addItem: (payload: AddCartItemPayload): Promise<CartDoc> =>
    axios.post<CartDoc>(BASE, payload).then((r) => r.data),

  /** PATCH /api/v1/cart — update quantity for an existing variant */
  updateItem: (payload: UpdateCartItemPayload): Promise<CartDoc> =>
    axios.patch<CartDoc>(BASE, payload).then((r) => r.data),

  /** DELETE /api/v1/cart/:variantId — remove one line item by variant id */
  removeItem: (variantId: string): Promise<CartDoc> =>
    axios.delete<CartDoc>(`${BASE}/${variantId}`).then((r) => r.data),

  /** DELETE /api/v1/cart — remove all items */
  clearCart: (): Promise<CartDoc> =>
    axios.delete<CartDoc>(`${BASE}/clear`).then((r) => r.data),
};