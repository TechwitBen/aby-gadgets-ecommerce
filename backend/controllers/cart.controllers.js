import mongoose from "mongoose";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Variant from "../models/variant.model.js";

const findOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  return cart;
};

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product", "name category images")
      .populate("items.variant", "sku price stock color storage ram");

    if (!cart) {
      const emptyCart = await Cart.create({ user: req.user._id, items: [] });
      return res.status(200).json(emptyCart);
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch cart",
      error: error.message,
    });
  }
};

export const addCartItem = async (req, res) => {
  try {
    console.log("🔥 ADD CART ITEM REQUEST BODY:", req.body);
    console.log("👤 USER:", req.user?._id);
    const { product, variant, quantity = 1 } = req.body;

    if (!product || !variant) {
      return res.status(400).json({
        message: "Product and variant IDs are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(product) ||
      !mongoose.Types.ObjectId.isValid(variant)
    ) {
      return res.status(400).json({ message: "Invalid product or variant ID" });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const foundProduct = await Product.findById(product);
    if (!foundProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const foundVariant = await Variant.findById(variant);
    if (!foundVariant || !foundVariant.is_active) {
      return res.status(404).json({ message: "Variant not found or unavailable" });
    }

    if (foundVariant.product.toString() !== product) {
      return res.status(400).json({
        message: "Variant does not belong to the provided product",
      });
    }

    if (foundVariant.stock < quantity) {
      return res.status(400).json({
        message: "Requested quantity exceeds available stock",
      });
    }

    const cart = await findOrCreateCart(req.user._id);
    const existingItem = cart.items.find(
      (item) => item.variant.toString() === variant,
    );

    if (existingItem) {
      const updatedQuantity = existingItem.quantity + quantity;
      if (foundVariant.stock < updatedQuantity) {
        return res.status(400).json({
          message: "Requested quantity exceeds available stock",
        });
      }
      existingItem.quantity = updatedQuantity;
      existingItem.unit_price = foundVariant.price;
      existingItem.total_price = updatedQuantity * foundVariant.price;
    } else {
      cart.items.push({
        product,
        variant,
        quantity,
        unit_price: foundVariant.price,
        total_price: foundVariant.price * quantity,
      });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate("items.product", "name category images")
      .populate("items.variant", "sku price stock color storage ram");

    res.status(200).json(populatedCart);
   
  } catch (error) {
    res.status(500).json({
      message: "Failed to add item to cart",
      error: error.message,
    });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { variant, quantity } = req.body;

    console.log("🔥 UPDATE CART ITEM REQUEST BODY:", req.body);

    if (!variant || quantity === undefined) {
      return res.status(400).json({
        message: "Variant ID and quantity are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(variant)) {
      return res.status(400).json({ message: "Invalid variant ID" });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const foundVariant = await Variant.findById(variant);
    if (!foundVariant || !foundVariant.is_active) {
      return res.status(404).json({ message: "Variant not found or unavailable" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find((item) => item.variant.toString() === variant);
    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (foundVariant.stock < quantity) {
      return res.status(400).json({
        message: "Requested quantity exceeds available stock",
      });
    }

    item.quantity = quantity;
    item.unit_price = foundVariant.price;
    item.total_price = quantity * foundVariant.price;

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate("items.product", "name category images")
      .populate("items.variant", "sku price stock color storage ram");

    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update cart item",
      error: error.message,
    });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { variantId } = req.params;
 console.log("🔥 DELETE CART ITEM REQUEST BODY:", variantId);

    if (!mongoose.Types.ObjectId.isValid(variantId)) {
      return res.status(400).json({ message: "Invalid variant ID" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.variant.toString() === variantId,
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate("items.product", "name category images")
      .populate("items.variant", "sku price stock color storage ram");

    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({
      message: "Failed to remove cart item",
      error: error.message,
    });
  }
};

export const clearCart = async (req, res) => {
  try {
    const cart = await findOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({
      message: "Failed to clear cart",
      error: error.message,
    });
  }
};
