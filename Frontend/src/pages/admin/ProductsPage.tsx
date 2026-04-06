import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { productsData as initialProductsData } from "@/pages/admin/data/mockData";
import { categories } from "@/pages/admin/data/mockData";
import { StatsCard } from "@/components/ui/stats-card";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, Trash2, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";

type Product = (typeof initialProductsData)[0];

// ── Delete Confirmation Modal ─────────────────────────────────────────────────
const DeleteConfirmModal = ({
  open, name, onConfirm, onCancel,
}: { open: boolean; name: string; onConfirm: () => void; onCancel: () => void }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="bg-popover text-popover-foreground rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center">
              <Trash2 size={16} className="text-destructive" />
            </div>
            <p className="text-sm font-semibold text-foreground">Delete Product</p>
          </div>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{name}</span>? This action cannot be undone.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button size="sm" onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:opacity-90 gap-1.5">
            <Trash2 size={14} /> Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Inline Dropdown ───────────────────────────────────────────────────────────
const FilterDropdown = ({
  label, value, options, onChange, isOpen, onToggle, onClose,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  isOpen: boolean;
  onToggle: (e: React.MouseEvent) => void;
  onClose: () => void;
}) => {
  const isActive = value !== label;
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`inline-flex items-center gap-1.5 text-sm rounded-lg px-3 py-2 border transition-colors whitespace-nowrap ${
          isActive
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-card text-foreground border-border hover:border-primary/50"
        }`}
      >
        {isActive ? value : label}
        <ChevronDown size={13} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-20 min-w-[160px] max-h-56 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => { onChange(label); onClose(); }}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary/70 transition-colors ${
              value === label ? "text-primary font-medium" : "text-muted-foreground"
            }`}
          >
            All
          </button>
          {options.map((opt) => (
            <button key={opt}
              onClick={() => { onChange(opt); onClose(); }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary/70 transition-colors ${
                value === opt ? "text-primary font-medium" : "text-popover-foreground"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Price range buckets ───────────────────────────────────────────────────────
const priceRanges = [
  { label: "Under ₦100k",        min: 0,        max: 100_000 },
  { label: "₦100k – ₦300k",      min: 100_000,  max: 300_000 },
  { label: "₦300k – ₦600k",      min: 300_000,  max: 600_000 },
  { label: "₦600k – ₦1m",        min: 600_000,  max: 1_000_000 },
  { label: "Over ₦1m",           min: 1_000_000, max: Infinity },
];

const sortFields = [
  { label: "Name A–Z",     key: "name",  dir: "asc"  },
  { label: "Name Z–A",     key: "name",  dir: "desc" },
  { label: "Price ↑",      key: "price", dir: "asc"  },
  { label: "Price ↓",      key: "price", dir: "desc" },
  { label: "Stock ↑",      key: "stock", dir: "asc"  },
  { label: "Stock ↓",      key: "stock", dir: "desc" },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
const ProductsPage = () => {
  const navigate = useNavigate();
  const [productsData, setProductsData] = useState(initialProductsData);
  const [searchTerm, setSearchTerm]     = useState("");

  // Filters
  const [filterCategory,  setFilterCategory]  = useState("Category");
  const [filterCondition, setFilterCondition] = useState("Condition");
  const [filterStatus,    setFilterStatus]    = useState("Status");
  const [filterBrand,     setFilterBrand]     = useState("Brand");
  const [filterPrice,     setFilterPrice]     = useState("Price");
  const [sortLabel,       setSortLabel]       = useState("Sort");

  // Which dropdown is open
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdown((prev) => (prev === name ? null : name));
  };
  const closeDropdown = () => setOpenDropdown(null);

  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Derive unique filter option lists from data
  const conditionOptions = useMemo(
    () => [...new Set(productsData.map((p) => p.condition))].sort(),
    [productsData]
  );
  const statusOptions = useMemo(
    () => [...new Set(productsData.map((p) => p.status))].sort(),
    [productsData]
  );
  const brandOptions = useMemo(
    () => [...new Set(productsData.map((p) => p.brand))].sort(),
    [productsData]
  );
  const categoryOptions = [...new Set(categories)].sort();

  // Active filter count (excluding search and sort)
  const activeCount = [filterCategory, filterCondition, filterStatus, filterBrand, filterPrice]
    .filter((v) => !["Category", "Condition", "Status", "Brand", "Price"].includes(v)).length;

  const clearAll = () => {
    setFilterCategory("Category");
    setFilterCondition("Condition");
    setFilterStatus("Status");
    setFilterBrand("Brand");
    setFilterPrice("Price");
    setSortLabel("Sort");
    setSearchTerm("");
  };

  // Filtering + sorting via useMemo — no flash of empty state
  const filteredProducts = useMemo(() => {
    let list = [...productsData];

    // Search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.condition.toLowerCase().includes(q)
      );
    }

    // Dropdown filters
    if (filterCategory !== "Category")  list = list.filter((p) => p.category  === filterCategory);
    if (filterCondition !== "Condition") list = list.filter((p) => p.condition === filterCondition);
    if (filterStatus    !== "Status")    list = list.filter((p) => p.status    === filterStatus);
    if (filterBrand     !== "Brand")     list = list.filter((p) => p.brand     === filterBrand);

    // Price range
    if (filterPrice !== "Price") {
      const range = priceRanges.find((r) => r.label === filterPrice);
      if (range) list = list.filter((p) => p.price >= range.min && p.price <= range.max);
    }

    // Sort
    const sort = sortFields.find((s) => s.label === sortLabel);
    if (sort) {
      list.sort((a, b) => {
        const av = a[sort.key as keyof Product] as string | number;
        const bv = b[sort.key as keyof Product] as string | number;
        if (av < bv) return sort.dir === "asc" ? -1 : 1;
        if (av > bv) return sort.dir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [productsData, searchTerm, filterCategory, filterCondition, filterStatus, filterBrand, filterPrice, sortLabel]);

  const handleConfirmDelete = () => {
    if (!deletingProduct) return;
    setProductsData((prev) => prev.filter((p) => p.id !== deletingProduct.id));
    setDeletingProduct(null);
  };

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  const getStatusClass = (status: string) => {
    switch (status) {
      case "In Stock":     return "text-success";
      case "Out of Stock": return "text-destructive";
      case "Low Stock":    return "text-yellow-500";
      default:             return "text-muted-foreground";
    }
  };

  // Derived stats
  const totalProducts  = productsData.length;
  const activeProducts = productsData.filter((p) => p.status === "In Stock").length;
  const outOfStock     = productsData.filter((p) => p.status === "Out of Stock").length;
  const inventoryValue = productsData.reduce((sum, p) => sum + p.price * p.stock, 0);
  const inventoryDisplay =
    inventoryValue >= 1_000_000
      ? `₦${(inventoryValue / 1_000_000).toFixed(1)}m`
      : `₦${inventoryValue.toLocaleString()}`;

  return (
    <div onClick={closeDropdown}>
      <h1 className="text-2xl font-semibold text-foreground mb-6">Product Information</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Products"  value={String(totalProducts)}  variant="primary" />
        <StatsCard title="Active Products" value={String(activeProducts)} variant="default" />
        <StatsCard title="Out of Stock"    value={String(outOfStock)}     variant="primary" />
        <StatsCard title="Inventory Value" value={inventoryDisplay}       variant="success" />
      </div>

      {/* ── Filter Toolbar ──────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        {/* Top row: search + add */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <SearchInput
            placeholder="Search by name, brand or condition…"
            value={searchTerm}
            onChange={setSearchTerm}
            className="flex-1 max-w-md"
          />
          <Link to="add">
            <Button className="gap-1 whitespace-nowrap">
              <Plus size={16} /> Add Products
            </Button>
          </Link>
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mr-1">
            <SlidersHorizontal size={14} />
            <span>Filters:</span>
          </div>

          <FilterDropdown
            label="Category" value={filterCategory} options={categoryOptions}
            onChange={setFilterCategory}
            isOpen={openDropdown === "category"}
            onToggle={(e) => toggleDropdown("category", e)}
            onClose={closeDropdown}
          />
          <FilterDropdown
            label="Brand" value={filterBrand} options={brandOptions}
            onChange={setFilterBrand}
            isOpen={openDropdown === "brand"}
            onToggle={(e) => toggleDropdown("brand", e)}
            onClose={closeDropdown}
          />
          <FilterDropdown
            label="Condition" value={filterCondition} options={conditionOptions}
            onChange={setFilterCondition}
            isOpen={openDropdown === "condition"}
            onToggle={(e) => toggleDropdown("condition", e)}
            onClose={closeDropdown}
          />
          <FilterDropdown
            label="Status" value={filterStatus} options={statusOptions}
            onChange={setFilterStatus}
            isOpen={openDropdown === "status"}
            onToggle={(e) => toggleDropdown("status", e)}
            onClose={closeDropdown}
          />
          <FilterDropdown
            label="Price" value={filterPrice} options={priceRanges.map((r) => r.label)}
            onChange={setFilterPrice}
            isOpen={openDropdown === "price"}
            onToggle={(e) => toggleDropdown("price", e)}
            onClose={closeDropdown}
          />

          {/* Divider */}
          <div className="w-px h-6 bg-border mx-1" />

          {/* Sort */}
          <div className="relative">
            <button
              onClick={(e) => toggleDropdown("sort", e)}
              className={`inline-flex items-center gap-1.5 text-sm rounded-lg px-3 py-2 border transition-colors whitespace-nowrap ${
                sortLabel !== "Sort"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary/50"
              }`}
            >
              <ArrowUpDown size={13} />
              {sortLabel === "Sort" ? "Sort" : sortLabel}
              <ChevronDown size={13} className={`transition-transform ${openDropdown === "sort" ? "rotate-180" : ""}`} />
            </button>
            {openDropdown === "sort" && (
              <div
                className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-20 min-w-[140px]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => { setSortLabel("Sort"); closeDropdown(); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary/70 transition-colors ${
                    sortLabel === "Sort" ? "text-primary font-medium" : "text-muted-foreground"
                  }`}
                >
                  Default
                </button>
                {sortFields.map((s) => (
                  <button key={s.label}
                    onClick={() => { setSortLabel(s.label); closeDropdown(); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary/70 transition-colors ${
                      sortLabel === s.label ? "text-primary font-medium" : "text-popover-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear all — only when something is active */}
          {(activeCount > 0 || sortLabel !== "Sort" || searchTerm) && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors ml-auto"
            >
              <X size={12} /> Clear all
            </button>
          )}
        </div>

        {/* Active filter pill summary */}
        {activeCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">Active:</span>
            {[
              { label: filterCategory,  reset: () => setFilterCategory("Category"),   sentinel: "Category"  },
              { label: filterBrand,     reset: () => setFilterBrand("Brand"),          sentinel: "Brand"     },
              { label: filterCondition, reset: () => setFilterCondition("Condition"),  sentinel: "Condition" },
              { label: filterStatus,    reset: () => setFilterStatus("Status"),        sentinel: "Status"    },
              { label: filterPrice,     reset: () => setFilterPrice("Price"),          sentinel: "Price"     },
            ]
              .filter(({ label, sentinel }) => label !== sentinel)
              .map(({ label, reset }) => (
                <span key={label}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {label}
                  <button onClick={reset} className="hover:text-destructive transition-colors">
                    <X size={10} />
                  </button>
                </span>
              ))}
          </div>
        )}
      </div>

      {/* ── Product Table ───────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-medium text-foreground">
            Product List
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({filteredProducts.length} of {totalProducts})
            </span>
          </h2>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Product</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Brand</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Condition</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Price</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Stock</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Status</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <p className="text-muted-foreground text-sm mb-2">No products match your filters.</p>
                    <button onClick={clearAll} className="text-xs text-primary hover:underline">
                      Clear all filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id}
                    className="border-b border-border hover:bg-secondary/40 transition-colors">
                    <td className="p-4 text-foreground text-sm font-medium cursor-pointer"
                      onClick={() => navigate(product.id)}>
                      {product.name}
                    </td>
                    <td className="p-4 text-muted-foreground text-sm cursor-pointer"
                      onClick={() => navigate(product.id)}>
                      {product.brand}
                    </td>
                    <td className="p-4 text-muted-foreground text-sm cursor-pointer"
                      onClick={() => navigate(product.id)}>
                      {product.condition}
                    </td>
                    <td className="p-4 text-primary text-sm cursor-pointer font-medium"
                      onClick={() => navigate(product.id)}>
                      {formatPrice(product.price)}
                    </td>
                    <td className="p-4 text-muted-foreground text-sm cursor-pointer"
                      onClick={() => navigate(product.id)}>
                      {product.stock}
                    </td>
                    <td className={`p-4 text-sm cursor-pointer font-medium ${getStatusClass(product.status)}`}
                      onClick={() => navigate(product.id)}>
                      {product.status}
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setDeletingProduct(product)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteConfirmModal
        open={!!deletingProduct}
        name={deletingProduct?.name ?? ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingProduct(null)}
      />
    </div>
  );
};

export default ProductsPage;