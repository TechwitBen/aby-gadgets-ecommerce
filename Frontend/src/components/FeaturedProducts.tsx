// src/components/FeaturedProducts.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart, Star, Heart, Zap,
  Sparkles, ArrowRight, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProductsBySection, formatPrice, type Product } from "@/data/products";
import { getTypeIcon, getTypeColor, getTwoSpecs } from "@/utils/productUtils";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

interface FeaturedProductsProps {
  showViewAll?: boolean;
}

const FeaturedProducts = ({ showViewAll = true }: FeaturedProductsProps) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Pull directly from products.ts — no hardcoded data here
  const newArrivals = getProductsBySection("New Arrivals").slice(0, 4);
  const sweetDeals  = getProductsBySection("Sweet Deals").slice(0, 4);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      storage: product.storage ?? undefined,
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  // Navigate to the Products page and scroll to the right section
  const handleViewAll = (section: "new-arrivals" | "sweet-deals") => {
    navigate(`/products#${section}`);
  };

  // ── Product Card ────────────────────────────────────────────────────────────
  const ProductCard = ({
    product,
    isNewArrival,
  }: {
    product: Product;
    isNewArrival: boolean;
  }) => {
    const [isHovered, setIsHovered] = useState(false);
    const inWishlist = isInWishlist(product.id);
    const TypeIcon    = getTypeIcon(product.type);
    const typeColor   = getTypeColor(product.type);
    const specs       = getTwoSpecs(product);

    return (
      <div
        className="group relative bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-contain p-4 transition-all duration-500 ${
              isHovered ? "opacity-0" : "opacity-100"
            }`}
          />
          {product.image2 && (
            <img
              src={product.image2}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-contain p-4 transition-all duration-500 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.type && (
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${typeColor}`}>
                <TypeIcon className="w-3 h-3" />
                <span>{product.type.charAt(0).toUpperCase() + product.type.slice(1)}</span>
              </div>
            )}
            {isNewArrival ? (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold w-fit">NEW</span>
            ) : (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold w-fit">DEAL</span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 border border-gray-200 z-10"
          >
            <Heart className={`w-5 h-5 ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
          </button>

          {/* Hover overlay */}
          {isHovered && product.inStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-all duration-300">
              <div className="flex flex-col gap-3">
                <Button
                  className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transform hover:scale-105 transition-all"
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Quick Add to Cart
                </Button>
                <Link
                  to={`/products/${product.id}`}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold text-center transform hover:scale-105 transition-all"
                >
                  View Details
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${typeColor}`}>
                {product.brand}
              </span>
              {product.condition === "New" && <Check className="w-4 h-4 text-green-500" />}
            </div>
            {product.rating !== undefined && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-gray-900">{product.rating}</span>
                {product.reviews !== undefined && (
                  <span className="text-xs text-gray-500">({product.reviews})</span>
                )}
              </div>
            )}
          </div>

          <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 h-12">{product.name}</h3>

          <div className="space-y-2 mb-4">
            {specs.map((spec, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <spec.icon className="w-4 h-4 text-gray-400" />
                <span className="truncate">{spec.value}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="text-xl font-bold text-blue-600">{formatPrice(product.price)}</div>
            <div className="text-xs text-gray-500">
              Condition: <span className="font-medium text-gray-700">{product.condition}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">

        {/* Main header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundImage: "linear-gradient(135deg, #0099ff, #00ccff)" }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wider uppercase" style={{ color: "#0099ff" }}>
                Featured Collections
              </div>
              <div className="w-16 h-1 rounded-full mx-auto mt-2" style={{ backgroundColor: "#0099ff" }} />
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Discover Premium <span style={{ color: "#0099ff" }}>Gadgets</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Explore our latest arrivals and exclusive deals
          </p>
        </div>

        {/* ── New Arrivals ── */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundImage: "linear-gradient(135deg, #0099ff, #00ccff)" }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">New Arrivals</h3>
                <p className="text-gray-600">Latest devices just arrived in stock</p>
              </div>
            </div>

            {showViewAll && (
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl"
                onClick={() => handleViewAll("new-arrivals")}
              >
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} isNewArrival={true} />
            ))}
          </div>
        </div>

        {/* ── Sweet Deals ── */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundImage: "linear-gradient(135deg, #ff3366, #ff6699)" }}
              >
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">Sweet Deals</h3>
                <p className="text-gray-600">Limited time offers you can't miss</p>
              </div>
            </div>

            {showViewAll && (
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl"
                onClick={() => handleViewAll("sweet-deals")}
              >
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sweetDeals.map((product) => (
              <ProductCard key={product.id} product={product} isNewArrival={false} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;