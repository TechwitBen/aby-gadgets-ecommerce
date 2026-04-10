import axios from "axios";

// ── Types ─────────────────────────────────────────────────────────────────────

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
  /** Convenience aliases mapped from images[0] / images[1] */
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
  variants?: Variant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: Product[];
  page: number;
  pages: number;
  totalProducts: number;
}

// ── Request payload types ─────────────────────────────────────────────────────

export interface GetProductsParams {
  page?: number;
  category?: string;
  section?: string;
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
}

export type UpdateVariantPayload = Omit<CreateVariantPayload, "productId">;

// ── Product service ───────────────────────────────────────────────────────────

const PRODUCTS_BASE = "/api/products";
const VARIANTS_BASE = "/api/variants";

export const productService = {
  /**
   * GET /api/products?category=&section=&page=
   */
  getAll: (params: GetProductsParams = {}): Promise<ProductsResponse> =>
    axios.get<ProductsResponse>(PRODUCTS_BASE, { params }).then((r) => r.data),

  /**
   * GET /api/products/:slug
   */
  getBySlug: (slug: string): Promise<Product> =>
    axios.get<Product>(`${PRODUCTS_BASE}/${slug}`).then((r) => r.data),

  /**
   * POST /api/products  (admin only)
   */
  create: (payload: CreateProductPayload): Promise<Product> =>
    axios.post<Product>(PRODUCTS_BASE, payload).then((r) => r.data),

  /**
   * PUT /api/products/:id  (admin only — full replace)
   */
  update: (id: string, payload: UpdateProductPayload): Promise<Product> =>
    axios.put<Product>(`${PRODUCTS_BASE}/${id}`, payload).then((r) => r.data),

  /**
   * PATCH /api/products/:id  (admin only — partial update)
   */
  patch: (id: string, payload: UpdateProductPayload): Promise<Product> =>
    axios.patch<Product>(`${PRODUCTS_BASE}/${id}`, payload).then((r) => r.data),

  /**
   * DELETE /api/products/:id  (admin only)
   */
  delete: (id: string): Promise<{ message: string }> =>
    axios.delete(`${PRODUCTS_BASE}/${id}`).then((r) => r.data),
};

// ── Variant service ───────────────────────────────────────────────────────────

export const variantService = {
  /**
   * POST /api/variants
   */
  create: (payload: CreateVariantPayload): Promise<Variant> =>
    axios.post<Variant>(VARIANTS_BASE, payload).then((r) => r.data),

  /**
   * PUT /api/variants/:id
   */
  update: (id: string, payload: UpdateVariantPayload): Promise<Variant> =>
    axios.put<Variant>(`${VARIANTS_BASE}/${id}`, payload).then((r) => r.data),

  /**
   * DELETE /api/variants/:id
   */
  delete: (id: string): Promise<{ message: string }> =>
    axios.delete(`${VARIANTS_BASE}/${id}`).then((r) => r.data),
};