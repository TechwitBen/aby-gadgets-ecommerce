import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowLeft,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react";
import { productService } from "@/services/products.service";

// ─── Debounce hook ────────────────────────────────────────────────────────────
function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Price formatter ──────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

const RECENT_KEY = "ag_recent_searches";
const MAX_RECENT = 6;

const getRecent = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
};
const saveRecent = (term) => {
  const prev = getRecent().filter((t) => t !== term);
  localStorage.setItem(
    RECENT_KEY,
    JSON.stringify([term, ...prev].slice(0, MAX_RECENT)),
  );
};

// ─── Skeleton card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 animate-pulse">
    <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
    </div>
    <div className="h-5 w-20 bg-gray-100 rounded-lg" />
  </div>
);

// ─── Product result card ──────────────────────────────────────────────────────
const ProductCard = ({ product, query, onClick }) => {
  const lowestPrice = product.variants?.length
    ? Math.min(...product.variants.map((v) => v.price))
    : null;

  // Bold-highlight matching text
  const highlight = (text = "") => {
    if (!query.trim()) return text;
    const parts = text.split(
      new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
    );
    return parts.map((p, i) =>
      p.toLowerCase() === query.toLowerCase() ? (
        <mark
          key={i}
          className="bg-violet-100 text-violet-700 rounded px-0.5 font-semibold not-italic"
        >
          {p}
        </mark>
      ) : (
        p
      ),
    );
  };

  return (
    <button
      onClick={() => onClick(product)}
      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-violet-200 hover:shadow-md hover:shadow-violet-50 transition-all duration-200 text-left group"
    >
      {/* Image */}
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 ring-1 ring-gray-100 group-hover:ring-violet-200 transition-all">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Search size={20} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate leading-snug">
          {highlight(product.name)}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {highlight(product.brand)} · {highlight(product.category)}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          {product.condition && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100">
              {product.condition}
            </span>
          )}
          {product.rating > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-500 font-medium">
              <Star size={10} fill="currentColor" />
              {product.rating}
            </span>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="flex-shrink-0 text-right">
        {lowestPrice != null ? (
          <>
            <p className="text-xs text-gray-400 leading-none mb-0.5">from</p>
            <p className="text-sm font-bold text-gray-900">
              {fmt(lowestPrice)}
            </p>
          </>
        ) : (
          <p className="text-xs text-gray-400">—</p>
        )}
      </div>
    </button>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQ = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [allProducts, setAllProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState(getRecent());
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    condition: "",
  });

  const inputRef = useRef(null);
  const debouncedQuery = useDebounce(query, 300);

  // Auto-focus
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Load all products once
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await productService.getAll();
        // Support both { products: [...] } and plain array responses
        setAllProducts(Array.isArray(data) ? data : data.products || []);
      } catch (e) {
        console.error(e);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter whenever query or products change
  useEffect(() => {
    const q = debouncedQuery.trim().toLowerCase();

    // Update URL
    if (q) {
      setSearchParams({ q: debouncedQuery }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }

    if (!q && !filters.category && !filters.brand && !filters.condition) {
      setFiltered([]);
      return;
    }

    const results = allProducts.filter((p) => {
      const matchQ =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q));

      const matchCat = !filters.category || p.category === filters.category;
      const matchBrand = !filters.brand || p.brand === filters.brand;
      const matchCond = !filters.condition || p.condition === filters.condition;

      return matchQ && matchCat && matchBrand && matchCond;
    });

    setFiltered(results);
  }, [debouncedQuery, allProducts, filters]);

  // Derived filter options from loaded products
  const categories = [
    ...new Set(allProducts.map((p) => p.category).filter(Boolean)),
  ].sort();
  const brands = [
    ...new Set(allProducts.map((p) => p.brand).filter(Boolean)),
  ].sort();
  const conditions = [
    ...new Set(allProducts.map((p) => p.condition).filter(Boolean)),
  ].sort();

  const handleProductClick = (product) => {
    if (query.trim()) {
      saveRecent(query.trim());
      setRecentSearches(getRecent());
    }
    navigate(`/products/${product._id || product.id}`);
  };

  const clearQuery = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const applyRecent = (term) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  const clearAllFilters = () =>
    setFilters({ category: "", brand: "", condition: "" });
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const showEmpty = !loading && debouncedQuery.trim() && filtered.length === 0;
  const showResults = !loading && filtered.length > 0;
  const showIdle = !loading && !debouncedQuery.trim() && !activeFilterCount;

  return (
    <div
      className="min-h-screen bg-[#faf9ff]"
      style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .search-input::placeholder { color: #c4b8e8; }
        .filter-chip { transition: all .15s; }
        .filter-chip.active { background: #6426E1; color: #fff; border-color: #6426E1; }
        .fade-in { animation: fadeUp .2s ease both; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .result-row { animation: fadeUp .18s ease both; }
      `}</style>

      {/* ── Header bar ── */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Search input */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400"
              size={16}
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search phones, laptops, gadgets…"
              className="search-input w-full pl-9 pr-9 py-2.5 bg-[#f3f0fc] rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400/40 transition-all"
            />
            {query && (
              <button
                onClick={clearQuery}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setFilterOpen((p) => !p)}
            className={`flex-shrink-0 relative flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              filterOpen || activeFilterCount
                ? "bg-violet-600 text-white border-violet-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-violet-300"
            }`}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Filter panel ── */}
        {filterOpen && (
          <div className="bg-white border-t border-gray-100 px-4 py-4 max-w-2xl mx-auto fade-in">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Filters
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-violet-600 hover:opacity-75 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Category */}
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-1.5">Category</p>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() =>
                      setFilters((f) => ({
                        ...f,
                        category: f.category === c ? "" : c,
                      }))
                    }
                    className={`filter-chip text-xs px-3 py-1 rounded-full border font-medium ${
                      filters.category === c
                        ? "active"
                        : "bg-white text-gray-600 border-gray-200 hover:border-violet-300"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand */}
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-1.5">Brand</p>
              <div className="flex flex-wrap gap-1.5">
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() =>
                      setFilters((f) => ({
                        ...f,
                        brand: f.brand === b ? "" : b,
                      }))
                    }
                    className={`filter-chip text-xs px-3 py-1 rounded-full border font-medium ${
                      filters.brand === b
                        ? "active"
                        : "bg-white text-gray-600 border-gray-200 hover:border-violet-300"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Condition</p>
              <div className="flex flex-wrap gap-1.5">
                {conditions.map((c) => (
                  <button
                    key={c}
                    onClick={() =>
                      setFilters((f) => ({
                        ...f,
                        condition: f.condition === c ? "" : c,
                      }))
                    }
                    className={`filter-chip text-xs px-3 py-1 rounded-full border font-medium ${
                      filters.condition === c
                        ? "active"
                        : "bg-white text-gray-600 border-gray-200 hover:border-violet-300"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Idle state */}
        {showIdle && (
          <div className="space-y-8 fade-in">
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <Clock size={12} /> Recent
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem(RECENT_KEY);
                      setRecentSearches([]);
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => applyRecent(term)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-sm text-gray-700 hover:border-violet-400 hover:text-violet-700 transition-colors"
                    >
                      <Clock size={11} className="text-gray-300" />
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending suggestion – first 6 products */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                <TrendingUp size={12} /> Trending
              </div>
              <div className="space-y-2">
                {allProducts.slice(0, 6).map((p) => (
                  <ProductCard
                    key={p._id || p.id}
                    product={p}
                    query=""
                    onClick={handleProductClick}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        {showResults && (
          <div className="mb-4 fade-in">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">
                {filtered.length}
              </span>{" "}
              result{filtered.length !== 1 ? "s" : ""} for{" "}
              {debouncedQuery && (
                <span className="font-semibold text-violet-700">
                  "{debouncedQuery}"
                </span>
              )}
              {activeFilterCount > 0 && (
                <span className="text-gray-400">
                  {" "}
                  · {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}{" "}
                  applied
                </span>
              )}
            </p>
          </div>
        )}

        {/* Results */}
        {showResults && (
          <div className="space-y-2">
            {filtered.map((p, i) => (
              <div
                key={p._id || p.id}
                className="result-row"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <ProductCard
                  product={p}
                  query={debouncedQuery}
                  onClick={handleProductClick}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {showEmpty && (
          <div className="fade-in text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
              <Search size={28} className="text-violet-300" />
            </div>
            <p className="font-semibold text-gray-800 text-lg mb-1">
              No results found
            </p>
            <p className="text-sm text-gray-400">
              No products match{" "}
              <span className="font-medium text-gray-600">
                "{debouncedQuery}"
              </span>
              {activeFilterCount > 0 && " with the current filters"}.
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="mt-4 text-sm text-violet-600 hover:opacity-75 font-medium underline underline-offset-2"
              >
                Clear filters and try again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
