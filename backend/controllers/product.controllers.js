import Product from "./../models/product.model.js";

/**
 * @desc    Create a new product
 * @route   POST /api/products
 */
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      brand,
      condition,
      image,
      image2,
      features,
    specs,
      type,
      section,
      rating,
      reviews,
    } = req.body;

    if (!name || !category || !brand) {
      return res.status(400).json({
        message: "Name, category, and brand are required",
      });
    }

    const product = await Product.create({
      name,
      description,
      category: category.toLowerCase(),
      brand,
      condition,
      // Map flat image fields to the images array
      images: [image, image2].filter(Boolean),
      features,
      type,
      section,
      rating: rating || 0,
      reviews: reviews || 0,
      // Map flat spec fields to nested specs object
      specs,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

/**
 * @desc    Update a product (PUT - Full update)
 * @route   PUT /api/products/:id
 */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const {
      name, description, category, brand, condition,
      image, image2, features, 
      specs, // Use the object here
      type, section, rating, reviews, is_active,
    } = req.body;

    // Update Top-Level Fields
    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.category = category ? category.toLowerCase() : product.category;
    product.brand = brand ?? product.brand;
    product.condition = condition ?? product.condition;
    product.features = features ?? product.features;
    product.type = type ?? product.type;
    product.section = section ?? product.section;
    product.rating = rating ?? product.rating;
    product.reviews = reviews ?? product.reviews;
    product.is_active = is_active ?? product.is_active;

    // Handle Image Array Updates
    if (image !== undefined || image2 !== undefined) {
      const currentImages = [...product.images];
      if (image !== undefined) currentImages[0] = image;
      if (image2 !== undefined) currentImages[1] = image2;
      product.images = currentImages.filter(Boolean);
    }

    // Update Nested Specs safely
    if (specs) {
      product.specs = {
        camera: specs.camera ?? product.specs.camera,
        battery: specs.battery ?? product.specs.battery,
        screenSize: specs.screenSize ?? product.specs.screenSize,
      };
    }

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Failed to update product", error: error.message });
  }
};

/**
 * @desc    Patch a product (Partial update)
 * @route   PATCH /api/products/:id
 */
export const patchProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updates = req.body;
    const specFields = ["camera", "battery", "screenSize"];

    Object.keys(updates).forEach((key) => {
      if (specFields.includes(key)) {
        // Handle nested specs
        product.specs[key] = updates[key];
      } else if (key === "image" || key === "image2") {
        // Handle images
        const idx = key === "image" ? 0 : 1;
        product.images[idx] = updates[key];
        product.markModified("images");
      } else if (key === "category") {
        product.category = updates.category.toLowerCase();
      } else {
        product[key] = updates[key];
      }
    });

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({
      message: "Failed to patch product",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all products (with pagination and category filter)
 * @route   GET /api/products
 */
export const getProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category.toLowerCase();
    }
    if (req.query.section) {
      filter.section = req.query.section;
    }

    const totalProducts = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      products,
      page,
      pages: Math.ceil(totalProducts / limit),
      totalProducts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

/**
 * @desc    Get product by slug
 * @route   GET /api/products/slug/:slug
 */
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Logic: You might also want to delete all associated Variants here
    await product.deleteOne();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};