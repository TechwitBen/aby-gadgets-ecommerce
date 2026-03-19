import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Heart, ChevronDown, ShoppingCart, Star, Grid, List,
  X, Check, Sparkles, Filter, Search,
  Cpu, Camera, Monitor, Smartphone,
  ChevronRight,
  Package, RefreshCw,
  Tag, DollarSign, HardDrive,
  Layers, Tablet,
  Headphones, Watch, Gamepad, Speaker,
  CheckCircle, BatteryCharging, Speaker as SpeakerIcon,
  Mic, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustBadges from "@/components/TrustBadges";
import { products, formatPrice, type Product } from "@/data/products";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";

// ---------- Category Definitions ----------
const categoryDefinitions = {
  smartphone: {
    title: "Smartphones",
    description: "Latest smartphones with cutting-edge technology",
    icon: Smartphone,
    color: "#3B82F6",
    bgColor: "bg-blue-600",
    textColor: "text-blue-600",
    features: ["5G Connectivity", "Advanced Cameras", "Powerful Processors"],
  },
  laptop: {
    title: "Laptops",
    description: "Powerful laptops for work and creativity",
    icon: Monitor,
    color: "#8B5CF6",
    bgColor: "bg-purple-600",
    textColor: "text-purple-600",
    features: ["High Performance", "Long Battery Life", "Premium Displays"],
  },
  tablet: {
    title: "Tablets",
    description: "Versatile tablets for entertainment and productivity",
    icon: Tablet,
    color: "#10B981",
    bgColor: "bg-green-600",
    textColor: "text-green-600",
    features: ["Portable", "Touch Screen", "Stylus Support"],
  },
  audio: {
    title: "Audio",
    description: "Premium audio devices for immersive sound",
    icon: Headphones,
    color: "#F59E0B",
    bgColor: "bg-amber-600",
    textColor: "text-amber-600",
    features: ["Noise Cancelling", "Wireless", "High Fidelity"],
  },
  gaming: {
    title: "Gaming",
    description: "High-performance gaming devices and consoles",
    icon: Gamepad,
    color: "#EF4444",
    bgColor: "bg-red-600",
    textColor: "text-red-600",
    features: ["High FPS", "4K Gaming", "Advanced Cooling"],
  },
  wearable: {
    title: "Wearables",
    description: "Smart watches and fitness trackers",
    icon: Watch,
    color: "#EC4899",
    bgColor: "bg-pink-600",
    textColor: "text-pink-600",
    features: ["Health Tracking", "Notifications", "Long Battery"],
  },
  budget: {
    title: "Budget Devices",
    description: "Affordable gadgets with great value",
    icon: Tag,
    color: "#059669",
    bgColor: "bg-emerald-600",
    textColor: "text-emerald-600",
    features: ["Under $300", "Great Value", "Essential Features"],
  },
  refurbished: {
    title: "Refurbished",
    description: "Certified pre-owned devices at great prices",
    icon: RefreshCw,
    color: "#D97706",
    bgColor: "bg-amber-600",
    textColor: "text-amber-600",
    features: ["Certified Quality", "Great Savings", "Eco-Friendly"],
  },
};

// ---------- Filter Options ----------
const productTypes = [
  { value: "all", label: "All Types", icon: Layers },
  ...Array.from(new Set(products.map((p) => p.type).filter(Boolean))).map((type) => ({
    value: type!,
    label:
      type === "smartphone"
        ? "Smartphones"
        : type === "laptop"
        ? "Laptops"
        : type === "tablet"
        ? "Tablets"
        : type === "earbuds"
        ? "Wireless Earbuds"
        : type === "headphones"
        ? "Headphones"
        : type === "smartwatch"
        ? "Smart Watches"
        : type === "gaming"
        ? "Gaming Consoles"
        : type === "speaker"
        ? "Smart Speakers"
        : type === "camera"
        ? "Cameras"
        : type === "drone"
        ? "Drones"
        : type === "e-reader"
        ? "E-Readers"
        : type!.charAt(0).toUpperCase() + type!.slice(1),
    icon:
      type === "smartphone"
        ? Smartphone
        : type === "laptop"
        ? Monitor
        : type === "tablet"
        ? Tablet
        : type === "earbuds" || type === "headphones"
        ? Headphones
        : type === "smartwatch"
        ? Watch
        : type === "gaming"
        ? Gamepad
        : type === "speaker"
        ? SpeakerIcon
        : type === "camera" || type === "drone"
        ? Camera
        : Layers,
  })),
];

