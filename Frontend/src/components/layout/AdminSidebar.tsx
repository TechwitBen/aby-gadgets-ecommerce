import { useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Settings,
  LogOut,
  Moon,
  Sun,
  ShoppingCart,
  CreditCard,
  Package,
  Users,
  UserCog,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Orders",              path: "orders",    icon: ShoppingCart },
  { name: "Payments",            path: "payments",  icon: CreditCard   },
  { name: "Products",            path: "products",  icon: Package      },
  { name: "Customers",           path: "customers", icon: Users        },
  { name: "Staffs (Admin only)", path: "staffs",    icon: UserCog      },
];

interface AdminSidebarProps {
  /** Called when a nav link is tapped on mobile — lets the layout close the drawer */
  onMobileClose?: () => void;
}

export const AdminSidebar = ({ onMobileClose }: AdminSidebarProps) => {
  const location = useLocation();
  const [endpointsOpen, setEndpointsOpen] = useState(true);
  const [darkMode,      setDarkMode]      = useState(true);
  /** collapsed = icon-only rail; expanded = full sidebar */
  const [collapsed,     setCollapsed]     = useState(false);

  const handleToggleDark = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      const adminRoot = document.querySelector<HTMLElement>(".admin-theme");
      if (adminRoot) adminRoot.classList.toggle("admin-light", !next);
      return next;
    });
  }, []);

  const handleNavClick = () => {
    onMobileClose?.();
  };

  return (
    <aside
      className={cn(
        // transition width smoothly
        "h-screen flex flex-col bg-sidebar border-r border-[hsl(var(--sidebar-border))] flex-shrink-0",
        "transition-all duration-300 ease-in-out overflow-hidden",
        collapsed ? "w-[60px]" : "w-56"
      )}
    >
      {/* ── Logo row ─────────────────────────────────────────────────── */}
      <div className="p-3 flex items-center gap-2 flex-shrink-0 min-h-[60px]">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary flex-shrink-0">
          <span className="text-primary-foreground font-bold text-sm">Ab</span>
        </div>

        {/* Hide text + mobile close when collapsed */}
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <span className="block text-foreground font-semibold text-sm truncate">
                Aby Gadgets
              </span>
              <span className="block text-primary text-xs">store</span>
            </div>
            {/* Mobile close button (only visible when the sidebar is an overlay) */}
            {onMobileClose && (
              <button
                onClick={onMobileClose}
                className="lg:hidden flex-shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto overflow-x-hidden">

        {/* EndPoints section header */}
        {collapsed ? (
          /* Collapsed: just a divider dot */
          <div className="flex justify-center mb-2">
            <LayoutGrid size={18} className="text-[hsl(var(--sidebar-foreground))]" />
          </div>
        ) : (
          <button
            onClick={() => setEndpointsOpen(!endpointsOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-[hsl(var(--sidebar-foreground))] hover:text-foreground transition-colors rounded-md hover:bg-[hsl(var(--sidebar-active))]"
          >
            <div className="flex items-center gap-2">
              <LayoutGrid size={18} />
              <span className="text-sm font-medium">EndPoints</span>
            </div>
            {endpointsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}

        {/* Menu items */}
        <div className={cn("mt-1 space-y-0.5", collapsed ? "mt-2" : "")}>
          {(collapsed || endpointsOpen) &&
            menuItems.map((item) => {
              const isActive = location.pathname.includes(item.path);
              const Icon = item.icon;

              return collapsed ? (
                /* Collapsed: icon-only with tooltip */
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  title={item.name}
                  className={cn(
                    "flex items-center justify-center w-full h-9 rounded-md transition-colors",
                    isActive
                      ? "bg-[hsl(var(--sidebar-active))] text-foreground"
                      : "text-[hsl(var(--sidebar-foreground))] hover:text-foreground hover:bg-[hsl(var(--sidebar-active))]"
                  )}
                >
                  <Icon size={18} />
                </Link>
              ) : (
                /* Expanded: icon + label */
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 ml-2 text-sm rounded-md transition-colors",
                    isActive
                      ? "bg-[hsl(var(--sidebar-active))] text-foreground"
                      : "text-[hsl(var(--sidebar-foreground))] hover:text-foreground hover:bg-[hsl(var(--sidebar-active))]"
                  )}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
        </div>

        {/* Settings */}
        <div className="mt-3">
          {collapsed ? (
            <Link
              to="settings"
              onClick={handleNavClick}
              title="Settings"
              className={cn(
                "flex items-center justify-center w-full h-9 rounded-md transition-colors",
                location.pathname.includes("settings")
                  ? "bg-[hsl(var(--sidebar-active))] text-foreground"
                  : "text-[hsl(var(--sidebar-foreground))] hover:text-foreground hover:bg-[hsl(var(--sidebar-active))]"
              )}
            >
              <Settings size={18} />
            </Link>
          ) : (
            <Link
              to="settings"
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors",
                location.pathname.includes("settings")
                  ? "bg-[hsl(var(--sidebar-active))] text-foreground"
                  : "text-[hsl(var(--sidebar-foreground))] hover:text-foreground hover:bg-[hsl(var(--sidebar-active))]"
              )}
            >
              <Settings size={18} className="flex-shrink-0" />
              <span>Settings</span>
            </Link>
          )}
        </div>

        {/* Logout */}
        <div className="mt-0.5">
          {collapsed ? (
            <button
              title="Logout"
              className="flex items-center justify-center w-full h-9 rounded-md text-[hsl(var(--sidebar-foreground))] hover:text-foreground hover:bg-[hsl(var(--sidebar-active))] transition-colors"
            >
              <LogOut size={18} />
            </button>
          ) : (
            <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[hsl(var(--sidebar-foreground))] hover:text-foreground hover:bg-[hsl(var(--sidebar-active))] rounded-md transition-colors">
              <LogOut size={18} className="flex-shrink-0" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </nav>

      {/* ── Footer: dark toggle + collapse toggle ────────────────────── */}
      <div
        className={cn(
          "p-3 border-t border-[hsl(var(--sidebar-border))] flex-shrink-0",
          collapsed ? "flex flex-col items-center gap-2" : "flex items-center justify-between gap-2"
        )}
      >
        {/* Dark/Light pill */}
        <button
          onClick={handleToggleDark}
          aria-label="Toggle colour scheme"
          title={darkMode ? "Switch to light" : "Switch to dark"}
          className={cn(
            "flex items-center gap-0.5 h-8 rounded-full border transition-all duration-300 flex-shrink-0",
            collapsed ? "px-0.5 w-auto" : "px-1",
            darkMode
              ? "bg-[#1e1e1e] border-white/[0.08]"
              : "bg-gray-200 border-gray-300"
          )}
        >
          <span
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
              !darkMode ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"
            )}
          >
            <Sun size={13} />
          </span>
          <span
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
              darkMode ? "bg-[#3a3a3a] text-white shadow-sm" : "text-gray-400"
            )}
          >
            <Moon size={13} />
          </span>
        </button>

        {/* Collapse/Expand button — hidden on mobile (sidebar is overlay there) */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-[hsl(var(--sidebar-foreground))] hover:text-foreground hover:bg-[hsl(var(--sidebar-active))] transition-colors flex-shrink-0"
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>
    </aside>
  );
};