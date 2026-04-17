import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Heart, ChevronDown, ShoppingCart, Star, Grid, List,
  X, Check, Filter, Search,
  Camera, Monitor, Smartphone, Package, RefreshCw,
  Tag, DollarSign, HardDrive, Layers, Tablet,
  Headphones, Watch, Gamepad, Speaker as SpeakerIcon,
  CheckCircle, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { productService, formatPrice, type Product, type GetProductsParams, type SortBy } from "@/services/Products.service";
import { getTypeIcon, getTypeColor, getTwoSpecs } from "@/utils/productUtils";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

const LIMIT = 30;

// ── Static filter option lists ────────────────────────────────────────────────

const productTypes = [
  { value: "all",         label: "All Types",        icon: Layers      },
  { value: "smartphone",  label: "Smartphones",      icon: Smartphone  },
  { value: "laptop",      label: "Laptops",          icon: Monitor     },
  { value: "tablet",      label: "Tablets",          icon: Tablet      },
  { value: "earbuds",     label: "Wireless Earbuds", icon: Headphones  },
  { value: "headphones",  label: "Headphones",       icon: Headphones  },
  { value: "smartwatch",  label: "Smart Watches",    icon: Watch       },
  { value: "gaming",      label: "Gaming Consoles",  icon: Gamepad     },
  { value: "speaker",     label: "Smart Speakers",   icon: SpeakerIcon },
  { value: "camera",      label: "Cameras",          icon: Camera      },
];

const priceRanges = [
  { value: "all",       label: "All Prices",            icon: DollarSign, min: 0,       max: 0       },
  { value: "under_100", label: "Under ₦100,000",        icon: DollarSign, min: 0,       max: 100000  },
  { value: "100_300",   label: "₦100,000 – ₦300,000",   icon: DollarSign, min: 100000,  max: 300000  },
  { value: "300_600",   label: "₦300,000 – ₦600,000",   icon: DollarSign, min: 300000,  max: 600000  },
  { value: "600_1000",  label: "₦600,000 – ₦1,000,000", icon: DollarSign, min: 600000,  max: 1000000 },
  { value: "over_1000", label: "Over ₦1,000,000",       icon: DollarSign, min: 1000000, max: 5000000 },
];

const storageOptions = [
  { value: "all",   label: "All Storage", icon: HardDrive },
  { value: "64GB",  label: "64GB",        icon: HardDrive },
  { value: "128GB", label: "128GB",       icon: HardDrive },
  { value: "256GB", label: "256GB",       icon: HardDrive },
  { value: "512GB", label: "512GB",       icon: HardDrive },
  { value: "1TB",   label: "1TB",         icon: HardDrive },
];

const conditionOptions = [
  { value: "all",         label: "All Conditions", icon: Package   },
  { value: "Brand New",   label: "Brand New",      icon: Package   },
  { value: "Refurbished", label: "Refurbished",    icon: RefreshCw },
  { value: "UK Used",     label: "UK Used",        icon: RefreshCw },
  { value: "Open Box",    label: "Open Box",       icon: Package   },
  { value: "Fairly Used", label: "Fairly Used",    icon: Package   },
];

const sortOptions: { value: SortBy; label: string }[] = [
  { value: "featured",     label: "Featured"            },
  { value: "price_low",    label: "Price: Low to High"  },
  { value: "price_high",   label: "Price: High to Low"  },
  { value: "newest",       label: "Newest First"        },
  { value: "best_rating",  label: "Best Rating"         },
  { value: "most_popular", label: "Most Popular"        },
];

