import Wishlist from "./../models/wishlist.model.js";
import Product from "./../models/product.model.js";
import Variant from "./../models/variant.model.js";

// ── Re-use the same normalizer shape as products ──────────────────────────────
const normalizeProduct = (product, variants = []) => {
  const doc = product.toObject ? product.toObject() : product;
  const activeVariants = variants.filter((v) => v.is_active);

  const sorted = [...activeVariants].sort((a, b) => a.price - b.price);
  const cheapest = sorted[0];
  const totalStock = activeVariants.reduce((sum, v) => sum + (v.stock ?? 0), 0);

  return {
    ...doc,
    id:      doc._id.toString(),
    image:   doc.images?.[0] ?? null,
    image2:  doc.images?.[1] ?? null,
    price:   cheapest?.price ?? 0,
    storage: cheapest?.storage ?? doc.specs?.storage ?? null,
    inStock: totalStock > 0,
    variants: variants.map((v) => ({
      ...(v.toObject ? v.toObject() : v),
      id: v._id.toString(),
    })),
  };
};

// ── Get or create a user's wishlist ───────────────────────────────────────────
const getOrCreate = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, items: [] });
  }
  return wishlist;
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc   Get authenticated user's wishlist (products + variants populated)
 * @route  GET /api/v1/wishlist
 */
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await getOrCreate(req.user._id);

    // Collect product IDs
    const productIds = wishlist.items.map((i) => i.product);

    // Fetch products + variants in parallel
    const [products, allVariants] = await Promise.all([
      Product.find({ _id: { $in: productIds } }).lean(),
      Variant.find({ product: { $in: productIds } }).lean(),
    ]);

    // Group variants by product
    const variantMap = {};
    allVariants.forEach((v) => {
      const key = v.product.toString();
      if (!variantMap[key]) variantMap[key] = [];
      variantMap[key].push(v);
    });

    const normalised = products.map((p) =>
      normalizeProduct(p, variantMap[p._id.toString()] ?? [])
    );

    res.status(200).json({
      wishlist: normalised,
      productIds: productIds.map((id) => id.toString()),
      total: normalised.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wishlist", error: error.message });
  }
};

/**
 * @desc   Add a product to wishlist
 * @route  POST /api/v1/wishlist/:productId
 */
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).lean();
    if (!product) return res.status(404).json({ message: "Product not found" });

    const wishlist = await getOrCreate(req.user._id);

    const alreadyAdded = wishlist.items.some(
      (i) => i.product.toString() === productId
    );

    if (alreadyAdded) {
      return res.status(200).json({
        message: "Product already in wishlist",
        productIds: wishlist.items.map((i) => i.product.toString()),
      });
    }

    wishlist.items.push({ product: productId });
    await wishlist.save();

    res.status(201).json({
      message: "Added to wishlist",
      productIds: wishlist.items.map((i) => i.product.toString()),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to add to wishlist", error: error.message });
  }
};

/**
 * @desc   Remove a product from wishlist
 * @route  DELETE /api/v1/wishlist/:productId
 */
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const wishlist = await getOrCreate(req.user._id);

    const before = wishlist.items.length;
    wishlist.items = wishlist.items.filter(
      (i) => i.product.toString() !== productId
    );

    if (wishlist.items.length === before) {
      return res.status(404).json({ message: "Product not found in wishlist" });
    }

    await wishlist.save();

    res.status(200).json({
      message: "Removed from wishlist",
      productIds: wishlist.items.map((i) => i.product.toString()),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove from wishlist", error: error.message });
  }
};

/**
 * @desc   Toggle a product in / out of wishlist
 * @route  POST /api/v1/wishlist/toggle/:productId
 */
export const toggleWishlistItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).lean();
    if (!product) return res.status(404).json({ message: "Product not found" });

    const wishlist = await getOrCreate(req.user._id);

    const index = wishlist.items.findIndex(
      (i) => i.product.toString() === productId
    );

    let action;
    if (index === -1) {
      wishlist.items.push({ product: productId });
      action = "added";
    } else {
      wishlist.items.splice(index, 1);
      action = "removed";
    }

    await wishlist.save();

    res.status(200).json({
      message: `Product ${action} ${action === "added" ? "to" : "from"} wishlist`,
      action,
      inWishlist: action === "added",
      productIds: wishlist.items.map((i) => i.product.toString()),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle wishlist", error: error.message });
  }
};

/**
 * @desc   Clear entire wishlist
 * @route  DELETE /api/v1/wishlist
 */
export const clearWishlist = async (req, res) => {
  try {
    const wishlist = await getOrCreate(req.user._id);
    wishlist.items = [];
    await wishlist.save();

    res.status(200).json({ message: "Wishlist cleared", productIds: [] });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear wishlist", error: error.message });
  }
};