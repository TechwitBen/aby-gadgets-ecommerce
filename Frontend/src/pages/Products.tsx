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
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
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
} from "@/services/Products.service";
import { getTypeIcon, getTypeColor, getTwoSpecs } from "@/utils/productUtils";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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
const ProductCard = ({ product }: { product: Product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const inWishlist = isInWishlist(product.id);
  const TypeIcon = getTypeIcon(product.type);
  const typeColor = getTypeColor(product.type);
  const specs = getTwoSpecs(product);
  const isOutOfStock = !product.inStock;

  const handleAddToCart = () => {
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
    <div className="group relative bg-white rounded-2xl border border-gray-200 hover:border-[#6426E1]/30 hover:shadow-xl transition-all duration-300 overflow-hidden isolate flex flex-col">
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-contain p-3 sm:p-4"
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
          className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all border border-gray-200 z-10"
        >
          <Heart
            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-600"}`}
          />
        </button>

        {/* Desktop hover overlay */}
        {!isOutOfStock && (
          <div className="hidden sm:flex absolute inset-0 bg-black/60 backdrop-blur-sm items-center justify-center z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
            <div className="flex flex-col gap-2">
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

      {/* ── Card body ── */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        {/* Brand + rating */}
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

        {/* Name */}
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-bold text-gray-900 text-xs sm:text-sm leading-snug line-clamp-2 mb-1.5 sm:mb-2 hover:text-[#6426E1] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Specs — sm+ only */}
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

        {/* Price row */}
        <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-gray-100 mb-2">
          <div className="text-sm sm:text-base font-bold text-[#6426E1]">
            {formatPrice(product.price)}
          </div>
          {/* Condition — hidden on mobile to save space */}
          <div className="hidden sm:block text-[10px] text-gray-400 truncate max-w-[90px] text-right">
            {product.condition}
          </div>
        </div>

        {/* CTA buttons */}
        {!isOutOfStock ? (
          <div className="flex gap-1.5">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCart();
              }}
              className="flex-1 py-1.5 sm:py-2 bg-[#6426E1] hover:bg-[#5420c4] text-white text-[11px] sm:text-xs font-semibold rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all"
            >
              <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {/* "Add" on mobile, "Add to Cart" on sm+ */}
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">Add to Cart</span>
            </button>
            <Link
              to={`/products/${product.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center w-8 sm:w-9 rounded-xl border border-gray-200 hover:border-[#6426E1] hover:text-[#6426E1] text-gray-400 transition-colors flex-shrink-0"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="py-1.5 text-center text-[11px] text-gray-400 font-medium border border-gray-200 rounded-xl">
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
const ProductListItem = ({ product }: { product: Product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

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
    <div className="group bg-white rounded-2xl border border-gray-200 hover:border-[#6426E1]/30 hover:shadow-lg transition-all p-4 sm:p-5">
      <div className="flex items-start gap-3 sm:gap-5">
        <div className="relative w-20 h-20 sm:w-28 sm:h-28 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-14 h-14 sm:w-20 sm:h-20 object-contain"
          />
          <button
            onClick={handleWishlist}
            className="absolute top-1 right-1 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-md border border-gray-200 z-10"
          >
            <Heart
              className={`w-3 h-3 ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-600"}`}
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
              className="flex items-center justify-center gap-1 text-xs h-8 sm:h-9 px-3 sm:px-4 rounded-xl font-semibold border border-gray-200 hover:border-[#6426E1] hover:text-[#6426E1] text-gray-600 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Details</span>
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
  visible: number;
  viewMode: "grid" | "list";
  setVisible: React.Dispatch<React.SetStateAction<number>>;
  resetFilters: () => void;
}

const SectionBlock = ({
  title,
  id,
  sectionRef,
  list,
  visible,
  viewMode,
  setVisible,
  resetFilters,
}: SectionBlockProps) => (
  <div ref={sectionRef} id={id} className="mb-10 sm:mb-12 scroll-mt-20">
    <div className="flex items-center justify-between mb-4 sm:mb-6">
      <div>
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
          Showing {Math.min(visible, list.length)} of {list.length}
        </p>
      </div>
      {list.length > 4 && (
        <Button
          variant="ghost"
          size="sm"
          className="text-[#6426E1] hover:text-[#5420c4] hover:bg-[#6426E1]/10 text-xs sm:text-sm"
          onClick={() =>
            setVisible((p) => (p >= list.length ? 4 : list.length))
          }
        >
          {visible >= list.length ? "View Less" : "View More"}
          {visible >= list.length ? (
            <ChevronUp className="w-3.5 h-3.5 ml-1" />
          ) : (
            <ChevronDownIcon className="w-3.5 h-3.5 ml-1" />
          )}
        </Button>
      )}
    </div>
    {list.length > 0 ? (
      viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {list.slice(0, visible).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {list.slice(0, visible).map((p) => (
            <ProductListItem key={p.id} product={p} />
          ))}
        </div>
      )
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

// ─────────────────────────────────────────────────────────────────────────────
// Products page
// ─────────────────────────────────────────────────────────────────────────────
const Products = () => {
  const location = useLocation();

  const [newArrivalsAll, setNewArrivalsAll] = useState<Product[]>([]);
  const [popularProductsAll, setPopularProductsAll] = useState<Product[]>([]);
  const [sweetDealsAll, setSweetDealsAll] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      productService.getBySection("New Arrivals"),
      productService.getBySection("Popular Products"),
      productService.getBySection("Sweet Deals"),
    ])
      .then(([na, pp, sd]) => {
        setNewArrivalsAll(na ?? []);
        setPopularProductsAll(pp ?? []);
        setSweetDealsAll(sd ?? []);
      })
      .catch(() => {
        setNewArrivalsAll([]);
        setPopularProductsAll([]);
        setSweetDealsAll([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

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

  const [newArrivalsVisible, setNewArrivalsVisible] = useState(4);
  const [popularVisible, setPopularVisible] = useState(4);
  const [sweetDealsVisible, setSweetDealsVisible] = useState(4);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setCurrentSlide((p) => (p + 1) % bannerCards.length),
      5000,
    );
    return () => clearInterval(id);
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="bg-white pt-4 pb-6 sm:py-8">
        <div className="container mx-auto px-3 sm:px-4">
          <p className="text-gray-600 text-center text-xs sm:text-sm mb-5 font-medium">
            Your Trusted Tech Partner, Built for{" "}
            <span className="bg-[#6426E1]/10 text-[#6426E1] px-1.5 py-0.5 rounded-sm font-bold">
              You
            </span>
            , Backed by Trust.
          </p>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl shadow-lg">
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {bannerCards.map((card) => (
                  <div key={card.id} className="w-full flex-shrink-0 px-1.5">
                    <div className="relative h-[160px] sm:h-[240px] md:h-[300px] rounded-2xl overflow-hidden">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() =>
                setCurrentSlide((p) =>
                  p === 0 ? bannerCards.length - 1 : p - 1,
                )
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white border border-gray-200"
            >
              <ChevronLeft className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={() =>
                setCurrentSlide((p) =>
                  p === bannerCards.length - 1 ? 0 : p + 1,
                )
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white border border-gray-200"
            >
              <ChevronRight className="w-4 h-4 text-gray-700" />
            </button>
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {bannerCards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`transition-all rounded-full ${currentSlide === i ? "w-5 h-1.5 bg-[#6426E1]" : "w-1.5 h-1.5 bg-gray-300"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky search/filter bar */}
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

      {/* Mobile Filter Drawer */}
      <div
        className={`fixed inset-0 z-[60] sm:hidden transition-all duration-300 ${showMobileFilter ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowMobileFilter(false)}
        />
        <div
          className={`absolute inset-y-0 right-0 w-[85vw] max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${showMobileFilter ? "translate-x-0" : "translate-x-full"}`}
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

      {/* Product Sections */}
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

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-[#6426E1] animate-spin" />
          </div>
        ) : (
          <>
            <SectionBlock
              title="New Arrivals"
              id="new-arrivals"
              sectionRef={newArrivalsRef}
              list={newArrivals}
              visible={newArrivalsVisible}
              viewMode={viewMode}
              setVisible={setNewArrivalsVisible}
              resetFilters={resetFilters}
            />
            <SectionBlock
              title="Popular Products"
              id="popular"
              sectionRef={{ current: null }}
              list={popularProducts}
              visible={popularVisible}
              viewMode={viewMode}
              setVisible={setPopularVisible}
              resetFilters={resetFilters}
            />
            <SectionBlock
              title="Sweet Deals"
              id="sweet-deals"
              sectionRef={sweetDealsRef}
              list={sweetDeals}
              visible={sweetDealsVisible}
              viewMode={viewMode}
              setVisible={setSweetDealsVisible}
              resetFilters={resetFilters}
            />
          </>
        )}

        {/* CTA */}
        <div className="text-center py-10 sm:py-16 bg-[#6426E1]/5 rounded-2xl border border-[#6426E1]/10 mt-4">
          <div className="max-w-md mx-auto px-4">
            <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Need Advanced Filters?
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">
              Visit our categories page for detailed specs, advanced filtering
              and more!
            </p>
            <Link to="/categories">
              <Button className="bg-[#6426E1] hover:bg-[#5420c4] text-white py-5 sm:py-7 px-8 sm:px-12 rounded-xl text-base sm:text-lg font-semibold shadow-lg w-full sm:w-auto">
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
