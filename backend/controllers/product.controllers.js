export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, countInStock, brand, image } =
      req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        message: "Name, price and category are required",
      });
    }

    const slug = slugify(name, { lower: true });

    const existingProduct = await Product.findOne({ slug });

    if (existingProduct) {
      return res.status(400).json({
        message: "Product already exists",
      });
    }

    const product = await Product.create({
      name,
      slug,
      description,
      price,
      category: category.toLowerCase(),
      countInStock,
      brand,
      image,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const { name, description, price, category, countInStock, brand, image } =
      req.body;

    if (name) {
      product.name = name;
      product.slug = slugify(name, { lower: true });
    }

    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.category = category ? category.toLowerCase() : product.category;
    product.countInStock = countInStock ?? product.countInStock;
    product.brand = brand ?? product.brand;
    product.image = image ?? product.image;

    const updatedProduct = await product.save();

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category.toLowerCase();
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

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};
