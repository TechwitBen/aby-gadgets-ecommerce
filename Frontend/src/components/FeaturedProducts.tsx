import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ShoppingCart, Star, Heart, Zap, 
  Sparkles, TrendingUp, ArrowRight,
  Check, Clock, Eye, Tag,
  Battery, Camera, Cpu, Smartphone,
  ChevronRight, Slash, Percent,
  ShieldCheck, TrendingUp as TrendingIcon,
  Timer, Monitor, Tablet, Headphones,
  Watch, Gamepad, Speaker, HardDrive,
  BatteryCharging
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Product data
const featuredProducts = {
  newArrivals: [
    {
      id: 1,
      name: "iPhone 16 Pro Max",
      brand: "Apple",
      type: "smartphone",
      price: 129999,
      rating: 4.8,
      reviews: 342,
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop",
      image2: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
      storage: "256GB",
      camera: "48MP Triple Camera",
      condition: "New", 
      available: true,
      stock: 12
    },
    {
      id: 2,
      name: "Samsung Galaxy S24 Ultra",
      brand: "Samsung",
      type: "smartphone",
      price: 119999,
      rating: 4.7,
      reviews: 289,
      image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop",
      image2: "https://images.unsplash.com/photo-1546054451-aa264c0c1eb4?w=400&h=400&fit=crop",
      storage: "512GB",
      screenSize: "6.8\"",
      camera: "200MP Pro Camera",
      condition: "New", 
      available: true,
      stock: 18
    },
    {
      id: 3,
      name: "MacBook Pro 16-inch",
      brand: "Apple",
      type: "laptop",
      price: 1899995,
      rating: 4.9,
      reviews: 245,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
      image2: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop",
      storage: "1TB SSD",
      processor: "M3 Pro Chip",
      condition: "New", 
      available: true,
      stock: 8
    },
    {
      id: 4,
      name: "Sony WH-1000XM5",
      brand: "Sony",
      type: "headphones",
      price: 34995,
      rating: 4.9,
      reviews: 421,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      image2: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop",
      battery: "30hrs battery",
      features: "Industry-leading ANC",
      condition: "New", 
      available: true,
      stock: 36
    }
  ],
  deals: [
    {
      id: 5,
      name: "iPhone 15 Pro",
      brand: "Apple",
      type: "smartphone",
      price: 89999,
      originalPrice: 119999,
      discount: 25,
      rating: 4.7,
      reviews: 456,
      image: "https://images.unsplash.com/photo-1592910147752-5b3a9a5e1f6e?w=400&h=400&fit=crop",
      image2: "https://images.unsplash.com/photo-1546054451-aa264c0c1eb4?w=400&h=400&fit=crop",
      storage: "256GB",
      camera: "48MP Pro Camera",
      condition: "New", 
      available: true,
      stock: 6,
      timeLeft: 43200,
      flashSale: true
    },
    {
      id: 6,
      name: "Samsung Galaxy S23 Ultra",
      brand: "Samsung",
      type: "smartphone",
      price: 79999,
      originalPrice: 109999,
      discount: 27,
      rating: 4.8,
      reviews: 512,
      image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop",
      image2: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
      storage: "512GB",
      camera: "200MP Pro Camera",
      condition: "New", 
      available: true,
      stock: 9,
      timeLeft: 21600,
      flashSale: true
    },
    {
      id: 7,
      name: "Dell XPS 15",
      brand: "Dell",
      type: "laptop",
      price: 1299995,
      originalPrice: 1599995,
      discount: 19,
      rating: 4.7,
      reviews: 178,
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
      image2: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=400&h=400&fit=crop",
      storage: "1TB SSD",
      processor: "Intel i9 13th Gen",
      condition: "New", 
      available: true,
      stock: 5,
      timeLeft: 14400,
      flashSale: true
    },
    {
      id: 8,
      name: "AirPods Pro 2",
      brand: "Apple",
      type: "earbuds",
      price: 19999,
      originalPrice: 29999,
      discount: 33,
      rating: 4.8,
      reviews: 891,
      image: "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=400&h=400&fit=crop",
      image2: "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=400&h=400&fit=crop",
      battery: "30hrs with case",
      features: "Active Noise Cancellation",
      condition: "New", 
      available: true,
      stock: 42,
      timeLeft: 28800,
      flashSale: true
    }
  ]
};

interface FeaturedProductsProps {
  showViewAll?: boolean;
}

