import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  Heart, ChevronDown, Package, Camera, Filter, 
  ShoppingCart, Star, TrendingUp, Zap, Grid, List,
  X, Check, Sparkles, Shield, Truck, ChevronLeft, ChevronRight,
  CheckCircle, Clock, Users, Award, DollarSign, Headphones,
  ShieldCheck, BadgeCheck, TruckIcon, Star as StarIcon,
  Loader2, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustBadges from "@/components/TrustBadges";

// Define primary color
const primaryColor = "hsl(240, 60%, 20%)"; // Dark blue
const primaryLight = "hsl(240, 60%, 95%)"; // Very light blue
const primaryMedium = "hsl(240, 60%, 30%)"; // Medium blue

// Extended dummy data with storage, rating, and second images
const allProducts = [
  // New Arrivals (Matching the image)
  { id: 1, name: "iPhone 16 Pro", price: 895995, brand: "Apple", type: "Phone", category: "New Arrivals", 
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w-400&h-400&fit=crop", 
    image2: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    storage: "256GB", condition: "New", camera: true, inStock: true, rating: 4.8, reviews: 128, isFeatured: true },
  
  { id: 2, name: "iPhone 16 Pro Max", price: 967885, brand: "Apple", type: "Phone", category: "New Arrivals", 
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop",
    image2: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    storage: "512GB", condition: "New", camera: true, inStock: true, rating: 4.9, reviews: 245, isFeatured: true },
  
  { id: 3, name: "iPhone 17", price: 1288999, brand: "Apple", type: "Phone", category: "New Arrivals", 
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop",
    image2: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    storage: "1TB", condition: "New", camera: true, inStock: true, rating: 4.9, reviews: 312, isFeatured: true },
  
  { id: 4, name: "iPhone 17 Air", price: 1000000, brand: "Apple", type: "Phone", category: "New Arrivals", 
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop",
    image2: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    storage: "512GB", condition: "New", camera: true, inStock: true, rating: 4.7, reviews: 89, isFeatured: true },
  
  // Popular Products (Matching the image)
  { id: 5, name: "iPhone 16 Pro Max", price: 1234895, brand: "Apple", type: "Phone", category: "Popular Products", 
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop",
    image2: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    storage: "1TB", condition: "New", camera: true, inStock: true, rating: 4.9, reviews: 289, isFeatured: true },
  
  { id: 6, name: "iPhone 14 Pro", price: 799895, brand: "Apple", type: "Phone", category: "Popular Products", 
    image: "https://images.unsplash.com/photo-1592910147752-5b3a9a5e1f6e?w=400&h=400&fit=crop",
    image2: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    storage: "256GB", condition: "New", camera: true, inStock: true, rating: 4.6, reviews: 201, isFeatured: true },
  
  { id: 7, name: "iPhone 12 Mini", price: 237888, brand: "Apple", type: "Phone", category: "Popular Products", 
    image: "https://images.unsplash.com/photo-1592910147752-5b3a9a5e1f6e?w=400&h=400&fit=crop",
    image2: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    storage: "128GB", condition: "Refurbished", camera: true, inStock: true, rating: 4.3, reviews: 156, isFeatured: false },
  
  { id: 8, name: "iPhone 13 Pro", price: 466886, brand: "Apple", type: "Phone", category: "Popular Products", 
    image: "https://images.unsplash.com/photo-1592910147752-5b3a9a5e1f6e?w=400&h=400&fit=crop",
    image2: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    storage: "256GB", condition: "New", camera: true, inStock: true, rating: 4.5, reviews: 178, isFeatured: false },
  
  // Sweet Deals (Matching the image)
  { id: 9, name: "iPhone 16 Pro Max", price: 1234995, brand: "Apple", type: "Phone", category: "Sweet Deals", 
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop",
    image2: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    storage: "1TB", condition: "New", camera: true, inStock: true, rating: 4.9, reviews: 245, isFeatured: true },
  
  { id: 10, name: "iPhone 15 Pro", price: 966642, brand: "Apple", type: "Phone", category: "Sweet Deals", 
    image: "https://images.unsplash.com/photo-1592910147752-5b3a9a5e1f6e?w=400&h=400&fit=crop",
    image2: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    storage: "256GB", condition: "New", camera: true, inStock: true, rating: 4.7, reviews: 189, isFeatured: true },
  
  { id: 11, name: "iPhone XS", price: 278550, brand: "Apple", type: "Phone", category: "Sweet Deals", 
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    image2: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    storage: "64GB", condition: "UK Used", camera: true, inStock: true, rating: 4.2, reviews: 134, isFeatured: false },
  
  { id: 12, name: "iPhone 11 Pro Max", price: 210773, brand: "Apple", type: "Phone", category: "Sweet Deals", 
    image: "https://images.unsplash.com/photo-1592910147752-5b3a9a5e1f6e?w=400&h=400&fit=crop",
    image2: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    storage: "256GB", condition: "UK Used", camera: true, inStock: true, rating: 4.4, reviews: 156, isFeatured: false },
  
  // Additional products for the sections
  { id: 13, name: "Open Box iPhone 11", price: 320093, brand: "Apple", type: "Phone", category: "Popular Products", 
    image: "https://images.unsplash.com/photo-1592910147752-5b3a9a5e1f6e?w=400&h=400&fit=crop",
    image2: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    storage: "128GB", condition: "Open Box", camera: true, inStock: true, rating: 4.3, reviews: 89, isFeatured: false },
  
  { id: 14, name: "iPhone X", price: 277007, brand: "Apple", type: "Phone", category: "Popular Products", 
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    image2: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    storage: "64GB", condition: "UK Used", camera: true, inStock: true, rating: 4.1, reviews: 112, isFeatured: false },
  
  { id: 15, name: "Open Box iPhone 11", price: 220093, brand: "Apple", type: "Phone", category: "Sweet Deals", 
    image: "https://images.unsplash.com/photo-1592910147752-5b3a9a5e1f6e?w=400&h=400&fit=crop",
    image2: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    storage: "64GB", condition: "Open Box", camera: true, inStock: true, rating: 4.2, reviews: 67, isFeatured: false },
  
  { id: 16, name: "iPhone X", price: 277587, brand: "Apple", type: "Phone", category: "Sweet Deals", 
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    image2: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    storage: "256GB", condition: "UK Used", camera: true, inStock: true, rating: 4.3, reviews: 98, isFeatured: false },
  
  { id: 17, name: "iPhone 15 Pro", price: 997554, brand: "Apple", type: "Phone", category: "Sweet Deals", 
    image: "https://images.unsplash.com/photo-1592910147752-5b3a9a5e1f6e?w=400&h=400&fit=crop",
    image2: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    storage: "512GB", condition: "New", camera: true, inStock: true, rating: 4.8, reviews: 201, isFeatured: true },
  
  { id: 18, name: "iPhone 16 Pro", price: 1234996, brand: "Apple", type: "Phone", category: "Sweet Deals", 
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop",
    image2: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    storage: "1TB", condition: "New", camera: true, inStock: true, rating: 4.9, reviews: 245, isFeatured: true },
];

