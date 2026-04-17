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
  ChevronUp, ChevronDown as ChevronDownIcon, Search, Loader2, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  productService, formatPrice, type Product,
} from "@/services/Products.service";
import { getTypeIcon, getTypeColor, getTwoSpecs } from "@/utils/productUtils";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

// ── Banner ────────────────────────────────────────────────────────────────────
const bannerCards = [
  { id: 1, image: graphicsGaming,      title: "Get Your Favourite Gadget Fast, Easy, and Verified." },
  { id: 2, image: graphicsHeadphones,  title: "Join Thousands of Smart Shoppers."                   },
  { id: 3, image: graphicsLaptops,     title: "Premium Quality at Unbeatable Prices"                },
  { id: 4, image: graphicsSmartphones, title: "24/7 Customer Support Always Here"                   },
  { id: 5, image: graphicsTablets,     title: "Fast & Secure Delivery Nationwide"                   },
  { id: 6, image: graphicsWatches,     title: "30-Day Money Back Guarantee"                         },
];
const CARDS_PER_SLIDE = 2;
const TOTAL_SLIDES    = Math.ceil(bannerCards.length / CARDS_PER_SLIDE);

// ── Component ─────────────────────────────────────────────────────────────────
const Products = () => {
  const location = useLocation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart }                   = useCart();
  const { toast }                       = useToast();

  // ── API data ───────────────────────────────────────────────────────────────
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

  // ── Filters (client-side on fetched data) ──────────────────────────────────
  const [viewMode,          setViewMode]          = useState<"grid" | "list">("grid");
  const [searchQuery,       setSearchQuery]       = useState("");
  const [selectedBrand,     setSelectedBrand]     = useState("All");
  const [selectedCategory,  setSelectedCategory]  = useState("All");
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [priceRange,        setPriceRange]        = useState<[number, number]>([0, 2_000_000]);
  const [showFilters,       setShowFilters]       = useState(false);

  // Visible counts per section
  const [newArrivalsVisible, setNewArrivalsVisible] = useState(4);
  const [popularVisible,     setPopularVisible]     = useState(4);
  const [sweetDealsVisible,  setSweetDealsVisible]  = useState(4);

  // Banner
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCurrentSlide((p) => (p + 1) % TOTAL_SLIDES), 5000);
    return () => clearInterval(id);
  }, []);

  // Section anchor scroll
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

  // ── Derive filter option lists from all loaded products ────────────────────
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

  const isFilterActive =
    searchQuery !== "" || selectedBrand !== "All" || selectedCategory !== "All" ||
    selectedCondition !== "All" || priceRange[0] !== 0 || priceRange[1] !== 2_000_000;

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

  // ── Product Card ───────────────────────────────────────────────────────────
  const ProductCard = ({ product }: { product: Product }) => {
    const [isHovered, setIsHovered] = useState(false);
    const inWishlist = isInWishlist(product.id);
    const TypeIcon   = getTypeIcon(product.type);
    const typeColor  = getTypeColor(product.type);
    const specs      = getTwoSpecs(product);

    return (
      <div
        className="group relative bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          <img src={product.image} alt={product.name}
            className={`absolute inset-0 w-full h-full object-contain p-4 transition-all duration-500 ${isHovered ? "opacity-0" : "opacity-100"}`} />
          {product.image2 && (
            <img src={product.image2} alt={product.name}
              className={`absolute inset-0 w-full h-full object-contain p-4 transition-all duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`} />
          )}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.type && (
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${typeColor}`}>
                <TypeIcon className="w-3 h-3" />
                <span>{product.type.charAt(0).toUpperCase() + product.type.slice(1)}</span>
              </div>
            )}
            {product.condition === "UK Used"     && <span className="bg-amber-500  text-white px-3 py-1 rounded-full text-xs font-bold">UK USED</span>}
            {product.condition === "Open Box"    && <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">OPEN BOX</span>}
            {product.condition === "Refurbished" && <span className="bg-green-500  text-white px-3 py-1 rounded-full text-xs font-bold">REFURBISHED</span>}
            {product.section   === "New Arrivals"&& <span className="bg-red-500    text-white px-3 py-1 rounded-full text-xs font-bold w-fit">NEW</span>}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
            className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all border border-gray-200 z-10"
          >
            <Heart className={`w-5 h-5 ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
          </button>
          {isHovered && product.inStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-all">
              <div className="flex flex-col gap-3">
                <Button
                  className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold"
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" /> Quick Add to Cart
                </Button>
                <Link
                  to={`/products/${product.slug}`}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold text-center"
                >
                  View Details
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${typeColor}`}>{product.brand}</span>
              {product.condition === "Brand New" && <CheckCircle className="w-4 h-4 text-green-500" />}
            </div>
            {product.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-gray-900">{product.rating}</span>
                {product.reviews > 0 && <span className="text-xs text-gray-500">({product.reviews})</span>}
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
          <div className="flex items-center justify-between mb-4 pt-3 border-t border-gray-100">
            <div className="text-xl font-bold text-blue-600">{formatPrice(product.price)}</div>
            <div className="text-xs text-gray-500">
              Condition: <span className="font-medium text-gray-700">{product.condition}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── List Item ──────────────────────────────────────────────────────────────
  const ProductListItem = ({ product }: { product: Product }) => {
    const inWishlist = isInWishlist(product.id);
    const TypeIcon   = getTypeIcon(product.type);
    const typeColor  = getTypeColor(product.type);
    const specs      = getTwoSpecs(product);

    return (
      <div className="group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all p-6">
        <div className="flex items-start gap-6">
          <div className="w-32 h-32 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 relative">
            <img src={product.image} alt={product.name} className="w-24 h-24 object-contain" />
            <button
              onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
              className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md border border-gray-200"
            >
              <Heart className={`w-4 h-4 ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${typeColor}`}>
                    <TypeIcon className="w-3 h-3" />
                    <span>{product.type?.charAt(0).toUpperCase()}{product.type?.slice(1)}</span>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-700 rounded-full">{product.brand}</span>
                  {product.section === "New Arrivals" && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">NEW</span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  {specs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <spec.icon className="w-4 h-4" /><span>{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 mb-2">{formatPrice(product.price)}</div>
                {product.rating > 0 && (
                  <div className="flex items-center justify-end gap-1 mb-3">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold text-gray-900">{product.rating}</span>
                    {product.reviews > 0 && <span className="text-xs text-gray-500">({product.reviews})</span>}
                  </div>
                )}
                <div className="text-xs text-gray-500 mb-2">
                  Condition: <span className="font-medium text-gray-700">{product.condition}</span>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleAddToCart(product)}>
                    <ShoppingCart className="w-4 h-4 mr-2" />Add to Cart
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/products/${product.slug}`}>Details</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EmptyState = ({ onReset }: { onReset?: () => void }) => (
    <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
      <p className="text-gray-500">No products match your filters</p>
      {onReset && (
        <Button variant="ghost" onClick={onReset} className="mt-2 text-blue-600">
          Reset filters
        </Button>
      )}
    </div>
  );

  const SectionBlock = ({
  title,
  id,
  sectionRef,
  list,
  visible,
  setVisible,
}: {
  title: string;
  id: string;
  sectionRef: React.RefObject<HTMLDivElement>;
  list: Product[];
  visible: number;
  setVisible: React.Dispatch<React.SetStateAction<number>>;
}) => (
    <div ref={sectionRef} id={id} className="mb-12 scroll-mt-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600 mt-1">
            Showing {Math.min(visible, list.length)} of {list.length} products
          </p>
        </div>
        {list.length > 4 && (
          <Button
            variant="ghost"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => setVisible((p) => (p >= list.length ? 4 : list.length))}
          >
            {visible >= list.length ? "View Less" : `View More (${visible}/${list.length})`}
            {visible >= list.length
              ? <ChevronUp className="w-4 h-4 ml-2" />
              : <ChevronDownIcon className="w-4 h-4 ml-2" />}
          </Button>
        )}
      </div>
      {list.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {list.slice(0, visible).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="space-y-4">
            {list.slice(0, visible).map((p) => <ProductListItem key={p.id} product={p} />)}
          </div>
        )
      ) : (
        <EmptyState onReset={resetFilters} />
      )}
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Banner */}
      <div className="bg-white py-6">
        <div className="container mx-auto px-4">
          <p className="text-gray-700 text-center text-base mb-6 font-medium">
            Your Trusted Tech Partner, Built for{" "}
            <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-sm mx-0.5 font-bold">You</span>
            , Backed by Trust.
          </p>
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentSlide * (100 / bannerCards.length) * CARDS_PER_SLIDE}%)`,
                  width: `${(bannerCards.length / CARDS_PER_SLIDE) * 100}%`,
                }}
              >
                {bannerCards.map((card) => (
                  <div key={card.id} className="px-2" style={{ width: `${100 / bannerCards.length}%` }}>
                    <div className="relative rounded-2xl overflow-hidden h-[140px] md:h-[160px] group hover:shadow-2xl transition-all">
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
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white border border-gray-300 z-20"
            >
              <ChevronLeft className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={() => setCurrentSlide((p) => (p + 1) % TOTAL_SLIDES)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white border border-gray-300 z-20"
            >
              <ChevronRight className="w-4 h-4 text-gray-700" />
            </button>
            <div className="flex items-center justify-center gap-2 mt-4">
              {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`rounded-full transition-all ${currentSlide === i ? "w-6 h-2.5 bg-blue-600" : "w-2.5 h-2.5 bg-gray-300"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search gadgets by name, brand, or type..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
                <Filter className="w-4 h-4" />{showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
              <Button variant="ghost" onClick={resetFilters} className="text-gray-600">Reset</Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Brand",     value: selectedBrand,     onChange: setSelectedBrand,     options: brands     },
                  { label: "Category",  value: selectedCategory,  onChange: setSelectedCategory,  options: categories },
                  { label: "Condition", value: selectedCondition, onChange: setSelectedCondition, options: conditions },
                ].map(({ label, value, onChange, options }) => (
                  <div key={label}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                    >
                      {options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price: {formatPrice(priceRange[0])} – {formatPrice(priceRange[1])}
                  </label>
                  <div className="space-y-2">
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
                        className="w-full"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Sections */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {isLoading ? "Loading products…" : (
                <>
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {newArrivals.length + popularProducts.length + sweetDeals.length}
                  </span>{" "}
                  filtered gadgets
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              {(["grid", "list"] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className="flex items-center gap-2"
                >
                  {mode === "grid" ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <>
            <SectionBlock
              title="New Arrivals"     id="new-arrivals" sectionRef={newArrivalsRef}
              list={newArrivals}       visible={newArrivalsVisible} setVisible={setNewArrivalsVisible}
            />
            <SectionBlock
              title="Popular Products" id="popular"      sectionRef={{ current: null }}
              list={popularProducts}   visible={popularVisible}     setVisible={setPopularVisible}
            />
            <SectionBlock
              title="Sweet Deals"      id="sweet-deals"  sectionRef={sweetDealsRef}
              list={sweetDeals}        visible={sweetDealsVisible}  setVisible={setSweetDealsVisible}
            />
          </>
        )}

        {/* CTA */}
        <div className="text-center py-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Need More Specific Filters?</h2>
            <p className="text-gray-600 text-lg mb-10">
              Visit our categories page for advanced filtering options, detailed specifications, and more!
            </p>
            <Link to="/categories">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-8 px-12 rounded-xl text-xl font-semibold shadow-xl">
                Go to Categories <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;