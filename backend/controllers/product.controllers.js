import Product from "./../models/product.model.js";
import Variant from "./../models/variant.model.js";

// ── Normalize a product + its variants into the frontend Product shape ────────
const normalizeProduct = (product, variants = []) => {
  const doc = product.toObject ? product.toObject() : product;
  const activeVariants = variants.filter((v) => v.is_active);

  // Pick cheapest active variant for the top-level price / storage
  const sorted = [...activeVariants].sort((a, b) => a.price - b.price);
  const cheapest = sorted[0];

  const totalStock = activeVariants.reduce((sum, v) => sum + (v.stock ?? 0), 0);

  return {
    ...doc,
    id:       doc._id.toString(),
    image:    doc.images?.[0] ?? null,
    image2:   doc.images?.[1] ?? null,
    price:    cheapest?.price ?? 0,
    storage:  cheapest?.storage ?? doc.specs?.storage ?? null,
    inStock:  totalStock > 0,
    variants: variants.map((v) => ({
      ...( v.toObject ? v.toObject() : v ),
      id: v._id.toString(),
    })),
  };
};

// ── Build Mongoose filter from query params ───────────────────────────────────
const buildFilter = (query) => {
  const {
    search, productType, brand, category,
    section, condition, storage,
  } = query;

  const filter = {};

  if (category)    filter.category  = category.toLowerCase();
  if (section)     filter.section   = section;
  if (brand)       filter.brand     = { $regex: brand, $options: "i" };
  if (productType) filter.type      = productType;
  if (condition)   filter.condition = condition;

  if (storage) {
    filter.$or = [
      { "specs.storage": { $regex: storage, $options: "i" } },
    ];
  }

  if (search) {
    const regex = { $regex: search, $options: "i" };
    const searchOr = [{ name: regex }, { brand: regex }, { type: regex }];
    // Merge with existing $or if storage filter already set one
    filter.$or = filter.$or ? [...filter.$or, ...searchOr] : searchOr;
  }

  return filter;
};

