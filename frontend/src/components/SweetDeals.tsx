import ProductShowcase from "@/components/ProductShowcase";
import { homeSweetDeals } from "@/data/dummyProducts";

interface SweetDealsProps {
  showViewAll?: boolean;
}

const SweetDeals = ({ showViewAll = true }: SweetDealsProps) => (
  <ProductShowcase
    sectionName="Sweet Deals"
    title="Sweet Deals"
    subtitle="Limited time offers you can't miss"
    hashKey="sweet-deals"
    badge="Deal"
    showViewAll={showViewAll}
    staticProducts={homeSweetDeals}
  />
);

export default SweetDeals;