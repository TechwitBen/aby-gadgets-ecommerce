import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Star,
  Heart,
  ArrowRight,
  Check,
  Loader2,
  ShoppingBag,
  TrendingUp,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  productService,
  formatPrice,
  type Product,
} from "@/services/products.service";
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

  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [sweetDeals, setSweetDeals] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      productService.getBySection("New Arrivals"),
      productService.getBySection("Sweet Deals"),
    ])
      .then(([na, sd]) => {
        setNewArrivals((na ?? []).slice(0, 4));
        setSweetDeals((sd ?? []).slice(0, 4));
      })
      .catch(() => {
        setNewArrivals([]);
        setSweetDeals([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleAddToCart = (product: Product) => {
    const variant =
      product.variants?.find((v) => v.is_active && v.stock > 0) ??
      product.variants?.[0];

    addToCart({
      id: product.id,
      variantId: variant?._id ?? variant?.id,
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

  const handleViewAll = (section: "new-arrivals" | "sweet-deals") =>
    navigate(`/products#${section}`);

  const SkeletonCard = () => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-100" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-2/3" />
        <div className="h-6 bg-gray-100 rounded w-1/3 mt-4" />
      </div>
    </div>
  );

  // ── Product Card — CSS group hover, no JS hover state ─────────────────────
  const ProductCard = ({
    product,
    isNewArrival,
  }: {
    product: Product;
    isNewArrival: boolean;
  }) => {
    const inWishlist = isInWishlist(product.id);
    const TypeIcon = getTypeIcon(product.type);
    const typeColor = getTypeColor(product.type);
    const specs = getTwoSpecs(product);
    const isOutOfStock = !product.inStock;

    return (
      <div className="group relative bg-white rounded-xl border border-gray-200 hover:border-violet-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Image area */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {/* Primary image */}
          <img
            src={product.image ?? ""}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-contain p-4 transition-opacity duration-500 ${
              !isOutOfStock ? "group-hover:opacity-0" : ""
            }`}
          />
          {/* Secondary image — only when in stock */}
          {product.image2 && !isOutOfStock && (
            <img
              src={product.image2}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-contain p-4 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.type && (
              <div
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${typeColor}`}
              >
                <TypeIcon className="w-3 h-3" />
                <span>
                  {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                </span>
              </div>
            )}
            {!isOutOfStock && (
              <span
                className="text-white px-3 py-1 rounded-full text-xs font-bold w-fit"
                style={{
                  backgroundColor: isNewArrival ? "#ef4444" : "#6426E1",
                }}
              >
                {isNewArrival ? "NEW" : "DEAL"}
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-xs font-bold">
                OUT OF STOCK
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 border border-gray-200 z-10"
          >
            <Heart
              className={`w-5 h-5 ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-600"}`}
            />
          </button>

          {/* Hover overlay — CSS group hover, stable */}
          {!isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
              <div className="flex flex-col gap-3">
                <Button
                  className="bg-white px-6 py-3 rounded-lg font-semibold transform hover:scale-105 transition-all"
                  style={{ color: "#6426E1" }}
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" /> Quick Add to Cart
                </Button>
                <Link
                  to={`/products/${product.slug}`}
                  className="text-white px-6 py-3 rounded-lg font-semibold text-center transform hover:scale-105 transition-all"
                  style={{ backgroundColor: "#6426E1" }}
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
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${typeColor}`}
              >
                {product.brand}
              </span>
              {product.condition === "Brand New" && (
                <Check className="w-4 h-4 text-green-500" />
              )}
            </div>
            {product.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-gray-900">
                  {product.rating}
                </span>
                {product.reviews > 0 && (
                  <span className="text-xs text-gray-500">
                    ({product.reviews})
                  </span>
                )}
              </div>
            )}
          </div>

          <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 h-12">
            {product.name}
          </h3>

          <div className="space-y-2 mb-4">
            {specs.map((spec, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <spec.icon className="w-4 h-4 text-gray-400" />
                <span className="truncate">{spec.value}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="text-xl font-bold" style={{ color: "#6426E1" }}>
              {formatPrice(product.price)}
            </div>
            <div className="text-xs text-gray-500">
              Condition:{" "}
              <span className="font-medium text-gray-700">
                {product.condition}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Section = ({
    title,
    subtitle,
    products,
    isNewArrival,
    sectionKey,
    icon: Icon,
    iconGradient,
  }: {
    title: string;
    subtitle: string;
    products: Product[];
    isNewArrival: boolean;
    sectionKey: "new-arrivals" | "sweet-deals";
    icon: React.ElementType;
    iconGradient: string;
  }) => (
    <div className="mb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundImage: iconGradient }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-900">{title}</h3>
            <p className="text-gray-600">{subtitle}</p>
          </div>
        </div>
        {showViewAll && (
          <Button
            variant="outline"
            size="lg"
            className="rounded-xl border-violet-200 hover:border-violet-400 hover:text-violet-700"
            onClick={() => handleViewAll(sectionKey)}
          >
            View All <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} isNewArrival={isNewArrival} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-gray-500">No products available right now.</p>
        </div>
      )}
    </div>
  );

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                backgroundImage: "linear-gradient(135deg, #6426E1, #9b59f5)",
              }}
            >
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <div
                className="text-sm font-semibold tracking-wider uppercase"
                style={{ color: "#6426E1" }}
              >
                Featured Collections
              </div>
              <div
                className="w-16 h-1 rounded-full mx-auto mt-2"
                style={{ backgroundColor: "#6426E1" }}
              />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Discover Premium <span style={{ color: "#6426E1" }}>Gadgets</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Explore our latest arrivals and exclusive deals — all verified and
            authentic
          </p>
        </div>

        <Section
          title="New Arrivals"
          subtitle="Latest devices just landed in stock"
          products={newArrivals}
          isNewArrival={true}
          sectionKey="new-arrivals"
          icon={TrendingUp}
          iconGradient="linear-gradient(135deg, #6426E1, #9b59f5)"
        />

        <Section
          title="Sweet Deals"
          subtitle="Limited time offers you can't miss"
          products={sweetDeals}
          isNewArrival={false}
          sectionKey="sweet-deals"
          icon={Tag}
          iconGradient="linear-gradient(135deg, #e11d48, #fb7185)"
        />
      </div>
    </section>
  );
};

export default FeaturedProducts;
