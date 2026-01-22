import { Search, ShoppingCart, User, Menu, ArrowLeft, ChevronDown, LogIn, UserPlus, Heart, Package, Headphones, HelpCircle, Truck, LogOut, Settings, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

interface HeaderProps {
  variant?: "default" | "transparent";
  showBackButton?: boolean;
  title?: string;
  isLoggedIn?: boolean;
}

const Header = ({ 
  variant = "default", 
  showBackButton = false, 
  title,
  isLoggedIn = false
}: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(3);
  const [isScrolled, setIsScrolled] = useState(false);
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation links
  const navLinks = [
    { name: "Home", path: "/", active: location.pathname === "/" },
    { name: "Products", path: "/products", active: location.pathname === "/products" },
    { name: "Categories", path: "/categories", active: location.pathname.startsWith("/category") },
    { name: "About", path: "/about", active: location.pathname === "/about" },
    { name: "Contact", path: "/contact", active: location.pathname === "/contact" },
  ];

  // Style helpers
  const getHeaderBackground = () => {
    if (variant === "transparent" && !isScrolled) {
      return "bg-transparent backdrop-blur-none";
    }
    return "bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/60";
  };

  const getTextColor = () => {
    if (variant === "transparent" && !isScrolled) {
      return "text-white";
    }
    return "text-gray-900";
  };

  const getBorderColor = () => {
    if (variant === "transparent" && !isScrolled) {
      return "border-transparent";
    }
    return "border-gray-200";
  };

  const getSearchPlaceholderColor = () => {
    if (variant === "transparent" && !isScrolled) {
      return "placeholder-gray-300";
    }
    return "placeholder-gray-500";
  };

  // Event handlers
  const handleLogin = () => {
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const handleSignup = () => {
    navigate("/signup");
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    console.log("User logged out");
    setUserDropdownOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 w-full border-b ${getBorderColor()} ${getHeaderBackground()} transition-all duration-300 shadow-sm`}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo */}
          <div className="flex items-center gap-3">
            {showBackButton ? (
              <button
                onClick={() => navigate(-1)}
                className={`flex items-center gap-2 ${variant === "transparent" && !isScrolled ? "text-white hover:text-gray-200" : "text-gray-600 hover:text-gray-900"} transition-colors`}
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline text-sm font-medium">Back</span>
              </button>
            ) : (
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                  <span className="text-white font-bold text-sm sm:text-lg">AG</span>
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className={`font-bold text-lg leading-tight ${getTextColor()} group-hover:text-blue-600 transition-colors`}>
                    Aby Gadgets
                  </span>
                  <span className="text-xs text-gray-500">Premium Tech Store</span>
                </div>
              </Link>
            )}
            
            {title && (
              <div className="hidden md:flex items-center ml-2">
                <span className={`text-lg font-bold ${getTextColor()} border-l border-gray-300 pl-4`}>
                  {title}
                </span>
              </div>
            )}
          </div>

          {/* Center Navigation - Desktop */}
          <nav className="hidden lg:flex items-center justify-center flex-1">
            <div className="flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium px-3.5 py-2 rounded-lg transition-all duration-200 relative group ${
                    link.active
                      ? variant === "transparent" && !isScrolled
                        ? "bg-white/20 text-white"
                        : "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 shadow-sm"
                      : variant === "transparent" && !isScrolled
                      ? "text-white/80 hover:text-white hover:bg-white/10"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {link.name}
                  {!link.active && (
                    <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-3/4 ${variant === "transparent" && !isScrolled ? "group-hover:bg-white" : ""}`}></span>
                  )}
                </Link>
              ))}
            </div>
          </nav>

          {/* Right Section - Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search - Desktop */}
            <div className="hidden md:flex items-center relative group">
              <Search className={`absolute left-3.5 h-4 w-4 ${variant === "transparent" && !isScrolled ? "text-gray-300 group-hover:text-white" : "text-gray-400 group-hover:text-blue-500"} transition-colors`} />
              <input
                type="text"
                placeholder="Search..."
                className={`pl-10 pr-4 py-2.5 text-sm ${variant === "transparent" && !isScrolled ? "bg-white/15 text-white border-white/30 hover:bg-white/20 focus:bg-white/25" : "bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100 focus:bg-white"} rounded-xl w-44 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${getSearchPlaceholderColor()} border transition-all duration-300`}
              />
            </div>

            {/* Search Icon - Mobile */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={`md:hidden ${variant === "transparent" && !isScrolled ? "text-white hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"} rounded-xl`}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Wishlist */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={`relative ${variant === "transparent" && !isScrolled ? "text-white hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-pink-500 hover:bg-pink-50"} rounded-xl`}
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
              className={`relative ${variant === "transparent" && !isScrolled ? "text-white hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"} rounded-xl`}
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs rounded-full flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </Button>

            {/* User Section - Desktop */}
            <div className="hidden md:block relative" ref={userDropdownRef}>
              {isLoggedIn ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`relative ${variant === "transparent" && !isScrolled ? "text-white hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"} rounded-xl group`}
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm group-hover:scale-105 transition-transform duration-200">
                      JS
                    </div>
                    <ChevronDown className={`absolute -bottom-1 -right-1 h-3 w-3 bg-white rounded-full border ${variant === "transparent" && !isScrolled ? "border-white/30" : "border-gray-300"} ${userDropdownOpen ? 'rotate-180' : ''} transition-transform duration-200`} />
                  </Button>

                  {/* User Dropdown */}
                  {userDropdownOpen && (
                    <div className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-xl border ${variant === "transparent" && !isScrolled ? "bg-gray-900/95 backdrop-blur-md border-white/20" : "bg-white border-gray-200"}`}>
                      <div className="p-5 border-b border-gray-200/50">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-base shadow-lg">
                            JS
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate">John Smith</h3>
                            <p className="text-sm text-gray-500 truncate">john.smith@email.com</p>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <div className="text-center p-2 bg-blue-50 rounded-lg">
                            <p className="text-xs text-gray-500">Orders</p>
                            <p className="font-bold text-gray-900">12</p>
                          </div>
                          <div className="text-center p-2 bg-purple-50 rounded-lg">
                            <p className="text-xs text-gray-500">Wishlist</p>
                            <p className="font-bold text-gray-900">3</p>
                          </div>
                          <div className="text-center p-2 bg-green-50 rounded-lg">
                            <p className="text-xs text-gray-500">Points</p>
                            <p className="font-bold text-gray-900">1.2k</p>
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
                            {wishlistCount > 0 && (
                              <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                {wishlistCount}
                              </span>
                            )}
                          </button>
                        </div>

                        <div className="space-y-1">
                          {[
                            { icon: Package, label: "My Orders", path: "/orders" },
                            { icon: Truck, label: "Track Order", path: "/track-order" },
                            { icon: Bell, label: "Notifications", path: "/notifications" },
                            { icon: Settings, label: "Settings", path: "/settings" },
                            { icon: Headphones, label: "Support", path: "/support" },
                            { icon: HelpCircle, label: "Help Center", path: "/help" },
                          ].map((item) => (
                            <button
                              key={item.label}
                              onClick={() => { navigate(item.path); setUserDropdownOpen(false); }}
                              className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                                variant === "transparent" && !isScrolled
                                  ? "text-gray-300 hover:bg-white/10 hover:text-white"
                                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              }`}
                            >
                              <item.icon className="h-4 w-4 flex-shrink-0" />
                              <span className="flex-1 text-left truncate">{item.label}</span>
                              <ChevronDown className="h-3 w-3 rotate-270 text-gray-400 flex-shrink-0" />
                            </button>
                          ))}
                        </div>

                        <div className={`h-px ${variant === "transparent" && !isScrolled ? "bg-white/20" : "bg-gray-200"} my-2`} />

                        <button
                          onClick={handleLogout}
                          className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                            variant === "transparent" && !isScrolled
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
                    className={`${variant === "transparent" && !isScrolled ? "text-white hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"} rounded-xl px-3.5`}
                    onClick={handleLogin}
                  >
                    <LogIn className="h-4 w-4 mr-1.5" />
                    <span className="hidden sm:inline">Login</span>
                  </Button>
                  <Button 
                    className={`rounded-xl px-3.5 ${
                      variant === "transparent" && !isScrolled
                        ? "bg-white text-gray-900 hover:bg-gray-100"
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
              className={`lg:hidden ${variant === "transparent" && !isScrolled ? "text-white hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"} rounded-xl`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`lg:hidden py-4 ${variant === "transparent" && !isScrolled ? "bg-black/95 backdrop-blur-md border-white/20" : "bg-white border-gray-200"} border-t`}>
            <div className="px-4 mb-4">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${variant === "transparent" && !isScrolled ? "text-gray-300" : "text-gray-400"}`} />
                <input
                  type="text"
                  placeholder="Search products..."
                  className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    variant === "transparent" && !isScrolled
                      ? "bg-white/20 text-white border-white/30"
                      : "bg-gray-100 text-gray-900 border-gray-200"
                  } ${getSearchPlaceholderColor()} border`}
                />
              </div>
            </div>

            <nav className="px-4 mb-6">
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`block text-sm font-medium px-4 py-3 rounded-xl transition-all duration-200 ${
                      link.active
                        ? variant === "transparent" && !isScrolled
                          ? "bg-white/30 text-white"
                          : "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 shadow-sm"
                        : variant === "transparent" && !isScrolled
                        ? "text-white/80 hover:bg-white/10 hover:text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </nav>

            <div className="px-4 pt-4 border-t border-white/20">
              <div className="space-y-2.5">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${variant === "transparent" && !isScrolled ? "text-white hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"} rounded-xl py-3`}
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
                
                {isLoggedIn ? (
                  <>
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start ${variant === "transparent" && !isScrolled ? "text-white hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"} rounded-xl py-3`}
                      onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }}
                    >
                      <User className="h-4 w-4 mr-3" />
                      My Account
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start ${variant === "transparent" && !isScrolled ? "text-white hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"} rounded-xl py-3`}
                      onClick={() => { navigate("/orders"); setMobileMenuOpen(false); }}
                    >
                      <Package className="h-4 w-4 mr-3" />
                      My Orders
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start ${variant === "transparent" && !isScrolled ? "text-white hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"} rounded-xl py-3`}
                      onClick={() => { navigate("/settings"); setMobileMenuOpen(false); }}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start ${variant === "transparent" && !isScrolled ? "text-rose-400 hover:text-rose-300 hover:bg-white/10" : "text-rose-500 hover:text-rose-600 hover:bg-rose-50"} rounded-xl py-3`}
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
                      className={`w-full justify-start ${variant === "transparent" && !isScrolled ? "text-white hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"} rounded-xl py-3`}
                      onClick={handleLogin}
                    >
                      <LogIn className="h-4 w-4 mr-3" />
                      Login
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start ${variant === "transparent" && !isScrolled ? "text-white hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"} rounded-xl py-3`}
                      onClick={handleSignup}
                    >
                      <UserPlus className="h-4 w-4 mr-3" />
                      Sign Up
                    </Button>
                  </>
                )}
                
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${variant === "transparent" && !isScrolled ? "text-white hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"} rounded-xl py-3`}
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