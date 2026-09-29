import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Product } from "@/services/products.service";
import { useInView } from "@/hooks/useInView";
import ProductCard, { SkeletonCard } from "./ProductCard";

interface FeaturedSectionProps {
  title: string;
  subtitle: string;
  products: Product[];
  isLoading: boolean;
  isNewArrival: boolean;
  sectionKey: "new-arrivals" | "sweet-deals";
  icon: React.ElementType;
  /** Tailwind classes for the icon tile background, e.g. "bg-primary" */
  iconBgClassName: string;
  showViewAll?: boolean;
}

const FeaturedSection = ({
  title,
  subtitle,
  products,
  isLoading,
  isNewArrival,
  sectionKey,
  icon: Icon,
  iconBgClassName,
  showViewAll = true,
}: FeaturedSectionProps) => {
  const navigate = useNavigate();
  const { ref: headerRef, isInView: headerInView } = useInView();

  return (
    <div>
      <div
        ref={headerRef}
        className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8 transition-all duration-700 ease-out"
        style={{
          opacity: headerInView ? 1 : 0,
          transform: headerInView ? "translateY(0)" : "translateY(16px)",
        }}
      >
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <div
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBgClassName}`}
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
              {title}
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 truncate">
              {subtitle}
            </p>
          </div>
        </div>
        {showViewAll && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-primary/20 hover:border-primary/50 hover:text-primary text-xs sm:text-sm flex-shrink-0 ml-2 transition-transform duration-200 hover:scale-105"
            onClick={() => navigate(`/products#${sectionKey}`)}
          >
            <span className="hidden sm:inline mr-1">View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {products.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              isNewArrival={isNewArrival}
              index={i}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 sm:py-12 bg-secondary rounded-2xl border border-border">
          <p className="text-muted-foreground text-sm">
            No products available right now.
          </p>
        </div>
      )}
    </div>
  );
};

export default FeaturedSection;