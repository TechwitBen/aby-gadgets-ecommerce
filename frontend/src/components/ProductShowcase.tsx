import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { productService, type Product } from "@/services/products.service";
import { useInView } from "@/hooks/useInView";
import ShowcaseProductCard from "@/components/ShowcaseProductCard";

interface ProductShowcaseProps {
  sectionName: string; // exact name used by productService.getBySection
  title: string;
  subtitle: string;
  hashKey: string; // used for the "View all" link: /products#<hashKey>
  badge?: string;
  limit?: number;
  showViewAll?: boolean;
  tinted?: boolean; // soft lavender band to separate stacked sections
  fallbackProducts?: Product[]; // shown only when the API returns no products
  staticProducts?: Product[]; // when provided, the API is NOT called at all
}

const SkeletonCard = () => (
  <div className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white">
    <div className="aspect-square bg-gray-100" />
    <div className="space-y-2 p-4">
      <div className="h-3 w-1/3 rounded bg-gray-100" />
      <div className="h-4 w-3/4 rounded bg-gray-100" />
      <div className="h-3 w-1/2 rounded bg-gray-100" />
      <div className="flex items-center justify-between pt-3">
        <div className="h-5 w-20 rounded bg-gray-100" />
        <div className="h-9 w-9 rounded-full bg-gray-100" />
      </div>
    </div>
  </div>
);

const ProductShowcase = ({
  sectionName,
  title,
  subtitle,
  hashKey,
  badge,
  limit = 4,
  showViewAll = true,
  tinted = false,
  fallbackProducts,
  staticProducts,
}: ProductShowcaseProps) => {
  const [products, setProducts] = useState<Product[]>(
    staticProducts ? staticProducts.slice(0, limit) : [],
  );
  const [isLoading, setIsLoading] = useState(!staticProducts);
  const { ref: headingRef, isInView: headingInView } = useInView();

  useEffect(() => {
    // Static mode: use the provided products only, no API call
    if (staticProducts) {
      setProducts(staticProducts.slice(0, limit));
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    productService
      .getBySection(sectionName)
      .then((res) => {
        if (cancelled) return;
        const list = res ?? [];
        // Use real products when they exist, otherwise fall back to the dummy list (if provided)
        setProducts(
          (list.length > 0 ? list : (fallbackProducts ?? [])).slice(0, limit),
        );
      })
      .catch(() => {
        if (!cancelled) setProducts((fallbackProducts ?? []).slice(0, limit));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sectionName, limit, fallbackProducts, staticProducts]);

  return (
    <section
      className={`w-full px-3 py-12 sm:px-5 md:py-16 lg:px-6 ${
        tinted ? "bg-[#F6F4FB]" : "bg-background"
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Heading row */}
        <div
          ref={headingRef}
          className="mb-8 flex items-end justify-between gap-4 transition-all duration-700 ease-out md:mb-10"
          style={{
            opacity: headingInView ? 1 : 0,
            transform: headingInView ? "translateY(0)" : "translateY(16px)",
          }}
        >
          <div className="min-w-0">
            <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl lg:text-[28px]">
              {title}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {subtitle}
            </p>
          </div>

          {showViewAll && (
            <Link
              to={`/products#${hashKey}`}
              className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-xs font-medium text-muted-foreground transition-colors hover:text-[#6426E1] sm:text-sm"
            >
              View All
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: limit }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
            {products.map((p, i) => (
              <ShowcaseProductCard
                key={p.id}
                product={p}
                badge={badge}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white py-12 text-center">
            <p className="text-sm text-gray-500">
              No products available right now.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductShowcase;