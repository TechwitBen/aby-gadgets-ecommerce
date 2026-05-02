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

  useEffect(() => { fetchOrderCount(); }, [fetchOrderCount]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "All Products", path: "/products", icon: Grid },
    { name: "Categories", path: "/categories", icon: Grid },
    { name: "About", path: "/about", icon: Info },
    { name: "Contact", path: "/contact", icon: Phone },
  ];

  // ── Scroll-aware style helpers ─────────────────────────────────────────────
  // When at top: fully transparent regardless of variant
  // When scrolled: crisp white with shadow
  const isHomePage = location.pathname === "/";
const isAtTop = isHomePage ? !isScrolled : false;

  const headerBg = isAtTop
    ? "bg-transparent"
    : "bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm";

  const headerBorder = isAtTop ? "border-transparent" : "border-gray-200";

  // Text is white on the transparent hero, dark after scroll
  const textColor = isAtTop ? "text-white" : "text-gray-800";
  const subtextColor = isAtTop ? "text-white/70" : "text-gray-500";
  const iconColor = isAtTop ? "text-white" : "text-gray-600";
  const iconHoverBg = isAtTop ? "hover:bg-white/15" : "hover:bg-gray-100";

  // Logo: white version on transparent, coloured on white
  const logoSrc = isAtTop ? whiteLogoImg : blueLogoImg;

  const handleLogin = () => { navigate("/login"); setMobileMenuOpen(false); };
  const handleSignup = () => { navigate("/signup"); setMobileMenuOpen(false); };
  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${headerBg} ${headerBorder}`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* ── Left — Logo / Back ─────────────────────────────────────── */}
            <div className="flex items-center gap-3">
              {showBackButton ? (
                <button
                  onClick={() => navigate(-1)}
                  className={`flex items-center gap-2 transition-colors ${iconColor} ${iconHoverBg} rounded-lg px-2 py-1`}
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="hidden sm:inline text-sm font-medium">Back</span>
                </button>
              ) : (
                <Link to="/" className="flex items-center gap-2.5 group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-200">
                    <img
                      src={logoSrc}
                      alt="Aby Gadgets logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-bold text-base sm:text-lg leading-tight transition-colors ${textColor}`}>
                      Aby Gadgets
                    </span>
                    <span className={`text-[10px] sm:text-xs hidden sm:block ${subtextColor}`}>
                      Premium Tech Store
                    </span>
                  </div>
                </Link>
              )}

              {title && (
                <div className="hidden md:flex items-center ml-2">
                  <span className={`text-lg font-bold ${textColor} border-l border-current/30 pl-4`}>
                    {title}
                  </span>
                </div>
              )}
            </div>

            {/* ── Center — Desktop Nav ───────────────────────────────────── */}
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
                          ? isAtTop
                            ? "bg-white/20 text-white"
                            : "bg-[#6426E1]/10 text-[#6426E1]"
                          : isAtTop
                            ? "text-white/85 hover:text-white hover:bg-white/15"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {link.name}
                      {!isActive && (
                        <span
                          className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-0.5 rounded-full transition-all duration-300 group-hover:w-3/4 ${
                            isAtTop ? "bg-white" : "bg-[#6426E1]"
                          }`}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* ── Right — Icons ─────────────────────────────────────────── */}
            <div className="flex items-center gap-1 sm:gap-1.5">

              {/* Desktop search bar */}
              <div
                className="hidden md:flex items-center relative group cursor-pointer"
                onClick={() => navigate("/search")}
              >
                <Search
                  className={`absolute left-3.5 h-4 w-4 pointer-events-none transition-colors ${
                    isAtTop ? "text-white/60 group-hover:text-white" : "text-gray-400 group-hover:text-[#6426E1]"
                  }`}
                />
                <div
                  className={`pl-10 pr-4 py-2 text-sm rounded-xl w-40 cursor-pointer select-none border transition-all duration-300 ${
                    isAtTop
                      ? "bg-white/15 text-white border-white/25 hover:bg-white/20"
                      : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-sm">Search...</span>
                </div>
              </div>

              {/* Mobile search icon */}
              <button
                className={`md:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${iconColor} ${iconHoverBg}`}
                onClick={() => navigate("/search")}
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Cart */}
              <button
                className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${iconColor} ${iconHoverBg}`}
                onClick={() => navigate("/cart")}
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm ${
                      isAtTop ? "bg-yellow-400 text-gray-900" : "bg-[#6426E1] text-white"
                    }`}
                  >
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Notification Bell — desktop only */}
              <div className="hidden md:flex">
                <NotificationBell isLight={isAtTop} />
              </div>

              {/* User dropdown — desktop only */}
              <div className="hidden md:block relative" ref={userDropdownRef}>
                {isAuthenticated ? (
                  <>
                    <button
                      className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors ${iconHoverBg}`}
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    >
                      {/* Avatar circle */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                          isAtTop
                            ? "bg-white/25 text-white border border-white/40"
                            : "bg-[#6426E1] text-white"
                        }`}
                      >
                        {getUserInitials()}
                      </div>
                      {/* Chevron badge */}
                      <ChevronDown
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-white rounded-full border border-gray-200 text-gray-600 transition-transform duration-200 ${
                          userDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown */}
                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-72 rounded-2xl shadow-xl border border-gray-100 bg-white overflow-hidden">

                        {/* User info */}
                        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-[#6426E1] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {getUserInitials()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 text-sm truncate">{user?.username}</h3>
                              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                          </div>

                          {/* Orders pill */}
                          <button
                            onClick={() => { navigate("/orders"); setUserDropdownOpen(false); }}
                            className="mt-3 w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                          >
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-[#6426E1]" />
                              <span className="text-xs text-gray-500">Total Orders</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-gray-900 text-sm">{orderCount}</span>
                              <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-[#6426E1] transition-colors" />
                            </div>
                          </button>
                        </div>

                        {/* Menu rows */}
                        <div className="p-2">
                          {[
                            { icon: Package,    label: "My Orders",    path: "/orders" },
                            { icon: Heart,      label: "Wishlist",     path: "/wishlist", count: wishlistCount },
                            { icon: Bell,       label: "Notifications",path: "/notifications" },
                            { icon: Settings,   label: "Settings",     path: "/settings" },
                            { icon: HelpCircle, label: "Help Centre",  path: "/help" },
                          ].map((item) => (
                            <button
                              key={item.label}
                              onClick={() => { navigate(item.path); setUserDropdownOpen(false); }}
                              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-xl text-gray-700 hover:bg-[#6426E1]/8 hover:text-[#6426E1] transition-all duration-150 group"
                            >
                              <item.icon className="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-[#6426E1] transition-colors" />
                              <span className="flex-1 text-left">{item.label}</span>
                              {"count" in item && item.count > 0 && (
                                <span className="bg-[#6426E1] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                  {item.count}
                                </span>
                              )}
                              <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-[#6426E1] transition-colors" />
                            </button>
                          ))}

                          <div className="h-px bg-gray-100 my-1.5 mx-1" />

                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-xl text-rose-500 hover:bg-rose-50 transition-all duration-150"
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
                      className={`rounded-xl px-3.5 text-sm font-medium transition-all ${
                        isAtTop
                          ? "text-white hover:text-white hover:bg-white/15"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                      onClick={handleLogin}
                    >
                      <LogIn className="h-4 w-4 mr-1.5" />
                      Login
                    </Button>
                    <Button
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                        isAtTop
                          ? "bg-white text-[#6426E1] hover:bg-white/90"
                          : "bg-[#6426E1] text-white hover:bg-[#5220c4]"
                      }`}
                      onClick={handleSignup}
                    >
                      <UserPlus className="h-4 w-4 mr-1.5" />
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                className={`lg:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${iconColor} ${iconHoverBg}`}
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ─────────────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-all duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Panel */}
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

          {/* Authenticated user strip */}
          {isAuthenticated && (
            <div className="mx-4 mt-4 p-3.5 bg-[#6426E1]/5 rounded-2xl border border-[#6426E1]/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#6426E1] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
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

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6426E1]/30 focus:border-[#6426E1]/40 transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter") { navigate("/search"); setMobileMenuOpen(false); }
                }}
              />
            </div>

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">
              Navigation
            </p>

            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#6426E1] text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <link.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />
                  {link.name}
                </Link>
              );
            })}

            <div className="h-px bg-gray-100 my-3" />

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">
              Quick Actions
            </p>

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

            {isAuthenticated && (
              <>
                <button
                  onClick={() => { navigate("/orders"); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-3.5 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
                >
                  <Package className="h-4 w-4 text-[#6426E1] flex-shrink-0" />
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
            )}

            <button
              onClick={() => { navigate("/help"); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 w-full px-3.5 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
            >
              <HelpCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
              Help Center
            </button>
          </div>

          {/* Drawer footer */}
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