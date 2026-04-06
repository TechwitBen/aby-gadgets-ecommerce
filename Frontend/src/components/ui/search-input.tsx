import { Search, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  showMenuIcon?: boolean;
}

export const SearchInput = ({
  placeholder = "Search...",
  value,
  onChange,
  className,
  showMenuIcon = true,
}: SearchInputProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 bg-secondary rounded-full px-4 py-2",
        className
      )}
    >
      {showMenuIcon && <Menu size={16} className="text-muted-foreground" />}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none flex-1"
      />
      <Search size={16} className="text-primary" />
    </div>
  );
};
