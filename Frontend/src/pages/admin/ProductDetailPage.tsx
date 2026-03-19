import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { productsData } from "@/pages/admin/data/mockData";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = productsData.find((p) => p.id === id);

  if (!product) {
    return <div className="text-foreground">Product not found</div>;
  }

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Product Information</h1>
        <Button variant="default" className="gap-2 bg-primary hover:bg-primary/90">
          <Edit size={16} />
          Edit Product
        </Button>
      </div>

      {/* Product Images */}
      <div className="grid grid-cols-6 gap-4 mb-8">
        {product.images.map((img, i) => (
          <div
            key={i}
            className="aspect-square bg-mint rounded-lg flex items-center justify-center overflow-hidden"
          >
            <span className="text-4xl">📱</span>
          </div>
        ))}
      </div>

      {/* Basic Info */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-foreground mb-4">Basic Info</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Name <span className="text-destructive">Required</span>
            </label>
            <div className="w-full bg-lavender text-lavender-foreground rounded-lg p-3 text-sm">
              {product.name}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Category</label>
            <div className="w-full bg-lavender text-lavender-foreground rounded-lg p-3 text-sm flex justify-between items-center">
              {product.category}
              <span className="text-muted-foreground">▼</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Brands</label>
            <div className="w-full bg-lavender text-lavender-foreground rounded-lg p-3 text-sm flex justify-between items-center">
              {product.brand}
              <span className="text-muted-foreground">▼</span>
            </div>
          </div>
        </div>
        <div className="w-1/3">
          <label className="text-xs text-muted-foreground block mb-1">Conditions</label>
          <div className="w-full bg-lavender text-lavender-foreground rounded-lg p-3 text-sm flex justify-between items-center">
            {product.condition}
            <span className="text-muted-foreground">▼</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-foreground mb-4">Product Details</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Storage</label>
            <div className="w-full bg-lavender text-lavender-foreground rounded-lg p-3 text-sm flex justify-between items-center">
              {product.storage}
              <span className="text-muted-foreground">▼</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">battery health</label>
            <div className="w-full bg-mint text-mint-foreground rounded-lg p-3 text-sm">
              {product.batteryHealth}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Color</label>
            <div className="w-full bg-mint text-mint-foreground rounded-lg p-3 text-sm">
              {product.color}
            </div>
          </div>
        </div>
      </div>

      {/* Product Description */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs text-muted-foreground">Product Description</label>
          <span className="text-xs text-destructive">Required</span>
        </div>
        <div className="w-full bg-mint text-mint-foreground rounded-lg p-4 text-sm min-h-[100px]">
          {product.description}
        </div>
      </div>

      {/* Pricing and Stock */}
      <div>
        <h2 className="text-lg font-medium text-foreground mb-4">Pricing and stock</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Price</label>
            <div className="w-full bg-lavender text-lavender-foreground rounded-lg p-3 text-sm">
              {formatPrice(product.price)}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Stock</label>
            <div className="w-full bg-mint text-mint-foreground rounded-lg p-3 text-sm">
              {product.stock}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
