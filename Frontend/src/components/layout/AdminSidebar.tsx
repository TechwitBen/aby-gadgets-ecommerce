import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Settings,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Orders", path: "orders" },
  { name: "Payments", path: "payments" },
  { name: "Products", path: "products" },
  { name: "Customers", path: "customers" },
  { name: "Staffs (Admin only)", path: "staffs" },
];

export const AdminSidebar = () => {
  const location = useLocation();
  const [endpointsOpen, setEndpointsOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <aside className="admin-theme w-56 min-h-screen flex flex-col bg-sidebar-background border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-4 flex items-center gap-2">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary">
          <span className="text-primary-foreground font-bold text-sm">Ab</span>
        </div>
        <div>
          <span className="block text-foreground font-semibold text-sm">
            Aby Gadgets
          </span>
          <span className="block text-primary text-xs">store</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        {/* EndPoints Section */}
        <button
          onClick={() => setEndpointsOpen(!endpointsOpen)}
          className="w-full flex items-center justify-between px-3 py-2 text-sidebar-foreground hover:text-foreground transition-colors"
        >
          <div className="flex items-center gap-2">
            <LayoutGrid size={18} />
            <span className="text-sm">EndPoints</span>
          </div>
          {endpointsOpen ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>

        {endpointsOpen && (
          <div className="mt-1 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname.includes(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "block px-3 py-2 ml-6 text-sm rounded-md transition-colors",
                    isActive
                      ? "bg-sidebar-active text-foreground"
                      : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-active/50"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}

        {/* Settings */}
        <Link
          to="settings"
          className={cn(
            "flex items-center gap-2 px-3 py-2 mt-4 text-sm rounded-md transition-colors",
            location.pathname.includes("settings")
              ? "bg-sidebar-active text-foreground"
              : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-active/50"
          )}
        >
          <Settings size={18} />
          <span>Settings</span>
        </Link>

        {/* Logout */}
        <button className="w-full flex items-center gap-2 px-3 py-2 mt-1 text-sm text-sidebar-foreground hover:text-foreground transition-colors">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </nav>

      {/* Dark Mode Toggle */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex items-center gap-2 text-sidebar-foreground hover:text-foreground transition-colors"
        >
          {darkMode ? <Moon size={18} /> : <Sun size={18} />}
          <span className="text-xs">{darkMode ? "Dark" : "Light"}</span>
        </button>
      </div>
    </aside>
  );
};
