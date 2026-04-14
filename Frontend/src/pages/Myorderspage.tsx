import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, WifiOff, RefreshCw } from "lucide-react";
import {
  orderService,
  type OrderDoc,
  type OrderStatus,
} from "@/services/Order.service";

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  pending: {
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-500",
  },
  confirmed: {
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
    dot: "bg-blue-500",
  },
  shipped: {
    badge: "bg-purple-50 text-purple-700 border border-purple-200",
    dot: "bg-purple-500",
  },
  delivered: {
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  cancelled: {
    badge: "bg-red-50 text-red-700 border border-red-200",
    dot: "bg-red-500",
  },
  refunded: {
    badge: "bg-gray-50 text-gray-700 border border-gray-200",
    dot: "bg-gray-500",
  },
};

const PAY_STYLES: Record<string, { badge: string; dot: string }> = {
  unpaid: {
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-500",
  },
  paid: {
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  refunded: {
    badge: "bg-gray-50 text-gray-700 border border-gray-200",
    dot: "bg-gray-500",
  },
};

const Badge = ({
  label,
  styles,
}: {
  label: string;
  styles: { badge: string; dot: string };
}) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles.badge}`}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
    {label}
  </span>
);

// ── Filter options ────────────────────────────────────────────────────────────
type FilterOption = "All" | OrderStatus;
const filterOptions: FilterOption[] = [
  "All",
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

// ─────────────────────────────────────────────────────────────────────────────
const MyOrdersPage = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // ← add
  const [filter, setFilter] = useState<FilterOption>("All");
  const [search, setSearch] = useState("");

  const fetchOrders = useCallback(async () => {
    // ← wrap in useCallback
    setIsLoading(true);
    setError(null);
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch {
      setError("Failed to load orders. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = orders.filter((o) => {
    const matchFilter = filter === "All" || o.status === filter;
    const matchSearch =
      o._id.toLowerCase().includes(search.toLowerCase()) ||
      (o.shipping_address?.full_name ?? "")
        .toLowerCase()
        .includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-sm">Loading orders…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <WifiOff className="w-10 h-10 text-gray-400" />
        <p className="text-sm text-gray-500">{error}</p>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:border-purple-400 hover:text-purple-600 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {orders.length} orders placed
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by name or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition"
              style={{ "--tw-ring-color": "#6426E1" } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="max-w-7xl mx-auto mt-4 flex gap-2 flex-wrap">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border capitalize ${
                filter === opt
                  ? "text-white border-transparent shadow-sm"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
              style={
                filter === opt
                  ? { backgroundColor: "#6426E1", borderColor: "#6426E1" }
                  : {}
              }
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Loading orders…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
              style={{ backgroundColor: "#F3EEFF" }}
            >
              <svg
                className="w-10 h-10"
                style={{ color: "#6426E1" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No orders yet
            </h3>
            <p className="text-sm text-gray-500 max-w-xs">
              {search || filter !== "All"
                ? "No orders match your current filter."
                : "When you place an order, it will show up here."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(order.createdAt).toLocaleDateString("en-GB")}{" "}
                        &nbsp;·&nbsp;
                        {order.items.reduce((s, i) => s + i.quantity, 0)}{" "}
                        item(s)
                      </p>
                      <p className="text-lg font-bold text-gray-900 mt-2">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                    <div className="flex flex-row sm:flex-col items-start gap-2 sm:items-end">
                      <Badge
                        label={order.payment_status}
                        styles={
                          PAY_STYLES[order.payment_status] ?? PAY_STYLES.unpaid
                        }
                      />
                      <Badge
                        label={order.status}
                        styles={
                          STATUS_STYLES[order.status] ?? STATUS_STYLES.pending
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => navigate(`/track-order/${order._id}`)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                      style={{ backgroundColor: "#6426E1" }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
                        />
                      </svg>
                      Track Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
