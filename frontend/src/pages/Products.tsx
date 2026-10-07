import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Grid,
  List,
  X,
  Search,
  ArrowRight,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, type Product } from "@/services/products.service";
import { useInView } from "@/hooks/useInView";
import ShowcaseProductCard from "@/components/ShowcaseProductCard";
import ShowcaseProductListItem from "@/components/ShowcaseProductListItem";
import {
  newArrivals as newArrivalsAll,
  popularProducts as popularProductsAll,
  sweetDeals as sweetDealsAll,
} from "@/data/dummyProducts";
import graphicsGaming from "@/assets/graphics-gaming.png";
import graphicsHeadphones from "@/assets/graphics-headphones.png";
import graphicsLaptops from "@/assets/graphics-laptops.png";
import graphicsSmartphones from "@/assets/graphics-smartphones.png";
import graphicsTablets from "@/assets/graphics-tablets.png";
import graphicsWatches from "@/assets/graphics-watches.png";

const bannerCards = [
  {
    id: 1,
    image: graphicsGaming,
    title: "Get Your Favourite Gadget Fast, Easy, and Verified.",
  },
  {
    id: 2,
    image: graphicsHeadphones,
    title: "Join Thousands of Smart Shoppers.",
  },
  {
    id: 3,
    image: graphicsLaptops,
    title: "Premium Quality at Unbeatable Prices",
  },
  {
    id: 4,
    image: graphicsSmartphones,
    title: "24/7 Customer Support Always Here",
  },
  { id: 5, image: graphicsTablets, title: "Fast & Secure Delivery Nationwide" },
  { id: 6, image: graphicsWatches, title: "30-Day Money Back Guarantee" },
];

const PAGE_SIZE = 8;
const MAX_PRICE = 2_000_000;
const PRICE_STEP = 10_000;

const pillBase =
  "inline-flex h-10 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors";
const pillIdle = "border-gray-200 bg-white text-gray-700 hover:border-gray-300";

// ─────────────────────────────────────────────────────────────────────────────
// Filter sidebar pieces
// ─────────────────────────────────────────────────────────────────────────────
interface Option {
  label: string;
  count: number;
}

interface FilterGroupConfig {
  title: string;
  options: Option[];
  selected: string[];
  onToggle: (v: string) => void;
  onReset: () => void;
}

const buildOptions = (values: string[]): Option[] => {
  const counts = new Map<string, number>();
  values.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
  return [...counts.entries()].map(([label, count]) => ({ label, count }));
};

const CheckGroup = ({
  title,
  options,
  selected,
  onToggle,
  onReset,
}: FilterGroupConfig) => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? options : options.slice(0, 5);

  return (
    <div className="border-b border-gray-200 pb-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {selected.length > 0 && (
          <button
            onClick={onReset}
            className="text-xs text-gray-400 transition-colors hover:text-[#6426E1]"
          >
            Reset
          </button>
        )}
      </div>

      <ul className="space-y-2.5">
        {visible.map((o) => (
          <li key={o.label}>
            <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={selected.includes(o.label)}
                onChange={() => onToggle(o.label)}
                className="h-4 w-4 rounded border-gray-300 accent-[#6426E1]"
              />
              <span className="flex-1 truncate">{o.label}</span>
              <span className="text-xs text-gray-400">{o.count}</span>
            </label>
          </li>
        ))}
      </ul>

      {options.length > 5 && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-3 w-full rounded-full border border-gray-200 bg-white py-2 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
};

