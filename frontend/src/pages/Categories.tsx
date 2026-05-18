import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ChevronDown,
  ShoppingCart,
  Star,
  Grid,
  List,
  X,
  Check,
  Search,
  Camera,
  Monitor,
  Smartphone,
  Package,
  RefreshCw,
  DollarSign,
  HardDrive,
  Layers,
  Tablet,
  Headphones,
  Watch,
  Gamepad,
  Speaker as SpeakerIcon,
  CheckCircle,
  Loader2,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowRight,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  productService,
  formatPrice,
  type Product,
  type GetProductsParams,
  type SortBy,
} from "@/services/products.service";
import { getTypeIcon, getTypeColor, getTwoSpecs } from "@/utils/productUtils";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useInView } from "@/hooks/useInView";

const LIMIT = 30;

const productTypes = [
  { value: "all", label: "All Types", icon: Layers },
  { value: "smartphone", label: "Smartphones", icon: Smartphone },
  { value: "laptop", label: "Laptops", icon: Monitor },
  { value: "tablet", label: "Tablets", icon: Tablet },
  { value: "earbuds", label: "Wireless Earbuds", icon: Headphones },
  { value: "headphones", label: "Headphones", icon: Headphones },
  { value: "smartwatch", label: "Smart Watches", icon: Watch },
  { value: "gaming", label: "Gaming Consoles", icon: Gamepad },
  { value: "speaker", label: "Smart Speakers", icon: SpeakerIcon },
  { value: "camera", label: "Cameras", icon: Camera },
];

const priceRanges = [
  { value: "all", label: "All Prices", icon: DollarSign, min: 0, max: 0 },
  {
    value: "under_100",
    label: "Under ₦100,000",
    icon: DollarSign,
    min: 0,
    max: 100000,
  },
  {
    value: "100_300",
    label: "₦100K – ₦300K",
    icon: DollarSign,
    min: 100000,
    max: 300000,
  },
  {
    value: "300_600",
    label: "₦300K – ₦600K",
    icon: DollarSign,
    min: 300000,
    max: 600000,
  },
  {
    value: "600_1000",
    label: "₦600K – ₦1M",
    icon: DollarSign,
    min: 600000,
    max: 1000000,
  },
  {
    value: "over_1000",
    label: "Over ₦1,000,000",
    icon: DollarSign,
    min: 1000000,
    max: 5000000,
  },
];

const storageOptions = [
  { value: "all", label: "All Storage", icon: HardDrive },
  { value: "64GB", label: "64GB", icon: HardDrive },
  { value: "128GB", label: "128GB", icon: HardDrive },
  { value: "256GB", label: "256GB", icon: HardDrive },
  { value: "512GB", label: "512GB", icon: HardDrive },
  { value: "1TB", label: "1TB", icon: HardDrive },
];

const conditionOptions = [
  { value: "all", label: "All Conditions", icon: Package },
  { value: "Brand New", label: "Brand New", icon: Package },
  { value: "Refurbished", label: "Refurbished", icon: RefreshCw },
  { value: "UK Used", label: "UK Used", icon: RefreshCw },
  { value: "Open Box", label: "Open Box", icon: Package },
  { value: "Fairly Used", label: "Fairly Used", icon: Package },
];

const sortOptions: { value: SortBy; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "best_rating", label: "Best Rating" },
  { value: "most_popular", label: "Most Popular" },
];

