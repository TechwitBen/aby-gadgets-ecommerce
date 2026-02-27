import mongoose from "mongoose";

const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String },
    shortDescription: { type: String },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand" },
    basePrice: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    currency: { type: String, default: "NGN", maxlength: 3 },
    costPrice: { type: Number, min: 0 },
    discountType: {
      type: String,
      enum: ["percentage", "fixed", "none"],
      default: "none",
    },
    discountValue: { type: Number, min: 0 },
    discountStartDate: { type: Date },
    discountEndDate: { type: Date },
    quantity: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10, min: 0 },
    allowBackorder: { type: Boolean, default: false },
    trackInventory: { type: Boolean, default: true },
    specifications: { type: Schema.Types.Mixed, default: {} },
    tags: { type: [String], default: [] },
    metaTitle: { type: String },
    metaDescription: { type: String },
    keywords: { type: [String], default: [] },
    ogImage: { type: String },
    weight: { type: Number },
    dimensions: { type: Schema.Types.Mixed, default: {} },
    freeShipping: { type: Boolean, default: false },
    shippingClass: {
      type: String,
      enum: ["standard", "express", "oversized", "fragile"],
      default: "standard",
    },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0, min: 0 },
    ratingDistribution: {
      type: Schema.Types.Mixed,
      default: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    },
    status: {
      type: String,
      enum: ["draft", "active", "archived", "out_of_stock"],
      default: "draft",
    },
    visibility: {
      type: String,
      enum: ["public", "private", "hidden"],
      default: "public",
    },
    featured: { type: Boolean, default: false },
    warrantyDuration: { type: Number },
    warrantyType: { type: String, enum: ["months", "years", "lifetime"] },
    warrantyDescription: { type: String },
    returnable: { type: Boolean, default: false },
    returnWindow: { type: Number, default: 30 },
    restockingFee: { type: Number, default: 0 },
    badges: { type: [String], default: [] },
    publishedAt: { type: Date },
    availableFrom: { type: Date },
    availableUntil: { type: Date },
    viewCount: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Indexes
ProductSchema.index({ sku: 1 }, { unique: true });
ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ brandId: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ basePrice: 1 });
ProductSchema.index({ createdAt: 1 });
// Text index for search
ProductSchema.index({ name: "text", description: "text" });

// Hooks
ProductSchema.pre("validate", function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

ProductSchema.pre("save", function (next) {
  if (this.salePrice && this.basePrice && this.salePrice > this.basePrice) {
    this.salePrice = this.basePrice;
  }
  next();
});

// Instance methods
ProductSchema.methods.getEffectivePrice = function () {
  const now = new Date();
  if (
    this.salePrice &&
    this.salePrice < this.basePrice &&
    (!this.discountStartDate || this.discountStartDate <= now) &&
    (!this.discountEndDate || this.discountEndDate >= now)
  ) {
    return this.salePrice;
  }
  return this.basePrice;
};

ProductSchema.methods.isInStock = function () {
  if (!this.trackInventory) return true;
  return this.quantity > 0 || this.allowBackorder;
};

ProductSchema.methods.isLowStock = function () {
  if (!this.trackInventory) return false;
  return this.quantity > 0 && this.quantity <= this.lowStockThreshold;
};

ProductSchema.methods.incrementViewCount = async function () {
  this.viewCount = (this.viewCount || 0) + 1;
  await this.save();
};

// Statics
ProductSchema.statics.findBySlug = async function (slug) {
  return this.findOne({ slug }).exec();
};

ProductSchema.statics.findFeatured = async function (limit = 10) {
  return this.find({ featured: true, status: "active", visibility: "public" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec();
};

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;
