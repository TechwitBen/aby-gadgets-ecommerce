import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  WifiOff,
  RefreshCw,
  ClipboardList,
  PackageCheck,
} from "lucide-react";
import {
  orderService,
  type OrderDoc,
  type OrderStatus,
  type FulfillmentType,
} from "@/services/order.service";
import { paymentService } from "@/services/payment.service";
import { useToast } from "@/hooks/use-toast";

// ── Constants ─────────────────────────────────────────────────────────────────
const COMPLETED_STATUSES = new Set([
  "delivered",
  "cancelled",
  "refunded",
  "collected",
]);
const isCompleted = (o: OrderDoc) => COMPLETED_STATUSES.has(o.status);

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

const displayOrderId = (order: OrderDoc): string =>
  order.order_number ?? `#${order._id.slice(-8).toUpperCase()}`;

// ── Status styles ─────────────────────────────────────────────────────────────
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
  ready_for_pickup: {
    badge: "bg-teal-50 text-teal-700 border border-teal-200",
    dot: "bg-teal-500",
  },
  collected: {
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
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
type Tab = "active" | "completed";
const ACTIVE_FILTERS: ("All" | OrderStatus)[] = [
  "All",
  "pending",
  "confirmed",
  "shipped",
  "ready_for_pickup",
];
const COMPLETED_FILTERS: ("All" | OrderStatus)[] = [
  "All",
  "delivered",
  "collected",
  "cancelled",
  "refunded",
];

// ── Completed-order action button config ──────────────────────────────────────
const completedButtonConfig = (status: OrderStatus, isPickup: boolean) => {
  if (status === "delivered")
    return {
      label: "Order Delivered",
      style: { backgroundColor: "#059669" },
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
    };
  if (status === "collected")
    return {
      label: "Order Collected",
      style: { backgroundColor: "#059669" },
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
    };
  if (status === "cancelled")
    return {
      label: "View Cancelled Order",
      style: { backgroundColor: "#DC2626" },
      icon: (
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
    };
  if (status === "refunded")
    return {
      label: "View Refund",
      style: { backgroundColor: "#6B7280" },
      icon: (
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
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
      ),
    };
  return {
    label: "View Details",
    style: { backgroundColor: "#6426E1" },
    icon: null,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
const MyOrdersPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("active");
  const [filter, setFilter] = useState<"All" | OrderStatus>("All");
  const [search, setSearch] = useState("");
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [retryError, setRetryError] = useState<string | null>(null);

  // FIX: added `silent` flag — background re-fetches skip the loading spinner
  // so the UI doesn't flash while the user is looking at their orders.
  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      setOrders(await orderService.getMyOrders());
    } catch {
      if (!silent) setError("Failed to load orders. Please check your connection.");
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // FIX: re-fetch silently whenever the tab becomes visible again.
  // When the user returns from Paystack the webhook has already updated
  // payment_status → "paid", so this single listener replaces the need
  // for polling or manual refresh.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchOrders(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [fetchOrders]);

  // FIX: detect Paystack callback URL (?reference=xxx or ?trxref=xxx) and
  // show a single informational toast so the user knows payment was received.
  // Runs once on mount; cleans the URL so it never fires again on refresh.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("reference") || params.get("trxref");
    if (!ref) return;
    window.history.replaceState({}, "", window.location.pathname);
    toast({
      title: "Payment received",
      description:
        "Your payment is being verified. Your order status will update shortly.",
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Retry payment handler ─────────────────────────────────────────────────
  const handleRetryPayment = async (orderId: string) => {
    setRetryingId(orderId);
    setRetryError(null);
    try {
      const { authorization_url } = await paymentService.initializePayment({
        orderId,
      });
      window.location.href = authorization_url;
    } catch (err: any) {
      setRetryError(
        err?.response?.data?.message ??
          "Could not start payment. Please try again or contact support.",
      );
      setRetryingId(null);
    }
  };

  const handleTabChange = (t: Tab) => {
    setTab(t);
    setFilter("All");
    setRetryError(null);
  };

  const tabOrders = orders.filter((o) =>
    tab === "active" ? !isCompleted(o) : isCompleted(o),
  );

  const filtered = tabOrders.filter((o) => {
    const matchFilter = filter === "All" || o.status === filter;
    const matchSearch =
      o._id.toLowerCase().includes(search.toLowerCase()) ||
      (o.order_number ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (o.shipping_address?.full_name ?? "")
        .toLowerCase()
        .includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const activeCount = orders.filter((o) => !isCompleted(o)).length;
  const completedCount = orders.filter(isCompleted).length;
  const subFilters = tab === "active" ? ACTIVE_FILTERS : COMPLETED_FILTERS;

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center gap-3 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-sm">Loading orders…</span>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <WifiOff className="w-10 h-10 text-gray-400" />
        <p className="text-sm text-gray-500">{error}</p>
        <button
          onClick={() => fetchOrders()}
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:border-purple-400 hover:text-purple-600 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {orders.length} total order{orders.length !== 1 ? "s" : ""}
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
              placeholder="Search by name, order ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition"
              style={{ "--tw-ring-color": "#6426E1" } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Primary tabs */}
        <div className="max-w-7xl mx-auto mt-5 flex border-b border-gray-200">
          {(["active", "completed"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                tab === t
                  ? "border-[#6426E1] text-[#6426E1]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "active" ? (
                <ClipboardList className="w-4 h-4" />
              ) : (
                <PackageCheck className="w-4 h-4" />
              )}
              {t === "active" ? "Active" : "Completed"}
              <span
                className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                style={
                  tab === t
                    ? { backgroundColor: "#6426E1", color: "#fff" }
                    : { backgroundColor: "#F3F4F6", color: "#6B7280" }
                }
              >
                {t === "active" ? activeCount : completedCount}
              </span>
            </button>
          ))}
        </div>

        {/* Sub-filter pills */}
        <div className="max-w-7xl mx-auto mt-3 flex gap-2 flex-wrap">
          {subFilters.map((opt) => (
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
              {opt === "ready_for_pickup" ? "Ready for Pickup" : opt}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Retry error banner */}
        {retryError && (
          <div className="mb-4 flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <svg
              className="w-4 h-4 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"
              />
            </svg>
            <span>{retryError}</span>
            <button
              onClick={() => setRetryError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
              style={{ backgroundColor: "#F3EEFF" }}
            >
              {tab === "active" ? (
                <ClipboardList
                  className="w-10 h-10"
                  style={{ color: "#6426E1" }}
                />
              ) : (
                <PackageCheck
                  className="w-10 h-10"
                  style={{ color: "#6426E1" }}
                />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {tab === "active" ? "No active orders" : "No completed orders"}
            </h3>
            <p className="text-sm text-gray-500 max-w-xs">
              {search || filter !== "All"
                ? "No orders match your current filter."
                : tab === "active"
                  ? "Your pending, confirmed and in-transit orders will appear here."
                  : "Delivered, collected, cancelled and refunded orders will appear here."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((order) => {
              const orderIsCompleted = COMPLETED_STATUSES.has(order.status);
              const isPickup = order.fulfillment_type === "pickup";
              const btnConfig = orderIsCompleted
                ? completedButtonConfig(order.status as OrderStatus, isPickup)
                : null;

              const needsPayment =
                order.status !== "cancelled" &&
                order.payment_status === "unpaid" &&
                (order as any).payment_method !== "pod";

              const isRetrying = retryingId === order._id;

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Unpaid warning banner */}
                  {needsPayment && (
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 border-b border-amber-100">
                      <svg
                        className="w-3.5 h-3.5 text-amber-500 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs font-semibold text-amber-700">
                        Payment pending — complete payment to confirm your order
                      </span>
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 text-base font-mono">
                            Order {displayOrderId(order)}
                          </h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isPickup
                                ? "bg-teal-100 text-teal-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {isPickup ? "🏪 Pickup" : "🚚 Delivery"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-GB",
                          )}
                          &nbsp;·&nbsp;
                          {order.items.reduce((s, i) => s + i.quantity, 0)}{" "}
                          item(s)
                          {isPickup && (
                            <>
                              {" "}
                              &nbsp;·&nbsp;{" "}
                              <span className="text-teal-600">Free Pickup</span>
                            </>
                          )}
                          {!isPickup && order.delivery_city && (
                            <> &nbsp;·&nbsp; {order.delivery_city}</>
                          )}
                        </p>
                        <p className="text-lg font-bold text-gray-900 mt-2">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                      <div className="flex flex-row sm:flex-col items-start gap-2 sm:items-end">
                        <Badge
                          label={order.payment_status}
                          styles={
                            PAY_STYLES[order.payment_status] ??
                            PAY_STYLES.unpaid
                          }
                        />
                        <Badge
                          label={order.status.replace(/_/g, " ")}
                          styles={
                            STATUS_STYLES[order.status] ?? STATUS_STYLES.pending
                          }
                        />
                      </div>
                    </div>

                    {/* Pickup code banner */}
                    {isPickup &&
                      order.pickup_code &&
                      order.status === "ready_for_pickup" && (
                        <div className="mt-3 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
                          <p className="text-xs text-teal-600 font-semibold mb-0.5">
                            Your Pickup Code
                          </p>
                          <p className="text-xl font-black text-teal-800 tracking-widest font-mono">
                            {order.pickup_code}
                          </p>
                          <p className="text-xs text-teal-600 mt-0.5">
                            Show this at the store when collecting.
                          </p>
                        </div>
                      )}

                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 flex-wrap">
                      {/* Complete Payment button (highest priority) */}
                      {needsPayment && (
                        <button
                          onClick={() => handleRetryPayment(order._id)}
                          disabled={isRetrying}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{ backgroundColor: "#6426E1" }}
                        >
                          {isRetrying ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
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
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                              />
                            </svg>
                          )}
                          {isRetrying ? "Opening payment…" : "Complete Payment"}
                        </button>
                      )}

                      {/* Track / View button */}
                      {orderIsCompleted && btnConfig ? (
                        <button
                          onClick={() => navigate(`/track-order/${order._id}`)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                          style={btnConfig.style}
                        >
                          {btnConfig.icon}
                          {btnConfig.label}
                        </button>
                      ) : isPickup ? (
                        <button
                          onClick={() => navigate(`/track-order/${order._id}`)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                          style={{ backgroundColor: "#0d9488" }}
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
                              d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                            />
                            <polyline
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              points="9 22 9 12 15 12 15 22"
                            />
                          </svg>
                          View Pickup Details
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/track-order/${order._id}`)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                          style={{
                            backgroundColor: needsPayment
                              ? "#9CA3AF"
                              : "#6426E1",
                          }}
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
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Track Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;