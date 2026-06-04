import axios from "axios";

/**
 * ─────────────────────────────────────────────────────────────
 * Axios Instance
 * ─────────────────────────────────────────────────────────────
 * All cart requests use this instance
 * Automatically:
 * - prefixes /api/v1
 * - sends cookies (for session auth)
 */
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  withCredentials: true,
});

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
  /**
   * GET CART
   */
  getCart: (): Promise<CartDoc> =>
    api.get("/cart").then((res) => res.data),

  /**
   * ADD ITEM TO CART
   */
  addItem: (payload: AddCartItemPayload): Promise<CartDoc> =>
    api.post("/cart", payload).then((res) => res.data),

  /**
   * UPDATE ITEM QUANTITY
   */
  updateItem: (payload: UpdateCartItemPayload): Promise<CartDoc> =>
    api.patch("/cart", payload).then((res) => res.data),

  /**
   * REMOVE SINGLE ITEM (by variantId)
   */
  removeItem: (variantId: string): Promise<CartDoc> =>
    api.delete(`/cart/${variantId}`).then((res) => res.data),

  /**
   * CLEAR CART
   */
  clearCart: (): Promise<CartDoc> =>
    api.delete("/cart/clear").then((res) => res.data),
};



