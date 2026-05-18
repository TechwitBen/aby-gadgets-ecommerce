import { useState, useEffect, useRef } from "react";
import graphicsGaming from "@/assets/graphics-gaming.png";
import graphicsHeadphones from "@/assets/graphics-headphones.png";
import graphicsLaptops from "@/assets/graphics-laptops.png";
import graphicsSmartphones from "@/assets/graphics-smartphones.png";
import graphicsTablets from "@/assets/graphics-tablets.png";
import graphicsWatches from "@/assets/graphics-watches.png";
import { Link, useLocation } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Star,
  Grid,
  List,
  X,
  Search,
  Loader2,
  ArrowRight,
  SlidersHorizontal,
  Eye,
  Filter,
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
import { useNavigate } from "react-router-dom";
import { useInView } from "@/hooks/useInView";

const bannerCards = [
  {
    id: 1,
    image: graphicsGaming,
    title: "Get Your Favourite Gadget Fast, Easy, and Verified.",
  },
  {
    id: 2,
    image: graphicsHeadphones,
    title: "Join Thousands of Smart Shoppers.",
  },
  {
    id: 3,
    image: graphicsLaptops,
    title: "Premium Quality at Unbeatable Prices",
  },
  {
    id: 4,
    image: graphicsSmartphones,
    title: "24/7 Customer Support Always Here",
  },
  { id: 5, image: graphicsTablets, title: "Fast & Secure Delivery Nationwide" },
  { id: 6, image: graphicsWatches, title: "30-Day Money Back Guarantee" },
];

