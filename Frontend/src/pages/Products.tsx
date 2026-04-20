import { useState, useEffect, useRef } from "react";
import graphicsGaming      from "@/assets/graphics-gaming.png";
import graphicsHeadphones  from "@/assets/graphics-headphones.png";
import graphicsLaptops     from "@/assets/graphics-laptops.png";
import graphicsSmartphones from "@/assets/graphics-smartphones.png";
import graphicsTablets     from "@/assets/graphics-tablets.png";
import graphicsWatches     from "@/assets/graphics-watches.png";
import { Link, useLocation } from "react-router-dom";
import {
  Heart, Filter, ShoppingCart, Star, Grid, List,
  X, ChevronLeft, ChevronRight, CheckCircle,
  ChevronUp, ChevronDown as ChevronDownIcon, Search, Loader2, ArrowRight, SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  productService, formatPrice, type Product,
} from "@/services/Products.service";
import { getTypeIcon, getTypeColor, getTwoSpecs } from "@/utils/productUtils";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

const bannerCards = [
  { id: 1, image: graphicsGaming,      title: "Get Your Favourite Gadget Fast, Easy, and Verified." },
  { id: 2, image: graphicsHeadphones,  title: "Join Thousands of Smart Shoppers."                   },
  { id: 3, image: graphicsLaptops,     title: "Premium Quality at Unbeatable Prices"                },
  { id: 4, image: graphicsSmartphones, title: "24/7 Customer Support Always Here"                   },
  { id: 5, image: graphicsTablets,     title: "Fast & Secure Delivery Nationwide"                   },
  { id: 6, image: graphicsWatches,     title: "30-Day Money Back Guarantee"                         },
];

