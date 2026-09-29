import { useState, useEffect } from "react";
import { Tag } from "lucide-react";
import { productService, type Product } from "@/services/products.service";
import FeaturedSection from "@/components/FeaturedProducts";

interface SweetDealsProps {
  showViewAll?: boolean;
}

const SweetDeals = ({ showViewAll = true }: SweetDealsProps) => {
  const [sweetDeals, setSweetDeals] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    productService
      .getBySection("Sweet Deals")
      .then((sd) => setSweetDeals((sd ?? []).slice(0, 4)))
      .catch(() => setSweetDeals([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="py-10 sm:py-16 md:py-20 bg-secondary">
      <div className="container mx-auto px-3 sm:px-4">
        <FeaturedSection
          title="Sweet Deals"
          subtitle="Limited time offers you can't miss"
          products={sweetDeals}
          isLoading={isLoading}
          isNewArrival={false}
          sectionKey="sweet-deals"
          icon={Tag}
          iconBgClassName="bg-rose-600"
          showViewAll={showViewAll}
        />
      </div>
    </section>
  );
};

export default SweetDeals;