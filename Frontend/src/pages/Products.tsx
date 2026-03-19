import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Heart, ChevronDown, Camera, Filter,
  ShoppingCart, Star, Grid, List,
  X, Check, Zap, Shield, Truck, ChevronLeft, ChevronRight,
  CheckCircle, Users, DollarSign, Headphones,
  ShieldCheck, TruckIcon,
  ArrowRight, ChevronUp, ChevronDown as ChevronDownIcon,
  Search, Smartphone, Monitor, Tablet, Headphones as HeadphonesIcon,
  Watch, Gamepad, Speaker, HardDrive, Cpu, BatteryCharging
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustBadges from "@/components/TrustBadges";
import { products, getProductsBySection, formatPrice, type Product } from "@/data/products";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";

// Banner Cards
const bannerCards = [
  {
    id: 1,
    gradient: "from-[#6366F1] to-[#818CF8]",
    title: "Get Your Favourite Gadget Fast, Easy, and Verified.",
    buttonText: "Shop Now",
    buttonColor: "text-indigo-600",
    bgColor: "bg-white",
    icon: ShieldCheck,
  },
  {
    id: 2,
    gradient: "from-[#0EA5E9] to-[#38BDF8]",
    title: "Join Thousands of Smart Shoppers.",
    buttonText: "Start Shopping",
    buttonColor: "text-sky-600",
    bgColor: "bg-white",
    icon: Users,
  },
  {
    id: 3,
    gradient: "from-[#F97316] to-[#FB923C]",
    title: "Premium Quality at Unbeatable Prices",
    buttonText: "View Deals",
    buttonColor: "text-orange-600",
    bgColor: "bg-white",
    icon: DollarSign,
  },
  {
    id: 4,
    gradient: "from-[#10B981] to-[#34D399]",
    title: "24/7 Customer Support Always Here",
    buttonText: "Get Support",
    buttonColor: "text-emerald-600",
    bgColor: "bg-white",
    icon: Headphones,
  },
  {
    id: 5,
    gradient: "from-[#8B5CF6] to-[#A78BFA]",
    title: "Fast & Secure Delivery Nationwide",
    buttonText: "Track Order",
    buttonColor: "text-violet-600",
    bgColor: "bg-white",
    icon: TruckIcon,
  },
  {
    id: 6,
    gradient: "from-[#EF4444] to-[#F87171]",
    title: "30-Day Money Back Guarantee",
    buttonText: "Learn More",
    buttonColor: "text-red-600",
    bgColor: "bg-white",
    icon: Shield,
  },
];

