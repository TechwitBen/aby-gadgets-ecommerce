import { DataTypes, Model } from "sequelize";

module.exports = (sequelize) => {
  class Product extends Model {
    static associate(models) {
      // i defined associations here
      Product.belongsTo(models.Category, {
        foreignKey: "categoryId",
        as: "category",
      });

      Product.belongsTo(models.Brand, {
        foreignKey: "brandId",
        as: "brand",
      });

      Product.hasMany(models.ProductVariant, {
        foreignKey: "productId",
        as: "variants",
      });

      Product.hasMany(models.ProductImage, {
        foreignKey: "productId",
        as: "images",
      });

      Product.hasMany(models.Review, {
        foreignKey: "productId",
        as: "reviews",
      });

      Product.belongsToMany(models.Product, {
        through: "RelatedProducts",
        as: "relatedProducts",
        foreignKey: "productId",
        otherKey: "relatedProductId",
      });
    }
  }

  Product.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      // Basic Information
      sku: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },

      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 255],
        },
      },

      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          is: /^[a-z0-9-]+$/,
        },
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      shortDescription: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },

      // Foreign Keys
      categoryId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "categories",
          key: "id",
        },
      },

      brandId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "brands",
          key: "id",
        },
      },

      // Pricing
      basePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },

      salePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
      },

      currency: {
        type: DataTypes.STRING(3),
        defaultValue: "NGN",
        validate: {
          len: [3, 3],
        },
      },

      costPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
      },

      // Discount Information
      discountType: {
        type: DataTypes.ENUM("percentage", "fixed", "none"),
        defaultValue: "none",
      },

      discountValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
      },

      discountStartDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      discountEndDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      // Inventory
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },

      lowStockThreshold: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
        validate: {
          min: 0,
        },
      },

      allowBackorder: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      trackInventory: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      // Specifications (stored as JSONB for flexibility)
      specifications: {
        type: DataTypes.JSONB,
        defaultValue: {},
        comment:
          "Flexible JSON storage for product specs like processor, RAM, storage, etc.",
      },

      // Tags
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },

      // SEO
      metaTitle: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      metaDescription: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },

      keywords: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },

      ogImage: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },

      // Shipping
      weight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: "Weight in kg",
      },

      dimensions: {
        type: DataTypes.JSONB,
        defaultValue: {},
        comment: "Object with length, width, height in cm",
      },

      freeShipping: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      shippingClass: {
        type: DataTypes.ENUM("standard", "express", "oversized", "fragile"),
        defaultValue: "standard",
      },

      // Reviews & Ratings (calculated fields)
      averageRating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0,
        validate: {
          min: 0,
          max: 5,
        },
      },

      totalReviews: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },

      ratingDistribution: {
        type: DataTypes.JSONB,
        defaultValue: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      },

      // Status & Visibility
      status: {
        type: DataTypes.ENUM("draft", "active", "archived", "out_of_stock"),
        defaultValue: "draft",
      },

      visibility: {
        type: DataTypes.ENUM("public", "private", "hidden"),
        defaultValue: "public",
      },

      featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      // Warranty
      warrantyDuration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Warranty duration value",
      },

      warrantyType: {
        type: DataTypes.ENUM("months", "years", "lifetime"),
        allowNull: true,
      },

      warrantyDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      // Return Policy
      returnable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      returnWindow: {
        type: DataTypes.INTEGER,
        defaultValue: 30,
        comment: "Return window in days",
      },

      restockingFee: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
        comment: "Restocking fee percentage",
      },

      // Badges
      badges: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        comment: 'e.g., ["New Arrival", "Best Seller", "Limited Edition"]',
      },

      // Availability Dates
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      availableFrom: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "For pre-orders or scheduled releases",
      },

      availableUntil: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "For limited time availability",
      },

      // View count for analytics
      viewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      // Soft delete
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "products",
      timestamps: true,
      paranoid: true, // Enables soft deletes
      indexes: [
        {
          fields: ["sku"],
          unique: true,
        },
        {
          fields: ["slug"],
          unique: true,
        },
        {
          fields: ["categoryId"],
        },
        {
          fields: ["brandId"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["featured"],
        },
        {
          fields: ["basePrice"],
        },
        {
          fields: ["createdAt"],
        },
        {
          // Full-text search index on name and description
          fields: ["name", "description"],
          type: "GIN",
          name: "products_search_idx",
        },
      ],
      hooks: {
        // Auto-generate slug from name if not provided
        beforeValidate: (product) => {
          if (product.name && !product.slug) {
            product.slug = product.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "");
          }
        },

        // Calculate effective price
        beforeSave: (product) => {
          // Ensuring sale price is not higher than base price
          if (product.salePrice && product.salePrice > product.basePrice) {
            product.salePrice = product.basePrice;
          }
        },
      },
    },
  );

  // Instance methods
  Product.prototype.getEffectivePrice = function () {
    const now = new Date();

    // Check if discount is active
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

  Product.prototype.isInStock = function () {
    if (!this.trackInventory) return true;
    return this.quantity > 0 || this.allowBackorder;
  };

  Product.prototype.isLowStock = function () {
    if (!this.trackInventory) return false;
    return this.quantity > 0 && this.quantity <= this.lowStockThreshold;
  };

  Product.prototype.incrementViewCount = async function () {
    this.viewCount += 1;
    await this.save();
  };

  // Class methods
  Product.findBySlug = async function (slug) {
    return await this.findOne({
      where: { slug },
      include: [
        { association: "category" },
        { association: "brand" },
        { association: "images" },
        { association: "variants" },
      ],
    });
  };

  Product.findFeatured = async function (limit = 10) {
    return await this.findAll({
      where: {
        featured: true,
        status: "active",
        visibility: "public",
      },
      limit,
      order: [["createdAt", "DESC"]],
    });
  };

  return Product;
};
