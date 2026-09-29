import { useState, useEffect } from "react";
import { ShoppingBag, TrendingUp } from "lucide-react";
import { productService, type Product } from "@/services/products.service";
import { useInView } from "@/hooks/useInView";
import FeaturedSection from "@/components/FeaturedProducts";

interface NewArrivalsProps {
  showViewAll?: boolean;
}

const NewArrivals = ({ showViewAll = true }: NewArrivalsProps) => {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { ref: headingRef, isInView: headingInView } = useInView();

  useEffect(() => {
    setIsLoading(true);
    productService
      .getBySection("New Arrivals")
      .then((na) => setNewArrivals((na ?? []).slice(0, 4)))
      .catch(() => setNewArrivals([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="pt-10 sm:pt-16 md:pt-24 pb-6 sm:pb-8 bg-background">
      <div className="container mx-auto px-3 sm:px-4">
        <div
          ref={headingRef}
          className="text-center mb-8 sm:mb-12 lg:mb-16 transition-all duration-700 ease-out"
          style={{
            opacity: headingInView ? 1 : 0,
            transform: headingInView ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center bg-primary">
              <ShoppingBag className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div className="text-left">
              <div className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-primary">
                Featured Collections
              </div>
              <div className="w-10 sm:w-16 h-1 rounded-full mt-1.5 bg-primary" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-6">
            Discover Premium <span className="text-primary">Gadgets</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed px-2">
            Latest arrivals and exclusive deals — all verified and authentic
          </p>
        </div>

        <FeaturedSection
          title="New Arrivals"
          subtitle="Latest devices just landed in stock"
          products={newArrivals}
          isLoading={isLoading}
          isNewArrival={true}
          sectionKey="new-arrivals"
          icon={TrendingUp}
          iconBgClassName="bg-primary"
          showViewAll={showViewAll}
        />
      </div>
    </section>
  );
};

export default NewArrivals;