// ─────────────────────────────────────────────────────────────────────────────
// ProductCard
// ─────────────────────────────────────────────────────────────────────────────
const ProductCard = ({
  product,
  index = 0,
  animate = false,
}: {
  product: Product;
  index?: number;
  animate?: boolean;
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { ref, isInView } = useInView({ threshold: 0.05 });

  const inWishlist = isInWishlist(product.id);
  const TypeIcon = getTypeIcon(product.type);
  const typeColor = getTypeColor(product.type);
  const specs = getTwoSpecs(product);
  const isOutOfStock = !product.inStock;

  const handleAddToCart = () => {
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
      className="group relative bg-white rounded-2xl border border-gray-200 hover:border-[#6426E1]/30 hover:shadow-xl overflow-hidden isolate flex flex-col transition-all duration-500"
      style={{
        transitionDelay: animate ? `${index * 70}ms` : "0ms",
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(24px)",
      }}
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={product.image}
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
          {!product.inStock && (
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
                  e.stopPropagation();
                  handleAddToCart();
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
          <span
            className={`text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full ${typeColor}`}
          >
            {product.brand}
          </span>
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
                handleAddToCart();
              }}
              className="flex-1 py-2 bg-[#6426E1] hover:bg-[#5420c4] text-white text-[11px] font-semibold rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all"
            >
              <ShoppingCart className="w-3 h-3" /> Add to Cart
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

// ─────────────────────────────────────────────────────────────────────────────
// ProductListItem
// ─────────────────────────────────────────────────────────────────────────────
const ProductListItem = ({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { ref, isInView } = useInView({ threshold: 0.05 });

  const inWishlist = isInWishlist(product.id);
  const TypeIcon = getTypeIcon(product.type);
  const typeColor = getTypeColor(product.type);
  const specs = getTwoSpecs(product);
  const isOutOfStock = !product.inStock;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
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
      className="group bg-white rounded-2xl border border-gray-200 hover:border-[#6426E1]/30 hover:shadow-lg p-4 sm:p-5 transition-all duration-500"
      style={{
        transitionDelay: `${index * 60}ms`,
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateX(0)" : "translateX(-20px)",
      }}
    >
      <div className="flex items-start gap-3 sm:gap-5">
        <div className="relative w-20 h-20 sm:w-28 sm:h-28 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-14 h-14 sm:w-20 sm:h-20 object-contain transition-transform duration-300 group-hover:scale-110"
          />
          <button
            onClick={handleWishlist}
            className="absolute top-1 right-1 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-md border border-gray-200 z-10 hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-3 h-3 transition-colors duration-200 ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-600"}`}
            />
          </button>
          {isOutOfStock && (
            <span className="absolute bottom-1 left-1 bg-gray-700 text-white px-1 py-0.5 rounded text-[10px] font-bold">
              SOLD OUT
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <div
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${typeColor}`}
                >
                  <TypeIcon className="w-2.5 h-2.5" />
                  <span>
                    {product.type?.charAt(0).toUpperCase()}
                    {product.type?.slice(1)}
                  </span>
                </div>
                {product.section === "New Arrivals" && (
                  <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                    NEW
                  </span>
                )}
              </div>
              <Link to={`/products/${product.slug}`}>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2 leading-snug hover:text-[#6426E1] transition-colors">
                  {product.name}
                </h3>
              </Link>
              <div className="text-[10px] text-gray-500 mt-0.5">
                {product.brand}
              </div>
              {specs.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1.5 flex-wrap">
                  {specs.slice(0, 2).map((spec, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <spec.icon className="w-3 h-3" />
                      <span>{spec.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-sm sm:text-lg font-bold text-[#6426E1]">
                {formatPrice(product.price)}
              </div>
              {product.rating > 0 && (
                <div className="flex items-center justify-end gap-0.5 mt-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-gray-900">
                    {product.rating}
                  </span>
                </div>
              )}
              <div className="text-[10px] text-gray-400 mt-0.5">
                {product.condition}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-2.5">
            <button
              disabled={isOutOfStock}
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs h-8 sm:h-9 px-3 sm:px-4 rounded-xl font-semibold transition-all active:scale-95 ${
                isOutOfStock
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-[#6426E1] hover:bg-[#5420c4] text-white"
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {isOutOfStock ? "Sold Out" : "Add to Cart"}
            </button>
            <Link
              to={`/products/${product.slug}`}
              className="flex items-center justify-center gap-1.5 text-xs h-8 sm:h-9 px-3 sm:px-4 rounded-xl font-semibold border border-gray-200 hover:border-[#6426E1] hover:text-[#6426E1] text-gray-600 transition-all whitespace-nowrap"
            >
              <Eye className="w-3.5 h-3.5" />
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FilterPanel
// ─────────────────────────────────────────────────────────────────────────────
interface FilterPanelProps {
  selectedBrand: string;
  selectedCategory: string;
  selectedCondition: string;
  priceRange: [number, number];
  brands: string[];
  categories: string[];
  conditions: string[];
  setSelectedBrand: (v: string) => void;
  setSelectedCategory: (v: string) => void;
  setSelectedCondition: (v: string) => void;
  setPriceRange: React.Dispatch<React.SetStateAction<[number, number]>>;
  resetFilters: () => void;
}

const FilterPanel = ({
  selectedBrand,
  selectedCategory,
  selectedCondition,
  priceRange,
  brands,
  categories,
  conditions,
  setSelectedBrand,
  setSelectedCategory,
  setSelectedCondition,
  setPriceRange,
  resetFilters,
}: FilterPanelProps) => (
  <div className="space-y-5">
    {[
      {
        label: "Brand",
        value: selectedBrand,
        onChange: setSelectedBrand,
        options: brands,
      },
      {
        label: "Category",
        value: selectedCategory,
        onChange: setSelectedCategory,
        options: categories,
      },
      {
        label: "Condition",
        value: selectedCondition,
        onChange: setSelectedCondition,
        options: conditions,
      },
    ].map(({ label, value, onChange, options }) => (
      <div key={label}>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
        <select
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6426E1]/30 bg-white"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
    ))}
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Price: {formatPrice(priceRange[0])} – {formatPrice(priceRange[1])}
      </label>
      <div className="space-y-3">
        {([0, 1] as const).map((idx) => (
          <input
            key={idx}
            type="range"
            min="0"
            max="2000000"
            step="10000"
            value={priceRange[idx]}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              setPriceRange((prev) => {
                const next = [...prev] as [number, number];
                if (idx === 0 && v <= prev[1]) next[0] = v;
                if (idx === 1 && v >= prev[0]) next[1] = v;
                return next;
              });
            }}
            className="w-full accent-[#6426E1]"
          />
        ))}
      </div>
    </div>
    <button
      onClick={resetFilters}
      className="w-full py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
    >
      Reset All Filters
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SectionBlock
// ─────────────────────────────────────────────────────────────────────────────
interface SectionBlockProps {
  title: string;
  id: string;
  sectionRef: React.RefObject<HTMLDivElement>;
  list: Product[];
  viewMode: "grid" | "list";
  resetFilters: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  isLoading?: boolean;
}

const SectionBlock = ({
  title,
  id,
  sectionRef,
  list,
  viewMode,
  resetFilters,
  hasMore,
  isLoadingMore,
  onLoadMore,
  isLoading = false,
}: SectionBlockProps) => {
  const { ref: headerRef, isInView: headerInView } = useInView();

  return (
    <div ref={sectionRef} id={id} className="mb-10 sm:mb-12 scroll-mt-20">
      <div
        ref={headerRef}
        className="flex items-center justify-between mb-4 sm:mb-6 transition-all duration-700 ease-out"
        style={{
          opacity: headerInView ? 1 : 0,
          transform: headerInView ? "translateY(0)" : "translateY(16px)",
        }}
      >
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
            {title}
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            {list.length} products
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-2xl border border-gray-200 animate-pulse h-[320px] w-full"
            />
          ))}
        </div>
      ) : list.length > 0 ? (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {list.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} animate />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {list.map((p, i) => (
                <ProductListItem key={p.id} product={p} index={i} />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:border-[#6426E1]/40 hover:text-[#6426E1] transition-all disabled:opacity-60 hover:scale-105 active:scale-95"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                  </>
                ) : (
                  "Load more"
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-200">
          <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium text-sm">
            No products match your filters
          </p>
          <Button
            variant="ghost"
            onClick={resetFilters}
            className="mt-3 text-[#6426E1] text-sm"
          >
            Reset filters
          </Button>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Products page
// ─────────────────────────────────────────────────────────────────────────────
const Products = () => {
  const location = useLocation();
  const { toast } = useToast();

  const [newArrivalsAll, setNewArrivalsAll] = useState<Product[]>([]);
  const [popularProductsAll, setPopularProductsAll] = useState<Product[]>([]);
  const [sweetDealsAll, setSweetDealsAll] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newArrivalsPage, setNewArrivalsPage] = useState(1);
  const [popularPage, setPopularPage] = useState(1);
  const [sweetDealsPage, setSweetDealsPage] = useState(1);

  const [newArrivalsHasMore, setNewArrivalsHasMore] = useState(false);
  const [popularHasMore, setPopularHasMore] = useState(false);
  const [sweetDealsHasMore, setSweetDealsHasMore] = useState(false);

  const [newArrivalsLoadingMore, setNewArrivalsLoadingMore] = useState(false);
  const [popularLoadingMore, setPopularLoadingMore] = useState(false);
  const [sweetDealsLoadingMore, setSweetDealsLoadingMore] = useState(false);

  const SECTION_LIMIT = 8;

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([
    0, 2_000_000,
  ]);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // ── Fade slider ────────────────────────────────────────────────────────────
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsTransitioning(false);
    }, 400); // half of the CSS transition duration
  };

  useEffect(() => {
    const id = setInterval(() => {
      goToSlide((currentSlide + 1) % bannerCards.length);
    }, 5000);
    return () => clearInterval(id);
  }, [currentSlide, isTransitioning]);

  // ── Filter scroll-reset ────────────────────────────────────────────────────
  const prevFilterState = useRef({
    selectedBrand,
    selectedCategory,
    selectedCondition,
    priceRange,
    searchQuery,
  });
  useEffect(() => {
    const curr = {
      selectedBrand,
      selectedCategory,
      selectedCondition,
      priceRange,
      searchQuery,
    };
    if (JSON.stringify(prevFilterState.current) !== JSON.stringify(curr)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      prevFilterState.current = curr;
    }
  }, [
    selectedBrand,
    selectedCategory,
    selectedCondition,
    priceRange,
    searchQuery,
  ]);

  // ── Hash scroll ────────────────────────────────────────────────────────────
  const newArrivalsRef = useRef<HTMLDivElement>(null);
  const sweetDealsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!location.hash) return;
    const tryScroll = () => {
      if (location.hash === "#new-arrivals" && newArrivalsRef.current) {
        newArrivalsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        return true;
      }
      if (location.hash === "#sweet-deals" && sweetDealsRef.current) {
        sweetDealsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        return true;
      }
      return false;
    };
    if (!tryScroll()) {
      const t = setTimeout(tryScroll, 300);
      return () => clearTimeout(t);
    }
  }, [location.hash]);

  // ── Initial fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      productService.getAll({
        section: "New Arrivals",
        page: 1,
        limit: SECTION_LIMIT,
      }),
      productService.getAll({
        section: "Popular Products",
        page: 1,
        limit: SECTION_LIMIT,
      }),
      productService.getAll({
        section: "Sweet Deals",
        page: 1,
        limit: SECTION_LIMIT,
      }),
    ])
      .then(([na, pp, sd]) => {
        setNewArrivalsAll(na?.products ?? []);
        setNewArrivalsHasMore((na?.page ?? 1) < (na?.pages ?? 1));
        setPopularProductsAll(pp?.products ?? []);
        setPopularHasMore((pp?.page ?? 1) < (pp?.pages ?? 1));
        setSweetDealsAll(sd?.products ?? []);
        setSweetDealsHasMore((sd?.page ?? 1) < (sd?.pages ?? 1));
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        toast({
          title: "Failed to load products",
          description: "Please check your connection and refresh the page.",
          variant: "destructive",
        });
        setNewArrivalsAll([]);
        setPopularProductsAll([]);
        setSweetDealsAll([]);
      })
      .finally(() => setIsLoading(false));
  }, [toast]);

  // ── Load more ──────────────────────────────────────────────────────────────
  const loadMoreNewArrivals = async () => {
    setNewArrivalsLoadingMore(true);
    try {
      const nextPage = newArrivalsPage + 1;
      const res = await productService.getAll({
        section: "New Arrivals",
        page: nextPage,
        limit: SECTION_LIMIT,
      });
      setNewArrivalsAll((prev) => [...prev, ...(res?.products ?? [])]);
      setNewArrivalsPage(nextPage);
      setNewArrivalsHasMore((res?.page ?? 1) < (res?.pages ?? 1));
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to load more",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setNewArrivalsLoadingMore(false);
    }
  };

  const loadMorePopular = async () => {
    setPopularLoadingMore(true);
    try {
      const nextPage = popularPage + 1;
      const res = await productService.getAll({
        section: "Popular Products",
        page: nextPage,
        limit: SECTION_LIMIT,
      });
      setPopularProductsAll((prev) => [...prev, ...(res?.products ?? [])]);
      setPopularPage(nextPage);
      setPopularHasMore((res?.page ?? 1) < (res?.pages ?? 1));
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to load more",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setPopularLoadingMore(false);
    }
  };

  const loadMoreSweetDeals = async () => {
    setSweetDealsLoadingMore(true);
    try {
      const nextPage = sweetDealsPage + 1;
      const res = await productService.getAll({
        section: "Sweet Deals",
        page: nextPage,
        limit: SECTION_LIMIT,
      });
      setSweetDealsAll((prev) => [...prev, ...(res?.products ?? [])]);
      setSweetDealsPage(nextPage);
      setSweetDealsHasMore((res?.page ?? 1) < (res?.pages ?? 1));
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to load more",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSweetDealsLoadingMore(false);
    }
  };

  // ── Filter helpers ─────────────────────────────────────────────────────────
  const allLoaded = [
    ...newArrivalsAll,
    ...popularProductsAll,
    ...sweetDealsAll,
  ];
  const brands = ["All", ...new Set(allLoaded.map((p) => p.brand))];
  const categories = ["All", ...new Set(allLoaded.map((p) => p.category))];
  const conditions = ["All", ...new Set(allLoaded.map((p) => p.condition))];

  const filterProducts = (list: Product[]) =>
    list.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.type?.toLowerCase() ?? "").includes(q);
      return (
        matchesSearch &&
        (selectedBrand === "All" || p.brand === selectedBrand) &&
        (selectedCategory === "All" || p.category === selectedCategory) &&
        (selectedCondition === "All" || p.condition === selectedCondition) &&
        p.price >= priceRange[0] &&
        p.price <= priceRange[1]
      );
    });

  const newArrivals = filterProducts(newArrivalsAll);
  const popularProducts = filterProducts(popularProductsAll);
  const sweetDeals = filterProducts(sweetDealsAll);

  const activeFiltersCount = [
    selectedBrand !== "All",
    selectedCategory !== "All",
    selectedCondition !== "All",
    priceRange[0] > 0 || priceRange[1] < 2_000_000,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedBrand("All");
    setSelectedCategory("All");
    setSelectedCondition("All");
    setPriceRange([0, 2_000_000]);
  };

  const filterPanelProps: FilterPanelProps = {
    selectedBrand,
    selectedCategory,
    selectedCondition,
    priceRange,
    brands,
    categories,
    conditions,
    setSelectedBrand,
    setSelectedCategory,
    setSelectedCondition,
    setPriceRange,
    resetFilters,
  };

  // ── Page-level entry animation ─────────────────────────────────────────────
  const { ref: bannerRef, isInView: bannerInView } = useInView({
    threshold: 0,
  });
  const { ref: ctaRef, isInView: ctaInView } = useInView({ threshold: 0.1 });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Banner ────────────────────────────────────────────────────────── */}
      <div
        ref={bannerRef}
        className="bg-white pt-4 pb-6 sm:py-8 transition-all duration-700 ease-out"
        style={{
          opacity: bannerInView ? 1 : 0,
          transform: bannerInView ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <div className="container mx-auto px-3 sm:px-4">
          <p className="text-gray-600 text-center text-xs sm:text-sm mb-5 font-medium">
            Your Trusted Tech Partner, Built for{" "}
            <span className="bg-[#6426E1]/10 text-[#6426E1] px-1.5 py-0.5 rounded-sm font-bold">
              You
            </span>
            , Backed by Trust.
          </p>

          {/* ── Fade Slider (no prev/next buttons) ── */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-lg h-[160px] sm:h-[240px] md:h-[300px]">
              {bannerCards.map((card, i) => (
                <div
                  key={card.id}
                  className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                  style={{
                    opacity: i === currentSlide ? 1 : 0,
                    zIndex: i === currentSlide ? 1 : 0,
                  }}
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Dot indicators only */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {bannerCards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={`transition-all duration-300 rounded-full ${
                    currentSlide === i
                      ? "w-5 h-1.5 bg-[#6426E1]"
                      : "w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky search/filter bar ──────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search gadgets..."
                className="w-full pl-9 pr-8 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6426E1]/30 bg-gray-50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowMobileFilter(true)}
              className="relative flex items-center gap-1.5 px-3 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors sm:hidden"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#6426E1] text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="hidden sm:flex items-center gap-2 text-sm rounded-xl"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? "Hide" : "Filters"}
              {activeFiltersCount > 0 && (
                <span className="bg-[#6426E1] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {(["grid", "list"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === mode ? "bg-white shadow-sm text-[#6426E1]" : "text-gray-500"}`}
                >
                  {mode === "grid" ? (
                    <Grid className="w-4 h-4" />
                  ) : (
                    <List className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {showFilters && (
            <div className="hidden sm:block mt-3 pt-3 border-t border-gray-100">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "Brand",
                    value: selectedBrand,
                    onChange: setSelectedBrand,
                    options: brands,
                  },
                  {
                    label: "Category",
                    value: selectedCategory,
                    onChange: setSelectedCategory,
                    options: categories,
                  },
                  {
                    label: "Condition",
                    value: selectedCondition,
                    onChange: setSelectedCondition,
                    options: conditions,
                  },
                ].map(({ label, value, onChange, options }) => (
                  <div key={label}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      {label}
                    </label>
                    <select
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6426E1]/30"
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                    >
                      {options.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Price: {formatPrice(priceRange[0])} –{" "}
                    {formatPrice(priceRange[1])}
                  </label>
                  <div className="space-y-1.5">
                    {([0, 1] as const).map((idx) => (
                      <input
                        key={idx}
                        type="range"
                        min="0"
                        max="2000000"
                        step="10000"
                        value={priceRange[idx]}
                        onChange={(e) => {
                          const v = parseInt(e.target.value);
                          setPriceRange((prev) => {
                            const next = [...prev] as [number, number];
                            if (idx === 0 && v <= prev[1]) next[0] = v;
                            if (idx === 1 && v >= prev[0]) next[1] = v;
                            return next;
                          });
                        }}
                        className="w-full accent-[#6426E1]"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Filter Drawer ───────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-[60] sm:hidden transition-all duration-300 ${
          showMobileFilter
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowMobileFilter(false)}
        />
        <div
          className={`absolute inset-y-0 right-0 w-[85vw] max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            showMobileFilter ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900">
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </h3>
            <button
              onClick={() => setShowMobileFilter(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <FilterPanel {...filterPanelProps} />
          </div>
          <div className="p-4 border-t border-gray-100 space-y-2">
            {activeFiltersCount > 0 && (
              <Button
                onClick={resetFilters}
                variant="outline"
                className="w-full rounded-xl h-10"
              >
                Clear All
              </Button>
            )}
            <Button
              className="w-full bg-[#6426E1] hover:bg-[#5520c0] text-white rounded-xl h-11 font-semibold"
              onClick={() => setShowMobileFilter(false)}
            >
              Show Results (
              {newArrivals.length + popularProducts.length + sweetDeals.length})
            </Button>
          </div>
        </div>
      </div>

      {/* ── Product Sections ───────────────────────────────────────────────── */}
      <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-8">
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <p className="text-xs sm:text-sm text-gray-600">
            {isLoading ? (
              "Loading…"
            ) : (
              <>
                <span className="font-bold text-gray-900">
                  {newArrivals.length +
                    popularProducts.length +
                    sweetDeals.length}
                </span>{" "}
                gadgets
              </>
            )}
          </p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 sm:hidden">
              {(["grid", "list"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === mode ? "bg-white shadow-sm text-[#6426E1]" : "text-gray-500"}`}
                >
                  {mode === "grid" ? (
                    <Grid className="w-4 h-4" />
                  ) : (
                    <List className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-red-500 font-medium px-2.5 py-1 bg-red-50 rounded-full border border-red-100"
              >
                <X className="w-3 h-3" /> Clear ({activeFiltersCount})
              </button>
            )}
          </div>
        </div>

        <SectionBlock
          title="New Arrivals"
          id="new-arrivals"
          sectionRef={newArrivalsRef}
          list={newArrivals}
          viewMode={viewMode}
          resetFilters={resetFilters}
          hasMore={newArrivalsHasMore}
          isLoadingMore={newArrivalsLoadingMore}
          onLoadMore={loadMoreNewArrivals}
          isLoading={isLoading}
        />
        <SectionBlock
          title="Popular Products"
          id="popular"
          sectionRef={{ current: null }}
          list={popularProducts}
          viewMode={viewMode}
          resetFilters={resetFilters}
          hasMore={popularHasMore}
          isLoadingMore={popularLoadingMore}
          onLoadMore={loadMorePopular}
          isLoading={isLoading}
        />
        <SectionBlock
          title="Sweet Deals"
          id="sweet-deals"
          sectionRef={sweetDealsRef}
          list={sweetDeals}
          viewMode={viewMode}
          resetFilters={resetFilters}
          hasMore={sweetDealsHasMore}
          isLoadingMore={sweetDealsLoadingMore}
          onLoadMore={loadMoreSweetDeals}
          isLoading={isLoading}
        />

        {/* CTA */}
        <div
          ref={ctaRef}
          className="text-center py-10 sm:py-16 bg-[#6426E1]/5 rounded-2xl border border-[#6426E1]/10 mt-4 transition-all duration-700 ease-out"
          style={{
            opacity: ctaInView ? 1 : 0,
            transform: ctaInView ? "translateY(0)" : "translateY(24px)",
          }}
        >
          <div className="max-w-md mx-auto px-4">
            <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Need Advanced Filters?
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">
              Visit our categories page for detailed specs, advanced filtering
              and more!
            </p>
            <Link to="/categories">
              <Button className="bg-[#6426E1] hover:bg-[#5420c4] text-white py-5 sm:py-7 px-8 sm:px-12 rounded-xl text-base sm:text-lg font-semibold shadow-lg w-full sm:w-auto transition-transform duration-200 hover:scale-105 active:scale-95">
                Go to Categories <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