// ── Filter Section (sidebar) ──────────────────────────────────────────────────
const FilterSection = ({
  title, value, options, expanded, onToggle, onSelect,
}: {
  title: string;
  value: string;
  options: { value: string; label: string; icon?: any }[];
  expanded: boolean;
  onToggle: () => void;
  onSelect: (v: string) => void;
}) => (
  <div className="border-b border-gray-200 last:border-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-4 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
    >
      <div className="flex items-center gap-2">
        <span>{title}</span>
        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
          {options.length}
        </span>
      </div>
      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? "rotate-180" : ""}`} />
    </button>

    {expanded && (
      <div className="pb-4 space-y-2">
        {options.map((opt) => {
          const Icon      = opt.icon;
          const isChecked = value === opt.value;
          return (
            <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input type="radio" checked={isChecked} onChange={() => onSelect(opt.value)} className="sr-only peer" />
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex items-center justify-center peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all duration-200">
                  {isChecked && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-1">
                {Icon && <Icon className="w-4 h-4 text-gray-400" />}
                <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">{opt.label}</span>
              </div>
              {isChecked && <Check className="w-4 h-4 text-blue-600" />}
            </label>
          );
        })}
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const Categories = () => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart }                   = useCart();
  const { toast }                       = useToast();

  // ── Filter state ───────────────────────────────────────────────────────────
  const [productType, setProductType] = useState("all");
  const [brand,       setBrand]       = useState("all");
  const [priceRange,  setPriceRange]  = useState("all");
  const [storage,     setStorage]     = useState("all");
  const [condition,   setCondition]   = useState("all");
  const [sortBy,      setSortBy]      = useState<SortBy>("featured");
  const [searchQuery, setSearchQuery] = useState("");

  // ── Brand options derived from fetched data ────────────────────────────────
  const [allBrands, setAllBrands] = useState<string[]>([]);

  // ── Products state ─────────────────────────────────────────────────────────
  const [products,      setProducts]      = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page,          setPage]          = useState(1);
  const [totalPages,    setTotalPages]    = useState(1);
  const [isLoading,     setIsLoading]     = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [viewMode,          setViewMode]          = useState<"grid" | "list">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedFilters,   setExpandedFilters]   = useState({
    brand: true, price: true, storage: false, productType: true, condition: true,
  });

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Build API params from filter state ─────────────────────────────────────
  const buildParams = useCallback((overridePage = 1): GetProductsParams => {
    const priceOpt = priceRanges.find((r) => r.value === priceRange);
    return {
      page:        overridePage,
      limit:       LIMIT,
      sortBy,
      search:      searchQuery || undefined,
      productType: productType !== "all" ? productType : undefined,
      brand:       brand       !== "all" ? brand       : undefined,
      condition:   condition   !== "all" ? condition   : undefined,
      storage:     storage     !== "all" ? storage     : undefined,
      minPrice:    priceOpt && priceOpt.value !== "all" ? priceOpt.min : undefined,
      maxPrice:    priceOpt && priceOpt.value !== "all" ? priceOpt.max : undefined,
    };
  }, [productType, brand, priceRange, storage, condition, sortBy, searchQuery]);

  // ── Initial / filter-change fetch ─────────────────────────────────────────
  const fetchPage1 = useCallback(async () => {
    setIsLoading(true);
    try {
      const res       = await productService.getAll(buildParams(1));
      const items     = res?.products      ?? [];
      const total     = res?.totalProducts ?? 0;
      const pages     = res?.pages         ?? 1;

      setProducts(items);
      setTotalProducts(total);
      setTotalPages(pages);
      setPage(1);

      const brands = [...new Set(items.map((p) => p.brand))].sort();
      setAllBrands(brands);
    } catch {
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(1);
      setAllBrands([]);
    } finally {
      setIsLoading(false);
    }
  }, [buildParams]);

  useEffect(() => { fetchPage1(); }, [fetchPage1]);

  // ── Load More ──────────────────────────────────────────────────────────────
  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setIsLoadingMore(true);
    try {
      const res   = await productService.getAll(buildParams(nextPage));
      const items = res?.products ?? [];

      setProducts((prev) => [...prev, ...items]);
      setPage(nextPage);

      const moreBrands = items.map((p) => p.brand);
      setAllBrands((prev) => [...new Set([...prev, ...moreBrands])].sort());
    } catch {
      // silently keep existing list
    } finally {
      setIsLoadingMore(false);
    }
  };

  // ── Search debounce ────────────────────────────────────────────────────────
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchPage1(), 400);
  };

  // ── Filter helpers ─────────────────────────────────────────────────────────
  const handleFilterSelect = <T extends string>(setter: (v: T) => void) => (v: T) => {
    setter(v);
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

  const activeFiltersCount = [productType, brand, priceRange, storage, condition]
    .filter((v) => v !== "all").length;

  const toggleFilterSection = (key: keyof typeof expandedFilters) =>
    setExpandedFilters((prev) => ({ ...prev, [key]: !prev[key] }));

  const brandOptions = [
    { value: "all", label: "All Brands", icon: Layers },
    ...allBrands.map((b) => ({ value: b, label: b, icon: Layers })),
  ];

  // ── Add to cart ────────────────────────────────────────────────────────────
  const handleAddToCart = (product: Product) => {
    const firstVariant =
      product.variants?.find((v) => v.is_active && v.stock > 0) ??
      product.variants?.[0];

    if (!firstVariant) {
      toast({ title: "Error", description: "No variants available for this product" });
      return;
    }

    addToCart({
      id:        product.id,
      variantId: firstVariant.id,
      name:      product.name,
      price:     firstVariant.price,
      image:     product.image,
      quantity:  1,
      storage:   firstVariant.storage ?? undefined,
      color:     firstVariant.color,
      sku:       firstVariant.sku,
    });

    toast({
      title:       "Added to cart",
      description: `${product.name} (${firstVariant.storage ?? firstVariant.color ?? "default"}) added`,
    });
  };

  // ── Filter sidebar JSX ─────────────────────────────────────────────────────
  const filterSidebar = (
    <div className="space-y-1">
      <FilterSection title="Product Type" value={productType} options={productTypes}
        expanded={expandedFilters.productType} onToggle={() => toggleFilterSection("productType")}
        onSelect={handleFilterSelect(setProductType)} />
      <FilterSection title="Brands" value={brand} options={brandOptions}
        expanded={expandedFilters.brand} onToggle={() => toggleFilterSection("brand")}
        onSelect={handleFilterSelect(setBrand)} />
      <FilterSection title="Price Range" value={priceRange} options={priceRanges}
        expanded={expandedFilters.price} onToggle={() => toggleFilterSection("price")}
        onSelect={handleFilterSelect(setPriceRange)} />
      {productType === "smartphone" && (
        <FilterSection title="Storage" value={storage} options={storageOptions}
          expanded={expandedFilters.storage} onToggle={() => toggleFilterSection("storage")}
          onSelect={handleFilterSelect(setStorage)} />
      )}
      <FilterSection title="Condition" value={condition} options={conditionOptions}
        expanded={expandedFilters.condition} onToggle={() => toggleFilterSection("condition")}
        onSelect={handleFilterSelect(setCondition)} />
    </div>
  );

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
        <Link to={`/products/${product.slug}`} className="block">
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
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
              className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 border border-gray-200 z-10"
            >
              <Heart className={`w-5 h-5 ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </button>
          </div>
        </Link>

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

          <Link to={`/products/${product.slug}`}>
            <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 h-12 hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
          </Link>

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

          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={!product.inStock}
              onClick={(e) => { e.preventDefault(); if (product.inStock) handleAddToCart(product); }}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.inStock ? "Add to Cart" : "Out of Stock"}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/products/${product.slug}`}>Details</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // ── List Item ──────────────────────────────────────────────────────────────
  const ProductListItem = ({ product }: { product: Product }) => {
    const TypeIcon  = getTypeIcon(product.type);
    const typeColor = getTypeColor(product.type);
    const specs     = getTwoSpecs(product);

    return (
      <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 p-6 transition-all">
        <div className="flex items-start gap-6">
          <Link
            to={`/products/${product.slug}`}
            className="w-32 h-32 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <img src={product.image} alt={product.name} className="w-24 h-24 object-contain" />
          </Link>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${typeColor}`}>
                    <TypeIcon className="w-3 h-3" />
                    <span>{product.type?.charAt(0).toUpperCase()}{product.type?.slice(1)}</span>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                    {product.brand}
                  </span>
                  {product.section === "New Arrivals" && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">NEW</span>
                  )}
                </div>
                <Link to={`/products/${product.slug}`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  {specs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <spec.icon className="w-4 h-4" />
                      <span>{spec.value}</span>
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
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleAddToCart(product)}>
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">

      {/* Hero */}
 {/* <div className="border-b border-slate-200 bg-white">
  <div className="container mx-auto px-4 py-12 md:py-16">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
    
      <div className="max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 tracking-tight mb-4">
          The Future, <br />
          <span className="inline-block border-b-4 border-blue-500 pb-1">In Stock.</span>
        </h1>
        <p className="text-slate-600 text-lg leading-relaxed max-w-xl mt-6 font-sans">
          Browse our full collection of premium tech — every product, every category, every condition.
        </p>
        <div className="mt-8">
          <p className="text-xs text-slate-400 inline-flex items-center gap-1.5 bg-white shadow-sm rounded-full px-3 py-1 border border-slate-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            {totalProducts} products available — updated weekly
          </p>
        </div>
      </div>

      
      <div className="grid grid-cols-2 gap-4">
       
        <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 group">
          <img
            src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt="Modern tech workspace"
            className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      
        <div className="flex flex-col gap-4">
          <div className="aspect-[16/9] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 group">
            <img
              src="https://images.pexels.com/photos/205316/pexels-photo-205316.png?auto=compress&cs=tinysrgb&w=600"
              alt="Smartphone"
              className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="aspect-[16/9] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 group">
            <img
              src="https://images.pexels.com/photos/3945659/pexels-photo-3945659.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Headphones"
              className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</div> */}
      {/* Main */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Mobile filter toggle */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">
                Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </span>
            </button>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {(["grid", "list"] as const).map((mode) => (
                  <button key={mode} onClick={() => setViewMode(mode)}
                    className={`p-2 rounded transition-colors ${viewMode === mode ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
                    {mode === "grid" ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                  </button>
                ))}
              </div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-1/4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear all
                  </button>
                )}
              </div>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search gadgets..."
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
              </div>
              {filterSidebar}
              {activeFiltersCount > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button onClick={clearFilters} variant="outline" className="w-full">Clear All Filters</Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Sidebar */}
          {showMobileFilters && (
            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
              <div className="absolute inset-y-0 left-0 w-80 bg-white overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                    <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {filterSidebar}
                </div>
              </div>
            </div>
          )}

          {/* Products area */}
          <div className="lg:w-3/4">
            {/* Desktop toolbar */}
            <div className="hidden lg:flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isLoading ? "Loading…" : `${totalProducts} Products Found`}
                </h2>
                {activeFiltersCount > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""} applied
                  </p>
                )}
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">View:</span>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    {(["grid", "list"] as const).map((mode) => (
                      <button key={mode} onClick={() => setViewMode(mode)}
                        className={`p-2 rounded transition-colors ${viewMode === mode ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
                        {mode === "grid" ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <div className="relative">
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}
                      className="appearance-none text-sm border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px] bg-white">
                      {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Active filter pills */}
            {activeFiltersCount > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {[
                  { key: "productType", val: productType, label: productTypes.find((t) => t.value === productType)?.label, reset: () => setProductType("all") },
                  { key: "brand",       val: brand,       label: brand,       reset: () => setBrand("all")      },
                  { key: "priceRange",  val: priceRange,  label: priceRanges.find((r) => r.value === priceRange)?.label, reset: () => setPriceRange("all") },
                  { key: "storage",     val: storage,     label: storage,     reset: () => setStorage("all")    },
                  { key: "condition",   val: condition,   label: condition,   reset: () => setCondition("all")  },
                ]
                  .filter(({ val }) => val !== "all")
                  .map(({ key, label, reset }) => (
                    <div key={key} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                      <span>{label}</span>
                      <button onClick={reset}><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                <button onClick={clearFilters} className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                  Clear all
                </button>
              </div>
            )}

            {/* Content */}
            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : products.length > 0 ? (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((p) => <ProductCard key={p.id} product={p} />)}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.map((p) => <ProductListItem key={p.id} product={p} />)}
                  </div>
                )}

                <div className="mt-10 flex flex-col items-center gap-3">
                  <p className="text-sm text-gray-500">
                    Showing <span className="font-semibold text-gray-800">{products.length}</span> of{" "}
                    <span className="font-semibold text-gray-800">{totalProducts}</span> products
                  </p>
                  {page < totalPages && (
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="w-full max-w-2xl py-3.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:shadow-md transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isLoadingMore
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading…</>
                        : "Load more"}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">No products found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">Try adjusting your filters or search terms.</p>
                <Button onClick={clearFilters} className="bg-blue-600 hover:bg-blue-700 text-white">
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