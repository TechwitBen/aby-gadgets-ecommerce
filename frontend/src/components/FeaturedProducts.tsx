import ProductShowcase from "@/components/ProductShowcase";
import { homeNewArrivals } from "@/data/dummyProducts";

interface FeaturedProductsProps {
  showViewAll?: boolean;
}

const FeaturedProducts = ({ showViewAll = true }: FeaturedProductsProps) => (
  <ProductShowcase
    sectionName="New Arrivals"
    title="New Arrivals"
    subtitle="Latest devices just landed in stock"
    hashKey="new-arrivals"
    badge="New"
    showViewAll={showViewAll}
    staticProducts={homeNewArrivals}
  />
);

export default FeaturedProducts;