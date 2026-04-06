// src/pages/Categories.tsx
import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart, ChevronDown, ShoppingCart, Star, Grid, List,
  X, Check, Filter, Search,
  Camera, Monitor, Smartphone,
  Package, RefreshCw,
  Tag, DollarSign, HardDrive,
  Layers, Tablet,
  Headphones, Watch, Gamepad, Speaker as SpeakerIcon,
  CheckCircle, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";


import { products, formatPrice, type Product } from "@/data/products";
import { getTypeIcon, getTypeColor, getTwoSpecs } from "@/utils/productUtils";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

// ─── Filter Options ───────────────────────────────────────────────────────────
const productTypes = [
  { value: "all", label: "All Types", icon: Layers },
  ...Array.from(new Set(products.map((p) => p.type).filter(Boolean))).map((type) => ({
    value: type!,
    label:
      type === "smartphone" ? "Smartphones"
      : type === "laptop"   ? "Laptops"
      : type === "tablet"   ? "Tablets"
      : type === "earbuds"  ? "Wireless Earbuds"
      : type === "headphones" ? "Headphones"
      : type === "smartwatch" ? "Smart Watches"
      : type === "gaming"   ? "Gaming Consoles"
      : type === "speaker"  ? "Smart Speakers"
      : type === "camera"   ? "Cameras"
      : type === "drone"    ? "Drones"
      : type === "e-reader" ? "E-Readers"
      : type!.charAt(0).toUpperCase() + type!.slice(1),
    icon:
      type === "smartphone" ? Smartphone
      : type === "laptop"   ? Monitor
      : type === "tablet"   ? Tablet
      : type === "earbuds" || type === "headphones" ? Headphones
      : type === "smartwatch" ? Watch
      : type === "gaming"   ? Gamepad
      : type === "speaker"  ? SpeakerIcon
      : type === "camera" || type === "drone" ? Camera
      : Layers,
  })),
];

const priceRanges = [
  { value: "all",       label: "All Prices",               icon: DollarSign, min: 0,       max: 0 },
  { value: "under_100", label: "Under ₦100,000",           icon: DollarSign, min: 0,       max: 100000 },
  { value: "100_300",   label: "₦100,000 - ₦300,000",      icon: DollarSign, min: 100000,  max: 300000 },
  { value: "300_600",   label: "₦300,000 - ₦600,000",      icon: DollarSign, min: 300000,  max: 600000 },
  { value: "600_1000",  label: "₦600,000 - ₦1,000,000",    icon: DollarSign, min: 600000,  max: 1000000 },
  { value: "over_1000", label: "Over ₦1,000,000",          icon: DollarSign, min: 1000000, max: 5000000 },
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
  { value: "all",          label: "All Conditions", icon: Package   },
  { value: "New",          label: "New",            icon: Package   },
  { value: "Brand New",    label: "Brand New",      icon: Package   },
  { value: "Refurbished",  label: "Refurbished",    icon: RefreshCw },
  { value: "UK Used",      label: "UK Used",        icon: RefreshCw },
  { value: "Open Box",     label: "Open Box",       icon: Package   },
];

const sortOptions = [
  { value: "featured",     label: "Featured" },
  { value: "price_low",    label: "Price: Low to High" },
  { value: "price_high",   label: "Price: High to Low" },
  { value: "newest",       label: "Newest First" },
  { value: "best_rating",  label: "Best Rating" },
  { value: "most_popular", label: "Most Popular" },
];