const Products = () => {
  const [selectedFilters, setSelectedFilters] = useState({
    availability: "ALL",
    brand: "ALL",
    condition: "ALL",
    storage: "ALL",
    priceRange: "ALL"
  });

  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState("grid");
  const [filteredProducts, setFilteredProducts] = useState(allProducts);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // New slider content with 6 individual cards (matching the design image)
  const bannerCards = [
    {
      id: 1,
      gradient: "from-[#6366F1] to-[#818CF8]",
      title: "Get Your Favourite Gadget Fast, Easy, and Verified.",
      buttonText: "Shop Now",
      buttonColor: "text-indigo-600",
      bgColor: "bg-white",
      icon: BadgeCheck,
      width: "w-[calc(50%-0.5rem)]" // 2 cards per view
    },
    {
      id: 2,
      gradient: "from-[#0EA5E9] to-[#38BDF8]",
      title: "Join Thousands of Smart Shoppers.",
      buttonText: "Start Shopping",
      buttonColor: "text-sky-600",
      bgColor: "bg-white",
      icon: Users,
      width: "w-[calc(50%-0.5rem)]"
    },
    {
      id: 3,
      gradient: "from-[#F97316] to-[#FB923C]",
      title: "Premium Quality at Unbeatable Prices",
      buttonText: "View Deals",
      buttonColor: "text-orange-600",
      bgColor: "bg-white",
      icon: DollarSign,
      width: "w-[calc(50%-0.5rem)]"
    },
    {
      id: 4,
      gradient: "from-[#10B981] to-[#34D399]",
      title: "24/7 Customer Support Always Here",
      buttonText: "Get Support",
      buttonColor: "text-emerald-600",
      bgColor: "bg-white",
      icon: Headphones,
      width: "w-[calc(50%-0.5rem)]"
    },
    {
      id: 5,
      gradient: "from-[#8B5CF6] to-[#A78BFA]",
      title: "Fast & Secure Delivery Nationwide",
      buttonText: "Track Order",
      buttonColor: "text-violet-600",
      bgColor: "bg-white",
      icon: TruckIcon,
      width: "w-[calc(50%-0.5rem)]"
    },
    {
      id: 6,
      gradient: "from-[#EF4444] to-[#F87171]",
      title: "30-Day Money Back Guarantee",
      buttonText: "Learn More",
      buttonColor: "text-red-600",
      bgColor: "bg-white",
      icon: ShieldCheck,
      width: "w-[calc(50%-0.5rem)]"
    }
  ];

  // Filter options
  const filterOptions = {
    availability: [
      { value: "ALL", label: "All Stock", icon: "📦" },
      { value: "IN_STOCK", label: "In Stock", icon: "✅" },
      { value: "OUT_OF_STOCK", label: "Out of Stock", icon: "⏳" }
    ],
    brand: [
      { value: "ALL", label: "All Brands", icon: "🏷️" },
      { value: "Apple", label: "Apple", icon: "🍎" },
      { value: "Samsung", label: "Samsung", icon: "📱" },
      { value: "Google", label: "Google", icon: "🔍" },
      { value: "OnePlus", label: "OnePlus", icon: "➕" },
      { value: "Xiaomi", label: "Xiaomi", icon: "⚡" },
      { value: "Sony", label: "Sony", icon: "🎧" }
    ],
    condition: [
      { value: "ALL", label: "All Conditions", icon: "✨" },
      { value: "New", label: "Brand New", icon: "🆕" },
      { value: "UK Used", label: "UK Used", icon: "🇬🇧" },
      { value: "Refurbished", label: "Refurbished", icon: "🔧" },
      { value: "Open Box", label: "Open Box", icon: "📦" }
    ],
    storage: [
      { value: "ALL", label: "All Storage", icon: "💾" },
      { value: "64GB", label: "64GB", icon: "📊" },
      { value: "128GB", label: "128GB", icon: "📈" },
      { value: "256GB", label: "256GB", icon: "💿" },
      { value: "512GB", label: "512GB", icon: "🔋" },
      { value: "1TB", label: "1TB", icon: "💎" }
    ],
    priceRange: [
      { value: "ALL", label: "All Prices", icon: "💰" },
      { value: "UNDER_300K", label: "Under ₱300K", icon: "💵" },
      { value: "300K_600K", label: "₱300K - ₱600K", icon: "💸" },
      { value: "600K_900K", label: "₱600K - ₱900K", icon: "💳" },
      { value: "ABOVE_900K", label: "Above ₱900K", icon: "💎" }
    ]
  };

  // Sort options
  const sortOptions = [
    { value: "featured", label: "Featured", icon: Sparkles },
    { value: "price_low", label: "Price: Low to High", icon: TrendingUp },
    { value: "price_high", label: "Price: High to Low", icon: TrendingUp },
    { value: "newest", label: "Newest First", icon: "🆕" },
    { value: "popular", label: "Most Popular", icon: "🔥" }
  ];

  // Apply filters and sorting
  useEffect(() => {
    let results = [...allProducts];

    // Apply filters
    if (selectedFilters.availability !== "ALL") {
      results = results.filter(product => 
        selectedFilters.availability === "IN_STOCK" ? product.inStock : !product.inStock
      );
    }

    if (selectedFilters.brand !== "ALL") {
      results = results.filter(product => product.brand === selectedFilters.brand);
    }

    if (selectedFilters.condition !== "ALL") {
      results = results.filter(product => product.condition === selectedFilters.condition);
    }

    if (selectedFilters.storage !== "ALL") {
      results = results.filter(product => product.storage === selectedFilters.storage);
    }

    if (selectedFilters.priceRange !== "ALL") {
      switch (selectedFilters.priceRange) {
        case "UNDER_300K":
          results = results.filter(p => p.price < 300000);
          break;
        case "300K_600K":
          results = results.filter(p => p.price >= 300000 && p.price <= 600000);
          break;
        case "600K_900K":
          results = results.filter(p => p.price >= 600000 && p.price <= 900000);
          break;
        case "ABOVE_900K":
          results = results.filter(p => p.price > 900000);
          break;
      }
    }

    // Apply sorting
    switch (sortBy) {
      case "price_low":
        results.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        results.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        results.sort((a, b) => b.id - a.id);
        break;
      case "popular":
        results.sort((a, b) => b.rating - a.rating);
        break;
      case "featured":
      default:
        results.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || b.rating - a.rating);
        break;
    }

    setFilteredProducts(results);
  }, [selectedFilters, sortBy]);

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(bannerCards.length / 2));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return `₱${price.toLocaleString('en-PH')}`;
  };

  const toggleWishlist = (productId: number) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleFilterSelect = (filterType: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      availability: "ALL",
      brand: "ALL",
      condition: "ALL",
      storage: "ALL",
      priceRange: "ALL"
    });
  };

  const hasActiveFilters = () => {
    return Object.values(selectedFilters).some(value => value !== "ALL");
  };

  // Slider navigation - now showing 2 cards at a time
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(bannerCards.length / 2));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(bannerCards.length / 2)) % Math.ceil(bannerCards.length / 2));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Group filtered products by category for sections
  const newArrivals = filteredProducts.filter(p => p.category === "New Arrivals");
  const popularProducts = filteredProducts.filter(p => p.category === "Popular Products");
  const sweetDeals = filteredProducts.filter(p => p.category === "Sweet Deals");

  // Product Card Component
  const ProductCard = ({ product }: { product: any }) => {
    const isInWishlist = wishlist.includes(product.id);
    const isQuickView = quickViewProduct === product.id;

    return (
      <div 
        className="group relative bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
        onMouseEnter={() => setQuickViewProduct(product.id)}
        onMouseLeave={() => setQuickViewProduct(null)}
      >
        {/* Product Image with Quick View Overlay */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <div className="relative w-full h-full">
            <img
              src={product.image}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-contain p-4 transition-all duration-500 ${isQuickView ? 'opacity-0' : 'opacity-100'}`}
            />
            <img
              src={product.image2 || product.image}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-contain p-4 transition-all duration-500 ${isQuickView ? 'opacity-100' : 'opacity-0'}`}
            />
          </div>

          {/* Product Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.condition === "UK Used" && (
              <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                UK USED
              </span>
            )}
            {product.condition === "Open Box" && (
              <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                OPEN BOX
              </span>
            )}
            {!product.inStock && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                OUT OF STOCK
              </span>
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
            <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </button>

          {/* Quick View Overlay */}
          {isQuickView && product.inStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-all duration-300">
              <div className="flex flex-col gap-3">
                <Button 
                  className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transform hover:scale-105 transition-all"
                  onClick={() => {/* Add to cart logic */}}
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

        {/* Product Info */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
              {product.brand}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-gray-900">{product.rating}</span>
              <span className="text-xs text-gray-500">({product.reviews})</span>
            </div>
          </div>

          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 h-12">
            {product.name}
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {formatPrice(product.price)}
                </div>
                <div className="text-xs text-gray-500">
                  Storage: <span className="font-medium text-gray-700">{product.storage}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Condition: <span className="font-medium text-gray-700">{product.condition}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-600">Free Shipping</span>
              </div>
              {product.camera && (
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-600">Camera</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Filter Dropdown Component
  const FilterDropdown = ({ type, label, value }: { type: keyof typeof selectedFilters; label: string; value: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-b from-white to-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 min-w-[200px] justify-between group"
        >
          <div className="text-left">
            <span className="text-gray-600 text-sm block font-medium">{label}</span>
            <span className="font-semibold text-gray-900 block truncate text-base">
              {filterOptions[type].find(opt => opt.value === value)?.label || "Select"}
            </span>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} group-hover:text-blue-600`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
            <div className="py-2 max-h-80 overflow-y-auto">
              {filterOptions[type].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    handleFilterSelect(type, option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-5 py-4 text-sm hover:bg-gray-50 transition-all duration-200 flex items-center justify-between group/option ${
                    selectedFilters[type] === option.value 
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 font-semibold' 
                      : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{option.icon}</span>
                    <span>{option.label}</span>
                  </div>
                  {selectedFilters[type] === option.value && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <Header isLoggedIn={true} />
      </div>

      {/* Hero Section with 6-card Slider */}
      <div className="bg-white py-6">
        <div className="container mx-auto px-4">
          <p className="text-gray-700 text-center text-base mb-4 font-medium">
            Your Trusted Tech Partner, Built<span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-sm mx-0.5 font-bold">Jimmy</span>ou, Backed by Trust.
          </p>
          
          {/* 6-Card Slider (Showing 2 cards at a time with partial third) */}
          <div className="relative max-w-6xl mx-auto">
            {/* Slider Container */}
            <div className="relative overflow-hidden rounded-2xl">
              {/* Slider Content */}
              <div 
                ref={sliderRef}
                className="flex transition-transform duration-500 ease-in-out gap-4"
                style={{ 
                  transform: `translateX(calc(-${currentSlide * (100 / 2)}% - ${currentSlide * 0.5}rem))`,
                  width: 'calc(200% + 2rem)' // 6 cards * (50% width) + gaps
                }}
              >
                {bannerCards.map((card, index) => (
                  <div 
                    key={card.id} 
                    className={`${card.width} flex-shrink-0 bg-gradient-to-br ${card.gradient} rounded-2xl p-6 text-white relative overflow-hidden h-[160px] group hover:shadow-2xl transition-all duration-300 flex items-center`}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                      }}></div>
                    </div>
                    
                    {/* Icon */}
                    <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                      <card.icon className="w-20 h-20" />
                    </div>
                    
                    <div className="relative z-10 max-w-[70%]">
                      <p className="text-lg font-semibold leading-tight mb-4">
                        {card.title}
                      </p>
                      <Button 
                        className={`${card.bgColor} ${card.buttonColor} hover:bg-gray-100 text-sm px-5 py-2.5 h-auto rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-300`}
                      >
                        {card.buttonText}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 border border-gray-200 z-20"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 border border-gray-200 z-20"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
              
              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                {Array.from({ length: Math.ceil(bannerCards.length / 2) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-white scale-125' : 'bg-white/60 hover:bg-white/80'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Sort Section at the Top */}
      <div className="bg-white border-t border-gray-100 py-6">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              {/* Left Section */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-xl font-medium"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                </button>
                
                <div className="hidden lg:flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <Filter className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Filter & Sort</div>
                    <div className="font-bold text-gray-900">Refine Results</div>
                  </div>
                </div>
                
                {hasActiveFilters() && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </button>
                )}
              </div>
              
              {/* Right Section - Sort & View */}
              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2.5 rounded-lg transition-all duration-300 ${viewMode === "grid" ? "bg-white shadow-lg text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2.5 rounded-lg transition-all duration-300 ${viewMode === "list" ? "bg-white shadow-lg text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                {/* Sorting Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => document.getElementById("sort-dropdown")?.classList.toggle("hidden")}
                    className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-b from-white to-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 min-w-[200px]"
                  >
                    <div className="text-left">
                      <span className="text-gray-600 text-sm block font-medium">Sort by</span>
                      <span className="font-semibold text-gray-900 text-base">
                        {sortOptions.find(opt => opt.value === sortBy)?.label}
                      </span>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  </button>
                  
                  <div id="sort-dropdown" className="hidden absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50">
                    <div className="py-2">
                      {sortOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value);
                              document.getElementById("sort-dropdown")?.classList.add("hidden");
                            }}
                            className={`w-full text-left px-5 py-4 text-sm hover:bg-gray-50 transition-all duration-200 flex items-center justify-between ${
                              sortBy === option.value 
                                ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 font-semibold' 
                                : 'text-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {typeof Icon === 'string' ? (
                                <span className="text-lg">{Icon}</span>
                              ) : (
                                <Icon className="w-4 h-4" />
                              )}
                              <span>{option.label}</span>
                            </div>
                            {sortBy === option.value && (
                              <Check className="w-5 h-5 text-blue-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Options Grid - Desktop */}
            <div className="hidden lg:grid grid-cols-5 gap-4">
              <FilterDropdown type="brand" label="Brand" value={selectedFilters.brand} />
              <FilterDropdown type="condition" label="Condition" value={selectedFilters.condition} />
              <FilterDropdown type="storage" label="Storage" value={selectedFilters.storage} />
              <FilterDropdown type="priceRange" label="Price Range" value={selectedFilters.priceRange} />
              <FilterDropdown type="availability" label="Availability" value={selectedFilters.availability} />
            </div>

            {/* Active filters display */}
            {hasActiveFilters() && (
              <div className="mt-6 flex flex-wrap gap-2">
                {Object.entries(selectedFilters).map(([key, value]) => {
                  if (value !== "ALL") {
                    const option = filterOptions[key as keyof typeof filterOptions]
                      ?.find(opt => opt.value === value);
                    return (
                      <div
                        key={key}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-xl text-sm font-medium shadow-sm"
                      >
                        <span className="capitalize">{key}:</span>
                        <span className="font-semibold">{option?.label}</span>
                        <button
                          onClick={() => handleFilterSelect(key as keyof typeof selectedFilters, "ALL")}
                          className="ml-1 text-blue-500 hover:text-blue-700 hover:scale-110 transition-transform"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Sections - Just like the design image */}
      <div className="container mx-auto px-4 py-8">
        
        {/* Section 1: New Arrivals */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
              <p className="text-gray-600 mt-1">
                Showing {newArrivals.length} products
                {hasActiveFilters() && " matching your filters"}
              </p>
            </div>
            <Button 
              variant="ghost" 
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          {newArrivals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-gray-500">No new arrivals match your filters</p>
            </div>
          )}
        </div>

        {/* Section 2: Popular Products */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Popular Products</h2>
              <p className="text-gray-600 mt-1">
                Showing {popularProducts.length} products
                {hasActiveFilters() && " matching your filters"}
              </p>
            </div>
            <Button 
              variant="ghost" 
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          {popularProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-gray-500">No popular products match your filters</p>
            </div>
          )}
          
          {/* Popular Picks Banner */}
          {popularProducts.length > 0 && (
            <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-bold text-amber-900">Popular Picks Sell Fast!</h3>
                  <p className="text-amber-700">Stay Updated Before They're Gone.</p>
                </div>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  Stay Updated
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Sweet Deals */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Sweet Deals</h2>
              <p className="text-gray-600 mt-1">
                Showing {sweetDeals.length} products
                {hasActiveFilters() && " matching your filters"}
              </p>
            </div>
            <Button 
              variant="ghost" 
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          {sweetDeals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sweetDeals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-gray-500">No sweet deals match your filters</p>
            </div>
          )}
        </div>

        {/* See All Products Section */}
        <div className="text-center py-12">
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Browse All Categories</h2>
            <p className="text-gray-600 mb-8">
              Explore our complete collection of gadgets and tech products
            </p>
            <Link to="/categories">
              <Button 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 px-8 rounded-xl text-lg font-semibold shadow-lg transition-all duration-300"
              >
                See All Products
                <ArrowRight className="w-5 h-5 ml-2" />
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