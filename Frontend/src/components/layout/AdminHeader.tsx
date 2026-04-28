import { useState, useEffect } from "react";
import { Bell, User, Plus, ShieldCheck, LogOut, Menu, Activity } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { auditService } from "@/services/auditLog.service";

interface AdminHeaderProps { onMobileMenuToggle: () => void; }

export const AdminHeader = ({ onMobileMenuToggle }: AdminHeaderProps) => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const { toast }        = useToast();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.role !== "admin") return;
    auditService.getUnreadCount()
      .then(setUnreadCount)
      .catch(() => {});
    // Poll every 60 seconds
    const id = setInterval(() => {
      auditService.getUnreadCount().then(setUnreadCount).catch(() => {});
    }, 60_000);
    return () => clearInterval(id);
  }, [user]);

  const handleLogout = async () => {
    try { await logout(); navigate("/login"); }
    catch { toast({ title: "Logout failed", description: "Please try again.", variant: "destructive" }); }
  };

  return (
    <header className="h-14 bg-background border-b border-border flex items-center justify-between px-4 md:px-6 gap-4">
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-4 ml-auto">
        {/* Notification bell — admin only */}
        {user?.role === "admin" && (
          <button
            onClick={() => navigate("/admin/activity")}
            className="relative text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Activity log"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        )}

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
              <span className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary group-hover:bg-primary/20 transition-colors">
                {user?.name
                  ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                  : user?.username
                    ? user.username.slice(0, 2).toUpperCase()
                    : <User size={14} />}
              </span>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52 bg-card border-border shadow-lg rounded-xl p-1">
            {user && (
              <div className="px-3 py-2.5 border-b border-border mb-1">
                <p className="text-xs font-semibold text-foreground truncate">{user.name ?? user.username}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                <span className="inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                  <ShieldCheck size={10} />
                  {user.role === "admin" ? "Admin" : "Staff"}
                </span>
              </div>
            )}

            {/* Manage Admins — admin only */}
            {user?.role === "admin" && (
              <>
                <DropdownMenuItem asChild>
                  <Link
                    to="/admin/manage-admins"
                    className="cursor-pointer flex items-center gap-2 text-sm rounded-lg px-2 py-2 text-foreground hover:bg-secondary transition-colors"
                  >
                    <ShieldCheck size={15} className="text-primary" />
                    Manage Admins
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    to="/admin/activity"
                    className="cursor-pointer flex items-center gap-2 text-sm rounded-lg px-2 py-2 text-foreground hover:bg-secondary transition-colors"
                  >
                    <Activity size={15} className="text-primary" />
                    Activity Log
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 border-border" />
              </>
            )}

            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer flex items-center gap-2 text-sm rounded-lg px-2 py-2 text-destructive hover:bg-destructive/10 focus:text-destructive focus:bg-destructive/10 transition-colors"
            >
              <LogOut size={15} />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Add Product — hide from staff with no product add permission */}
        {(user?.role === "admin" || user?.staffPermissions?.products?.addProducts) && (
          <Link to="products/add">
            <Button size="sm" className="gap-1">
              <Plus size={16} />
              <span className="hidden sm:inline">Add Products</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
};