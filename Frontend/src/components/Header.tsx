import { Search, ShoppingCart, User, Menu, ArrowLeft, ChevronDown, LogIn, UserPlus, Heart, Package, Headphones, HelpCircle, Truck, LogOut, Settings, Bell, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";

interface HeaderProps {
  variant?: "default" | "transparent";
  showBackButton?: boolean;
  title?: string;
}

const Header = ({ 
  variant = "default", 
  showBackButton = false, 
  title,
}: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { totalItems } = useCart();
  const { wishlistProducts } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  
  const wishlistCount = wishlistProducts.length;
  
  const navigate = useNavigate();
  const location = useLocation();
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const getUserInitials = () => {
    if (!user?.username) return "U";
    const names = user.username.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "All Products", path: "/products" },
    { name: "Categories", path: "/categories" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const getHeaderBackground = () => {
    if (variant === "transparent" && !isScrolled) {
      return "bg-transparent backdrop-blur-none";
    }
    if (variant === "default" && !isScrolled) {
      return "bg-[#6426E1]";
    }
    return "bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/60";
  };

  const getTextColor = () => {
    if (variant === "transparent" && !isScrolled) {
      return "text-white";
    }
    if (variant === "default" && !isScrolled) {
      return "text-white";
    }
    return "text-gray-900";
  };

  const getBorderColor = () => {
    if (variant === "transparent" && !isScrolled) {
      return "border-transparent";
    }
    if (variant === "default" && !isScrolled) {
      return "border-purple-700/30";
    }
    return "border-gray-200";
  };

  const getSearchPlaceholderColor = () => {
    if (variant === "transparent" && !isScrolled) {
      return "placeholder-gray-300";
    }
    if (variant === "default" && !isScrolled) {
      return "placeholder-purple-200";
    }
    return "placeholder-gray-500";
  };

  const handleLogin = () => {
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const handleSignup = () => {
    navigate("/signup");
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  const isTransparentUnscrolled = variant === "transparent" && !isScrolled;
  const isDefaultUnscrolled = variant === "default" && !isScrolled;

  return (
    <header className={`sticky top-0 z-50 w-full border-b ${getBorderColor()} ${getHeaderBackground()} transition-all duration-300 shadow-sm`}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo */}
          <div className="flex items-center gap-3">
            {showBackButton ? (
              <button
                onClick={() => navigate(-1)}
                className={`flex items-center gap-2 ${isTransparentUnscrolled ? "text-white hover:text-gray-200" : isDefaultUnscrolled ? "text-white hover:text-purple-100" : "text-gray-600 hover:text-gray-900"} transition-colors`}
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline text-sm font-medium">Back</span>
              </button>
            ) : (
              <Link to="/" className="flex items-center gap-3 group">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 ${isDefaultUnscrolled ? "bg-white" : "bg-gradient-to-br from-blue-600 to-purple-600"} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200`}>
                  <span className={`font-bold text-sm sm:text-lg ${isDefaultUnscrolled ? "text-[#6426E1]" : "text-white"}`}>
                    AG
                  </span>
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className={`font-bold text-lg leading-tight ${getTextColor()} ${isDefaultUnscrolled ? "group-hover:text-purple-100" : "group-hover:text-blue-600"} transition-colors`}>
                    Aby Gadgets
                  </span>
                  <span className={`text-xs ${isDefaultUnscrolled ? "text-purple-200" : "text-gray-500"}`}>
                    Premium Tech Store
                  </span>
                </div>
              </Link>
            )}
            
            {title && (
              <div className="hidden md:flex items-center ml-2">
                <span className={`text-lg font-bold ${getTextColor()} border-l ${isDefaultUnscrolled ? "border-purple-300/50" : "border-gray-300"} pl-4`}>
                  {title}
                </span>
              </div>
            )}
          </div>

          {/* Center Navigation - Desktop */}
          <nav className="hidden lg:flex items-center justify-center flex-1">
            <div className="flex items-center gap-0.5">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`text-sm font-medium px-3.5 py-2 rounded-lg transition-all duration-200 relative group ${
                      isActive
                        ? isTransparentUnscrolled
                          ? "bg-white/20 text-white"
                          : isDefaultUnscrolled
                          ? "bg-white/20 text-white shadow-sm"
                          : "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 shadow-sm"
                        : isTransparentUnscrolled
                        ? "text-white/80 hover:text-white hover:bg-white/10"
                        : isDefaultUnscrolled
                        ? "text-white/90 hover:text-white hover:bg-white/10"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {link.name}
                    {!isActive && (
                      <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 ${isDefaultUnscrolled ? "bg-white" : "bg-gradient-to-r from-blue-500 to-purple-500"} transition-all duration-300 group-hover:w-3/4 ${isTransparentUnscrolled ? "group-hover:bg-white" : ""}`}></span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Right Section - Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search - Desktop */}
            <div className="hidden md:flex items-center relative group">
              <Search className={`absolute left-3.5 h-4 w-4 ${isTransparentUnscrolled ? "text-gray-300 group-hover:text-white" : isDefaultUnscrolled ? "text-purple-200 group-hover:text-white" : "text-gray-400 group-hover:text-blue-500"} transition-colors`} />
              <input
                type="text"
                placeholder="Search..."
                className={`pl-10 pr-4 py-2.5 text-sm ${isTransparentUnscrolled ? "bg-white/15 text-white border-white/30 hover:bg-white/20 focus:bg-white/25" : isDefaultUnscrolled ? "bg-white/20 text-white border-white/30 hover:bg-white/30 focus:bg-white/40" : "bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100 focus:bg-white"} rounded-xl w-44 focus:outline-none focus:ring-2 ${isDefaultUnscrolled ? "focus:ring-white/30" : "focus:ring-blue-500/30"} ${getSearchPlaceholderColor()} border transition-all duration-300`}
              />
            </div>

            {/* Search Icon - Mobile */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={`md:hidden ${isTransparentUnscrolled ? "text-white hover:text-white hover:bg-white/10" : isDefaultUnscrolled ? "text-white hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"} rounded-xl`}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Wishlist */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={`relative ${isTransparentUnscrolled ? "text-white hover:text-white hover:bg-white/10" : isDefaultUnscrolled ? "text-white hover:text-pink-100 hover:bg-white/10" : "text-gray-600 hover:text-pink-500 hover:bg-pink-50"} rounded-xl`}
              onClick={() => navigate("/wishlist")}
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-pink-500 to-rose-500 text-white text-xs rounded-full flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Button>

            {/* Cart */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={`relative ${isTransparentUnscrolled ? "text-white hover:text-white hover:bg-white/10" : isDefaultUnscrolled ? "text-white hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"} rounded-xl`}
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className={`absolute -top-1 -right-1 w-5 h-5 ${isDefaultUnscrolled ? "bg-yellow-400 text-[#6426E1]" : "bg-gradient-to-br from-blue-500 to-blue-600 text-white"} text-xs rounded-full flex items-center justify-center shadow-sm`}>
                  {totalItems}
                </span>
              )}
            </Button>

            {/* User Section - Desktop */}
            <div className="hidden md:block relative" ref={userDropdownRef}>
              {isAuthenticated ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`relative ${isTransparentUnscrolled ? "text-white hover:text-white hover:bg-white/10" : isDefaultUnscrolled ? "text-white hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"} rounded-xl group`}
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  >
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${isDefaultUnscrolled ? "bg-white text-[#6426E1]" : "bg-gradient-to-br from-blue-500 to-purple-500 text-white"} flex items-center justify-center font-semibold text-sm group-hover:scale-105 transition-transform duration-200`}>
                      {getUserInitials()}
                    </div>
                    <ChevronDown className={`absolute -bottom-1 -right-1 h-3 w-3 bg-white rounded-full border ${isTransparentUnscrolled ? "border-white/30" : isDefaultUnscrolled ? "border-white" : "border-gray-300"} ${isDefaultUnscrolled ? "text-[#6426E1]" : "text-gray-600"} ${userDropdownOpen ? 'rotate-180' : ''} transition-transform duration-200`} />
                  </Button>

                  {/* User Dropdown */}
                  {userDropdownOpen && (
                    <div className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-xl border ${isTransparentUnscrolled ? "bg-gray-900/95 backdrop-blur-md border-white/20" : "bg-white border-gray-200"}`}>
                      <div className="p-5 border-b border-gray-200/50">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-base shadow-lg">
                            {getUserInitials()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate">{user?.username}</h3>
                            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <div className="text-center p-2 bg-blue-50 rounded-lg">
                            <p className="text-xs text-gray-500">Orders</p>
                            <p className="font-bold text-gray-900">0</p>
                          </div>
                          <div className="text-center p-2 bg-purple-50 rounded-lg">
                            <p className="text-xs text-gray-500">Wishlist</p>
                            <p className="font-bold text-gray-900">{wishlistCount}</p>
                          </div>
                          <div className="text-center p-2 bg-green-50 rounded-lg">
                            <p className="text-xs text-gray-500">Points</p>
                            <p className="font-bold text-gray-900">0</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3">
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <button
                            onClick={() => { navigate("/profile"); setUserDropdownOpen(false); }}
                            className="flex flex-col items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                          >
                            <User className="h-5 w-5 text-gray-600 mb-1" />
                            <span className="text-xs font-medium text-gray-700">Profile</span>
                          </button>
                          <button
                            onClick={() => { navigate("/wishlist"); setUserDropdownOpen(false); }}
                            className="flex flex-col items-center p-3 rounded-xl bg-pink-50 hover:bg-pink-100 transition-colors duration-200"
                          >
                            <Heart className="h-5 w-5 text-pink-500 mb-1" />
                            <span className="text-xs font-medium text-gray-700">Wishlist</span>
                          </button>
                        </div>

                        <div className="space-y-1">
                          {[
                            { icon: Package, label: "My Orders", path: "/orders" },
                            { icon: Truck, label: "Track Order", path: "/track-order" },
                            { icon: Bell, label: "Notifications", path: "/notifications" },
  
                            { icon: HelpCircle, label: "Help Center", path: "/help" },
                          ].map((item) => (
                            <button
                              key={item.label}
                              onClick={() => { navigate(item.path); setUserDropdownOpen(false); }}
                              className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                                isTransparentUnscrolled
                                  ? "text-gray-300 hover:bg-white/10 hover:text-white"
                                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              }`}
                            >
                              <item.icon className="h-4 w-4 flex-shrink-0" />
                              <span className="flex-1 text-left truncate">{item.label}</span>
                              <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            </button>
                          ))}
                        </div>

                        <div className={`h-px ${isTransparentUnscrolled ? "bg-white/20" : "bg-gray-200"} my-2`} />

                        <button
                          onClick={handleLogout}
                          className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                            isTransparentUnscrolled
                              ? "text-rose-400 hover:bg-white/10"
                              : "text-rose-500 hover:bg-rose-50"
                          }`}
                        >
                          <LogOut className="h-4 w-4" />
                          <span className="flex-1 text-left">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    className={`${isTransparentUnscrolled ? "text-white hover:text-white hover:bg-white/10" : isDefaultUnscrolled ? "text-white hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"} rounded-xl px-3.5`}
                    onClick={handleLogin}
                  >
                    <LogIn className="h-4 w-4 mr-1.5" />
                    <span className="hidden sm:inline">Login</span>
                  </Button>
                  <Button 
                    className={`rounded-xl px-3.5 ${
                      isTransparentUnscrolled
                        ? "bg-white text-gray-900 hover:bg-gray-100"
                        : isDefaultUnscrolled
                        ? "bg-white text-[#6426E1] hover:bg-gray-100"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                    }`}
                    onClick={handleSignup}
                  >
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    <span className="hidden sm:inline">Sign Up</span>
                    <span className="sm:hidden">Signup</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={`lg:hidden ${isTransparentUnscrolled ? "text-white hover:text-white hover:bg-white/10" : isDefaultUnscrolled ? "text-white hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"} rounded-xl`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`lg:hidden py-4 ${isTransparentUnscrolled ? "bg-black/95 backdrop-blur-md border-white/20" : isDefaultUnscrolled ? "bg-[#6426E1] border-purple-700/30" : "bg-white border-gray-200"} border-t`}>
            <div className="px-4 mb-4">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isTransparentUnscrolled ? "text-gray-300" : isDefaultUnscrolled ? "text-purple-200" : "text-gray-400"}`} />
                <input
                  type="text"
                  placeholder="Search products..."
                  className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 ${
                    isTransparentUnscrolled
                      ? "bg-white/20 text-white border-white/30 focus:ring-white/30"
                      : isDefaultUnscrolled
                      ? "bg-white/20 text-white border-white/30 focus:ring-white/30"
                      : "bg-gray-100 text-gray-900 border-gray-200 focus:ring-blue-500"
                  } ${getSearchPlaceholderColor()} border`}
                />
              </div>
            </div>

            <nav className="px-4 mb-6">
              <div className="space-y-2">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`block text-sm font-medium px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? isTransparentUnscrolled
                            ? "bg-white/30 text-white"
                            : isDefaultUnscrolled
                            ? "bg-white/20 text-white"
                            : "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 shadow-sm"
                          : isTransparentUnscrolled
                          ? "text-white/80 hover:bg-white/10 hover:text-white"
                          : isDefaultUnscrolled
                          ? "text-white/90 hover:bg-white/10 hover:text-white"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="px-4 pt-4 border-t border-white/20">
              <div className="space-y-2.5">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${isTransparentUnscrolled ? "text-white hover:text-white hover:bg-white/10" : isDefaultUnscrolled ? "text-white hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"} rounded-xl py-3`}
                  onClick={() => { navigate("/wishlist"); setMobileMenuOpen(false); }}
                >
                  <Heart className="h-4 w-4 mr-3" />
                  Wishlist
                  {wishlistCount > 0 && (
                    <span className="ml-auto bg-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
                
                {isAuthenticated ? (
                  <>
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start ${isTransparentUnscrolled ? "text-white hover:text-white hover:bg-white/10" : isDefaultUnscrolled ? "text-white hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"} rounded-xl py-3`}
                      onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }}
                    >
                      <User className="h-4 w-4 mr-3" />
                      My Account
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start ${isTransparentUnscrolled ? "text-white hover:text-white hover:bg-white/10" : isDefaultUnscrolled ? "text-white hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"} rounded-xl py-3`}
                      onClick={() => { navigate("/orders"); setMobileMenuOpen(false); }}
                    >
                      <Package className="h-4 w-4 mr-3" />
                      My Orders
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start ${isTransparentUnscrolled ? "text-white hover:text-white hover:bg-white/10" : isDefaultUnscrolled ? "text-white hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"} rounded-xl py-3`}
                      onClick={() => { navigate("/settings"); setMobileMenuOpen(false); }}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start ${isTransparentUnscrolled ? "text-rose-300 hover:text-rose-200 hover:bg-white/10" : isDefaultUnscrolled ? "text-rose-300 hover:text-rose-200 hover:bg-white/10" : "text-rose-500 hover:text-rose-600 hover:bg-rose-50"} rounded-xl py-3`}
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start ${isTransparentUnscrolled ? "text-white hover:text-white hover:bg-white/10" : isDefaultUnscrolled ? "text-white hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"} rounded-xl py-3`}
                      onClick={handleLogin}
                    >
                      <LogIn className="h-4 w-4 mr-3" />
                      Login
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start ${isTransparentUnscrolled ? "text-white hover:text-white hover:bg-white/10" : isDefaultUnscrolled ? "text-white hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"} rounded-xl py-3`}
                      onClick={handleSignup}
                    >
                      <UserPlus className="h-4 w-4 mr-3" />
                      Sign Up
                    </Button>
                  </>
                )}
                
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${isTransparentUnscrolled ? "text-white hover:text-white hover:bg-white/10" : isDefaultUnscrolled ? "text-white hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"} rounded-xl py-3`}
                  onClick={() => { navigate("/help"); setMobileMenuOpen(false); }}
                >
                  <HelpCircle className="h-4 w-4 mr-3" />
                  Help Center
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;