// ── Build Mongoose sort from sortBy param ─────────────────────────────────────
const buildSort = (sortBy) => {
  switch (sortBy) {
    case "newest":       return { createdAt: -1 };
    case "best_rating":  return { rating: -1 };
    case "most_popular": return { reviews: -1 };
    case "featured":
    default:
      return { rating: -1, reviews: -1 };
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Get all products with advanced filtering, sorting, pagination
 * @route   GET /api/products
 *
 * Query params:
 *   page, limit          – pagination (ignored when all=true)
 *   all                  – "true" → skip pagination
 *   search               – text across name / brand / type
 *   productType, brand, category, section, condition, storage
 *   minPrice, maxPrice   – applied after variant join (in-memory)
 *   sortBy               – price_low | price_high | newest | best_rating | most_popular | featured
 *   withVariants         – "true" → embed variant docs (default: true for public API)
 */
export const getProducts = async (req, res) => {
  try {
    const {
      page     = 1,
      limit    = 12,
      all      = "false",
      sortBy   = "featured",
      minPrice,
      maxPrice,
    } = req.query;

    const filter = buildFilter(req.query);
    const sort   = buildSort(sortBy);

    // ── Fetch products ──────────────────────────────────────────────────────
    let query = Product.find(filter).sort(sort);

    const returnAll = all === "true";
    const pageNum   = Math.max(1, parseInt(page));
    const limitNum  = Math.min(100, Math.max(1, parseInt(limit)));

    if (!returnAll) {
      query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const [products, totalProducts] = await Promise.all([
      query.lean(),
      Product.countDocuments(filter),
    ]);

    // ── Batch-fetch variants for all returned products ──────────────────────
    const productIds = products.map((p) => p._id);
    const allVariants = await Variant.find({
      product: { $in: productIds },
    }).lean();

    // Group variants by product id
    const variantMap = {};
    allVariants.forEach((v) => {
      const key = v.product.toString();
      if (!variantMap[key]) variantMap[key] = [];
      variantMap[key].push(v);
    });

    // ── Normalize ───────────────────────────────────────────────────────────
    let normalized = products.map((p) => {
      const variants = variantMap[p._id.toString()] ?? [];
      return normalizeProduct(p, variants);
    });

    // ── Price filter (post-join) ─────────────────────────────────────────────
    if (minPrice) normalized = normalized.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) normalized = normalized.filter((p) => p.price <= Number(maxPrice));

    // ── Price sort (post-join) ───────────────────────────────────────────────
    if (sortBy === "price_low")  normalized.sort((a, b) => a.price - b.price);
    if (sortBy === "price_high") normalized.sort((a, b) => b.price - a.price);

    res.status(200).json({
      products: normalized,
      page:     returnAll ? 1 : pageNum,
      pages:    returnAll ? 1 : Math.ceil(totalProducts / limitNum),
      totalProducts,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
};

/**
 * @desc    Get product by slug (with variants)
 * @route   GET /api/products/slug/:slug
 */
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).lean();
    if (!product) return res.status(404).json({ message: "Product not found" });

    const variants = await Variant.find({ product: product._id }).lean();
    res.status(200).json(normalizeProduct(product, variants));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product", error: error.message });
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 */
export const createProduct = async (req, res) => {
  try {
    const {
      name, description, category, brand, condition,
      image, image2, features, specs, type, section,
      rating, reviews, deliveryFee, tags,
    } = req.body;

    if (!name || !category || !brand) {
      return res.status(400).json({ message: "Name, category, and brand are required" });
    }

    const product = await Product.create({
      name,
      description,
      category: category.toLowerCase(),
      brand,
      condition,
      images:      [image, image2].filter(Boolean),
      features,
      tags,
      type,
      section,
      rating:      rating      ?? 0,
      reviews:     reviews     ?? 0,
      deliveryFee: deliveryFee ?? 0,
      specs,
    });

    res.status(201).json(normalizeProduct(product, []));
  } catch (error) {
    res.status(500).json({ message: "Failed to create product", error: error.message });
  }
};

/**
 * @desc    Full update (PUT)
 * @route   PUT /api/products/:id
 */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const {
      name, description, category, brand, condition,
      image, image2, features, tags, specs,
      type, section, rating, reviews, is_active, deliveryFee,
    } = req.body;

    product.name        = name        ?? product.name;
    product.description = description ?? product.description;
    product.category    = category ? category.toLowerCase() : product.category;
    product.brand       = brand       ?? product.brand;
    product.condition   = condition   ?? product.condition;
    product.features    = features    ?? product.features;
    product.tags        = tags        ?? product.tags;
    product.type        = type        ?? product.type;
    product.section     = section     ?? product.section;
    product.rating      = rating      ?? product.rating;
    product.reviews     = reviews     ?? product.reviews;
    product.is_active   = is_active   ?? product.is_active;
    product.deliveryFee = deliveryFee ?? product.deliveryFee;

    if (image !== undefined || image2 !== undefined) {
      const imgs = [...product.images];
      if (image  !== undefined) imgs[0] = image;
      if (image2 !== undefined) imgs[1] = image2;
      product.images = imgs.filter(Boolean);
    }

    if (specs) {
      product.specs = {
        camera:     specs.camera     ?? product.specs?.camera,
        battery:    specs.battery    ?? product.specs?.battery,
        screenSize: specs.screenSize ?? product.specs?.screenSize,
        storage:    specs.storage    ?? product.specs?.storage,
      };
    }

    const updated = await product.save();
    const variants = await Variant.find({ product: product._id }).lean();
    res.status(200).json(normalizeProduct(updated, variants));
  } catch (error) {
    res.status(500).json({ message: "Failed to update product", error: error.message });
  }
};

/**
 * @desc    Partial update (PATCH)
 * @route   PATCH /api/products/:id
 */
export const patchProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const specFields = ["camera", "battery", "screenSize", "storage"];
    Object.keys(req.body).forEach((key) => {
      if (specFields.includes(key)) {
        if (!product.specs) product.specs = {};
        product.specs[key] = req.body[key];
        product.markModified("specs");
      } else if (key === "image") {
        product.images[0] = req.body[key];
        product.markModified("images");
      } else if (key === "image2") {
        product.images[1] = req.body[key];
        product.markModified("images");
      } else if (key === "category") {
        product.category = req.body.category.toLowerCase();
      } else if (key === "specs" && typeof req.body[key] === "object") {
        product.specs = { ...(product.specs ?? {}), ...req.body[key] };
        product.markModified("specs");
      } else {
        product[key] = req.body[key];
      }
    });

    const updated = await product.save();
    const variants = await Variant.find({ product: product._id }).lean();
    res.status(200).json(normalizeProduct(updated, variants));
  } catch (error) {
    res.status(500).json({ message: "Failed to patch product", error: error.message });
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.deleteOne();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
};