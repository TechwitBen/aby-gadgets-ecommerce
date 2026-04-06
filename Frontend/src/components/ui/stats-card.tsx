import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: "default" | "primary" | "success" | "destructive";
  className?: string;
}

export const StatsCard = ({
  title,
  value,
  subtitle,
  variant = "default",
  className,
}: StatsCardProps) => {
  const borderColors = {
    default: "border-l-muted-foreground",
    primary: "border-l-primary",
    success: "border-l-success",
    destructive: "border-l-destructive",
  };

  const valueColors = {
    default: "text-foreground",
    primary: "text-primary",
    success: "text-success",
    destructive: "text-destructive",
  };

  return (
    <div
      className={cn(
        "bg-card rounded-lg p-4 border-l-4",
        borderColors[variant],
        className
      )}
    >
      <p className="text-muted-foreground text-sm mb-1">{title}</p>
      <p className={cn("text-2xl font-bold", valueColors[variant])}>{value}</p>
      {subtitle && (
        <p className="text-muted-foreground text-xs mt-1">{subtitle}</p>
      )}
    </div>
  );
};
