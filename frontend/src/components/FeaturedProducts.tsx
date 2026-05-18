import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Star,
  Heart,
  ArrowRight,
  Check,
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
import { useInView } from "@/hooks/useInView";

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
    if (!variant) {
      toast({ title: "Error", description: "No variants available" });
      return;
    }
    addToCart({
      id: product.id,
      variantId: variant.id,
      name: product.name,
      price: variant.price,
      image: product.image,
      quantity: 1,
      storage: variant.storage ?? undefined,
      color: variant.color,
      sku: variant.sku,
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleViewAll = (section: "new-arrivals" | "sweet-deals") =>
    navigate(`/products#${section}`);

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-100" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="h-7 bg-gray-100 rounded mt-2" />
      </div>
    </div>
  );

  const ProductCard = ({
    product,
    isNewArrival,
    index,
  }: {
    product: Product;
    isNewArrival: boolean;
    index: number;
  }) => {
    const inWishlist = isInWishlist(product.id);
    const TypeIcon = getTypeIcon(product.type);
    const typeColor = getTypeColor(product.type);
    const specs = getTwoSpecs(product);
    const isOutOfStock = !product.inStock;
    const { ref, isInView } = useInView({ threshold: 0.05 });

    const handleWishlist = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const alreadyIn = inWishlist;
      toggleWishlist(product.id);
      toast({
        title: alreadyIn ? "Removed from wishlist" : "Added to wishlist",
        description: `${product.name} ${alreadyIn ? "removed from" : "saved to"} your wishlist`,
      });
    };

    return (
      <div
        ref={ref}
        className="group relative bg-white rounded-2xl border border-gray-200 hover:border-[#6426E1]/30 hover:shadow-xl transition-all duration-500 overflow-hidden isolate flex flex-col"
        style={{
          transitionDelay: `${index * 80}ms`,
          opacity: isInView ? 1 : 0,
          transform: isInView ? "translateY(0)" : "translateY(28px)",
        }}
      >
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <img
            src={product.image ?? ""}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-contain p-3 sm:p-4 transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.type && (
              <div
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${typeColor}`}
              >
                <TypeIcon className="w-2.5 h-2.5" />
                <span className="hidden sm:inline">
                  {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                </span>
              </div>
            )}
            {product.section === "New Arrivals" && (
              <span className="text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold w-fit bg-red-500">
                NEW
              </span>
            )}
            {product.condition === "UK Used" && (
              <span className="bg-amber-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold w-fit">
                UK USED
              </span>
            )}
            {product.condition === "Open Box" && (
              <span className="bg-purple-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold w-fit">
                OPEN BOX
              </span>
            )}
            {product.condition === "Refurbished" && (
              <span className="bg-green-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold w-fit">
                REFURB
              </span>
            )}
            {!isOutOfStock && !product.section && (
              <span
                className="text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold w-fit"
                style={{
                  backgroundColor: isNewArrival ? "#ef4444" : "#6426E1",
                }}
              >
                {isNewArrival ? "NEW" : "DEAL"}
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-gray-700 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold w-fit">
                SOLD OUT
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all border border-gray-200 z-30"
          >
            <Heart
              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-colors duration-200 ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-600"}`}
            />
          </button>

          {/* Desktop hover overlay */}
          {!isOutOfStock && (
            <div className="hidden sm:flex absolute inset-0 bg-black/60 backdrop-blur-sm items-center justify-center z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
              <div className="flex flex-col gap-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <Button
                  className="bg-white text-[#6426E1] hover:bg-gray-100 px-4 py-2 rounded-xl font-semibold text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" /> Quick Add
                </Button>
                <Link
                  to={`/products/${product.slug}`}
                  className="bg-[#6426E1] hover:bg-[#5420c4] text-white px-4 py-2 rounded-xl font-semibold text-sm text-center transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="p-3 sm:p-4 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-1 sm:mb-1.5">
            <div className="flex items-center gap-1">
              <span
                className={`text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full ${typeColor}`}
              >
                {product.brand}
              </span>
              {product.condition === "Brand New" && (
                <Check className="w-3 h-3 text-green-500 hidden sm:block" />
              )}
            </div>
            {product.rating > 0 && (
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-[11px] font-bold text-gray-900">
                  {product.rating}
                </span>
              </div>
            )}
          </div>

          <Link to={`/products/${product.slug}`}>
            <h3 className="font-bold text-gray-900 text-xs sm:text-sm leading-snug line-clamp-2 mb-1.5 sm:mb-2 hover:text-[#6426E1] transition-colors">
              {product.name}
            </h3>
          </Link>

          {specs.length > 0 && (
            <div className="hidden sm:block space-y-1 mb-3">
              {specs.slice(0, 2).map((spec, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 text-xs text-gray-500"
                >
                  <spec.icon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{spec.value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-gray-100 mb-2">
            <div className="text-sm sm:text-base font-bold text-[#6426E1]">
              {formatPrice(product.price)}
            </div>
            <div className="hidden sm:block text-[10px] text-gray-400 truncate max-w-[90px] text-right">
              {product.condition}
            </div>
          </div>

          {!isOutOfStock ? (
            <div className="flex gap-1.5 sm:hidden">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
                className="flex-1 py-2 bg-[#6426E1] hover:bg-[#5420c4] text-white text-[11px] font-semibold rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all"
              >
                <ShoppingCart className="w-3 h-3" />
                Add to Cart
              </button>
              <Link
                to={`/products/${product.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-gray-200 hover:border-[#6426E1] hover:text-[#6426E1] text-gray-600 text-[11px] font-semibold transition-colors flex-shrink-0 whitespace-nowrap"
              >
                View Details
              </Link>
            </div>
          ) : (
            <div className="py-1.5 text-center text-[11px] text-gray-400 font-medium border border-gray-200 rounded-xl sm:hidden">
              Sold out
            </div>
          )}

          {isOutOfStock && (
            <div className="hidden sm:block py-2 text-center text-xs text-gray-400 font-medium border border-gray-200 rounded-xl">
              Sold out
            </div>
          )}
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
    iconColor,
  }: {
    title: string;
    subtitle: string;
    products: Product[];
    isNewArrival: boolean;
    sectionKey: "new-arrivals" | "sweet-deals";
    icon: React.ElementType;
    iconColor: string;
  }) => {
    const { ref: headerRef, isInView: headerInView } = useInView();

    return (
      <div className="mb-10 sm:mb-16 lg:mb-20">
        <div
          ref={headerRef}
          className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8 transition-all duration-700 ease-out"
          style={{
            opacity: headerInView ? 1 : 0,
            transform: headerInView ? "translateY(0)" : "translateY(16px)",
          }}
        >
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <div
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: iconColor }}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                {title}
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5 truncate">
                {subtitle}
              </p>
            </div>
          </div>
          {showViewAll && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-[#6426E1]/20 hover:border-[#6426E1]/50 hover:text-[#6426E1] text-xs sm:text-sm flex-shrink-0 ml-2 transition-transform duration-200 hover:scale-105"
              onClick={() => handleViewAll(sectionKey)}
            >
              <span className="hidden sm:inline mr-1">View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {products.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                isNewArrival={isNewArrival}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 sm:py-12 bg-gray-50 rounded-2xl border border-gray-200">
            <p className="text-gray-500 text-sm">
              No products available right now.
            </p>
          </div>
        )}
      </div>
    );
  };

  // Section heading
  const { ref: headingRef, isInView: headingInView } = useInView();

  return (
    <section className="py-10 sm:py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-3 sm:px-4">
        <div
          ref={headingRef}
          className="text-center mb-8 sm:mb-12 lg:mb-16 transition-all duration-700 ease-out"
          style={{
            opacity: headingInView ? 1 : 0,
            transform: headingInView ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div
              className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: "#6426E1" }}
            >
              <ShoppingBag className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="text-left">
              <div
                className="text-xs sm:text-sm font-semibold tracking-wider uppercase"
                style={{ color: "#6426E1" }}
              >
                Featured Collections
              </div>
              <div
                className="w-10 sm:w-16 h-1 rounded-full mt-1.5"
                style={{ backgroundColor: "#6426E1" }}
              />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-6">
            Discover Premium <span style={{ color: "#6426E1" }}>Gadgets</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed px-2">
            Latest arrivals and exclusive deals — all verified and authentic
          </p>
        </div>

        <Section
          title="New Arrivals"
          subtitle="Latest devices just landed in stock"
          products={newArrivals}
          isNewArrival={true}
          sectionKey="new-arrivals"
          icon={TrendingUp}
          iconColor="#6426E1"
        />
        <Section
          title="Sweet Deals"
          subtitle="Limited time offers you can't miss"
          products={sweetDeals}
          isNewArrival={false}
          sectionKey="sweet-deals"
          icon={Tag}
          iconColor="#e11d48"
        />
      </div>
    </section>
  );
};

export default FeaturedProducts;
