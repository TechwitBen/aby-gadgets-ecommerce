import { useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronUp, LayoutGrid, Settings, LogOut, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Orders",              path: "orders"    },
  { name: "Payments",            path: "payments"  },
  { name: "Products",            path: "products"  },
  { name: "Customers",           path: "customers" },
  { name: "Staffs (Admin only)", path: "staffs"    },
];

export const AdminSidebar = () => {
  const location = useLocation();
  const [endpointsOpen, setEndpointsOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleToggle = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev; // next = true means DARK
      // The ONLY .admin-theme element is the AdminLayout root div.
      // Adding .admin-light switches to the light variable set.
      const adminRoot = document.querySelector<HTMLElement>(".admin-theme");
      if (adminRoot) {
        adminRoot.classList.toggle("admin-light", !next); // admin-light present = light mode
      }
      return next;
    });
  }, []);

  return (
    // NO admin-theme class here — inherits variables from AdminLayout root
    <aside className="w-56 h-screen flex flex-col bg-sidebar border-r border-[hsl(var(--sidebar-border))] flex-shrink-0">

      {/* Logo */}
      <div className="p-4 flex items-center gap-2 flex-shrink-0">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary">
          <span className="text-primary-foreground font-bold text-sm">Ab</span>
        </div>
        <div>
          <span className="block text-foreground font-semibold text-sm">Aby Gadgets</span>
          <span className="block text-primary text-xs">store</span>
        </div>
      </div>

      {/* Nav — scrollable so sidebar never grows */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <button
          onClick={() => setEndpointsOpen(!endpointsOpen)}
          className="w-full flex items-center justify-between px-3 py-2 text-[hsl(var(--sidebar-foreground))] hover:text-foreground transition-colors"
        >
          <div className="flex items-center gap-2">
            <LayoutGrid size={18} />
            <span className="text-sm">EndPoints</span>
          </div>
          {endpointsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
                      ? "bg-[hsl(var(--sidebar-active))] text-foreground"
                      : "text-[hsl(var(--sidebar-foreground))] hover:text-foreground hover:bg-[hsl(var(--sidebar-active))]"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}

        <Link
          to="settings"
          className={cn(
            "flex items-center gap-2 px-3 py-2 mt-4 text-sm rounded-md transition-colors",
            location.pathname.includes("settings")
              ? "bg-[hsl(var(--sidebar-active))] text-foreground"
              : "text-[hsl(var(--sidebar-foreground))] hover:text-foreground hover:bg-[hsl(var(--sidebar-active))]"
          )}
        >
          <Settings size={18} />
          <span>Settings</span>
        </Link>

        <button className="w-full flex items-center gap-2 px-3 py-2 mt-1 text-sm text-[hsl(var(--sidebar-foreground))] hover:text-foreground transition-colors">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </nav>

      {/* ── Pill toggle ── */}
      <div className="p-4 border-t border-[hsl(var(--sidebar-border))] flex-shrink-0">
        <button
          onClick={handleToggle}
          aria-label="Toggle colour scheme"
          className={cn(
            "flex items-center gap-0.5 h-8 px-1 rounded-full border transition-all duration-300",
            darkMode
              ? "bg-[#1e1e1e] border-white/[0.08]"
              : "bg-gray-200 border-gray-300"
          )}
        >
          {/* Sun — active when light mode */}
          <span
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
              !darkMode ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"
            )}
          >
            <Sun size={13} />
          </span>

          {/* Moon — active when dark mode */}
          <span
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
              darkMode ? "bg-[#3a3a3a] text-white shadow-sm" : "text-gray-400"
            )}
          >
            <Moon size={13} />
          </span>
        </button>
      </div>
    </aside>
  );
};