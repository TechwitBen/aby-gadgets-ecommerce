import axios from "axios";

// Uses the same base URL and cookie strategy as the rest of your auth stack.
// Authentication is handled automatically by the session cookie — no token
// reading from storage needed.
const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  withCredentials: true,
});

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ReviewUser {
  _id: string;
  name: string;
  username: string;
}

export interface Review {
  _id: string;
  product: string;
  user: ReviewUser;
  rating: number;
  comment?: string;
  verified_purchase: boolean;
  createdAt: string;
}

export interface ReviewsPayload {
  reviews: Review[];
  totalReviews: number;
  averageRating: number;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const reviewService = {
  /** Fetch all reviews + aggregate stats for a product */
  async getByProduct(productId: string): Promise<ReviewsPayload> {
    const { data } = await api.get<ReviewsPayload>(
      `/reviews/product/${productId}`,
    );
    return data;
  },

  /** Submit a new review — requires an active session cookie */
  async create(payload: {
    productId: string;
    rating: number;
    comment?: string;
  }): Promise<Review> {
    const { data } = await api.post<Review>("/reviews", payload);
    return data;
  },

  /** Delete a review by ID — owner or admin only */
  async remove(reviewId: string): Promise<void> {
    await api.delete(`/reviews/${reviewId}`);
  },
};