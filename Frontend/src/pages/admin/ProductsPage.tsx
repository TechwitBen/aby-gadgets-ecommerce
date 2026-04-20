import { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { categories } from "@/pages/admin/data/mockData";
import { StatsCard } from "@/components/ui/stats-card";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ChevronDown,
  Trash2,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Loader2,
  RefreshCw,
  Filter,
  ChevronRight,
} from "lucide-react";
import {
  productService,
  getStockStatus,
  formatPrice,
  type Product,
} from "@/services/Products.service";

// ── Delete Modal ──────────────────────────────────────────────────────────────
const DeleteConfirmModal = ({
  open,
  name,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  open: boolean;
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-popover text-popover-foreground rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm shadow-xl overflow-hidden">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center">
              <Trash2 size={16} className="text-destructive" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Delete Product
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{name}</span>? This
            cannot be undone.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:opacity-90 gap-1.5"
          >
            {isDeleting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Inline filter dropdown (desktop) ─────────────────────────────────────────
const FilterDropdown = ({
  label,
  value,
  options,
  onChange,
  isOpen,
  onToggle,
  onClose,
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
        <ChevronDown
          size={13}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-20 min-w-[160px] max-h-56 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              onChange(label);
              onClose();
            }}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary/70 transition-colors ${
              value === label
                ? "text-primary font-medium"
                : "text-muted-foreground"
            }`}
          >
            All
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                onClose();
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary/70 transition-colors ${
                value === opt
                  ? "text-primary font-medium"
                  : "text-popover-foreground"
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

// ── Mobile Filter Sheet ───────────────────────────────────────────────────────
const MobileFilterSheet = ({
  open,
  onClose,
  filterCategory,
  filterCondition,
  filterStatus,
  filterBrand,
  filterPrice,
  sortLabel,
  setFilterCategory,
  setFilterCondition,
  setFilterStatus,
  setFilterBrand,
  setFilterPrice,
  setSortLabel,
  conditionOptions,
  brandOptions,
  categoryOptions,
  statusOptions,
  priceRanges,
  sortFields,
  clearAll,
}: {
  open: boolean;
  onClose: () => void;
  filterCategory: string;
  filterCondition: string;
  filterStatus: string;
  filterBrand: string;
  filterPrice: string;
  sortLabel: string;
  setFilterCategory: (v: string) => void;
  setFilterCondition: (v: string) => void;
  setFilterStatus: (v: string) => void;
  setFilterBrand: (v: string) => void;
  setFilterPrice: (v: string) => void;
  setSortLabel: (v: string) => void;
  conditionOptions: string[];
  brandOptions: string[];
  categoryOptions: string[];
  statusOptions: string[];
  priceRanges: { label: string }[];
  sortFields: readonly { label: string }[];
  clearAll: () => void;
}) => {
  if (!open) return null;

  const SectionHeader = ({ title }: { title: string }) => (
    <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
      {title}
    </p>
  );

  const PillGroup = ({
    options,
    value,
    onChange,
    sentinel,
  }: {
    options: string[];
    value: string;
    onChange: (v: string) => void;
    sentinel: string;
  }) => (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(sentinel)}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          value === sentinel
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-muted-foreground"
        }`}
      >
        All
      </button>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            value === opt
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end md:hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-popover w-full rounded-t-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-popover px-6 pt-4 pb-3 border-b border-border z-10">
          <div className="flex justify-center mb-3">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold text-foreground">
              Filter & Sort
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={clearAll}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Clear all
              </button>
              <button onClick={onClose}>
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <SectionHeader title="Category" />
            <PillGroup
              options={categoryOptions}
              value={filterCategory}
              onChange={setFilterCategory}
              sentinel="Category"
            />
          </div>
          <div>
            <SectionHeader title="Brand" />
            <PillGroup
              options={brandOptions}
              value={filterBrand}
              onChange={setFilterBrand}
              sentinel="Brand"
            />
          </div>
          <div>
            <SectionHeader title="Condition" />
            <PillGroup
              options={conditionOptions}
              value={filterCondition}
              onChange={setFilterCondition}
              sentinel="Condition"
            />
          </div>
          <div>
            <SectionHeader title="Status" />
            <PillGroup
              options={statusOptions}
              value={filterStatus}
              onChange={setFilterStatus}
              sentinel="Status"
            />
          </div>
          <div>
            <SectionHeader title="Price Range" />
            <PillGroup
              options={priceRanges.map((r) => r.label)}
              value={filterPrice}
              onChange={setFilterPrice}
              sentinel="Price"
            />
          </div>
          <div>
            <SectionHeader title="Sort By" />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSortLabel("Sort")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  sortLabel === "Sort"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                Default
              </button>
              {sortFields.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setSortLabel(s.label)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    sortLabel === s.label
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-popover px-6 py-4 border-t border-border">
          <Button className="w-full" onClick={onClose}>
            Show {" "}results
          </Button>
        </div>
      </div>
    </div>
  );
};

const priceRanges = [
  { label: "Under ₦100k", min: 0, max: 100_000 },
  { label: "₦100k – ₦300k", min: 100_000, max: 300_000 },
  { label: "₦300k – ₦600k", min: 300_000, max: 600_000 },
  { label: "₦600k – ₦1m", min: 600_000, max: 1_000_000 },
  { label: "Over ₦1m", min: 1_000_000, max: Infinity },
];

const sortFields = [
  { label: "Name A–Z", key: "name", dir: "asc" },
  { label: "Name Z–A", key: "name", dir: "desc" },
  { label: "Price ↑", key: "price", dir: "asc" },
  { label: "Price ↓", key: "price", dir: "desc" },
  { label: "Stock ↑", key: "stock", dir: "asc" },
  { label: "Stock ↓", key: "stock", dir: "desc" },
] as const;

const totalStock = (p: Product) =>
  (p.variants || []).reduce((s, v) => s + (v.is_active ? v.stock : 0), 0);

// ── Product Card (mobile) ─────────────────────────────────────────────────────
const ProductCard = ({
  product,
  onNavigate,
  onDelete,
}: {
  product: Product;
  onNavigate: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) => {
  const stock = totalStock(product);
  const status = getStockStatus(product);

  const statusColor =
    status === "In Stock"
      ? "text-green-600"
      : status === "Out of Stock"
      ? "text-destructive"
      : "text-yellow-500";

  const dotColor =
    status === "In Stock"
      ? "bg-green-500"
      : status === "Low Stock"
      ? "bg-yellow-500"
      : "bg-destructive";

  return (
    <div
      className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 active:bg-secondary/30 transition-colors"
      onClick={onNavigate}
    >
      <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center p-1 overflow-hidden flex-shrink-0 border border-border/50">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="text-[10px] text-muted-foreground">No img</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {product.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {product.brand} · {product.condition}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-sm font-bold text-primary">
            {formatPrice(product.price)}
          </p>
          <span className={`text-xs font-medium flex items-center gap-1 ${statusColor}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            {status}
          </span>
        </div>
      </div>
      <div
        className="flex items-center gap-1 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onDelete}
          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:bg-destructive/20 transition-colors"
        >
          <Trash2 size={15} />
        </button>
        <ChevronRight size={16} className="text-muted-foreground" />
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const ProductsPage = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await productService.getAll({ all: true });
      setProducts(Array.isArray(data?.products) ? data.products : []);
    } catch {
      setFetchError("Failed to load products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Category");
  const [filterCondition, setFilterCondition] = useState("Condition");
  const [filterStatus, setFilterStatus] = useState("Status");
  const [filterBrand, setFilterBrand] = useState("Brand");
  const [filterPrice, setFilterPrice] = useState("Price");
  const [sortLabel, setSortLabel] = useState("Sort");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleDropdown = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdown((prev) => (prev === name ? null : name));
  };
  const closeDropdown = () => setOpenDropdown(null);

  const conditionOptions = useMemo(
    () =>
      [...new Set((products || []).map((p) => p.condition))]
        .filter(Boolean)
        .sort(),
    [products]
  );
  const brandOptions = useMemo(
    () =>
      [...new Set((products || []).map((p) => p.brand))]
        .filter(Boolean)
        .sort(),
    [products]
  );
  const statusOptions = ["In Stock", "Low Stock", "Out of Stock"];
  const categoryOptions = [...new Set(categories)].sort();

  const activeFilterCount = [
    filterCategory,
    filterCondition,
    filterStatus,
    filterBrand,
    filterPrice,
  ].filter(
    (v) => !["Category", "Condition", "Status", "Brand", "Price"].includes(v)
  ).length;

  const clearAll = () => {
    setFilterCategory("Category");
    setFilterCondition("Condition");
    setFilterStatus("Status");
    setFilterBrand("Brand");
    setFilterPrice("Price");
    setSortLabel("Sort");
    setSearchTerm("");
  };

  const filteredProducts = useMemo(() => {
    let list = [...(products || [])];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.condition.toLowerCase().includes(q)
      );
    }
    if (filterCategory !== "Category")
      list = list.filter(
        (p) => p.category?.toLowerCase() === filterCategory.toLowerCase()
      );
    if (filterCondition !== "Condition")
      list = list.filter((p) => p.condition === filterCondition);
    if (filterBrand !== "Brand")
      list = list.filter((p) => p.brand === filterBrand);
    if (filterStatus !== "Status")
      list = list.filter((p) => getStockStatus(p) === filterStatus);
    if (filterPrice !== "Price") {
      const range = priceRanges.find((r) => r.label === filterPrice);
      if (range)
        list = list.filter(
          (p) => p.price >= range.min && p.price <= range.max
        );
    }
    const sort = sortFields.find((s) => s.label === sortLabel);
    if (sort) {
      list.sort((a, b) => {
        const av =
          sort.key === "stock"
            ? totalStock(a)
            : (a[sort.key as keyof Product] as number | string);
        const bv =
          sort.key === "stock"
            ? totalStock(b)
            : (b[sort.key as keyof Product] as number | string);
        if (av < bv) return sort.dir === "asc" ? -1 : 1;
        if (av > bv) return sort.dir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [
    products,
    searchTerm,
    filterCategory,
    filterCondition,
    filterStatus,
    filterBrand,
    filterPrice,
    sortLabel,
  ]);

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      await productService.delete(deletingProduct._id);
      setProducts((prev) =>
        prev.filter((p) => p._id !== deletingProduct._id)
      );
      setDeletingProduct(null);
    } catch {
      // keep modal open
    } finally {
      setIsDeleting(false);
    }
  };

  const safeProducts = products || [];
  const totalCount = safeProducts.length;
  const activeCount2 = safeProducts.filter(
    (p) => getStockStatus(p) === "In Stock"
  ).length;
  const outCount = safeProducts.filter(
    (p) => getStockStatus(p) === "Out of Stock"
  ).length;
  const invValue = safeProducts.reduce(
    (s, p) => s + (p.price || 0) * totalStock(p),
    0
  );
  const invDisplay =
    invValue >= 1_000_000
      ? `₦${(invValue / 1_000_000).toFixed(1)}m`
      : formatPrice(invValue);

  const getStatusClass = (status: string) => {
    if (status === "In Stock") return "text-green-600";
    if (status === "Out of Stock") return "text-destructive";
    if (status === "Low Stock") return "text-yellow-500";
    return "text-muted-foreground";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-muted-foreground gap-3">
        <Loader2 size={20} className="animate-spin text-primary" />
        <span className="text-sm">Loading products…</span>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-sm text-destructive">{fetchError}</p>
        <Button variant="outline" onClick={fetchProducts} className="gap-2">
          <RefreshCw size={14} /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div onClick={closeDropdown} className="animate-in fade-in duration-500">
      <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-5">
        Product Information
      </h1>

      {/* Stats — 2×2 on mobile, 4 on lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatsCard
          title="Total Products"
          value={String(totalCount)}
          variant="primary"
        />
        <StatsCard
          title="Active"
          value={String(activeCount2)}
          variant="default"
        />
        <StatsCard
          title="Out of Stock"
          value={String(outCount)}
          variant="primary"
        />
        <StatsCard
          title="Inv. Value"
          value={invDisplay}
          variant="success"
        />
      </div>

      {/* Filter toolbar */}
      <div className="bg-card border border-border rounded-xl p-3 sm:p-4 mb-5 shadow-sm">
        <div className="flex items-center gap-3 mb-0 sm:mb-4">
          <SearchInput
            placeholder="Search products…"
            value={searchTerm}
            onChange={setSearchTerm}
            className="flex-1 min-w-0"
          />
          {/* Mobile: filter button + add */}
          <button
            className="md:hidden inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground rounded-lg px-3 py-2 flex-shrink-0 relative"
            onClick={(e) => {
              e.stopPropagation();
              setShowMobileFilters(true);
            }}
          >
            <Filter size={14} />
            <span className="text-sm hidden sm:inline">Filters</span>
            {(activeFilterCount > 0 || sortLabel !== "Sort") && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount + (sortLabel !== "Sort" ? 1 : 0)}
              </span>
            )}
          </button>
          <Link to="add" className="flex-shrink-0">
            <Button className="gap-1 whitespace-nowrap px-3 sm:px-4">
              <Plus size={16} />
              <span className="hidden sm:inline">Add Product</span>
            </Button>
          </Link>
        </div>

        {/* Desktop filter row */}
        <div className="hidden md:flex items-center gap-2 flex-wrap mt-0">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mr-1">
            <SlidersHorizontal size={14} />
            <span>Filters:</span>
          </div>
          <FilterDropdown
            label="Category"
            value={filterCategory}
            options={categoryOptions}
            onChange={setFilterCategory}
            isOpen={openDropdown === "category"}
            onToggle={(e) => toggleDropdown("category", e)}
            onClose={closeDropdown}
          />
          <FilterDropdown
            label="Brand"
            value={filterBrand}
            options={brandOptions}
            onChange={setFilterBrand}
            isOpen={openDropdown === "brand"}
            onToggle={(e) => toggleDropdown("brand", e)}
            onClose={closeDropdown}
          />
          <FilterDropdown
            label="Condition"
            value={filterCondition}
            options={conditionOptions}
            onChange={setFilterCondition}
            isOpen={openDropdown === "condition"}
            onToggle={(e) => toggleDropdown("condition", e)}
            onClose={closeDropdown}
          />
          <FilterDropdown
            label="Status"
            value={filterStatus}
            options={statusOptions}
            onChange={setFilterStatus}
            isOpen={openDropdown === "status"}
            onToggle={(e) => toggleDropdown("status", e)}
            onClose={closeDropdown}
          />
          <FilterDropdown
            label="Price"
            value={filterPrice}
            options={priceRanges.map((r) => r.label)}
            onChange={setFilterPrice}
            isOpen={openDropdown === "price"}
            onToggle={(e) => toggleDropdown("price", e)}
            onClose={closeDropdown}
          />
          <div className="hidden md:block w-px h-6 bg-border mx-1" />
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
              <ChevronDown
                size={13}
                className={`transition-transform ${
                  openDropdown === "sort" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openDropdown === "sort" && (
              <div
                className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-20 min-w-[140px]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setSortLabel("Sort");
                    closeDropdown();
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-secondary/70 text-muted-foreground"
                >
                  Default
                </button>
                {sortFields.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => {
                      setSortLabel(s.label);
                      closeDropdown();
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary/70 ${
                      sortLabel === s.label
                        ? "text-primary font-medium"
                        : "text-popover-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {(activeFilterCount > 0 ||
            sortLabel !== "Sort" ||
            searchTerm) && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors ml-auto"
            >
              <X size={12} /> Clear all
            </button>
          )}
        </div>

        {/* Active filter chips (desktop) */}
        {activeFilterCount > 0 && (
          <div className="hidden md:flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">Active:</span>
            {[
              {
                label: filterCategory,
                reset: () => setFilterCategory("Category"),
                sentinel: "Category",
              },
              {
                label: filterBrand,
                reset: () => setFilterBrand("Brand"),
                sentinel: "Brand",
              },
              {
                label: filterCondition,
                reset: () => setFilterCondition("Condition"),
                sentinel: "Condition",
              },
              {
                label: filterStatus,
                reset: () => setFilterStatus("Status"),
                sentinel: "Status",
              },
              {
                label: filterPrice,
                reset: () => setFilterPrice("Price"),
                sentinel: "Price",
              },
            ]
              .filter(({ label, sentinel }) => label !== sentinel)
              .map(({ label, reset }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
                >
                  {label}
                  <button
                    onClick={reset}
                    className="hover:text-destructive transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Product count */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm sm:text-base font-medium text-foreground">
          Product List
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({filteredProducts.length} of {totalCount})
          </span>
        </h2>
      </div>

      {/* ── Desktop table ───────────────────────────────────────────── */}
      <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  "Product",
                  "Brand",
                  "Condition",
                  "Price",
                  "Stock",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="p-4 text-muted-foreground font-semibold whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <p className="text-muted-foreground italic mb-2">
                      No products match your filters.
                    </p>
                    <button
                      onClick={clearAll}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Clear all filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const stock = totalStock(product);
                  const status = getStockStatus(product);
                  return (
                    <tr
                      key={product._id}
                      className="hover:bg-muted/50 transition-colors group"
                    >
                      <td
                        className="p-4 font-medium cursor-pointer"
                        onClick={() => navigate(product.slug)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary/30 flex items-center justify-center p-1 overflow-hidden shrink-0 border border-border/50">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span className="text-[10px] text-muted-foreground">
                                No img
                              </span>
                            )}
                          </div>
                          <span className="line-clamp-1 text-foreground">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td
                        className="p-4 text-muted-foreground cursor-pointer"
                        onClick={() => navigate(product.slug)}
                      >
                        {product.brand}
                      </td>
                      <td
                        className="p-4 text-muted-foreground cursor-pointer"
                        onClick={() => navigate(product.slug)}
                      >
                        {product.condition}
                      </td>
                      <td
                        className="p-4 text-primary font-bold cursor-pointer"
                        onClick={() => navigate(product.slug)}
                      >
                        {formatPrice(product.price)}
                      </td>
                      <td
                        className="p-4 text-muted-foreground cursor-pointer"
                        onClick={() => navigate(product.slug)}
                      >
                        {stock}
                      </td>
                      <td
                        className={`p-4 font-bold cursor-pointer ${getStatusClass(status)}`}
                        onClick={() => navigate(product.slug)}
                      >
                        <span className="flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              status === "In Stock"
                                ? "bg-green-500"
                                : status === "Low Stock"
                                ? "bg-yellow-500"
                                : "bg-destructive"
                            }`}
                          />
                          {status}
                        </span>
                      </td>
                      <td
                        className="p-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setDeletingProduct(product)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile card list ─────────────────────────────────────────── */}
      <div className="md:hidden space-y-2">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground italic mb-3 text-sm">
              No products match your filters.
            </p>
            <button
              onClick={clearAll}
              className="text-xs text-primary hover:underline font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onNavigate={() => navigate(product.slug)}
              onDelete={(e) => {
                e.stopPropagation();
                setDeletingProduct(product);
              }}
            />
          ))
        )}
      </div>

      {/* Mobile filter sheet */}
      <MobileFilterSheet
        open={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        filterCategory={filterCategory}
        filterCondition={filterCondition}
        filterStatus={filterStatus}
        filterBrand={filterBrand}
        filterPrice={filterPrice}
        sortLabel={sortLabel}
        setFilterCategory={setFilterCategory}
        setFilterCondition={setFilterCondition}
        setFilterStatus={setFilterStatus}
        setFilterBrand={setFilterBrand}
        setFilterPrice={setFilterPrice}
        setSortLabel={setSortLabel}
        conditionOptions={conditionOptions}
        brandOptions={brandOptions}
        categoryOptions={categoryOptions}
        statusOptions={statusOptions}
        priceRanges={priceRanges}
        sortFields={sortFields}
        clearAll={clearAll}
      />

      <DeleteConfirmModal
        open={!!deletingProduct}
        name={deletingProduct?.name ?? ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingProduct(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ProductsPage;