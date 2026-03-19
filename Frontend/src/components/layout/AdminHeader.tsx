import { Bell, User, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const AdminHeader = () => {
  return (
    <header className="h-14 bg-background border-b border-border flex items-center justify-end px-6 gap-4">
      <button className="text-muted-foreground hover:text-foreground transition-colors">
        <Bell size={20} />
      </button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <User size={20} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 bg-card border-border">
          <DropdownMenuItem asChild>
            <Link to="login" className="cursor-pointer">
              Login
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="signup" className="cursor-pointer">
              Sign Up
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Link to="products/add">
        <Button size="sm" className="gap-1">
          <Plus size={16} />
          Add Products
        </Button>
      </Link>
    </header>
  );
};