const Products = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [newArrivalsVisible, setNewArrivalsVisible] = useState(4);
  const [popularVisible, setPopularVisible] = useState(4);
  const [sweetDealsVisible, setSweetDealsVisible] = useState(4);

  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [showFilters, setShowFilters] = useState(false);

  // Global contexts
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const allNewArrivals = getProductsBySection("New Arrivals");
  const allPopular = getProductsBySection("Popular Products");
  const allSweetDeals = getProductsBySection("Sweet Deals");

  const brands = ["All", ...new Set(products.map((p) => p.brand))];
  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const conditions = ["All", ...new Set(products.map((p) => p.condition))];

  const filterProducts = (productList: Product[]) => {
    return productList.filter((product) => {
      const matchesSearch =
        searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.type?.toLowerCase() || "").includes(searchQuery.toLowerCase());

      const matchesBrand = selectedBrand === "All" || product.brand === selectedBrand;
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      const matchesCondition = selectedCondition === "All" || product.condition === selectedCondition;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesSearch && matchesBrand && matchesCategory && matchesCondition && matchesPrice;
    });
  };

  const newArrivals = filterProducts(allNewArrivals);
  const popularProducts = filterProducts(allPopular);
  const sweetDeals = filterProducts(allSweetDeals);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedBrand("All");
    setSelectedCategory("All");
    setSelectedCondition("All");
    setPriceRange([0, 2000000]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(bannerCards.length / 2));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(bannerCards.length / 2));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(bannerCards.length / 2)) % Math.ceil(bannerCards.length / 2));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const getTypeIcon = (type: string = "smartphone") => {
    switch (type) {
      case "smartphone": return Smartphone;
      case "laptop": return Monitor;
      case "tablet": return Tablet;
      case "earbuds":
      case "headphones": return HeadphonesIcon;
      case "smartwatch": return Watch;
      case "gaming": return Gamepad;
      case "camera":
      case "drone": return Camera;
      case "e-reader": return Tablet;
      case "speaker": return Speaker;
      default: return Smartphone;
    }
  };

  const getTypeColor = (type: string = "smartphone") => {
    switch (type) {
      case "smartphone": return "bg-blue-100 text-blue-600";
      case "laptop": return "bg-purple-100 text-purple-600";
      case "tablet": return "bg-green-100 text-green-600";
      case "earbuds": return "bg-amber-100 text-amber-600";
      case "headphones": return "bg-orange-100 text-orange-600";
      case "smartwatch": return "bg-pink-100 text-pink-600";
      case "gaming": return "bg-red-100 text-red-600";
      case "camera": return "bg-indigo-100 text-indigo-600";
      case "drone": return "bg-cyan-100 text-cyan-600";
      case "e-reader": return "bg-gray-100 text-gray-600";
      default: return "bg-gray-100 text-gray-600";
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

  const ProductCard = ({ product }: { product: Product }) => {
    const [isQuickView, setIsQuickView] = useState(false);
    const inWishlist = isInWishlist(product.id);
    const TypeIcon = getTypeIcon(product.type);
    const typeColorClass = getTypeColor(product.type);
    const specs = getTwoSpecs(product);

    return (
      <div
        className="group relative bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
        onMouseEnter={() => setIsQuickView(true)}
        onMouseLeave={() => setIsQuickView(false)}
      >
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

          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.type && (
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${typeColorClass}`}>
                <TypeIcon className="w-3 h-3" />
                <span>{product.type.charAt(0).toUpperCase() + product.type.slice(1)}</span>
              </div>
            )}
            {product.condition === "UK Used" && (
              <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">UK USED</span>
            )}
            {product.condition === "Open Box" && (
              <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">OPEN BOX</span>
            )}
            {product.condition === "Refurbished" && (
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">REFURBISHED</span>
            )}
            {product.section === "New Arrivals" && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">NEW</span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 border border-gray-200 z-10"
          >
            <Heart className={`w-5 h-5 ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
          </button>

          {isQuickView && product.inStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-all duration-300">
              <div className="flex flex-col gap-3">
                <Button
                  className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transform hover:scale-105 transition-all"
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
                  Quick Add to Cart
                </Button>
                <Link
                  to={`/products/${product.id}`}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold text-center transform hover:scale-105 transition-all"
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

          <div className="space-y-2 mb-4">
            {specs.map((spec, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                <spec.icon className="w-4 h-4 text-gray-400" />
                <span className="truncate">{spec.value}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-4 pt-3 border-t border-gray-100">
            <div>
              <div className="text-xl font-bold text-blue-600">{formatPrice(product.price)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">
                Condition: <span className="font-medium text-gray-700">{product.condition}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProductListItem = ({ product }: { product: Product }) => {
    const inWishlist = isInWishlist(product.id);
    const TypeIcon = getTypeIcon(product.type);
    const typeColorClass = getTypeColor(product.type);
    const specs = getTwoSpecs(product);

    return (
      <div className="group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 p-6">
        <div className="flex items-start gap-6">
          <div className="w-32 h-32 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 relative">
            <img src={product.image} alt={product.name} className="w-24 h-24 object-contain" />
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleWishlist(product.id);
              }}
              className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all border border-gray-200"
            >
              <Heart className={`w-4 h-4 ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </button>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${typeColorClass}`}>
                    <TypeIcon className="w-3 h-3" />
                    <span>{product.type?.charAt(0).toUpperCase() + product.type?.slice(1)}</span>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                    {product.brand}
                  </span>
                  {product.section === "New Arrivals" && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">NEW</span>
                  )}
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
                <div className="text-2xl font-bold text-gray-900 mb-2">{formatPrice(product.price)}</div>
                <div className="flex items-center justify-end gap-1 mb-3">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-gray-900">{product.rating}</span>
                  <span className="text-xs text-gray-500">({product.reviews})</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  Condition: <span className="font-medium text-gray-700">{product.condition}</span>
                </div>
                <div className="flex gap-2 justify-end">
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
  };

  const isFilterActive =
    searchQuery !== "" ||
    selectedBrand !== "All" ||
    selectedCategory !== "All" ||
    selectedCondition !== "All" ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 2000000;

  const removeFilter = (type: "brand" | "category" | "condition" | "search" | "price") => {
    switch (type) {
      case "brand": setSelectedBrand("All"); break;
      case "category": setSelectedCategory("All"); break;
      case "condition": setSelectedCondition("All"); break;
      case "search": setSearchQuery(""); break;
      case "price": setPriceRange([0, 2000000]); break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <Header />
      </div>

      {/* Hero Slider */}
      <div className="bg-white py-6">
        <div className="container mx-auto px-4">
          <p className="text-gray-700 text-center text-base mb-6 font-medium">
            Your Trusted Tech Partner, Built
            <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-sm mx-0.5 font-bold">
              Jimmy
            </span>
            ou, Backed by Trust.
          </p>
          <div className="relative overflow-hidden">
            <div
              ref={sliderRef}
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentSlide * (100 / 3)}%)`,
                width: `${bannerCards.length * (100 / 3)}%`,
              }}
            >
              {bannerCards.map((card) => (
                <div key={card.id} className="flex-shrink-0 px-2" style={{ width: `${100 / 3}%` }}>
                  <div
                    className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-5 text-white relative overflow-hidden h-[140px] md:h-[150px] group hover:shadow-2xl transition-all duration-300 flex items-center`}
                  >
                    <div className="absolute inset-0 opacity-10">
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                      />
                    </div>
                    <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                      <card.icon className="w-14 h-14 md:w-16 md:h-16" />
                    </div>
                    <div className="relative z-10 w-full pr-12">
                      <p className="text-sm md:text-base font-bold leading-tight mb-2">{card.title}</p>
                      <Button
                        className={`${card.bgColor} ${card.buttonColor} hover:bg-gray-100 text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 h-auto rounded-lg font-semibold shadow-md transform hover:scale-105 transition-all duration-300`}
                      >
                        {card.buttonText}
                        <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 border border-gray-300 z-20"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 border border-gray-300 z-20"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
              {Array.from({ length: Math.ceil(bannerCards.length / 3) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index * 3)}
                  className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                    Math.floor(currentSlide / 3) === index
                      ? "bg-white scale-125 shadow-lg"
                      : "bg-white/60 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search gadgets by name, brand, or type..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
              <Button variant="ghost" onClick={resetFilters} className="text-gray-600 hover:text-gray-800">
                Reset
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                  >
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                  >
                    {conditions.map((cond) => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="2000000"
                      step="10000"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="2000000"
                      step="10000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {isFilterActive && (
                <div className="mt-4 pt-3 border-t border-gray-200 text-right">
                  <Button variant="ghost" onClick={resetFilters} className="text-blue-600 hover:text-blue-800">
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          )}

          {isFilterActive && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Active Filters:</p>
              <div className="flex flex-wrap gap-2">
                {selectedBrand !== "All" && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                    Brand: {selectedBrand}
                    <button onClick={() => removeFilter("brand")} className="ml-1 hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedCategory !== "All" && (
                  <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">
                    Category: {selectedCategory}
                    <button onClick={() => removeFilter("category")} className="ml-1 hover:text-purple-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedCondition !== "All" && (
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                    Condition: {selectedCondition}
                    <button onClick={() => removeFilter("condition")} className="ml-1 hover:text-green-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">
                    Search: "{searchQuery}"
                    <button onClick={() => removeFilter("search")} className="ml-1 hover:text-amber-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {(priceRange[0] !== 0 || priceRange[1] !== 2000000) && (
                  <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
                    Price: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                    <button onClick={() => removeFilter("price")} className="ml-1 hover:text-gray-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Sections */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {newArrivals.length + popularProducts.length + sweetDeals.length}
                </span>{" "}
                filtered gadgets
              </p>
              {searchQuery && (
                <p className="text-sm text-gray-600 mt-1">
                  Search results for "<span className="font-semibold">{searchQuery}</span>"
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="flex items-center gap-2"
              >
                <Grid className="w-4 h-4" /> Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="flex items-center gap-2"
              >
                <List className="w-4 h-4" /> List
              </Button>
            </div>
          </div>
        </div>

        {/* New Arrivals */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
              <p className="text-gray-600 mt-1">
                Showing {newArrivals.slice(0, newArrivalsVisible).length} of {newArrivals.length} products
              </p>
            </div>
            {newArrivals.length > 4 && (
              <Button
                variant="ghost"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => setNewArrivalsVisible((prev) => (prev >= newArrivals.length ? 4 : newArrivals.length))}
              >
                {newArrivalsVisible >= newArrivals.length ? "View Less" : `View More (${newArrivalsVisible}/${newArrivals.length})`}
                {newArrivalsVisible >= newArrivals.length ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDownIcon className="w-4 h-4 ml-2" />}
              </Button>
            )}
          </div>
          {newArrivals.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {newArrivals.slice(0, newArrivalsVisible).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {newArrivals.slice(0, newArrivalsVisible).map((product) => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-gray-500">No new arrivals match your filters</p>
              <Button variant="ghost" onClick={resetFilters} className="mt-2 text-blue-600 hover:text-blue-700">
                Reset filters
              </Button>
            </div>
          )}
        </div>

        {/* Popular Products */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Popular Products</h2>
              <p className="text-gray-600 mt-1">
                Showing {popularProducts.slice(0, popularVisible).length} of {popularProducts.length} products
              </p>
            </div>
            {popularProducts.length > 4 && (
              <Button
                variant="ghost"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => setPopularVisible((prev) => (prev >= popularProducts.length ? 4 : popularProducts.length))}
              >
                {popularVisible >= popularProducts.length ? "View Less" : `View More (${popularVisible}/${popularProducts.length})`}
                {popularVisible >= popularProducts.length ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDownIcon className="w-4 h-4 ml-2" />}
              </Button>
            )}
          </div>
          {popularProducts.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {popularProducts.slice(0, popularVisible).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {popularProducts.slice(0, popularVisible).map((product) => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-gray-500">No popular products match your filters</p>
            </div>
          )}
          {popularProducts.length > 0 && (
            <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-bold text-amber-900">Popular Picks Sell Fast!</h3>
                  <p className="text-amber-700">Stay Updated Before They're Gone.</p>
                </div>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">Stay Updated</Button>
              </div>
            </div>
          )}
        </div>

        {/* Sweet Deals */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Sweet Deals</h2>
              <p className="text-gray-600 mt-1">
                Showing {sweetDeals.slice(0, sweetDealsVisible).length} of {sweetDeals.length} products
              </p>
            </div>
            {sweetDeals.length > 4 && (
              <Button
                variant="ghost"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => setSweetDealsVisible((prev) => (prev >= sweetDeals.length ? 4 : sweetDeals.length))}
              >
                {sweetDealsVisible >= sweetDeals.length ? "View Less" : `View More (${sweetDealsVisible}/${sweetDeals.length})`}
                {sweetDealsVisible >= sweetDeals.length ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDownIcon className="w-4 h-4 ml-2" />}
              </Button>
            )}
          </div>
          {sweetDeals.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {sweetDeals.slice(0, sweetDealsVisible).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sweetDeals.slice(0, sweetDealsVisible).map((product) => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-gray-500">No sweet deals match your filters</p>
            </div>
          )}
        </div>

        {/* Categories CTA */}
        <div className="text-center py-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Need More Specific Filters?</h2>
            <p className="text-gray-600 text-lg mb-10">
              Visit our categories page for advanced filtering options, detailed specifications, and more!
            </p>
            <Link to="/categories">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-8 px-12 rounded-xl text-xl font-semibold shadow-xl transition-all duration-300">
                Go to Categories
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <TrustBadges />
      <Footer />
    </div>
  );
};

export default Products;