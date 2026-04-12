import axios from "axios";

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

/** Shape returned by every product endpoint (controller normalizes _id → id, images → image/image2, etc.) */
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
  image?: string;   // images[0]
  image2?: string;  // images[1]
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
  // Derived by controller
  price: number;     // cheapest active variant price
  storage?: string;  // cheapest variant storage
  inStock: boolean;  // totalStock > 0
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: Product[];
  page: number;
  pages: number;
  totalProducts: number;
}

// ── Query param types ─────────────────────────────────────────────────────────

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
  /** "true" → return all matching products (no pagination) */
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

// ── Payload types ─────────────────────────────────────────────────────────────

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
}

export type UpdateVariantPayload = Omit<CreateVariantPayload, "productId">;

// ── Internal helper ───────────────────────────────────────────────────────────

const toQuery = (p: GetProductsParams) => ({
  ...p,
  all: p.all ? "true" : undefined,
});

// ── Product service ───────────────────────────────────────────────────────────

const BASE  = "/api/products";
const VBASE = "/api/variants";

export const productService = {
  /** GET /api/products — paginated & filterable */
  getAll: (params: GetProductsParams = {}): Promise<ProductsResponse> =>
    axios.get<ProductsResponse>(BASE, { params: toQuery(params) }).then((r) => r.data),

  /** Fetch ALL products for a given section (no pagination) */
  getBySection: (section: string, extra: Omit<GetProductsParams, "section" | "all"> = {}): Promise<Product[]> =>
    axios
      .get<ProductsResponse>(BASE, { params: toQuery({ ...extra, section, all: true }) })
      .then((r) => r.data.products),

  /** GET /api/products/slug/:slug */
  getBySlug: (slug: string): Promise<Product> =>
    axios.get<Product>(`${BASE}/slug/${slug}`).then((r) => r.data),

  /** POST /api/products */
  create: (payload: CreateProductPayload): Promise<Product> =>
    axios.post<Product>(BASE, payload).then((r) => r.data),

  /** PUT /api/products/:id */
  update: (id: string, payload: UpdateProductPayload): Promise<Product> =>
    axios.put<Product>(`${BASE}/${id}`, payload).then((r) => r.data),

  /** PATCH /api/products/:id */
  patch: (id: string, payload: UpdateProductPayload): Promise<Product> =>
    axios.patch<Product>(`${BASE}/${id}`, payload).then((r) => r.data),

  /** DELETE /api/products/:id */
  delete: (id: string): Promise<{ message: string }> =>
    axios.delete(`${BASE}/${id}`).then((r) => r.data),
};

// ── Variant service ───────────────────────────────────────────────────────────

export const variantService = {
  /** GET /api/variants/product/:productId */
  getByProduct: (productId: string): Promise<Variant[]> =>
    axios.get<Variant[]>(`${VBASE}/product/${productId}`).then((r) => r.data),

  /** POST /api/variants */
  create: (payload: CreateVariantPayload): Promise<Variant> =>
    axios.post<Variant>(VBASE, payload).then((r) => r.data),

  /** PUT /api/variants/:id */
  update: (id: string, payload: UpdateVariantPayload): Promise<Variant> =>
    axios.put<Variant>(`${VBASE}/${id}`, payload).then((r) => r.data),

  /** DELETE /api/variants/:id */
  delete: (id: string): Promise<{ message: string }> =>
    axios.delete(`${VBASE}/${id}`).then((r) => r.data),
};

// ── Shared utilities ──────────────────────────────────────────────────────────

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export const getStockStatus = (product: Product): StockStatus => {
  const total = product.variants.reduce((s, v) => s + (v.is_active ? v.stock : 0), 0);
  if (total === 0) return "Out of Stock";
  if (total <= 5)  return "Low Stock";
  return "In Stock";
};

export const formatPrice = (n: number) =>
  `₦${n.toLocaleString("en-NG")}`;