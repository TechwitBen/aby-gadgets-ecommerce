import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowLeft,
  TrendingUp,
  Clock,
  Star,
  Loader2,
} from "lucide-react";
import { productService } from "@/services/products.service";

function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

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

const SkeletonCard = () => (
  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 animate-pulse">
    <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
    <div className="h-5 w-20 bg-gray-100 rounded-lg" />
  </div>
);

const ProductCard = ({ product, query, onClick }) => {
  const lowestPrice = product.variants?.length
    ? Math.min(...product.variants.map((v) => v.price))
    : null;

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
      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all duration-200 text-left group"
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 ring-1 ring-gray-100 group-hover:ring-violet-200 transition-all">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Search size={20} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">
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
              <Star size={10} fill="currentColor" /> {product.rating}
            </span>
          )}
        </div>
      </div>
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

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQ = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState([]);
  const [trending, setTrending] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState(getRecent());

  const inputRef = useRef(null);
  const debouncedQuery = useDebounce(query, 300);
  const abortRef = useRef(null); // ← cancel previous request

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Load trending products once on mount (small fetch — just 6)
  useEffect(() => {
    productService
      .getAll({ limit: 6, sortBy: "most_popular" })
      .then((data) => setTrending(data?.products ?? []))
      .catch(() => setTrending([]));
  }, []);

  // Search whenever debounced query changes
  useEffect(() => {
    const q = debouncedQuery.trim();

    // Update URL
    if (q) {
      setSearchParams({ q: debouncedQuery }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
      setResults([]);
      return;
    }

    // Cancel previous in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsSearching(true);

    productService
      .getAll({ search: q, limit: 20 })
      .then((data) => {
        if (!controller.signal.aborted) {
          setResults(data?.products ?? []);
        }
      })
      .catch((err) => {
        if (err?.name !== "CanceledError") setResults([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsSearching(false);
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  const handleProductClick = (product) => {
    if (query.trim()) {
      saveRecent(query.trim());
      setRecentSearches(getRecent());
    }
    navigate(`/products/${product.slug ?? product._id ?? product.id}`);
  };

  const clearQuery = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  const showIdle = !query.trim() && !isSearching;
  const showResults = !isSearching && query.trim() && results.length > 0;
  const showEmpty = !isSearching && query.trim() && results.length === 0;

  return (
    <div
      className="min-h-screen bg-[#faf9ff]"
      style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}
    >
      <style>{`
        .search-input::placeholder { color: #c4b8e8; }
        .fade-in { animation: fadeUp .2s ease both; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .result-row { animation: fadeUp .18s ease both; }
      `}</style>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
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
            {/* Show spinner while searching, X when idle with query */}
            {isSearching ? (
              <Loader2
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 animate-spin"
              />
            ) : query ? (
              <button
                onClick={clearQuery}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Skeleton while searching */}
        {isSearching && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Idle — show recent + trending */}
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
                      onClick={() => setQuery(term)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-sm text-gray-700 hover:border-violet-400 hover:text-violet-700 transition-colors"
                    >
                      <Clock size={11} className="text-gray-300" /> {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {trending.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  <TrendingUp size={12} /> Trending
                </div>
                <div className="space-y-2">
                  {trending.map((p) => (
                    <ProductCard
                      key={p._id || p.id}
                      product={p}
                      query=""
                      onClick={handleProductClick}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {showResults && (
          <>
            <p className="text-sm text-gray-500 mb-4 fade-in">
              <span className="font-semibold text-gray-900">
                {results.length}
              </span>{" "}
              result{results.length !== 1 ? "s" : ""} for{" "}
              <span className="font-semibold text-violet-700">
                "{debouncedQuery}"
              </span>
            </p>
            <div className="space-y-2">
              {results.map((p, i) => (
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
          </>
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
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
