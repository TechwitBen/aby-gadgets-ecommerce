import { Bell, User, Plus, ShieldCheck, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const AdminHeader = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const { toast }        = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch {
      toast({ title: "Logout failed", description: "Please try again.", variant: "destructive" });
    }
  };

  return (
    <header className="h-14 bg-background border-b border-border flex items-center justify-end px-6 gap-4">
      {/* Notification bell */}
      <button className="text-muted-foreground hover:text-foreground transition-colors">
        <Bell size={20} />
      </button>

      {/* Profile dropdown — admin actions only, no login/signup */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
            {/* Avatar circle with initials */}
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
          {/* Identity — non-interactive */}
          {user && (
            <div className="px-3 py-2.5 border-b border-border mb-1">
              <p className="text-xs font-semibold text-foreground truncate">
                {user.name ?? user.username}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
              <span className="inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                <ShieldCheck size={10} />
                Admin
              </span>
            </div>
          )}

          {/* Manage Admins — links to the admin management page */}
          <DropdownMenuItem asChild>
            <Link
              to="/admin/manage-admins"
              className="cursor-pointer flex items-center gap-2 text-sm rounded-lg px-2 py-2 text-foreground hover:bg-secondary transition-colors"
            >
              <ShieldCheck size={15} className="text-primary" />
              Manage Admins
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 border-border" />

          {/* Logout */}
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer flex items-center gap-2 text-sm rounded-lg px-2 py-2 text-destructive hover:bg-destructive/10 focus:text-destructive focus:bg-destructive/10 transition-colors"
          >
            <LogOut size={15} />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add Product shortcut */}
      <Link to="products/add">
        <Button size="sm" className="gap-1">
          <Plus size={16} />
          Add Products
        </Button>
      </Link>
    </header>
  );
};