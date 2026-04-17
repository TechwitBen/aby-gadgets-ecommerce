import axios from "axios";

// ─────────────────────────────────────────────
// CENTRAL API CLIENT (SESSION SUPPORT)
// ─────────────────────────────────────────────

const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",

  // 🔥 REQUIRED FOR PASSPORT SESSION AUTH
  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});


// ── Shared Types ──────────────────────────────────────────────────────────────

export interface ProductSpecs {
  storage?: string;
  screenSize?: string;
  camera?: string;
  battery?: string;
}

export interface Variant {
  id: string;
  _id?: string;
  product: string;
  color?: string;
  storage?: string;
  ram?: string;
  sku: string;
  price: number;
  compare_at_price?: number;
  stock: number;
  is_active: boolean;
}

export interface Product {
  _id: string;
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  brand: string;
  condition: string;
  images: string[];
  image?: string;
  image2?: string;
  features?: string[];
  tags?: string[];
  type?: string;
  section?: string;
  rating: number;
  reviews: number;
  deliveryFee?: number;
  specs?: ProductSpecs;
  is_active: boolean;
  variants: Variant[];
  price: number;
  storage?: string;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: Product[];
  page: number;
  pages: number;
  totalProducts: number;
}

export type SortBy =
  | "featured"
  | "price_low"
  | "price_high"
  | "newest"
  | "best_rating"
  | "most_popular";

export interface GetProductsParams {
  page?: number;
  limit?: number;
  all?: boolean;
  search?: string;
  productType?: string;
  brand?: string;
  category?: string;
  section?: string;
  condition?: string;
  storage?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: SortBy;
}

export interface CreateProductPayload {
  name: string;
  category: string;
  brand: string;
  condition?: string;
  description?: string;
  type?: string;
  section?: string;
  image?: string;
  image2?: string;
  deliveryFee?: number;
  rating?: number;
  reviews?: number;
  features?: string[];
  tags?: string[];
  specs?: ProductSpecs;
}

export type UpdateProductPayload = Partial<CreateProductPayload> & {
  is_active?: boolean;
};

export interface CreateVariantPayload {
  productId: string;
  color?: string;
  storage?: string;
  ram?: string;
  sku: string;
  price: number;
  compare_at_price?: number;
  stock: number;
  is_active?: boolean;
};

export type UpdateVariantPayload = Omit<CreateVariantPayload, "productId">;

// ── helper ───────────────────────────────────────────────────────────

const toQuery = (p: GetProductsParams) => ({
  ...p,
  all: p.all ? "true" : undefined,
});

// ── PRODUCT SERVICE ───────────────────────────────────────────────────────────

export const productService = {
  getAll: (params: GetProductsParams = {}): Promise<ProductsResponse> =>
    api.get("/products", { params: toQuery(params) }).then((r) => r.data),

  getBySection: (
    section: string,
    extra: Omit<GetProductsParams, "section" | "all"> = {},
  ): Promise<Product[]> =>
    api
      .get("/products", {
        params: toQuery({ ...extra, section, all: true }),
      })
      .then((r) => r.data.products),

  getBySlug: (slug: string): Promise<Product> =>
    api.get(`/products/${slug}`).then((r) => r.data),

  create: (payload: CreateProductPayload): Promise<Product> =>
    api.post("/products", payload).then((r) => r.data),

  update: (id: string, payload: UpdateProductPayload): Promise<Product> =>
    api.put(`/products/${id}`, payload).then((r) => r.data),

  patch: (id: string, payload: UpdateProductPayload): Promise<Product> =>
    api.patch(`/products/${id}`, payload).then((r) => r.data),

  delete: (id: string): Promise<{ message: string }> =>
    api.delete(`/products/${id}`).then((r) => r.data),
};

// ── VARIANT SERVICE ───────────────────────────────────────────────────────────

export const variantService = {
  getByProduct: (productId: string): Promise<Variant[]> =>
    api.get(`/variants/product/${productId}`).then((r) => r.data),

  create: (payload: CreateVariantPayload): Promise<Variant> =>
    api.post("/variants", payload).then((r) => r.data),

  update: (id: string, payload: UpdateVariantPayload): Promise<Variant> =>
    api.put(`/variants/${id}`, payload).then((r) => r.data),

  delete: (id: string): Promise<{ message: string }> =>
    api.delete(`/variants/${id}`).then((r) => r.data),
};

// ── UTILITIES ──────────────────────────────────────────────────────────

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export const getStockStatus = (product: Product): StockStatus => {
  const total = product.variants.reduce(
    (s, v) => s + (v.is_active ? v.stock : 0),
    0,
  );

  if (total === 0) return "Out of Stock";
  if (total <= 5) return "Low Stock";
  return "In Stock";
};

export const formatPrice = (n: number) =>
  `₦${n.toLocaleString("en-NG")}`;