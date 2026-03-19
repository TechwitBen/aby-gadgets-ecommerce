import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { categories, brands, conditions } from "@/pages/admin/data/mockData";

const AddProductPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    category: "Phones",
    brand: "Apple",
    condition: "Brand New",
    description: "",
    price: "",
    quantity: "",
    deliveryFee: "",
  });

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);

  const handleSubmit = () => {
    console.log("Publishing product:", formData);
    navigate("products");
  };

  return (
    <div className="admin-theme">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Product Information</h1>
        <Button onClick={handleSubmit} className="gap-1 bg-primary text-primary-foreground hover:opacity-90">
          <Plus size={16} />
          Publish Products
        </Button>
      </div>

      {/* Image Upload */}
      <div className="grid grid-cols-6 gap-4 mb-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-card"
          >
            <Plus size={24} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground mt-1">Image</span>
          </div>
        ))}
      </div>

      {/* Basic Info */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-foreground mb-4">Basic Info</h2>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Name */}
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Name <span className="text-destructive">Required</span>
            </label>
            <input
              type="text"
              placeholder="Value"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-lavender text-lavender-foreground rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Category */}
          <div className="relative">
            <label className="text-xs text-muted-foreground block mb-1">Category</label>
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full bg-lavender text-lavender-foreground rounded-lg p-3 text-sm text-left flex justify-between items-center"
            >
              {formData.category} <span>▼</span>
            </button>
            {showCategoryDropdown && (
              <div className="absolute top-full left-0 right-0 bg-popover border border-border rounded-lg mt-1 shadow-lg z-10">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setFormData({ ...formData, category: cat });
                      setShowCategoryDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-lavender/50 transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Brands */}
          <div className="relative">
            <label className="text-xs text-muted-foreground block mb-1">Brands</label>
            <button
              onClick={() => setShowBrandDropdown(!showBrandDropdown)}
              className="w-full bg-lavender text-lavender-foreground rounded-lg p-3 text-sm text-left flex justify-between items-center"
            >
              {formData.brand} <span>▼</span>
            </button>
            {showBrandDropdown && (
              <div className="absolute top-full left-0 right-0 bg-popover border border-border rounded-lg mt-1 shadow-lg z-10">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => {
                      setFormData({ ...formData, brand: brand });
                      setShowBrandDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-lavender/50 transition-colors"
                  >
                    {brand}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Conditions */}
        <div className="relative w-1/3">
          <label className="text-xs text-muted-foreground block mb-1">Condition</label>
          <button
            onClick={() => setShowConditionDropdown(!showConditionDropdown)}
            className="w-full bg-lavender text-lavender-foreground rounded-lg p-3 text-sm text-left flex justify-between items-center"
          >
            {formData.condition} <span>▼</span>
          </button>
          {showConditionDropdown && (
            <div className="absolute top-full left-0 right-0 bg-popover border border-border rounded-lg mt-1 shadow-lg z-10">
              {conditions.map((cond) => (
                <button
                  key={cond}
                  onClick={() => {
                    setFormData({ ...formData, condition: cond });
                    setShowConditionDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-lavender/50 transition-colors"
                >
                  {cond}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Description */}
      <div className="mb-8">
        <label className="text-xs text-muted-foreground block mb-1">
          Product Description <span className="text-destructive">Required</span>
        </label>
        <textarea
          placeholder="Value"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full bg-lavender text-lavender-foreground rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {/* Pricing and Stock */}
      <div>
        <h2 className="text-lg font-medium text-foreground mb-4">Pricing and Stock</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Price</label>
            <input
              type="text"
              placeholder="₦234,000"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full bg-lavender text-lavender-foreground rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Quantity Available</label>
            <input
              type="text"
              placeholder="value"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full bg-mint text-mint-foreground rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div className="w-1/2">
          <label className="text-xs text-muted-foreground block mb-1">Delivery Fee</label>
          <input
            type="text"
            placeholder="Value"
            value={formData.deliveryFee}
            onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })}
            className="w-full bg-lavender text-lavender-foreground rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;