const Products = () => {
  const location = useLocation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart }                   = useCart();
  const { toast }                       = useToast();

  const [newArrivalsAll,     setNewArrivalsAll]     = useState<Product[]>([]);
  const [popularProductsAll, setPopularProductsAll] = useState<Product[]>([]);
  const [sweetDealsAll,      setSweetDealsAll]      = useState<Product[]>([]);
  const [isLoading,          setIsLoading]          = useState(true);

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

  const [viewMode,          setViewMode]          = useState<"grid" | "list">("grid");
  const [searchQuery,       setSearchQuery]       = useState("");
  const [selectedBrand,     setSelectedBrand]     = useState("All");
  const [selectedCategory,  setSelectedCategory]  = useState("All");
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [priceRange,        setPriceRange]        = useState<[number, number]>([0, 2_000_000]);
  const [showFilters,       setShowFilters]       = useState(false);
  const [showMobileFilter,  setShowMobileFilter]  = useState(false);

  const [newArrivalsVisible, setNewArrivalsVisible] = useState(4);
  const [popularVisible,     setPopularVisible]     = useState(4);
  const [sweetDealsVisible,  setSweetDealsVisible]  = useState(4);

  // Mobile: show 4, Desktop: show 4 initially
  const [currentSlide, setCurrentSlide] = useState(0);

  // Responsive: 1 card/slide mobile, 2 cards/slide desktop
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const CARDS_PER_SLIDE = isMobile ? 1 : 2;
  const TOTAL_SLIDES    = Math.ceil(bannerCards.length / CARDS_PER_SLIDE);

  useEffect(() => {
    const id = setInterval(() => setCurrentSlide((p) => (p + 1) % TOTAL_SLIDES), 5000);
    return () => clearInterval(id);
  }, [TOTAL_SLIDES]);

  const newArrivalsRef = useRef<HTMLDivElement>(null);
  const sweetDealsRef  = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!location.hash) return;
    const tryScroll = () => {
      if (location.hash === "#new-arrivals" && newArrivalsRef.current) {
        newArrivalsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        return true;
      }
      if (location.hash === "#sweet-deals" && sweetDealsRef.current) {
        sweetDealsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        return true;
      }
      return false;
    };
    if (!tryScroll()) {
      const t = setTimeout(tryScroll, 300);
      return () => clearTimeout(t);
    }
  }, [location.hash]);

  const allLoaded  = [...newArrivalsAll, ...popularProductsAll, ...sweetDealsAll];
  const brands     = ["All", ...new Set(allLoaded.map((p) => p.brand))];
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
        (selectedBrand     === "All" || p.brand     === selectedBrand) &&
        (selectedCategory  === "All" || p.category  === selectedCategory) &&
        (selectedCondition === "All" || p.condition === selectedCondition) &&
        p.price >= priceRange[0] && p.price <= priceRange[1]
      );
    });

  const newArrivals     = filterProducts(newArrivalsAll);
  const popularProducts = filterProducts(popularProductsAll);
  const sweetDeals      = filterProducts(sweetDealsAll);

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

  const handleAddToCart = (product: Product) => {
    const variant = product.variants?.[0];
    addToCart({
      id:        product.id,
      variantId: variant._id,
      name:      product.name,
      price:     product.price,
      image:     product.image,
      quantity:  1,
      storage:   product.storage ?? undefined,
    });
    toast({ title: "Added to cart", description: `${product.name} has been added to your cart.` });
  };

  // ── Filter Panel Content (shared between mobile drawer and desktop) ────────
  const FilterPanel = () => (
    <div className="space-y-5">
      {[
        { label: "Brand",     value: selectedBrand,     onChange: setSelectedBrand,     options: brands     },
        { label: "Category",  value: selectedCategory,  onChange: setSelectedCategory,  options: categories },
        { label: "Condition", value: selectedCondition, onChange: setSelectedCondition, options: conditions },
      ].map(({ label, value, onChange, options }) => (
        <div key={label}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
          <select
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
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
              className="w-full accent-blue-600"
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

  // ── Product Card ───────────────────────────────────────────────────────────
  const ProductCard = ({ product }: { product: Product }) => {
    const inWishlist   = isInWishlist(product.id);
    const TypeIcon     = getTypeIcon(product.type);
    const typeColor    = getTypeColor(product.type);
    const specs        = getTwoSpecs(product);
    const isOutOfStock = !product.inStock;

    return (
      <div className="group relative bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-contain p-4 transition-opacity duration-500 ${
              !isOutOfStock ? "group-hover:opacity-0" : ""
            }`}
          />
          {product.image2 && !isOutOfStock && (
            <img
              src={product.image2}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-contain p-4 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
            />
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {product.type && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${typeColor}`}>
                <TypeIcon className="w-3 h-3" />
                <span className="hidden sm:inline">{product.type.charAt(0).toUpperCase() + product.type.slice(1)}</span>
              </div>
            )}
            {product.condition === "UK Used"     && <span className="bg-amber-500  text-white px-2 py-0.5 rounded-full text-xs font-bold">UK USED</span>}
            {product.condition === "Open Box"    && <span className="bg-purple-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">OPEN BOX</span>}
            {product.condition === "Refurbished" && <span className="bg-green-500  text-white px-2 py-0.5 rounded-full text-xs font-bold">REFURB</span>}
            {product.section   === "New Arrivals"&& <span className="bg-red-500    text-white px-2 py-0.5 rounded-full text-xs font-bold">NEW</span>}
            {isOutOfStock && (
              <span className="bg-gray-700 text-white px-2 py-0.5 rounded-full text-xs font-bold">SOLD OUT</span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
            className="absolute top-2 right-2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all border border-gray-200 z-10"
          >
            <Heart className={`w-4 h-4 ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
          </button>

          {/* Desktop hover overlay */}
          {!isOutOfStock && (
            <div className="hidden sm:flex absolute inset-0 bg-black/60 backdrop-blur-sm items-center justify-center z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
              <div className="flex flex-col gap-2">
                <Button
                  className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold text-sm"
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" /> Quick Add
                </Button>
                <Link
                  to={`/products/${product.slug}`}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold text-sm text-center"
                >
                  View Details
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Card content */}
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColor}`}>{product.brand}</span>
            {product.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-gray-900">{product.rating}</span>
              </div>
            )}
          </div>
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm leading-snug">{product.name}</h3>
          
          {/* Specs - hide on very small screens */}
          <div className="hidden sm:block space-y-1 mb-3">
            {specs.slice(0, 1).map((spec, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                <spec.icon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <span className="truncate">{spec.value}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="text-base sm:text-lg font-bold text-blue-600">{formatPrice(product.price)}</div>
            {product.condition && (
              <div className="text-xs text-gray-500 hidden sm:block">
                <span className="font-medium text-gray-600">{product.condition}</span>
              </div>
            )}
          </div>

          {/* Mobile CTA button */}
          {!isOutOfStock ? (
            <button
              onClick={() => handleAddToCart(product)}
              className="sm:hidden mt-2 w-full py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
            </button>
          ) : (
            <Link
              to={`/products/${product.slug}`}
              className="sm:hidden mt-2 block w-full py-2 border border-gray-300 text-gray-600 text-xs font-semibold rounded-xl text-center"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    );
  };

  // ── List Item ──────────────────────────────────────────────────────────────
  const ProductListItem = ({ product }: { product: Product }) => {
    const inWishlist   = isInWishlist(product.id);
    const TypeIcon     = getTypeIcon(product.type);
    const typeColor    = getTypeColor(product.type);
    const specs        = getTwoSpecs(product);
    const isOutOfStock = !product.inStock;

    return (
      <div className="group bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all p-4 sm:p-5">
        <div className="flex items-start gap-3 sm:gap-5">
          <div className="relative w-20 h-20 sm:w-28 sm:h-28 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <img src={product.image} alt={product.name} className="w-14 h-14 sm:w-20 sm:h-20 object-contain" />
            <button
              onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
              className="absolute top-1 right-1 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-md border border-gray-200"
            >
              <Heart className={`w-3.5 h-3.5 ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </button>
            {isOutOfStock && (
              <span className="absolute bottom-1 left-1 bg-gray-700 text-white px-1.5 py-0.5 rounded text-xs font-bold">SOLD OUT</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${typeColor}`}>
                    <TypeIcon className="w-3 h-3" />
                    <span>{product.type?.charAt(0).toUpperCase()}{product.type?.slice(1)}</span>
                  </div>
                  {product.section === "New Arrivals" && (
                    <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">NEW</span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2 leading-snug">{product.name}</h3>
                <div className="text-xs text-gray-500 mt-0.5">{product.brand}</div>
                
                <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500 mt-2">
                  {specs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <spec.icon className="w-3 h-3" /><span>{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-base sm:text-xl font-bold text-gray-900">{formatPrice(product.price)}</div>
                {product.rating > 0 && (
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-gray-900">{product.rating}</span>
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-1">{product.condition}</div>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-xs h-8 sm:h-9"
                disabled={isOutOfStock}
                onClick={() => { if (!isOutOfStock) handleAddToCart(product); }}
              >
                <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-8 sm:h-9" asChild>
                <Link to={`/products/${product.slug}`}>Details</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EmptyState = ({ onReset }: { onReset?: () => void }) => (
    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-200">
      <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500 font-medium">No products match your filters</p>
      {onReset && (
        <Button variant="ghost" onClick={onReset} className="mt-3 text-blue-600">
          Reset filters
        </Button>
      )}
    </div>
  );

  const SectionBlock = ({
    title, id, sectionRef, list, visible, setVisible,
  }: {
    title: string;
    id: string;
    sectionRef: React.RefObject<HTMLDivElement>;
    list: Product[];
    visible: number;
    setVisible: React.Dispatch<React.SetStateAction<number>>;
  }) => (
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
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs sm:text-sm"
            onClick={() => setVisible((p) => (p >= list.length ? 4 : list.length))}
          >
            {visible >= list.length ? "View Less" : "View More"}
            {visible >= list.length
              ? <ChevronUp className="w-3.5 h-3.5 ml-1" />
              : <ChevronDownIcon className="w-3.5 h-3.5 ml-1" />}
          </Button>
        )}
      </div>
      {list.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {list.slice(0, visible).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="space-y-3">
            {list.slice(0, visible).map((p) => <ProductListItem key={p.id} product={p} />)}
          </div>
        )
      ) : (
        <EmptyState onReset={resetFilters} />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="bg-white pt-4 pb-5 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4">
          <p className="text-gray-600 text-center text-xs sm:text-sm mb-4 font-medium">
            Your Trusted Tech Partner, Built for{" "}
            <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-sm font-bold">You</span>
            , Backed by Trust.
          </p>
          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentSlide * (100 / bannerCards.length) * CARDS_PER_SLIDE}%)`,
                  width: `${(bannerCards.length / CARDS_PER_SLIDE) * 100}%`,
                }}
              >
                {bannerCards.map((card) => (
                  <div key={card.id} className="px-1.5" style={{ width: `${100 / bannerCards.length}%` }}>
                    <div className="relative rounded-xl overflow-hidden h-[120px] sm:h-[150px] md:h-[160px] group hover:shadow-xl transition-all">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setCurrentSlide((p) => (p - 1 + TOTAL_SLIDES) % TOTAL_SLIDES)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-3 w-8 h-8 sm:w-9 sm:h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white border border-gray-300 z-20"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-gray-700" />
            </button>
            <button
              onClick={() => setCurrentSlide((p) => (p + 1) % TOTAL_SLIDES)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-3 w-8 h-8 sm:w-9 sm:h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white border border-gray-300 z-20"
            >
              <ChevronRight className="w-3.5 h-3.5 text-gray-700" />
            </button>
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`rounded-full transition-all ${currentSlide === i ? "w-5 h-2 bg-blue-600" : "w-2 h-2 bg-gray-300"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Filter/Search Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search gadgets..."
                className="w-full pl-9 pr-8 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
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

            {/* Filter button (mobile & desktop) */}
            <button
              onClick={() => setShowMobileFilter(true)}
              className="relative flex items-center gap-1.5 px-3 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors sm:hidden"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Desktop filter toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="hidden sm:flex items-center gap-2 text-sm rounded-xl relative"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? "Hide Filters" : "Filters"}
              {activeFiltersCount > 0 && (
                <span className="bg-blue-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {/* View mode */}
            <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {(["grid", "list"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === mode ? "bg-white shadow-sm text-blue-600" : "text-gray-500"}`}
                >
                  {mode === "grid" ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop expanded filters */}
          {showFilters && (
            <div className="hidden sm:block mt-3 pt-3 border-t border-gray-100">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Brand",     value: selectedBrand,     onChange: setSelectedBrand,     options: brands     },
                  { label: "Category",  value: selectedCategory,  onChange: setSelectedCategory,  options: categories },
                  { label: "Condition", value: selectedCondition, onChange: setSelectedCondition, options: conditions },
                ].map(({ label, value, onChange, options }) => (
                  <div key={label}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                    <select
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                    >
                      {options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Price: {formatPrice(priceRange[0])} – {formatPrice(priceRange[1])}
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
                        className="w-full accent-blue-600"
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
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileFilter(false)}
          />
          <div className="absolute inset-y-0 right-0 w-[85vw] max-w-sm bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Filters</h3>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterPanel />
            </div>
            <div className="p-4 border-t border-gray-100">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-semibold"
                onClick={() => setShowMobileFilter(false)}
              >
                Show Results ({newArrivals.length + popularProducts.length + sweetDeals.length})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Product Sections */}
      <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-8">
        {/* Stats & View Toggle Bar */}
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <p className="text-xs sm:text-sm text-gray-600">
            {isLoading ? "Loading…" : (
              <><span className="font-bold text-gray-900">{newArrivals.length + popularProducts.length + sweetDeals.length}</span> gadgets</>
            )}
          </p>
          <div className="flex items-center gap-2">
            {/* Mobile view toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 sm:hidden">
              {(["grid", "list"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === mode ? "bg-white shadow-sm text-blue-600" : "text-gray-500"}`}
                >
                  {mode === "grid" ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
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
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <>
            <SectionBlock
              title="New Arrivals" id="new-arrivals" sectionRef={newArrivalsRef}
              list={newArrivals} visible={newArrivalsVisible} setVisible={setNewArrivalsVisible}
            />
            <SectionBlock
              title="Popular Products" id="popular" sectionRef={{ current: null }}
              list={popularProducts} visible={popularVisible} setVisible={setPopularVisible}
            />
            <SectionBlock
              title="Sweet Deals" id="sweet-deals" sectionRef={sweetDealsRef}
              list={sweetDeals} visible={sweetDealsVisible} setVisible={setSweetDealsVisible}
            />
          </>
        )}

        {/* CTA Banner */}
        <div className="text-center py-10 sm:py-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 mt-4">
          <div className="max-w-md mx-auto px-4">
            <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Need Advanced Filters?</h2>
            <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">
              Visit our categories page for detailed specs, advanced filtering and more!
            </p>
            <Link to="/categories">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-5 sm:py-7 px-8 sm:px-12 rounded-xl text-base sm:text-lg font-semibold shadow-lg w-full sm:w-auto">
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