const priceRanges = [
  { value: "all", label: "All Prices", icon: DollarSign },
  { value: "under_100", label: "Under ₦100,000", min: 0, max: 100000, icon: DollarSign },
  { value: "100_300", label: "₦100,000 - ₦300,000", min: 100000, max: 300000, icon: DollarSign },
  { value: "300_600", label: "₦300,000 - ₦600,000", min: 300000, max: 600000, icon: DollarSign },
  { value: "600_1000", label: "₦600,000 - ₦1,000,000", min: 600000, max: 1000000, icon: DollarSign },
  { value: "over_1000", label: "Over ₦1,000,000", min: 1000000, max: 5000000, icon: DollarSign },
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
  { value: "New", label: "New", icon: Package },
  { value: "Refurbished", label: "Refurbished", icon: RefreshCw },
  { value: "UK Used", label: "UK Used", icon: RefreshCw },
  { value: "Open Box", label: "Open Box", icon: Package },
];

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "best_rating", label: "Best Rating" },
  { value: "most_popular", label: "Most Popular" },
];

const Categories = () => {
  // ---------- Filter State ----------
  const [selectedFilters, setSelectedFilters] = useState({
    brand: "all",
    priceRange: "all",
    storage: "all",
    productType: "all",
    condition: "all",
  });
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [comparisonProducts, setComparisonProducts] = useState<string[]>([]);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({
    brand: true,
    price: true,
    storage: false,
    productType: true,
    condition: true,
  });
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // ---------- Global Contexts ----------
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  // ---------- Get Brand Options Dynamically ----------
  const getBrandOptions = () => {
    const productType = selectedFilters.productType;
    let brandList: string[] = [];

    if (productType === "all") {
      brandList = Array.from(new Set(products.map((p) => p.brand)));
    } else {
      brandList = Array.from(
        new Set(products.filter((p) => p.type === productType).map((p) => p.brand))
      );
    }

    return [
      { value: "all", label: "All Brands", icon: Layers },
      ...brandList.map((brand) => ({
        value: brand,
        label: brand,
        icon: brand === "Apple" || brand === "Samsung" ? Smartphone : Layers,
      })),
    ];
  };

  // ---------- Active Filters Count ----------
  useEffect(() => {
    const count = Object.values(selectedFilters).filter((v) => v !== "all").length;
    setActiveFiltersCount(count);
  }, [selectedFilters]);

  // ---------- Filter & Sort Logic ----------
  useEffect(() => {
    let results = [...products];

    // Search
    if (searchQuery) {
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.type?.toLowerCase() || "").includes(searchQuery.toLowerCase())
      );
    }

    // Product Type
    if (selectedFilters.productType !== "all") {
      results = results.filter((p) => p.type === selectedFilters.productType);
    }

    // Brand
    if (selectedFilters.brand !== "all") {
      results = results.filter((p) => p.brand === selectedFilters.brand);
    }

    // Price Range
    if (selectedFilters.priceRange !== "all") {
      const range = priceRanges.find((r) => r.value === selectedFilters.priceRange);
      if (range) {
        results = results.filter((p) => p.price >= range.min && p.price <= range.max);
      }
    }

    // Storage
    if (selectedFilters.storage !== "all") {
      results = results.filter(
        (p) => p.storage && p.storage.some((s) => s.includes(selectedFilters.storage))
      );
    }

    // Condition
    if (selectedFilters.condition !== "all") {
      results = results.filter((p) => p.condition === selectedFilters.condition);
    }

    // Sorting
    switch (sortBy) {
      case "price_low":
        results.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        results.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        results.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
      case "best_rating":
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "most_popular":
        results.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
        break;
      case "featured":
      default:
        results.sort((a, b) => {
          const aFeatured = a.section === "New Arrivals" ? 2 : (a.rating || 0) >= 4.5 ? 1 : 0;
          const bFeatured = b.section === "New Arrivals" ? 2 : (b.rating || 0) >= 4.5 ? 1 : 0;
          return bFeatured - aFeatured || (b.rating || 0) - (a.rating || 0);
        });
        break;
    }

    setFilteredProducts(results);
  }, [selectedFilters, sortBy, searchQuery]);

  // ---------- Handlers ----------
  const handleFilterSelect = (filterType: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      brand: "all",
      priceRange: "all",
      storage: "all",
      productType: "all",
      condition: "all",
    });
    setSearchQuery("");
  };

  const toggleFilterSection = (section: keyof typeof expandedFilters) => {
    setExpandedFilters((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleComparison = (productId: string) => {
    setComparisonProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else if (prev.length < 4) {
        return [...prev, productId];
      }
      return prev;
    });
  };

  // ---------- Helper Functions ----------
  const getTypeIcon = (type: string = "smartphone") => {
    switch (type) {
      case "smartphone":
        return Smartphone;
      case "laptop":
        return Monitor;
      case "tablet":
        return Tablet;
      case "earbuds":
      case "headphones":
        return Headphones;
      case "smartwatch":
        return Watch;
      case "gaming":
        return Gamepad;
      case "camera":
      case "drone":
        return Camera;
      case "e-reader":
        return Tablet;
      case "speaker":
        return SpeakerIcon;
      default:
        return Smartphone;
    }
  };

  const getTypeColor = (type: string = "smartphone") => {
    switch (type) {
      case "smartphone":
        return "bg-blue-100 text-blue-600";
      case "laptop":
        return "bg-purple-100 text-purple-600";
      case "tablet":
        return "bg-green-100 text-green-600";
      case "earbuds":
        return "bg-amber-100 text-amber-600";
      case "headphones":
        return "bg-orange-100 text-orange-600";
      case "smartwatch":
        return "bg-pink-100 text-pink-600";
      case "gaming":
        return "bg-red-100 text-red-600";
      case "speaker":
        return "bg-indigo-100 text-indigo-600";
      case "camera":
        return "bg-cyan-100 text-cyan-600";
      case "drone":
        return "bg-gray-100 text-gray-600";
      case "e-reader":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getTwoSpecs = (product: Product) => {
    const specs = [];
    if (product.storage && product.storage.length > 0) {
      specs.push({ label: "Storage", value: product.storage[0], icon: HardDrive });
    }
    if (product.camera) {
      specs.push({ label: "Camera", value: product.camera, icon: Camera });
    } else if (product.screenSize) {
      specs.push({ label: "Display", value: product.screenSize, icon: Monitor });
    } else if (product.processor) {
      specs.push({ label: "Processor", value: product.processor, icon: Cpu });
    } else if (product.battery) {
      specs.push({ label: "Battery", value: product.battery, icon: BatteryCharging });
    } else if (product.features && product.features.length > 0) {
      specs.push({ label: "Feature", value: product.features[0], icon: Zap });
    }
    return specs.slice(0, 2);
  };

  // ---------- Product Card Component ----------
  const ProductCard = ({ product }: { product: Product }) => {
    const [isQuickView, setIsQuickView] = useState(false);
    const inWishlist = isInWishlist(product.id);
    const isInComparison = comparisonProducts.includes(product.id);
    const TypeIcon = getTypeIcon(product.type);
    const typeColorClass = getTypeColor(product.type);
    const specs = getTwoSpecs(product);

    return (
      <div
        className="group relative bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
        onMouseEnter={() => setIsQuickView(true)}
        onMouseLeave={() => setIsQuickView(false)}
      >
        {/* Image Section */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          <div className="relative w-full h-full">
            <img
              src={product.image}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-contain p-4 transition-all duration-500 ${
                isQuickView ? "opacity-0" : "opacity-100"
              }`}
            />
            {product.image2 && (
              <img
                src={product.image2}
                alt={product.name}
                className={`absolute inset-0 w-full h-full object-contain p-4 transition-all duration-500 ${
                  isQuickView ? "opacity-100" : "opacity-0"
                }`}
              />
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.type && (
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${typeColorClass}`}>
                <TypeIcon className="w-3 h-3" />
                <span>{product.type.charAt(0).toUpperCase() + product.type.slice(1)}</span>
              </div>
            )}
            {product.condition === "Refurbished" && (
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                REFURBISHED
              </span>
            )}
            {product.section === "New Arrivals" && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">NEW</span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 border border-gray-200 z-10"
          >
            <Heart className={`w-5 h-5 ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${typeColorClass}`}>
                {product.brand}
              </span>
              {product.condition === "New" && <CheckCircle className="w-4 h-4 text-green-500" />}
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-gray-900">{product.rating}</span>
              <span className="text-xs text-gray-500">({product.reviews})</span>
            </div>
          </div>

          <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 h-12">{product.name}</h3>

          {/* Two Specs */}
          <div className="space-y-2 mb-4">
            {specs.map((spec, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                <spec.icon className="w-4 h-4 text-gray-400" />
                <span className="truncate">{spec.value}</span>
              </div>
            ))}
          </div>

          {/* Price & Condition */}
          <div className="flex items-center justify-between mb-4 pt-3 border-t border-gray-100">
            <div>
              <div className="text-xl font-bold text-gray-900">{formatPrice(product.price)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">
                Condition: <span className="font-medium text-gray-700">{product.condition}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] bg-blue-600 hover:bg-blue-700"
              disabled={!product.inStock}
              onClick={() => {
                if (product.inStock) {
                  addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: 1,
                    storage: product.storage?.[0],
                    color: product.colors?.[0],
                  });
                }
              }}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.inStock ? "Add to Cart" : "Out of Stock"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleComparison(product.id)}
              className={`rounded-lg py-2.5 px-4 text-sm font-semibold border-gray-300 hover:border-blue-600 ${
                isInComparison ? "bg-blue-50 text-blue-600 border-blue-600" : ""
              }`}
            >
              Details
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // ---------- Filter Section Component ----------
  const FilterSection = ({
    title,
    type,
    options,
    expanded,
    onToggle,
  }: {
    title: string;
    type: keyof typeof selectedFilters;
    options: any[];
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
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500 rotate-180 transition-transform" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500 transition-transform" />
        )}
      </button>
      {expanded && (
        <div className="pb-4 space-y-2">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="radio"
                    checked={selectedFilters[type] === option.value}
                    onChange={() => handleFilterSelect(type, option.value)}
                    className="sr-only peer"
                  />
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex items-center justify-center peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all duration-200">
                    {selectedFilters[type] === option.value && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  {Icon && <Icon className="w-4 h-4 text-gray-400" />}
                  <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                    {option.label}
                  </span>
                </div>
                {selectedFilters[type] === option.value && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />

      {/* Black Friday Banner */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 text-white text-sm">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">Holiday Sale: Up to 40% off on all gadgets!</span>
            <Link to="/deals" className="ml-2 underline underline-offset-2 hover:no-underline">
              Shop Now →
            </Link>
          </div>
        </div>
      </div>

      {/* Category Hero */}
      <div className="bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Discover Amazing Gadgets</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Browse our collection of smartphones, laptops, tablets, audio devices, and more
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {["Smartphones", "Laptops", "Tablets", "Audio", "Gaming", "Wearables"].map((feature, index) => (
              <div
                key={index}
                className="group relative px-4 py-3 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-125 transition-transform"></div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    {feature}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            </button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block lg:w-1/4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear all
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search gadgets..."
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                />
              </div>

              {/* Filter Sections */}
              <div className="space-y-1">
                <FilterSection
                  title="Product Type"
                  type="productType"
                  options={productTypes}
                  expanded={expandedFilters.productType}
                  onToggle={() => toggleFilterSection("productType")}
                />
                <FilterSection
                  title="Brands"
                  type="brand"
                  options={getBrandOptions()}
                  expanded={expandedFilters.brand}
                  onToggle={() => toggleFilterSection("brand")}
                />
                <FilterSection
                  title="Price Range"
                  type="priceRange"
                  options={priceRanges}
                  expanded={expandedFilters.price}
                  onToggle={() => toggleFilterSection("price")}
                />
                {selectedFilters.productType === "smartphone" && (
                  <FilterSection
                    title="Storage"
                    type="storage"
                    options={storageOptions}
                    expanded={expandedFilters.storage}
                    onToggle={() => toggleFilterSection("storage")}
                  />
                )}
                <FilterSection
                  title="Conditions"
                  type="condition"
                  options={conditionOptions}
                  expanded={expandedFilters.condition}
                  onToggle={() => toggleFilterSection("condition")}
                />
              </div>

              {activeFiltersCount > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button onClick={clearFilters} variant="outline" className="w-full border-gray-300 hover:border-blue-600 hover:text-blue-600">
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Filters Sidebar */}
          {showMobileFilters && (
            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
              <div className="absolute inset-y-0 left-0 w-80 bg-white overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <FilterSection
                      title="Product Type"
                      type="productType"
                      options={productTypes}
                      expanded={expandedFilters.productType}
                      onToggle={() => toggleFilterSection("productType")}
                    />
                    <FilterSection
                      title="Brands"
                      type="brand"
                      options={getBrandOptions()}
                      expanded={expandedFilters.brand}
                      onToggle={() => toggleFilterSection("brand")}
                    />
                    <FilterSection
                      title="Price Range"
                      type="priceRange"
                      options={priceRanges}
                      expanded={expandedFilters.price}
                      onToggle={() => toggleFilterSection("price")}
                    />
                    {selectedFilters.productType === "smartphone" && (
                      <FilterSection
                        title="Storage"
                        type="storage"
                        options={storageOptions}
                        expanded={expandedFilters.storage}
                        onToggle={() => toggleFilterSection("storage")}
                      />
                    )}
                    <FilterSection
                      title="Conditions"
                      type="condition"
                      options={conditionOptions}
                      expanded={expandedFilters.condition}
                      onToggle={() => toggleFilterSection("condition")}
                    />
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button onClick={clearFilters} className="w-full py-3 text-sm font-medium text-blue-600 hover:text-blue-700">
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid/List */}
          <div className="lg:w-3/4">
            {/* Desktop Toolbar */}
            <div className="hidden lg:flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{filteredProducts.length} Products Found</h2>
                {activeFiltersCount > 0 && (
                  <div className="text-sm text-gray-600 mt-1">
                    {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""} applied
                  </div>
                )}
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">View:</span>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded transition-colors ${
                        viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded transition-colors ${
                        viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none text-sm border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[180px] bg-white"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {Object.entries(selectedFilters).map(([key, value]) => {
                  if (value !== "all") {
                    let option;
                    if (key === "productType") {
                      option = productTypes.find((opt) => opt.value === value);
                    } else if (key === "brand") {
                      option = getBrandOptions().find((opt) => opt.value === value);
                    } else if (key === "priceRange") {
                      option = priceRanges.find((opt) => opt.value === value);
                    } else if (key === "storage") {
                      option = storageOptions.find((opt) => opt.value === value);
                    } else if (key === "condition") {
                      option = conditionOptions.find((opt) => opt.value === value);
                    }
                    return option ? (
                      <div
                        key={key}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100"
                      >
                        <span>{option.label}</span>
                        <button
                          onClick={() => handleFilterSelect(key as keyof typeof selectedFilters, "all")}
                          className="hover:text-blue-900 hover:scale-110 transition-transform"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : null;
                  }
                  return null;
                })}
                <button onClick={clearFilters} className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                  Clear all
                </button>
              </div>
            )}

            {/* Products Display */}
            {filteredProducts.length > 0 ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((product) => {
                    const TypeIcon = getTypeIcon(product.type);
                    const specs = getTwoSpecs(product);
                    return (
                      <div
                        key={product.id}
                        className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 p-6"
                      >
                        <div className="flex items-start gap-6">
                          <div className="w-32 h-32 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <img src={product.image} alt={product.name} className="w-24 h-24 object-contain" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <div
                                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getTypeColor(
                                      product.type
                                    )}`}
                                  >
                                    <TypeIcon className="w-3 h-3" />
                                    <span>{product.type?.charAt(0).toUpperCase() + product.type?.slice(1)}</span>
                                  </div>
                                  <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                                    {product.brand}
                                  </span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                  {specs.map((spec, index) => (
                                    <div key={index} className="flex items-center gap-1">
                                      <spec.icon className="w-4 h-4" />
                                      <span>{spec.value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900 mb-2">
                                  {formatPrice(product.price)}
                                </div>
                                <div className="flex items-center justify-end gap-1 mb-3">
                                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                  <span className="text-sm font-bold text-gray-900">{product.rating}</span>
                                  <span className="text-xs text-gray-500">({product.reviews})</span>
                                </div>
                                <div className="text-xs text-gray-500 mb-2">
                                  Condition: <span className="font-medium text-gray-700">{product.condition}</span>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700"
                                    onClick={() => {
                                      addToCart({
                                        id: product.id,
                                        name: product.name,
                                        price: product.price,
                                        image: product.image,
                                        quantity: 1,
                                        storage: product.storage?.[0],
                                        color: product.colors?.[0],
                                      });
                                    }}
                                  >
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Add to Cart
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
                  })}
                </div>
              )
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

      <TrustBadges />
      <Footer />
    </div>
  );
};

export default Categories;