const FeaturedProducts = ({ showViewAll = true }: FeaturedProductsProps) => {
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<{[key: number]: number}>({});

  // Initialize timers only for deals section
  useEffect(() => {
    const initialTimes: {[key: number]: number} = {};
    
    featuredProducts.deals.forEach(product => {
      if (product.timeLeft) {
        initialTimes[product.id] = product.timeLeft;
      }
    });
    
    setTimeLeft(initialTimes);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTimes = {...prev};
        Object.keys(newTimes).forEach(id => {
          if (newTimes[Number(id)] > 0) {
            newTimes[Number(id)] -= 1;
          }
        });
        return newTimes;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  const toggleWishlist = (productId: number) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return { hours, minutes, seconds: secs };
  };

  // Get type icon based on product type
  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'smartphone': return Smartphone;
      case 'laptop': return Monitor;
      case 'tablet': return Tablet;
      case 'earbuds': return Headphones;
      case 'headphones': return Headphones;
      case 'smartwatch': return Watch;
      case 'gaming': return Gamepad;
      case 'speaker': return Speaker;
      default: return Smartphone;
    }
  };

  // Get type color based on product type
  const getTypeColor = (type: string) => {
    switch(type) {
      case 'smartphone': return 'bg-blue-100 text-blue-600';
      case 'laptop': return 'bg-purple-100 text-purple-600';
      case 'tablet': return 'bg-green-100 text-green-600';
      case 'earbuds': return 'bg-amber-100 text-amber-600';
      case 'headphones': return 'bg-orange-100 text-orange-600';
      case 'smartwatch': return 'bg-pink-100 text-pink-600';
      case 'gaming': return 'bg-red-100 text-red-600';
      case 'speaker': return 'bg-indigo-100 text-indigo-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Get two specifications for each product type
  const getTwoSpecs = (product: any) => {
    const specs = [];
    
    if (product.storage) {
      specs.push({ label: 'Storage', value: product.storage, icon: HardDrive });
    }
    
    if (product.camera) {
      specs.push({ label: 'Camera', value: product.camera, icon: Camera });
    } else if (product.screenSize) {
      specs.push({ label: 'Display', value: product.screenSize, icon: Monitor });
    } else if (product.processor) {
      specs.push({ label: 'Processor', value: product.processor, icon: Cpu });
    } else if (product.battery) {
      specs.push({ label: 'Battery', value: product.battery, icon: BatteryCharging });
    } else if (product.features) {
      specs.push({ label: 'Feature', value: product.features, icon: Zap });
    }
    
    return specs.slice(0, 2);
  };

  const sections = [
    {
      id: 'newArrivals' as const,
      title: 'New Arrivals',
      icon: Sparkles,
      color: '#0099ff',
      gradient: 'from-[#0099ff] to-[#00ccff]',
      products: featuredProducts.newArrivals,
      description: "Latest devices just arrived in stock"
    },
    {
      id: 'deals' as const,
      title: 'Sweet Deals',
      icon: Zap,
      color: '#ff3366',
      gradient: 'from-[#ff3366] to-[#ff6699]',
      products: featuredProducts.deals,
      description: "Limited time offers you can't miss"
    }
  ];

  const TimerDisplay = () => {
    const minTimeLeft = Math.min(...featuredProducts.deals.map(p => timeLeft[p.id] || p.timeLeft || 0));
    const { hours, minutes, seconds } = formatTime(minTimeLeft);
    const isExpired = minTimeLeft <= 0;

    if (isExpired) {
      return (
        <div className="bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200 px-6 py-4 rounded-xl">
          <div className="flex items-center justify-center gap-3">
            <Timer className="w-5 h-5 text-gray-500" />
            <span className="text-base font-medium text-gray-700">Flash Sale Ended</span>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 px-6 py-4 rounded-xl mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Timer className="w-5 h-5 text-red-500" />
            <div>
              <div className="text-lg font-semibold text-gray-900">Flash Sale Ending Soon</div>
              <div className="text-sm text-gray-600">Hurry up! These offers won't last long.</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="text-center">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 min-w-[60px]">
                  <div className="text-2xl font-bold text-gray-900">{hours.toString().padStart(2, '0')}</div>
                  <div className="text-xs text-gray-500 mt-1">Hours</div>
                </div>
              </div>
              <div className="text-xl font-bold text-gray-400">:</div>
              <div className="text-center">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 min-w-[60px]">
                  <div className="text-2xl font-bold text-gray-900">{minutes.toString().padStart(2, '0')}</div>
                  <div className="text-xs text-gray-500 mt-1">Minutes</div>
                </div>
              </div>
              <div className="text-xl font-bold text-gray-400">:</div>
              <div className="text-center">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 min-w-[60px]">
                  <div className="text-2xl font-bold text-gray-900">{seconds.toString().padStart(2, '0')}</div>
                  <div className="text-xs text-gray-500 mt-1">Seconds</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProductCard = ({ product, section }: { product: any; section: any }) => {
    const isInWishlist = wishlist.includes(product.id);
    const TypeIcon = getTypeIcon(product.type);
    const typeColorClass = getTypeColor(product.type);
    const specs = getTwoSpecs(product);
    const [isQuickView, setIsQuickView] = useState(false);

    return (
      <div 
        className="group relative bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
        onMouseEnter={() => setIsQuickView(true)}
        onMouseLeave={() => setIsQuickView(false)}
      >
        {/* Product Image with Quick View Overlay */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
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
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${typeColorClass}`}>
              <TypeIcon className="w-3 h-3" />
              <span>{product.type.charAt(0).toUpperCase() + product.type.slice(1)}</span>
            </div>
            {section.id === "deals" && product.flashSale && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                FLASH SALE
              </span>
            )}
            {section.id === "newArrivals" && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                NEW
              </span>
            )}
          </div>

          {/* Discount Badge - Only for deals section */}
          {section.id === "deals" && product.discount > 0 && (
            <div className="absolute top-3 right-3">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-center px-3 py-1.5 rounded-lg shadow-xl">
                <div className="text-xs font-semibold">SAVE</div>
                <div className="text-lg font-bold leading-none">
                  ${((product.originalPrice - product.price) / 100).toFixed(0)}
                </div>
              </div>
            </div>
          )}

          {/* Wishlist Button */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            className="absolute bottom-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 border border-gray-200 z-10"
          >
            <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </button>

          {/* Quick View Overlay */}
          {isQuickView && product.available && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-all duration-300">
              <div className="flex flex-col gap-3">
                <Button 
                  className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transform hover:scale-105 transition-all"
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
          {/* Brand and Rating */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${typeColorClass}`}>
                {product.brand}
              </span>
              {product.condition === "New" && (
                <Check className="w-4 h-4 text-green-500" />
              )}
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-gray-900">{product.rating}</span>
              <span className="text-xs text-gray-500">({product.reviews})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 h-12">
            {product.name}
          </h3>

          {/* Two Specifications */}
          <div className="space-y-2 mb-4">
            {specs.map((spec, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                <spec.icon className="w-4 h-4 text-gray-400" />
                <span className="truncate">{spec.value}</span>
              </div>
            ))}
          </div>

          {/* Price Information - Different for deals vs new arrivals */}
          <div className="flex items-center justify-between mb-4 pt-3 border-t border-gray-100">
            <div>
              <div className="text-xl font-bold text-blue-600">
                {formatPrice(product.price)}
              </div>
              {/* Only show original price for deals section */}
              {section.id === "deals" && product.originalPrice && (
                <div className="text-sm text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </div>
              )}
            </div>
            <div className="text-right">
              {/* Only show discount percentage for deals section */}
              {section.id === "deals" && product.discount > 0 && (
                <div className="text-sm font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                  -{product.discount}% OFF
                </div>
              )}
              <div className="text-xs text-gray-500">
                Condition: <span className="font-medium text-gray-700">{product.condition}</span>
              </div>
            </div>
          </div>

          {/* Removed Add to Cart and Details buttons - only overlay remains */}
        </div>
      </div>
    );
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Main Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                 style={{ backgroundColor: '#0099ff', backgroundImage: 'linear-gradient(135deg, #0099ff, #00ccff)' }}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wider uppercase" style={{ color: '#0099ff' }}>
                Featured Collections
              </div>
              <div className="w-16 h-1 rounded-full mx-auto mt-2" style={{ backgroundColor: '#0099ff' }} />
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Discover Premium <span style={{ color: '#0099ff' }}>Gadgets</span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Explore our latest arrivals and exclusive deals
          </p>
        </div>

        {/* New Arrivals Section */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                   style={{ backgroundColor: '#0099ff', backgroundImage: 'linear-gradient(135deg, #0099ff, #00ccff)' }}>
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">New Arrivals</h3>
                <p className="text-gray-600">Latest devices just arrived in stock</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl"
              asChild
            >
              <Link to="/products?category=new-arrivals" className="flex items-center gap-2">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sections[0].products.map((product) => (
              <ProductCard key={product.id} product={product} section={sections[0]} />
            ))}
          </div>
        </div>

        {/* Sweet Deals Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                   style={{ backgroundColor: '#ff3366', backgroundImage: 'linear-gradient(135deg, #ff3366, #ff6699)' }}>
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">Sweet Deals</h3>
                <p className="text-gray-600">Limited time offers you can't miss</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl"
              asChild
            >
              <Link to="/products?category=deals" className="flex items-center gap-2">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Timer Display for Sweet Deals */}
          <TimerDisplay />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sections[1].products.map((product) => (
              <ProductCard key={product.id} product={product} section={sections[1]} />
            ))}
          </div>
        </div>
        
        {/* Removed View All Products Button */}
      </div>
    </section>
  );
};

export default FeaturedProducts;