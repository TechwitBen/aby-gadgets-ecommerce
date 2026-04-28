import {
  Search,
  ShoppingCart,
  Menu,
  ArrowLeft,
  ChevronDown,
  LogIn,
  UserPlus,
  Heart,
  Package,
  HelpCircle,
  Truck,
  LogOut,
  ChevronRight,
  Settings,
  X,
  Bell,
  Home,
  Grid,
  Phone,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { orderService } from "@/services/order.service";
import { NotificationBell } from "@/components/Notificationbell";

import blueLogoImg from "@/assets/blueLogo.png";
import whiteLogoImg from "@/assets/whiteLogo.png";

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
  const [orderCount, setOrderCount] = useState<number>(0);

  const { totalItems } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const getUserInitials = () => {
    if (!user?.username) return "U";
    const names = user.username.split(" ");
    return names.length >= 2
      ? (names[0][0] + names[1][0]).toUpperCase()
      : user.username.substring(0, 2).toUpperCase();
  };

  const fetchOrderCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const orders = await orderService.getMyOrders();
      setOrderCount(orders.length);
    } catch {
      setOrderCount(0);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchOrderCount();
  }, [fetchOrderCount]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "All Products", path: "/products", icon: Grid },
    { name: "Categories", path: "/categories", icon: Grid },
    { name: "About", path: "/about", icon: Info },
    { name: "Contact", path: "/contact", icon: Phone },
  ];

  const getHeaderBackground = () => {
    if (variant === "transparent" && !isScrolled)
      return "bg-transparent backdrop-blur-none";
    if (variant === "default" && !isScrolled) return "bg-[#6426E1]";
    return "bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/60";
  };

  const getTextColor = () => {
    if (variant === "transparent" && !isScrolled) return "text-white";
    if (variant === "default" && !isScrolled) return "text-white";
    return "text-gray-900";
  };

  const getBorderColor = () => {
    if (variant === "transparent" && !isScrolled) return "border-transparent";
    if (variant === "default" && !isScrolled) return "border-purple-700/30";
    return "border-gray-200";
  };

  const getSearchPlaceholderColor = () => {
    if (variant === "transparent" && !isScrolled) return "placeholder-gray-300";
    if (variant === "default" && !isScrolled) return "placeholder-purple-200";
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
  const isLight = isTransparentUnscrolled || isDefaultUnscrolled;

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full border-b ${getBorderColor()} ${getHeaderBackground()} transition-all duration-300 shadow-sm`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* ── Left — Logo / Back button ── */}
            <div className="flex items-center gap-3">
              {showBackButton ? (
                <button
                  onClick={() => navigate(-1)}
                  className={`flex items-center gap-2 transition-colors ${
                    isTransparentUnscrolled
                      ? "text-white hover:text-gray-200"
                      : isDefaultUnscrolled
                        ? "text-white hover:text-purple-100"
                        : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="hidden sm:inline text-sm font-medium">
                    Back
                  </span>
                </button>
              ) : (
                <Link to="/" className="flex items-center gap-2.5 group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-200">
                    <img
                      src={isScrolled ? whiteLogoImg : blueLogoImg}
                      alt="Aby Gadgets logo"
                      className="w-full h-full object-cover transition-opacity duration-300"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`font-bold text-base sm:text-lg leading-tight transition-colors ${getTextColor()} ${
                        isDefaultUnscrolled
                          ? "group-hover:text-purple-100"
                          : "group-hover:text-blue-600"
                      }`}
                    >
                      Aby Gadgets
                    </span>
                    <span
                      className={`text-[10px] sm:text-xs hidden sm:block ${
                        isDefaultUnscrolled ? "text-purple-200" : "text-gray-500"
                      }`}
                    >
                      Premium Tech Store
                    </span>
                  </div>
                </Link>
              )}

              {title && (
                <div className="hidden md:flex items-center ml-2">
                  <span
                    className={`text-lg font-bold ${getTextColor()} border-l ${
                      isDefaultUnscrolled
                        ? "border-purple-300/50"
                        : "border-gray-300"
                    } pl-4`}
                  >
                    {title}
                  </span>
                </div>
              )}
            </div>

            {/* ── Center — Desktop Nav ── */}
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
                        <span
                          className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 transition-all duration-300 group-hover:w-3/4 ${
                            isDefaultUnscrolled
                              ? "bg-white"
                              : isTransparentUnscrolled
                                ? "group-hover:bg-white bg-white"
                                : "bg-gradient-to-r from-blue-500 to-purple-500"
                          }`}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* ── Right — Icons ── */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Desktop search */}
              <div
                className="hidden md:flex items-center relative group cursor-pointer"
                onClick={() => navigate("/search")}
              >
                <Search
                  className={`absolute left-3.5 h-4 w-4 pointer-events-none transition-colors ${
                    isTransparentUnscrolled
                      ? "text-gray-300 group-hover:text-white"
                      : isDefaultUnscrolled
                        ? "text-purple-200 group-hover:text-white"
                        : "text-gray-400 group-hover:text-blue-500"
                  }`}
                />
                <div
                  className={`pl-10 pr-4 py-2.5 text-sm rounded-xl w-44 cursor-pointer select-none border transition-all duration-300 ${
                    isTransparentUnscrolled
                      ? "bg-white/15 text-white border-white/30 hover:bg-white/20"
                      : isDefaultUnscrolled
                        ? "bg-white/20 text-white border-white/30 hover:bg-white/30"
                        : "bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <span className={`${getSearchPlaceholderColor()} text-sm`}>
                    Search...
                  </span>
                </div>
              </div>

              {/* Mobile search icon */}
              <button
                className={`md:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
                  isLight
                    ? "text-white hover:bg-white/10"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => navigate("/search")}
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Cart — visible on all screens */}
              <button
                className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
                  isLight
                    ? "text-white hover:bg-white/10"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
                onClick={() => navigate("/cart")}
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm ${
                      isDefaultUnscrolled
                        ? "bg-yellow-400 text-[#6426E1]"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Notification Bell (authenticated only, desktop) */}
              <div className="hidden md:flex">
                <NotificationBell isLight={isLight} />
              </div>

              {/* User dropdown — Desktop only */}
              <div className="hidden md:block relative" ref={userDropdownRef}>
                {isAuthenticated ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`relative rounded-xl group ${
                        isLight
                          ? "text-white hover:text-white hover:bg-white/10"
                          : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    >
                      <div
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-semibold text-sm group-hover:scale-105 transition-transform duration-200 ${
                          isDefaultUnscrolled
                            ? "bg-white text-[#6426E1]"
                            : "bg-gradient-to-br from-blue-500 to-purple-500 text-white"
                        }`}
                      >
                        {getUserInitials()}
                      </div>
                      <ChevronDown
                        className={`absolute -bottom-1 -right-1 h-3 w-3 bg-white rounded-full border transition-transform duration-200 ${
                          userDropdownOpen ? "rotate-180" : ""
                        } ${
                          isTransparentUnscrolled
                            ? "border-white/30"
                            : isDefaultUnscrolled
                              ? "border-white"
                              : "border-gray-300"
                        } ${isDefaultUnscrolled ? "text-[#6426E1]" : "text-gray-600"}`}
                      />
                    </Button>

                    {userDropdownOpen && (
                      <div
                        className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-xl border ${
                          isTransparentUnscrolled
                            ? "bg-gray-900/95 backdrop-blur-md border-white/20"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        {/* User info */}
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#6426E1] to-purple-400 flex items-center justify-center text-white font-semibold text-sm shadow-md flex-shrink-0">
                              {getUserInitials()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3
                                className={`font-bold truncate text-sm ${
                                  isTransparentUnscrolled
                                    ? "text-white"
                                    : "text-gray-900"
                                }`}
                              >
                                {user?.username}
                              </h3>
                              <p
                                className={`text-xs truncate ${
                                  isTransparentUnscrolled
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                }`}
                              >
                                {user?.email}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              navigate("/orders");
                              setUserDropdownOpen(false);
                            }}
                            className="mt-3 w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#6426E1]/15 transition-colors group"
                            style={{ backgroundColor: "rgba(100, 38, 225, 0.06)" }}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: "rgba(100, 38, 225, 0.12)" }}
                              >
                                <Package className="h-4 w-4" style={{ color: "#6426E1" }} />
                              </div>
                              <div className="text-left">
                                <p className={`text-xs ${isTransparentUnscrolled ? "text-gray-400" : "text-gray-500"}`}>
                                  Total Orders
                                </p>
                                <p className={`font-bold text-sm ${isTransparentUnscrolled ? "text-white" : "text-gray-900"}`}>
                                  {orderCount}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-[#6426E1] transition-colors" />
                          </button>
                        </div>

                        <div className="p-2">
                          {[
                            { icon: Package, label: "My Orders", path: "/orders" },
                            { icon: Truck, label: "Notifications", path: "/notifications" },
                            { icon: Settings, label: "Settings", path: "/settings" },
                            { icon: HelpCircle, label: "Help Centre", path: "/help" },
                          ].map((item) => (
                            <button
                              key={item.label}
                              onClick={() => {
                                navigate(item.path);
                                setUserDropdownOpen(false);
                              }}
                              className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-xl transition-all duration-200 ${
                                isTransparentUnscrolled
                                  ? "text-gray-300 hover:bg-white/10 hover:text-white"
                                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                              }`}
                            >
                              <item.icon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                              <span className="flex-1 text-left">{item.label}</span>
                              <ChevronRight className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                            </button>
                          ))}

                          <div className={`h-px my-1.5 mx-2 ${isTransparentUnscrolled ? "bg-white/20" : "bg-gray-100"}`} />

                          <button
                            onClick={handleLogout}
                            className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-xl transition-all duration-200 ${
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
                      className={`rounded-xl px-3.5 ${
                        isLight
                          ? "text-white hover:text-white hover:bg-white/10"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
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

              {/* Mobile Hamburger */}
              <button
                className={`lg:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
                  isLight
                    ? "text-white hover:bg-white/10"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu — Full-screen slide-in drawer ── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-all duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Dimmed overlay */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Drawer panel — slides in from the right */}
        <div
          className={`absolute top-0 right-0 h-full w-[82vw] max-w-[340px] bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl overflow-hidden shadow">
                <img src={blueLogoImg} alt="logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-gray-900 text-base">Aby Gadgets</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          {/* User info strip (if authenticated) */}
          {isAuthenticated && (
            <div className="mx-4 mt-4 p-3.5 bg-gradient-to-r from-[#6426E1]/8 to-purple-50 rounded-2xl border border-purple-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6426E1] to-purple-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow">
                  {getUserInitials()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{user?.username}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Orders</p>
                  <p className="font-bold text-[#6426E1] text-sm">{orderCount}</p>
                </div>
              </div>
            </div>
          )}

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
            {/* Search bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6426E1]/30 focus:border-[#6426E1]/40 transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    navigate("/search");
                    setMobileMenuOpen(false);
                  }
                }}
              />
            </div>

            {/* Nav section label */}
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">
              Navigation
            </p>

            {/* Nav links */}
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#6426E1] text-white shadow-sm shadow-purple-200"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <link.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />
                  {link.name}
                </Link>
              );
            })}

            {/* Divider */}
            <div className="h-px bg-gray-100 my-3" />

            {/* Quick actions label */}
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">
              Quick Actions
            </p>

            {/* Wishlist */}
            <button
              onClick={() => { navigate("/wishlist"); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 w-full px-3.5 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
            >
              <Heart className="h-4 w-4 text-pink-500 flex-shrink-0" />
              Wishlist
              {wishlistCount > 0 && (
                <span className="ml-auto bg-pink-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => { navigate("/cart"); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 w-full px-3.5 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
            >
              <ShoppingCart className="h-4 w-4 text-blue-500 flex-shrink-0" />
              Cart
              {totalItems > 0 && (
                <span className="ml-auto bg-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Authenticated-only items */}
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => { navigate("/orders"); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-3.5 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
                >
                  <Package className="h-4 w-4 text-purple-500 flex-shrink-0" />
                  My Orders
                  {orderCount > 0 && (
                    <span className="ml-auto bg-[#6426E1] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {orderCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => { navigate("/notifications"); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-3.5 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
                >
                  <Bell className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  Notifications
                </button>

                <button
                  onClick={() => { navigate("/settings"); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-3.5 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
                >
                  <Settings className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  Settings
                </button>
              </>
            ) : null}

            <button
              onClick={() => { navigate("/help"); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 w-full px-3.5 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
            >
              <HelpCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
              Help Center
            </button>
          </div>

          {/* Drawer footer — auth buttons or logout */}
          <div className="px-4 pb-6 pt-3 border-t border-gray-100">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-rose-500 bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleLogin}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <LogIn className="h-4 w-4" /> Login
                </button>
                <button
                  onClick={handleSignup}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold text-white bg-[#6426E1] hover:bg-[#5520c0] transition-colors shadow-sm"
                >
                  <UserPlus className="h-4 w-4" /> Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;