// ─── Component ────────────────────────────────────────────────────────────────
const Categories = () => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [selectedFilters, setSelectedFilters] = useState({
    brand: "all", priceRange: "all", storage: "all", productType: "all", condition: "all",
  });
  const [sortBy, setSortBy]             = useState("featured");
  const [viewMode, setViewMode]         = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery]   = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(30);
  const [expandedFilters, setExpandedFilters] = useState({
    brand: true, price: true, storage: false, productType: true, condition: true,
  });

  const getBrandOptions = () => {
    const { productType } = selectedFilters;
    const source = productType === "all" ? products : products.filter((p) => p.type === productType);
    const brands = Array.from(new Set(source.map((p) => p.brand)));
    return [
      { value: "all", label: "All Brands", icon: Layers },
      ...brands.map((brand) => ({ value: brand, label: brand, icon: Layers })),
    ];
  };

  const activeFiltersCount = Object.values(selectedFilters).filter((v) => v !== "all").length;

  const filteredProducts = useMemo(() => {
    // Categories shows ALL products (with or without a section)
    let results = [...products];

    if (searchQuery) {
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.type?.toLowerCase() ?? "").includes(searchQuery.toLowerCase())
      );
    }
    if (selectedFilters.productType !== "all") {
      results = results.filter((p) => p.type === selectedFilters.productType);
    }
    if (selectedFilters.brand !== "all") {
      results = results.filter((p) => p.brand === selectedFilters.brand);
    }
    if (selectedFilters.priceRange !== "all") {
      const range = priceRanges.find((r) => r.value === selectedFilters.priceRange);
      if (range) results = results.filter((p) => p.price >= range.min && p.price <= range.max);
    }
    if (selectedFilters.storage !== "all") {
      results = results.filter((p) => p.storage?.includes(selectedFilters.storage));
    }
    if (selectedFilters.condition !== "all") {
      results = results.filter((p) => p.condition === selectedFilters.condition);
    }

    switch (sortBy) {
      case "price_low":    results.sort((a, b) => a.price - b.price); break;
      case "price_high":   results.sort((a, b) => b.price - a.price); break;
      case "newest":       results.sort((a, b) => parseInt(b.id) - parseInt(a.id)); break;
      case "best_rating":  results.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
      case "most_popular": results.sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0)); break;
      default:
        results.sort((a, b) => {
          const score = (p: Product) =>
            p.section === "New Arrivals" ? 2 : (p.rating ?? 0) >= 4.5 ? 1 : 0;
          return score(b) - score(a) || (b.rating ?? 0) - (a.rating ?? 0);
        });
    }
    return results;
  }, [selectedFilters, sortBy, searchQuery]);

  const handleFilterSelect = (key: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters((prev) => ({ ...prev, [key]: value }));
    setVisibleCount(30);
  };

  const clearFilters = () => {
    setSelectedFilters({ brand: "all", priceRange: "all", storage: "all", productType: "all", condition: "all" });
    setSearchQuery("");
    setVisibleCount(30);
  };

  const toggleFilterSection = (section: keyof typeof expandedFilters) =>
    setExpandedFilters((prev) => ({ ...prev, [section]: !prev[section] }));

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      storage: product.storage ?? undefined,
    });
    toast({ title: "Added to cart", description: `${product.name} has been added to your cart.` });
  };

  // ── Filter Section ──────────────────────────────────────────────────────────
  const FilterSection = ({
    title, type, options, expanded, onToggle,
  }: {
    title: string;
    type: keyof typeof selectedFilters;
    options: { value: string; label: string; icon?: any }[];
    expanded: boolean;
    onToggle: () => void;
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
          {options.map((option) => {
            const Icon = option.icon;
            const isChecked = selectedFilters[type] === option.value;
            return (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input type="radio" checked={isChecked} onChange={() => handleFilterSelect(type, option.value)} className="sr-only peer" />
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex items-center justify-center peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all duration-200">
                    {isChecked && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  {Icon && <Icon className="w-4 h-4 text-gray-400" />}
                  <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">{option.label}</span>
                </div>
                {isChecked && <Check className="w-4 h-4 text-blue-600" />}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );

  const filterSidebar = (
    <div className="space-y-1">
      <FilterSection title="Product Type" type="productType" options={productTypes}         expanded={expandedFilters.productType} onToggle={() => toggleFilterSection("productType")} />
      <FilterSection title="Brands"       type="brand"       options={getBrandOptions()}    expanded={expandedFilters.brand}       onToggle={() => toggleFilterSection("brand")} />
      <FilterSection title="Price Range"  type="priceRange"  options={priceRanges}          expanded={expandedFilters.price}       onToggle={() => toggleFilterSection("price")} />
      {selectedFilters.productType === "smartphone" && (
        <FilterSection title="Storage"   type="storage"     options={storageOptions}        expanded={expandedFilters.storage}     onToggle={() => toggleFilterSection("storage")} />
      )}
      <FilterSection title="Condition"   type="condition"   options={conditionOptions}      expanded={expandedFilters.condition}   onToggle={() => toggleFilterSection("condition")} />
    </div>
  );

  // ── Product Card ────────────────────────────────────────────────────────────
  const ProductCard = ({ product }: { product: Product }) => {
    const [isHovered, setIsHovered] = useState(false);
    const inWishlist  = isInWishlist(product.id);
    const TypeIcon    = getTypeIcon(product.type);   // ← from productUtils
    const typeColor   = getTypeColor(product.type);  // ← from productUtils
    const specs       = getTwoSpecs(product);         // ← from productUtils

    return (
      <div
        className="group relative bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/products/${product.id}`} className="block">
          <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            <img src={product.image} alt={product.name}
              className={`absolute inset-0 w-full h-full object-contain p-4 transition-all duration-500 ${isHovered ? "opacity-0" : "opacity-100"}`} />
            {product.image2 && (
              <img src={product.image2} alt={product.name}
                className={`absolute inset-0 w-full h-full object-contain p-4 transition-all duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`} />
            )}

            {/* Badges */}
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
              {product.condition === "New" && <CheckCircle className="w-4 h-4 text-green-500" />}
            </div>
            {product.rating !== undefined && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-gray-900">{product.rating}</span>
                {product.reviews !== undefined && <span className="text-xs text-gray-500">({product.reviews})</span>}
              </div>
            )}
          </div>

          <Link to={`/products/${product.id}`}>
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
              <Link to={`/products/${product.id}`}>Details</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // ── List Item ───────────────────────────────────────────────────────────────
  const ProductListItem = ({ product }: { product: Product }) => {
    const TypeIcon  = getTypeIcon(product.type);
    const typeColor = getTypeColor(product.type);
    const specs     = getTwoSpecs(product);

    return (
      <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 p-6 transition-all">
        <div className="flex items-start gap-6">
          <Link to={`/products/${product.id}`}
            className="w-32 h-32 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity">
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
                  <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-700 rounded-full">{product.brand}</span>
                  {product.section === "New Arrivals" && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">NEW</span>
                  )}
                </div>
                <Link to={`/products/${product.id}`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">{product.name}</h3>
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
                {product.rating !== undefined && (
                  <div className="flex items-center justify-end gap-1 mb-3">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold text-gray-900">{product.rating}</span>
                    {product.reviews !== undefined && <span className="text-xs text-gray-500">({product.reviews})</span>}
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
                    <Link to={`/products/${product.id}`}>Details</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border-b border-slate-200 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
              Discover Amazing Gadgets
            </h1>
            <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Browse our full collection of premium tech — every product, every category, every condition.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: "Smartphones", icon: "📱", type: "smartphone" },
              { name: "Laptops",     icon: "💻", type: "laptop"     },
              { name: "Tablets",     icon: "🖥️", type: "tablet"     },
              { name: "Audio",       icon: "🎧", type: "earbuds"    },
              { name: "Gaming",      icon: "🎮", type: "gaming"     },
              { name: "Wearables",   icon: "⌚", type: "smartwatch" },
            ].map((cat) => (
              <button
                key={cat.type}
                onClick={() => handleFilterSelect("productType", cat.type)}
                className={`group relative px-5 py-2.5 rounded-full border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 ${
                  selectedFilters.productType === cat.type
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-slate-200 hover:border-blue-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cat.icon}</span>
                  <span className={`text-sm font-semibold transition-colors ${
                    selectedFilters.productType === cat.type ? "text-white" : "text-slate-700 group-hover:text-blue-700"
                  }`}>{cat.name}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-xs text-slate-400 inline-flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              {products.length} products available — updated weekly
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
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
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
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
                  <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear all
                  </button>
                )}
              </div>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(30); }}
                  placeholder="Search gadgets..." className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
              </div>
              {filterSidebar}
              {activeFiltersCount > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button onClick={clearFilters} variant="outline" className="w-full border-gray-300 hover:border-blue-600 hover:text-blue-600">
                    Clear All Filters
                  </Button>
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

          {/* Products Area */}
          <div className="lg:w-3/4">
            {/* Desktop toolbar */}
            <div className="hidden lg:flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{filteredProducts.length} Products Found</h2>
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
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
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
                {Object.entries(selectedFilters).map(([key, value]) => {
                  if (value === "all") return null;
                  const k = key as keyof typeof selectedFilters;
                  const allOptions = {
                    productType: productTypes, brand: getBrandOptions(),
                    priceRange: priceRanges, storage: storageOptions, condition: conditionOptions,
                  }[k] ?? [];
                  const option = allOptions.find((o) => o.value === value);
                  return option ? (
                    <div key={key} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                      <span>{option.label}</span>
                      <button onClick={() => handleFilterSelect(k, "all")}><X className="w-3 h-3" /></button>
                    </div>
                  ) : null;
                })}
                <button onClick={clearFilters} className="text-sm text-gray-600 hover:text-gray-900 font-medium">Clear all</button>
              </div>
            )}

            {/* Product grid / list */}
            {filteredProducts.length > 0 ? (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.slice(0, visibleCount).map((p) => <ProductCard key={p.id} product={p} />)}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProducts.slice(0, visibleCount).map((p) => <ProductListItem key={p.id} product={p} />)}
                  </div>
                )}

                {/* Load More */}
                <div className="mt-10 flex flex-col items-center gap-3">
                  <p className="text-sm text-gray-500">
                    Showing <span className="font-semibold text-gray-800">{Math.min(visibleCount, filteredProducts.length)}</span> of{" "}
                    <span className="font-semibold text-gray-800">{filteredProducts.length}</span> products
                  </p>
                  {visibleCount < filteredProducts.length && (
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 50)}
                      className="w-full max-w-2xl py-3.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:shadow-md transition-all duration-200"
                    >
                      Load more
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
                <Button onClick={clearFilters} className="bg-blue-600 hover:bg-blue-700 text-white">Clear All Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>

    
      
    </div>
  );
};

export default Categories;