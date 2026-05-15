import axios from "axios";
import type { Product } from "./Products.service";

// Re-use the same axios instance pattern
const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export interface WishlistResponse {
  wishlist: Product[];
  productIds: string[];
  total: number;
}

export interface ToggleResponse {
  message: string;
  action: "added" | "removed";
  inWishlist: boolean;
  productIds: string[];
}

export interface MutationResponse {
  message: string;
  productIds: string[];
}

export const wishlistService = {
  /**
   * Fetch the authenticated user's wishlist.
   * Returns populated product objects + a flat productIds array.
   */
  getWishlist: (): Promise<WishlistResponse> =>
    api.get("/wishlist").then((r) => r.data),

  /**
   * Add a single product to the wishlist.
   */
  add: (productId: string): Promise<MutationResponse> =>
    api.post(`/wishlist/${productId}`).then((r) => r.data),

  /**
   * Remove a single product from the wishlist.
   */
  remove: (productId: string): Promise<MutationResponse> =>
    api.delete(`/wishlist/${productId}`).then((r) => r.data),

  /**
   * Toggle a product in/out of the wishlist in one request.
   * Returns whether the item is now in the wishlist.
   */
  toggle: (productId: string): Promise<ToggleResponse> =>
    api.post(`/wishlist/toggle/${productId}`).then((r) => r.data),

  /**
   * Clear the entire wishlist.
   */
  clear: (): Promise<MutationResponse> =>
    api.delete("/wishlist").then((r) => r.data),
};