const FilterSection = ({
  title,
  value,
  options,
  expanded,
  onToggle,
  onSelect,
}: {
  title: string;
  value: string;
  options: { value: string; label: string; icon?: any }[];
  expanded: boolean;
  onToggle: () => void;
  onSelect: (v: string) => void;
}) => (
  <div className="border-b border-gray-100 last:border-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-3.5 text-sm font-semibold text-gray-900 hover:text-[#6426E1] transition-colors"
    >
      <div className="flex items-center gap-2">
        <span>{title}</span>
        {value !== "all" && (
          <span className="w-2 h-2 rounded-full bg-[#6426E1]" />
        )}
      </div>
      <ChevronDown
        className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
      />
    </button>
    {expanded && (
      <div className="pb-3 space-y-1.5">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isChecked = value === opt.value;
          return (
            <label
              key={`${title}-${opt.value}`}
              className="flex items-center gap-3 cursor-pointer group py-1"
            >
              <div className="relative flex-shrink-0">
                <input
                  type="radio"
                  checked={isChecked}
                  onChange={() => onSelect(opt.value)}
                  className="sr-only peer"
                />
                <div
                  className={`w-4 h-4 border-2 rounded-full flex items-center justify-center transition-all duration-200 ${isChecked ? "border-[#6426E1] bg-[#6426E1]" : "border-gray-300"}`}
                >
                  {isChecked && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {Icon && (
                  <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                )}
                <span className="text-sm text-gray-700 group-hover:text-[#6426E1] transition-colors truncate">
                  {opt.label}
                </span>
              </div>
              {isChecked && (
                <Check className="w-3.5 h-3.5 text-[#6426E1] flex-shrink-0" />
              )}
            </label>
          );
        })}
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Animated ProductCard (standalone so useInView hook is valid)
// ─────────────────────────────────────────────────────────────────────────────
const ProductCard = ({
  product,
  index,
  isInWishlist,
  toggleWishlist,
  handleAddToCart,
  toast,
}: {
  product: Product;
  index: number;
  isInWishlist: (id: string) => boolean;
  toggleWishlist: (id: string) => void;
  handleAddToCart: (p: Product) => void;
  toast: any;
}) => {
  const { ref, isInView } = useInView({ threshold: 0.05 });
  const inWishlist = isInWishlist(product.id);
  const TypeIcon = getTypeIcon(product.type);
  const typeColor = getTypeColor(product.type);
  const specs = getTwoSpecs(product);
  const isOutOfStock = !product.inStock;

  return (
    <div
      ref={ref}
      className="group relative bg-white rounded-2xl border border-gray-200 hover:border-[#6426E1]/30 hover:shadow-xl overflow-hidden isolate flex flex-col transition-all duration-500"
      style={{
        transitionDelay: `${(index % 6) * 70}ms`,
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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const alreadyIn = inWishlist;
            toggleWishlist(product.id);
            toast({
              title: alreadyIn ? "Removed from wishlist" : "Added to wishlist",
              description: `${product.name} ${alreadyIn ? "removed from" : "saved to"} your wishlist`,
            });
          }}
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
              <CheckCircle className="w-3 h-3 text-green-500 hidden sm:block" />
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
// Animated ProductListItem
// ─────────────────────────────────────────────────────────────────────────────
const ProductListItem = ({
  product,
  index,
  isInWishlist,
  toggleWishlist,
  handleAddToCart,
  toast,
}: {
  product: Product;
  index: number;
  isInWishlist: (id: string) => boolean;
  toggleWishlist: (id: string) => void;
  handleAddToCart: (p: Product) => void;
  toast: any;
}) => {
  const { ref, isInView } = useInView({ threshold: 0.05 });
  const inWishlist = isInWishlist(product.id);
  const TypeIcon = getTypeIcon(product.type);
  const typeColor = getTypeColor(product.type);
  const specs = getTwoSpecs(product);
  const isOutOfStock = !product.inStock;

  return (
    <div
      ref={ref}
      className="bg-white rounded-2xl border border-gray-200 hover:border-[#6426E1]/30 p-4 sm:p-5 transition-all duration-500 hover:shadow-lg"
      style={{
        transitionDelay: `${(index % 8) * 60}ms`,
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateX(0)" : "translateX(-20px)",
      }}
    >
      <div className="flex items-start gap-3 sm:gap-5">
        <Link
          to={`/products/${product.slug}`}
          className="relative w-20 h-20 sm:w-28 sm:h-28 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-14 h-14 sm:w-20 sm:h-20 object-contain transition-transform duration-300 hover:scale-110"
          />
          {isOutOfStock && (
            <span className="absolute bottom-1 left-1 bg-gray-700 text-white px-1.5 py-0.5 rounded text-xs font-bold">
              SOLD OUT
            </span>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${typeColor}`}
                >
                  <TypeIcon className="w-3 h-3" />
                  <span>
                    {product.type?.charAt(0).toUpperCase()}
                    {product.type?.slice(1)}
                  </span>
                </div>
                {product.section === "New Arrivals" && (
                  <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                    NEW
                  </span>
                )}
              </div>
              <Link to={`/products/${product.slug}`}>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 hover:text-[#6426E1] transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              {specs.length > 0 && (
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-2 flex-wrap">
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
              <div className="text-base sm:text-xl font-bold text-[#6426E1]">
                {formatPrice(product.price)}
              </div>
              {product.rating > 0 && (
                <div className="flex items-center justify-end gap-1 mt-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-gray-900">
                    {product.rating}
                  </span>
                </div>
              )}
              <div className="text-xs text-gray-400 mt-0.5">
                {product.condition}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <button
              disabled={isOutOfStock}
              onClick={() => {
                if (!isOutOfStock) handleAddToCart(product);
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs h-8 sm:h-9 px-4 rounded-xl font-semibold transition-all active:scale-95 ${
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
              <Eye className="w-3.5 h-3.5" /> View Details
            </Link>
            <button
              onClick={() => {
                const alreadyIn = inWishlist;
                toggleWishlist(product.id);
                toast({
                  title: alreadyIn
                    ? "Removed from wishlist"
                    : "Added to wishlist",
                  description: `${product.name} ${alreadyIn ? "removed from" : "saved to"} your wishlist`,
                });
              }}
              className="w-8 h-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all flex-shrink-0"
            >
              <Heart
                className={`w-4 h-4 transition-colors duration-200 ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-400"}`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Categories page
// ─────────────────────────────────────────────────────────────────────────────
const Categories = () => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [productType, setProductType] = useState("all");
  const [brand, setBrand] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [storage, setStorage] = useState("all");
  const [condition, setCondition] = useState("all");
  const [sortBy, setSortBy] = useState<SortBy>("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [allBrands, setAllBrands] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({
    brand: true,
    price: true,
    storage: false,
    productType: true,
    condition: true,
  });

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animation refs
  const { ref: sidebarRef, isInView: sidebarInView } = useInView({
    threshold: 0,
  });
  const { ref: toolbarRef, isInView: toolbarInView } = useInView({
    threshold: 0,
  });
  const { ref: pillsRef, isInView: pillsInView } = useInView({ threshold: 0 });
  const { ref: emptyRef, isInView: emptyInView } = useInView({
    threshold: 0.1,
  });
  const { ref: loadMoreRef, isInView: loadMoreInView } = useInView({
    threshold: 0.1,
  });

  const buildParams = useCallback(
    (overridePage = 1): GetProductsParams => {
      const priceOpt = priceRanges.find((r) => r.value === priceRange);
      return {
        page: overridePage,
        limit: LIMIT,
        sortBy,
        search: searchQuery || undefined,
        productType: productType !== "all" ? productType : undefined,
        brand: brand !== "all" ? brand : undefined,
        condition: condition !== "all" ? condition : undefined,
        storage: storage !== "all" ? storage : undefined,
        minPrice:
          priceOpt && priceOpt.value !== "all" ? priceOpt.min : undefined,
        maxPrice:
          priceOpt && priceOpt.value !== "all" ? priceOpt.max : undefined,
      };
    },
    [productType, brand, priceRange, storage, condition, sortBy, searchQuery],
  );

  const fetchPage1 = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await productService.getAll(buildParams(1));
      const items = res?.products ?? [];
      setProducts(items);
      setTotalProducts(res?.totalProducts ?? 0);
      setTotalPages(res?.pages ?? 1);
      setPage(1);
      setAllBrands([...new Set(items.map((p) => p.brand))].sort());
    } catch {
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(1);
      setAllBrands([]);
      toast({
        title: "Failed to load products",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    fetchPage1();
  }, [fetchPage1]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [productType, brand, priceRange, storage, condition, sortBy, searchQuery]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setIsLoadingMore(true);
    try {
      const res = await productService.getAll(buildParams(nextPage));
      const items = res?.products ?? [];
      setProducts((prev) => [...prev, ...items]);
      setPage(nextPage);
      setAllBrands((prev) =>
        [...new Set([...prev, ...items.map((p) => p.brand)])].sort(),
      );
    } catch {
      toast({
        title: "Failed to load more products",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchPage1(), 400);
  };

  const clearFilters = () => {
    setProductType("all");
    setBrand("all");
    setPriceRange("all");
    setStorage("all");
    setCondition("all");
    setSortBy("featured");
    setSearchQuery("");
  };

  const activeFiltersCount = [
    productType,
    brand,
    priceRange,
    storage,
    condition,
  ].filter((v) => v !== "all").length;

  const toggleFilterSection = (key: keyof typeof expandedFilters) =>
    setExpandedFilters((prev) => ({ ...prev, [key]: !prev[key] }));

  const brandOptions = [
    { value: "all", label: "All Brands", icon: Layers },
    ...allBrands.map((b) => ({ value: b, label: b, icon: Layers })),
  ];

  const handleAddToCart = (product: Product) => {
    const firstVariant =
      product.variants?.find((v) => v.is_active && v.stock > 0) ??
      product.variants?.[0];
    if (!firstVariant) {
      toast({ title: "Error", description: "No variants available" });
      return;
    }
    addToCart({
      id: product.id,
      variantId: firstVariant.id,
      name: product.name,
      price: firstVariant.price,
      image: product.image,
      quantity: 1,
      storage: firstVariant.storage ?? undefined,
      color: firstVariant.color,
      sku: firstVariant.sku,
    });
    toast({ title: "Added to cart", description: `${product.name} added` });
  };

  const filterSidebar = (
    <div className="space-y-0">
      <FilterSection
        title="Product Type"
        value={productType}
        options={productTypes}
        expanded={expandedFilters.productType}
        onToggle={() => toggleFilterSection("productType")}
        onSelect={setProductType}
      />
      <FilterSection
        title="Brands"
        value={brand}
        options={brandOptions}
        expanded={expandedFilters.brand}
        onToggle={() => toggleFilterSection("brand")}
        onSelect={setBrand}
      />
      <FilterSection
        title="Price Range"
        value={priceRange}
        options={priceRanges}
        expanded={expandedFilters.price}
        onToggle={() => toggleFilterSection("price")}
        onSelect={setPriceRange}
      />
      {productType === "smartphone" && (
        <FilterSection
          title="Storage"
          value={storage}
          options={storageOptions}
          expanded={expandedFilters.storage}
          onToggle={() => toggleFilterSection("storage")}
          onSelect={setStorage}
        />
      )}
      <FilterSection
        title="Condition"
        value={condition}
        options={conditionOptions}
        expanded={expandedFilters.condition}
        onToggle={() => toggleFilterSection("condition")}
        onSelect={setCondition}
      />
    </div>
  );

  // ── Type chips (mobile) ──────────────────────────────────────────────────
  const TypeChip = ({ type }: { type: (typeof productTypes)[0] }) => {
    const isActive = productType === type.value;
    const Icon = type.icon;
    return (
      <button
        onClick={() => setProductType(type.value)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
          isActive
            ? "bg-[#6426E1] text-white shadow-md scale-105"
            : "bg-white border border-gray-200 text-gray-600 hover:border-[#6426E1]/40 hover:text-[#6426E1]"
        }`}
      >
        <Icon className="w-3.5 h-3.5" />
        {type.label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Mobile sticky chips ─────────────────────────────────────────── */}
      <div className="lg:hidden bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="px-3 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search gadgets..."
              className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6426E1]/30 bg-gray-50"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-2 px-3 pb-2.5 overflow-x-auto scrollbar-hide">
          {productTypes.map((type) => (
            <TypeChip key={type.value} type={type} />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* ── Desktop Sidebar ────────────────────────────────────────── */}
          <div
            ref={sidebarRef}
            className="hidden lg:block lg:w-72 flex-shrink-0 transition-all duration-700 ease-out"
            style={{
              opacity: sidebarInView ? 1 : 0,
              transform: sidebarInView ? "translateX(0)" : "translateX(-28px)",
            }}
          >
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900 text-base">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-[#6426E1] hover:text-[#5420c4] font-semibold flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3 h-3" /> Clear all
                  </button>
                )}
              </div>
              <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search gadgets..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6426E1]/30 bg-gray-50"
                />
              </div>
              {filterSidebar}
              {activeFiltersCount > 0 && (
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="w-full rounded-xl"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* ── Mobile Filter Drawer ────────────────────────────────────── */}
          <div
            className={`lg:hidden fixed inset-0 z-[60] transition-all duration-300 ${
              showMobileFilters
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowMobileFilters(false)}
            />
            <div
              className={`absolute inset-y-0 left-0 w-[85vw] max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${showMobileFilters ? "translate-x-0" : "-translate-x-full"}`}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">
                  Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4">{filterSidebar}</div>
              <div className="p-4 border-t border-gray-100 space-y-2">
                {activeFiltersCount > 0 && (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="w-full rounded-xl h-10"
                  >
                    Clear All
                  </Button>
                )}
                <Button
                  className="w-full bg-[#6426E1] hover:bg-[#5520c0] text-white rounded-xl h-11 font-semibold"
                  onClick={() => setShowMobileFilters(false)}
                >
                  Show {totalProducts} Products
                </Button>
              </div>
            </div>
          </div>

          {/* ── Mobile Sort Sheet ───────────────────────────────────────── */}
          <div
            className={`lg:hidden fixed inset-0 z-[50] transition-all duration-300 ${
              showSortSheet
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowSortSheet(false)}
            />
            <div
              className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out ${showSortSheet ? "translate-y-0" : "translate-y-full"}`}
            >
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />
              <div className="px-4 pb-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">
                  Sort by
                </h3>
                <div className="space-y-1">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSortBy(opt.value);
                        setShowSortSheet(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        sortBy === opt.value
                          ? "bg-[#6426E1]/10 text-[#6426E1]"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                      {sortBy === opt.value && (
                        <Check className="w-4 h-4 text-[#6426E1]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Products area ───────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Desktop toolbar */}
            <div
              ref={toolbarRef}
              className="hidden lg:flex items-center justify-between mb-6 transition-all duration-700 ease-out"
              style={{
                opacity: toolbarInView ? 1 : 0,
                transform: toolbarInView ? "translateY(0)" : "translateY(14px)",
              }}
            >
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isLoading ? "Loading…" : `${totalProducts} Products Found`}
                </h2>
                {activeFiltersCount > 0 && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {activeFiltersCount} filter
                    {activeFiltersCount > 1 ? "s" : ""} applied
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl p-1">
                  {(["grid", "list"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`p-2 rounded-lg transition-colors ${viewMode === mode ? "bg-white shadow-sm text-[#6426E1]" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      {mode === "grid" ? (
                        <Grid className="w-4 h-4" />
                      ) : (
                        <List className="w-4 h-4" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="appearance-none text-sm border border-gray-200 rounded-xl px-4 py-2 pr-9 focus:outline-none focus:ring-2 focus:ring-[#6426E1]/30 bg-white min-w-[160px]"
                  >
                    {sortOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Mobile toolbar */}
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="relative flex items-center gap-1.5 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 flex-1 justify-center transition-colors hover:border-[#6426E1]/40"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#6426E1] text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowSortSheet(true)}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 flex-1 justify-center"
              >
                <ArrowUpDown className="w-4 h-4" /> Sort
              </button>
              <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-xl p-1">
                {(["grid", "list"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === mode ? "bg-[#6426E1]/10 text-[#6426E1]" : "text-gray-400"}`}
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

            {/* Active filter pills */}
            {activeFiltersCount > 0 && (
              <div ref={pillsRef} className="mb-4 flex flex-wrap gap-2">
                {[
                  {
                    key: "productType",
                    val: productType,
                    label: productTypes.find((t) => t.value === productType)
                      ?.label,
                    reset: () => setProductType("all"),
                  },
                  {
                    key: "brand",
                    val: brand,
                    label: brand,
                    reset: () => setBrand("all"),
                  },
                  {
                    key: "priceRange",
                    val: priceRange,
                    label: priceRanges.find((r) => r.value === priceRange)
                      ?.label,
                    reset: () => setPriceRange("all"),
                  },
                  {
                    key: "storage",
                    val: storage,
                    label: storage,
                    reset: () => setStorage("all"),
                  },
                  {
                    key: "condition",
                    val: condition,
                    label: condition,
                    reset: () => setCondition("all"),
                  },
                ]
                  .filter(({ val }) => val !== "all")
                  .map(({ key, label, reset }, i) => (
                    <div
                      key={key}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#6426E1]/10 text-[#6426E1] rounded-full text-xs font-semibold border border-[#6426E1]/20 transition-all duration-500"
                      style={{
                        transitionDelay: `${i * 60}ms`,
                        opacity: pillsInView ? 1 : 0,
                        transform: pillsInView ? "scale(1)" : "scale(0.85)",
                      }}
                    >
                      <span>{label}</span>
                      <button onClick={reset}>
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-500 hover:text-gray-800 font-medium transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}

            <div className="lg:hidden mb-3 text-xs text-gray-500 font-medium">
              {isLoading ? "Loading…" : `${totalProducts} products found`}
            </div>

            {/* ── Product Grid / List ─────────────────────────────────── */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse flex flex-col justify-between"
                  >
                    <div className="bg-gray-200 aspect-square rounded-xl w-full" />
                    <div className="space-y-2 mt-3">
                      <div className="bg-gray-200 h-3 w-1/3 rounded-full" />
                      <div className="bg-gray-200 h-4 w-full rounded-md" />
                      <div className="bg-gray-200 h-3 w-2/3 rounded-md" />
                    </div>
                    <div className="bg-gray-200 h-5 w-1/2 rounded-md mt-2" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                    {products.map((p, i) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        index={i}
                        isInWishlist={isInWishlist}
                        toggleWishlist={toggleWishlist}
                        handleAddToCart={handleAddToCart}
                        toast={toast}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products.map((p, i) => (
                      <ProductListItem
                        key={p.id}
                        product={p}
                        index={i}
                        isInWishlist={isInWishlist}
                        toggleWishlist={toggleWishlist}
                        handleAddToCart={handleAddToCart}
                        toast={toast}
                      />
                    ))}
                  </div>
                )}

                <div
                  ref={loadMoreRef}
                  className="mt-8 flex flex-col items-center gap-2 transition-all duration-700 ease-out"
                  style={{
                    opacity: loadMoreInView ? 1 : 0,
                    transform: loadMoreInView
                      ? "translateY(0)"
                      : "translateY(16px)",
                  }}
                >
                  <p className="text-xs text-gray-500">
                    Showing{" "}
                    <span className="font-semibold text-gray-800">
                      {products.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-800">
                      {totalProducts}
                    </span>{" "}
                    products
                  </p>
                  {page < totalPages && (
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="w-full max-w-sm py-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:border-[#6426E1]/40 hover:text-[#6426E1] hover:shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                        </>
                      ) : (
                        "Load more"
                      )}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div
                ref={emptyRef}
                className="text-center py-16 bg-white rounded-2xl border border-gray-200 transition-all duration-700 ease-out"
                style={{
                  opacity: emptyInView ? 1 : 0,
                  transform: emptyInView ? "translateY(0)" : "translateY(20px)",
                }}
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-5 text-sm max-w-xs mx-auto">
                  Try adjusting your filters or search terms.
                </p>
                <Button
                  onClick={clearFilters}
                  className="bg-[#6426E1] hover:bg-[#5420c4] text-white rounded-xl transition-transform duration-200 hover:scale-105 active:scale-95"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