const thumbStyles =
  "pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#6426E1] [&::-webkit-slider-thumb]:shadow " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[#6426E1]";

const PriceSlider = ({
  value,
  onChange,
  onReset,
}: {
  value: [number, number];
  onChange: (v: [number, number]) => void;
  onReset: () => void;
}) => {
  const [min, max] = value;
  const pct = (n: number) => (n / MAX_PRICE) * 100;
  const changed = min > 0 || max < MAX_PRICE;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Price</h3>
        {changed && (
          <button
            onClick={onReset}
            className="text-xs text-gray-400 transition-colors hover:text-[#6426E1]"
          >
            Reset
          </button>
        )}
      </div>

      <div className="relative mx-1 h-5">
        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gray-200" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#6426E1]"
          style={{ left: `${pct(min)}%`, width: `${pct(max) - pct(min)}%` }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          min={0}
          max={MAX_PRICE}
          step={PRICE_STEP}
          value={min}
          onChange={(e) =>
            onChange([
              Math.min(parseInt(e.target.value), max - PRICE_STEP),
              max,
            ])
          }
          className={thumbStyles}
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={0}
          max={MAX_PRICE}
          step={PRICE_STEP}
          value={max}
          onChange={(e) =>
            onChange([
              min,
              Math.max(parseInt(e.target.value), min + PRICE_STEP),
            ])
          }
          className={thumbStyles}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>{formatPrice(min)}</span>
        <span>{formatPrice(max)}</span>
      </div>
    </div>
  );
};

interface FilterPanelProps {
  groups: FilterGroupConfig[];
  priceRange: [number, number];
  setPriceRange: (v: [number, number]) => void;
  hasActive: boolean;
  resetFilters: () => void;
}

const FilterPanel = ({
  groups,
  priceRange,
  setPriceRange,
  hasActive,
  resetFilters,
}: FilterPanelProps) => (
  <div className="space-y-5">
    {groups.map((g) => (
      <CheckGroup key={g.title} {...g} />
    ))}
    <PriceSlider
      value={priceRange}
      onChange={setPriceRange}
      onReset={() => setPriceRange([0, MAX_PRICE])}
    />
    {hasActive && (
      <button
        onClick={resetFilters}
        className="w-full rounded-full border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-300"
      >
        Reset all filters
      </button>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SectionBlock
// ─────────────────────────────────────────────────────────────────────────────
interface SectionBlockProps {
  title: string;
  id: string;
  sectionRef?: React.RefObject<HTMLDivElement>;
  list: Product[];
  viewMode: "grid" | "list";
  badge?: string;
  resetFilters: () => void;
}

const SectionBlock = ({
  title,
  id,
  sectionRef,
  list,
  viewMode,
  badge,
  resetFilters,
}: SectionBlockProps) => {
  const { ref: headerRef, isInView: headerInView } = useInView();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = list.slice(0, visible);
  const hasMore = list.length > visible;

  return (
    <div ref={sectionRef} id={id} className="mb-10 scroll-mt-24 sm:mb-12">
      <div
        ref={headerRef}
        className="mb-4 flex items-baseline justify-between transition-all duration-700 ease-out sm:mb-5"
        style={{
          opacity: headerInView ? 1 : 0,
          transform: headerInView ? "translateY(0)" : "translateY(16px)",
        }}
      >
        <h2 className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
          {title}
        </h2>
        <p className="text-xs text-gray-500 sm:text-sm">
          {list.length} products
        </p>
      </div>

      {shown.length > 0 ? (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
              {shown.map((p, i) => (
                <ShowcaseProductCard
                  key={p.id}
                  product={p}
                  badge={badge}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {shown.map((p, i) => (
                <ShowcaseProductListItem
                  key={p.id}
                  product={p}
                  badge={badge}
                  index={i}
                />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:border-[#6426E1]/40 hover:text-[#6426E1] active:scale-95"
              >
                Load more
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white py-10 text-center">
          <Search className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">
            No products match your filters
          </p>
          <Button
            variant="ghost"
            onClick={resetFilters}
            className="mt-3 text-sm text-[#6426E1]"
          >
            Reset filters
          </Button>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Products page
// ─────────────────────────────────────────────────────────────────────────────
const Products = () => {
  const location = useLocation();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    0,
    MAX_PRICE,
  ]);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // ── Banner carousel (fade) ─────────────────────────────────────────────────
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setCurrentSlide((i) => (i + 1) % bannerCards.length),
      5000,
    );
    return () => clearInterval(id);
  }, []);

  // ── Section refs + hash scroll (homepage "View All" links land here) ───────
  const newArrivalsRef = useRef<HTMLDivElement>(null);
  const popularRef = useRef<HTMLDivElement>(null);
  const sweetDealsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!location.hash) return;
    const targets: Record<string, React.RefObject<HTMLDivElement>> = {
      "#new-arrivals": newArrivalsRef,
      "#popular": popularRef,
      "#sweet-deals": sweetDealsRef,
    };
    const tryScroll = () => {
      const el = targets[location.hash]?.current;
      if (!el) return false;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return true;
    };
    if (!tryScroll()) {
      const t = setTimeout(tryScroll, 300);
      return () => clearTimeout(t);
    }
  }, [location.hash]);

  // ── Filter options (with counts) ───────────────────────────────────────────
  const allLoaded = [
    ...newArrivalsAll,
    ...popularProductsAll,
    ...sweetDealsAll,
  ];
  const brandOptions = buildOptions(allLoaded.map((p) => p.brand));
  const categoryOptions = buildOptions(allLoaded.map((p) => p.category));
  const conditionOptions = buildOptions(allLoaded.map((p) => p.condition));

  const toggle =
    (setter: React.Dispatch<React.SetStateAction<string[]>>) => (v: string) =>
      setter((prev) =>
        prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
      );

  const filterGroups: FilterGroupConfig[] = [
    {
      title: "Brand",
      options: brandOptions,
      selected: selectedBrands,
      onToggle: toggle(setSelectedBrands),
      onReset: () => setSelectedBrands([]),
    },
    {
      title: "Category",
      options: categoryOptions,
      selected: selectedCategories,
      onToggle: toggle(setSelectedCategories),
      onReset: () => setSelectedCategories([]),
    },
    {
      title: "Condition",
      options: conditionOptions,
      selected: selectedConditions,
      onToggle: toggle(setSelectedConditions),
      onReset: () => setSelectedConditions([]),
    },
  ];

  const filterProducts = (list: Product[]) =>
    list.filter(
      (p) =>
        (selectedBrands.length === 0 || selectedBrands.includes(p.brand)) &&
        (selectedCategories.length === 0 ||
          selectedCategories.includes(p.category)) &&
        (selectedConditions.length === 0 ||
          selectedConditions.includes(p.condition)) &&
        p.price >= priceRange[0] &&
        p.price <= priceRange[1],
    );

  const newArrivals = filterProducts(newArrivalsAll);
  const popularProducts = filterProducts(popularProductsAll);
  const sweetDeals = filterProducts(sweetDealsAll);
  const totalShown =
    newArrivals.length + popularProducts.length + sweetDeals.length;

  const activeFiltersCount = [
    selectedBrands.length > 0,
    selectedCategories.length > 0,
    selectedConditions.length > 0,
    priceRange[0] > 0 || priceRange[1] < MAX_PRICE,
  ].filter(Boolean).length;
  const hasActive = activeFiltersCount > 0;

  const resetFilters = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedConditions([]);
    setPriceRange([0, MAX_PRICE]);
  };

  const filterPanelProps: FilterPanelProps = {
    groups: filterGroups,
    priceRange,
    setPriceRange,
    hasActive,
    resetFilters,
  };

  const { ref: ctaRef, isInView: ctaInView } = useInView({ threshold: 0.1 });

  return (
    <div className="min-h-screen bg-white">
      {/* One shared wrapper so the filter button, banner, sidebar and grid all share the same edges */}
      <div className="w-full px-3 pb-12 pt-4 sm:px-5 sm:pt-5 lg:px-6">
        {/* ── Mobile filter button ─────────────────────────────────────────── */}
        <div className="mb-4 flex lg:hidden">
          <button
            onClick={() => setShowMobileFilter(true)}
            className={`${pillBase} ${pillIdle} relative gap-1.5`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
            {activeFiltersCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#6426E1] text-[10px] font-bold text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Banner carousel (full width, aligned with the content) ───────── */}
        <div className="mb-6 sm:mb-8">
          <div className="relative h-[150px] overflow-hidden rounded-2xl bg-gray-100 sm:h-[220px] lg:h-[280px] xl:h-[320px]">
            {bannerCards.map((card, i) => (
              <div
                key={card.id}
                aria-hidden={i !== currentSlide}
                className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                style={{
                  opacity: i === currentSlide ? 1 : 0,
                  zIndex: i === currentSlide ? 1 : 0,
                }}
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-center gap-1.5">
            {bannerCards.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === i
                    ? "w-5 bg-[#6426E1]"
                    : "w-1.5 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── Breadcrumb + title ───────────────────────────────────────────── */}
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
          <div className="min-w-0">
            <nav
              aria-label="Breadcrumb"
              className="mb-1.5 flex items-center gap-1 text-xs text-gray-500"
            >
              <Link to="/" className="transition-colors hover:text-gray-900">
                Home
              </Link>
              <ChevronRight className="h-3 w-3" aria-hidden />
              <span className="text-gray-900">Products</span>
            </nav>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Gadget Collection
            </h1>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              {totalShown} products
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {hasActive && (
              <button
                onClick={resetFilters}
                className="hidden items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 sm:flex"
              >
                <X className="h-3 w-3" /> Clear all
              </button>
            )}
            <div className="flex items-center gap-1 rounded-full bg-gray-100 p-1">
              {(["grid", "list"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  aria-label={`${mode} view`}
                  className={`rounded-full p-1.5 transition-colors ${
                    viewMode === mode
                      ? "bg-white text-[#6426E1] shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  {mode === "grid" ? (
                    <Grid className="h-4 w-4" />
                  ) : (
                    <List className="h-4 w-4" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Sidebar + products ───────────────────────────────────────────── */}
        <div className="flex gap-8 xl:gap-10">
          {/* Filter sidebar (desktop) */}
          <aside className="hidden w-60 shrink-0 lg:block xl:w-64">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-gray-200/70 bg-[#F5F5F7] p-5 [scrollbar-width:thin]">
              <FilterPanel {...filterPanelProps} />
            </div>
          </aside>

          {/* Product sections */}
          <div className="min-w-0 flex-1">
            <SectionBlock
              title="New Arrivals"
              id="new-arrivals"
              sectionRef={newArrivalsRef}
              list={newArrivals}
              viewMode={viewMode}
              badge="New"
              resetFilters={resetFilters}
            />
            <SectionBlock
              title="Popular Products"
              id="popular"
              sectionRef={popularRef}
              list={popularProducts}
              viewMode={viewMode}
              resetFilters={resetFilters}
            />
            <SectionBlock
              title="Sweet Deals"
              id="sweet-deals"
              sectionRef={sweetDealsRef}
              list={sweetDeals}
              viewMode={viewMode}
              badge="Deal"
              resetFilters={resetFilters}
            />

            {/* CTA */}
            <div
              ref={ctaRef}
              className="mt-4 rounded-2xl border border-[#6426E1]/10 bg-[#6426E1]/5 py-10 text-center transition-all duration-700 ease-out sm:py-14"
              style={{
                opacity: ctaInView ? 1 : 0,
                transform: ctaInView ? "translateY(0)" : "translateY(24px)",
              }}
            >
              <div className="mx-auto max-w-md px-4">
                <h2 className="mb-3 text-xl font-bold text-gray-900 sm:text-2xl">
                  Need Advanced Filters?
                </h2>
                <p className="mb-6 text-sm text-gray-600 sm:text-base">
                  Visit our categories page for detailed specs, advanced
                  filtering and more!
                </p>
                <Link to="/categories">
                  <Button className="w-full rounded-full bg-[#6426E1] px-8 py-5 text-base font-semibold text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-[#5420c4] active:scale-95 sm:w-auto">
                    Go to Categories <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile / tablet filter drawer ──────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-[60] transition-all duration-300 lg:hidden ${
          showMobileFilter
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowMobileFilter(false)}
        />
        <div
          className={`absolute inset-y-0 right-0 flex w-[85vw] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
            showMobileFilter ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-gray-100 p-4">
            <h3 className="text-base font-bold text-gray-900">
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </h3>
            <button
              onClick={() => setShowMobileFilter(false)}
              aria-label="Close filters"
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <FilterPanel {...filterPanelProps} />
          </div>
          <div className="border-t border-gray-100 p-4">
            <Button
              className="h-11 w-full rounded-full bg-[#6426E1] font-semibold text-white hover:bg-[#5520c0]"
              onClick={() => setShowMobileFilter(false)}
            >
              Show Results ({totalShown})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;