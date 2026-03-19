import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { productsData } from "@/pages/admin/data/mockData";
import { StatsCard } from "@/components/ui/stats-card";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from "lucide-react";

const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Category");

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "In Stock":
        return "text-success";
      case "Out of Stock":
        return "text-destructive";
      case "Low Stock":
        return "text-yellow-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground mb-6">Product Information</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Products" value="128" variant="primary" />
        <StatsCard title="Active Products" value="102" variant="default" />
        <StatsCard title="Out of Stock" value="28" variant="primary" />
        <StatsCard title="Inventory Value" value="₦ 18.4m" variant="success" />
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs text-muted-foreground block mb-1">Filter</span>
          <div className="inline-flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
            <span className="text-sm">{categoryFilter}</span>
            <ChevronDown size={14} className="text-muted-foreground" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <SearchInput
            placeholder="Search by product name, brands or tag"
            value={searchTerm}
            onChange={setSearchTerm}
            className="w-80"
          />
          <Link to="products/add">
            <Button className="gap-1">
              <Plus size={16} />
              Add Products
            </Button>
          </Link>
        </div>
      </div>

      {/* Product List */}
      <div>
        <h2 className="text-lg font-medium text-foreground mb-4">Product List</h2>
        <div className="bg-card rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Products</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Condition</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Price</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Stock</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {productsData.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border hover:bg-secondary/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`products/${product.id}`)}
                >
                  <td className="p-4 text-foreground text-sm">{product.name}</td>
                  <td className="p-4 text-muted-foreground text-sm">{product.condition}</td>
                  <td className="p-4 text-primary text-sm">{formatPrice(product.price)}</td>
                  <td className="p-4 text-muted-foreground text-sm">{product.stock}</td>
                  <td className={`p-4 text-sm ${getStatusClass(product.status)}`}>{product.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
