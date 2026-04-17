import mongoose from "mongoose";
import Variant from "../models/variant.model.js";
import Product from "../models/product.model.js";

export const getVariantsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const variants = await Variant.find({
      product: productId,
      is_active: true,
    }).sort({ createdAt: -1 });

    res.status(200).json(variants);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch variants",
      error: error.message,
    });
  }
};

export const createVariant = async (req, res) => {
  try {
   const { productId, color, storage, ram, price, compare_at_price, stock, sku, is_active } = req.body;
    if (!productId || !price || !sku) {
      return res.status(400).json({
        message: "Product ID, price, and SKU are required",
      });
    }


    // ADD VALIDATION:
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Valid product ID is required" });
    }

    if (!price || typeof price !== "number" || price <= 0) {
      return res.status(400).json({ message: "Price must be a positive number" });
    }

    if (!sku || typeof sku !== "string" || !sku.trim()) {
      return res.status(400).json({ message: "SKU is required and must be non-empty" });
    }

    if (stock === undefined || stock < 0) {
      return res.status(400).json({ message: "Stock must be 0 or greater" });
    }

    if (compare_at_price && compare_at_price <= price) {
      return res.status(400).json({ 
        message: "Compare price must be greater than selling price" 
      });
    }

    // Ensure product exists
    const productExists = await Product.findById(productId);

    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingSku = await Variant.findOne({ sku });

    if (existingSku) {
      return res.status(400).json({
        message: "SKU already exists",
      });
    }

   const variant = await Variant.create({
      product: productId,
      color:    color   || undefined,
      storage:  storage || undefined,
      ram:      ram     || undefined,
      price,
      compare_at_price: compare_at_price || undefined,
      stock:    stock ?? 0,
      sku,
      is_active: is_active !== false, // Default to true
    });

    res.status(201).json(variant);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "SKU must be unique",
      });
    }

    res.status(500).json({
      message: "Failed to create variant",
      error: error.message,
    });
  }
};

export const updateVariant = async (req, res) => {
  try {
    const variant = await Variant.findById(req.params.id);

    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    const {
      color,
      storage,
      ram,
      price,
      compare_at_price,
      stock,
      sku,
      is_active,
    } = req.body;

    // ADD VALIDATION:
    if (price !== undefined) {
      if (typeof price !== "number" || price <= 0) {
        return res.status(400).json({ message: "Price must be a positive number" });
      }
      variant.price = price;
    }

    if (stock !== undefined) {
      if (stock < 0) {
        return res.status(400).json({ message: "Stock cannot be negative" });
      }
      variant.stock = stock;
    }

    if (compare_at_price !== undefined) {
      if (compare_at_price > 0 && compare_at_price <= variant.price) {
        return res.status(400).json({ 
          message: "Compare price must be greater than selling price" 
        });
      }
      variant.compare_at_price = compare_at_price || null;
    }

    if (sku !== undefined) {
      if (!sku || !sku.trim()) {
        return res.status(400).json({ message: "SKU cannot be empty" });
      }
      // Check for duplicate SKU (excluding current variant)
      const existingSku = await Variant.findOne({ sku, _id: { $ne: variant._id } });
      if (existingSku) {
        return res.status(400).json({ message: "SKU already exists" });
      }
      variant.sku = sku;
    }

    if (color !== undefined) variant.color = color;
    if (storage !== undefined) variant.storage = storage;
    if (ram !== undefined) variant.ram = ram;
    if (price !== undefined) variant.price = price;
    if (compare_at_price !== undefined)
      variant.compare_at_price = compare_at_price;
    if (stock !== undefined) variant.stock = stock;
    if (sku !== undefined) variant.sku = sku;
    if (is_active !== undefined) variant.is_active = is_active;

    const updatedVariant = await variant.save();

    res.status(200).json(updatedVariant);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "SKU must be unique",
      });
    }

    res.status(500).json({
      message: "Failed to update variant",
      error: error.message,
    });
  }
};

export const deleteVariant = async (req, res) => {
  try {
    const variant = await Variant.findById(req.params.id);

    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    variant.is_active = false;
    await variant.save();

    res.status(200).json({
      message: "Variant deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete variant",
      error: error.message,
    });
  }
};
