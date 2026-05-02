import { useState, useCallback, useEffect, useRef } from "react";
import { StatsCard } from "@/components/ui/stats-card";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Check,
  Loader2,
  RefreshCw,
  X,
  Filter,
  ClipboardList,
  PackageCheck,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { paymentService, type PaymentDoc } from "@/services/Payment.service";
import { orderService, type OrderDoc } from "@/services/Order.service";

// ── Constants ─────────────────────────────────────────────────────────────────
const CONFIRMED_STATUSES = new Set(["success", "cancelled"]);
const isConfirmedPayment = (status: string) => CONFIRMED_STATUSES.has(status);

const methodOptions = ["All", "paystack", "pod"];

const formatPrice = (n: number) => `₦${(n || 0).toLocaleString()}`;

const statusLabel: Record<string, string> = {
  success: "Confirmed",
  pending: "Pending",
  failed: "Failed",
  cancelled: "Cancelled",
};

const statusClass: Record<string, string> = {
  success: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-700",
};

// ── Unified display type ──────────────────────────────────────────────────────
interface PaymentDisplayItem {
  _id: string;
  payment_number: string | undefined;
  reference: string;
  order: string;
  order_number: string | undefined;
  fulfillment_type: "delivery" | "pickup" | undefined;
  amount: number;
  delivery_fee: number;
  payment_method: string;
  status: "pending" | "success" | "failed" | "cancelled";
  createdAt: string;
  isPOD: boolean;
  isAwaitingRetry: boolean; // NEW: Paystack order where init failed, no Payment doc yet
  rawPayment?: PaymentDoc;
}

const orderPaymentStatusToDisplay = (
  ps: string,
): PaymentDisplayItem["status"] => {
  if (ps === "paid") return "success";
  if (ps === "refunded") return "cancelled";
  return "pending";
};

const orderToDisplayItem = (o: OrderDoc): PaymentDisplayItem => ({
  _id: `pod-${o._id}`,
  payment_number: undefined,
  reference: o.order_number
    ? `POD-${o.order_number}`
    : `POD-${o._id.slice(-8).toUpperCase()}`,
  order: o._id,
  order_number: o.order_number,
  fulfillment_type: o.fulfillment_type,
  amount: o.total,
  delivery_fee: o.shipping_fee ?? 0,
  payment_method: "pod",
  status: orderPaymentStatusToDisplay(o.payment_status),
  createdAt: o.createdAt,
  isPOD: true,
  isAwaitingRetry: false,
});

const paymentToDisplayItem = (p: PaymentDoc): PaymentDisplayItem => {
  const orderObj =
    typeof p.order === "object" && p.order !== null ? (p.order as any) : null;
  return {
    _id: p._id,
    payment_number: p.payment_number,
    reference: p.reference,
    order: String(p.order),
    order_number: orderObj?.order_number,
    fulfillment_type: orderObj?.fulfillment_type,
    amount: p.amount,
    delivery_fee: orderObj?.shipping_fee ?? 0,
    payment_method: p.payment_method ?? "paystack",
    status: p.status,
    createdAt: p.createdAt,
    isPOD: false,
    isAwaitingRetry: false,
    rawPayment: p,
  };
};

// NEW: Paystack orders where initializePayment failed — no Payment doc exists
const awaitingOrderToDisplayItem = (o: OrderDoc): PaymentDisplayItem => ({
  _id: `awaiting-${o._id}`,
  payment_number: undefined,
  reference: o.order_number
    ? `UNPAID-${o.order_number}`
    : `UNPAID-${o._id.slice(-8).toUpperCase()}`,
  order: o._id,
  order_number: o.order_number,
  fulfillment_type: o.fulfillment_type,
  amount: o.total,
  delivery_fee: o.shipping_fee ?? 0,
  payment_method: "paystack",
  status: "pending",
  createdAt: o.createdAt,
  isPOD: false,
  isAwaitingRetry: true,
});

const displayPaymentId = (item: PaymentDisplayItem): string =>
  item.payment_number ?? item.reference;

// ── Fulfillment badge ─────────────────────────────────────────────────────────
const FulfillmentBadge = ({ type }: { type?: "delivery" | "pickup" }) =>
  type === "pickup" ? (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700 whitespace-nowrap">
      🏪 Pickup
    </span>
  ) : (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 whitespace-nowrap">
      🚚 Delivery
    </span>
  );

// ── Payment Card (mobile) ─────────────────────────────────────────────────────
const PaymentCard = ({
  item,
  onClick,
}: {
  item: PaymentDisplayItem;
  onClick: () => void;
}) => (
  <div
    className="bg-card border border-border rounded-xl p-4 active:bg-secondary/30 transition-colors"
    onClick={onClick}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-mono font-bold text-primary truncate">
            {displayPaymentId(item)}
          </p>
          {item.isPOD && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 flex-shrink-0">
              POD
            </span>
          )}
          {/* NEW: Awaiting retry badge */}
          {item.isAwaitingRetry && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 flex-shrink-0">
              AWAITING RETRY
            </span>
          )}
          <FulfillmentBadge type={item.fulfillment_type} />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {item.order_number ?? `#${item.order.slice(-8).toUpperCase()}`}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusClass[item.status] ?? "bg-gray-100 text-gray-700"}`}
        >
          {statusLabel[item.status] ?? item.status}
        </span>
        <p className="text-sm font-bold text-foreground">
          {formatPrice(item.amount)}
        </p>
      </div>
    </div>
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
      <span className="text-xs text-muted-foreground capitalize">
        {item.payment_method === "pod"
          ? "Pay on Delivery"
          : item.payment_method}
      </span>
      <span className="text-xs text-muted-foreground">
        {new Date(item.createdAt).toLocaleDateString("en-GB")}
      </span>
    </div>
  </div>
);

// ── Mobile Filter Sheet ───────────────────────────────────────────────────────
const FilterSheet = ({
  open,
  onClose,
  methodFilter,
  onMethodChange,
}: {
  open: boolean;
  onClose: () => void;
  methodFilter: string;
  onMethodChange: (v: string) => void;
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-popover w-full rounded-t-2xl p-6 shadow-2xl">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between mb-5">
          <p className="text-base font-semibold text-foreground">Filters</p>
          <button onClick={onClose}>
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
            Method
          </p>
          <div className="flex flex-wrap gap-2">
            {methodOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => onMethodChange(opt)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                  methodFilter === opt
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {opt === "pod" ? "Pay on Delivery" : opt}
              </button>
            ))}
          </div>
        </div>
        <Button className="w-full mt-6" onClick={onClose}>
          Apply
        </Button>
      </div>
    </div>
  );
};

// ── Tab type ──────────────────────────────────────────────────────────────────
type Tab = "pending" | "confirmed";

// ── Auto-refresh interval for pending payments (ms) ───────────────────────────
const PENDING_REFRESH_INTERVAL_MS = 30_000;

// ── Main Page ─────────────────────────────────────────────────────────────────
const PaymentsPage = () => {
  const [allItems, setAllItems] = useState<PaymentDisplayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [methodFilter, setMethodFilter] = useState("All");
  const [showMethodDD, setShowMethodDD] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PaymentDisplayItem | null>(
    null,
  );
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const activeTabRef = useRef(activeTab);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const loadAll = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setFetchError(null);
    try {
      const [paymentsRaw, ordersRaw] = await Promise.all([
        paymentService.getAllPayments().catch(() => [] as PaymentDoc[]),
        orderService.getAllOrders().catch(() => [] as OrderDoc[]),
      ]);

      const payments: PaymentDoc[] = Array.isArray(paymentsRaw)
        ? paymentsRaw
        : ((paymentsRaw as any)?.payments ?? []);
      const orders: OrderDoc[] = Array.isArray(ordersRaw) ? ordersRaw : [];

      const paystackItems = payments.map(paymentToDisplayItem);
      const paystackOrderIds = new Set(payments.map((p) => String(p.order)));

      // POD orders that don't have a Paystack payment record
      const podItems = orders
        .filter(
          (o) => o.payment_method === "pod" && !paystackOrderIds.has(o._id),
        )
        .map(orderToDisplayItem);

      // NEW: Paystack orders where initializePayment failed — no Payment doc was
      // ever created (the backend transaction was aborted), so the order is stuck
      // with payment_status "unpaid" and no matching Payment document.
      // These need to be surfaced so admins aren't confused by invisible orders.
      const awaitingItems = orders
        .filter(
          (o) =>
            o.payment_method === "paystack" &&
            o.payment_status === "unpaid" &&
            o.status !== "cancelled" &&
            !paystackOrderIds.has(o._id), // no Payment doc exists for this order
        )
        .map(awaitingOrderToDisplayItem);

      const merged = [...paystackItems, ...podItems, ...awaitingItems].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setAllItems(merged);
      setLastRefreshed(new Date());
    } catch {
      setFetchError("Failed to load payments.");
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Auto-refresh every 30 s when the Pending tab is visible
  useEffect(() => {
    const id = setInterval(() => {
      if (activeTabRef.current === "pending") loadAll(true);
    }, PENDING_REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [loadAll]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const tabItems = allItems.filter((item) =>
    activeTab === "pending"
      ? !isConfirmedPayment(item.status)
      : isConfirmedPayment(item.status),
  );

  const filtered = tabItems.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      (item.payment_number ?? "").toLowerCase().includes(q) ||
      item.reference.toLowerCase().includes(q) ||
      item.order.toLowerCase().includes(q) ||
      (item.order_number ?? "").toLowerCase().includes(q);
    const matchMethod =
      methodFilter === "All" || item.payment_method === methodFilter;
    return matchSearch && matchMethod;
  });

  const pendingCount = allItems.filter(
    (i) => !isConfirmedPayment(i.status),
  ).length;
  const confirmedCount = allItems.filter((i) =>
    isConfirmedPayment(i.status),
  ).length;
  const totalRevenue = allItems
    .filter((i) => i.status === "success")
    .reduce((s, i) => s + i.amount, 0);
  const successCount = allItems.filter((i) => i.status === "success").length;
  // NEW: count of Paystack orders waiting for user to retry payment
  const awaitingRetryCount = allItems.filter((i) => i.isAwaitingRetry).length;

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-muted-foreground">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading payments…</span>
      </div>
    );

  if (fetchError)
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-sm text-destructive">{fetchError}</p>
        <Button variant="outline" onClick={() => loadAll()} className="gap-2">
          <RefreshCw size={14} /> Retry
        </Button>
      </div>
    );

  return (
    <div
      className="animate-in fade-in duration-500"
      onClick={() => setShowMethodDD(false)}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
          Payments
        </h1>
        <div className="flex items-center gap-2">
          {lastRefreshed && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              Updated{" "}
              {lastRefreshed.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          <button
            onClick={() => loadAll(false)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Auto-refresh notice when pending tab is active */}
      {activeTab === "pending" && (
        <div className="mb-4 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2 text-xs text-blue-700">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
          This page auto-refreshes every 30 seconds. Paystack payments confirmed
          via webhook will appear automatically.
        </div>
      )}

      {/* NEW: Awaiting retry callout — only shown when there are stuck orders */}
      {awaitingRetryCount > 0 && (
        <div className="mb-4 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
          <span className="text-orange-500 text-base mt-0.5 flex-shrink-0">
            ⚠
          </span>
          <div>
            <p className="text-sm font-semibold text-orange-800">
              {awaitingRetryCount} order
              {awaitingRetryCount > 1 ? "s are" : " is"} waiting for payment
            </p>
            <p className="text-xs text-orange-700 mt-0.5">
              These are Paystack orders where payment initialization failed. No
              payment record exists yet. The customer needs to retry from their
              Orders page. They appear below labelled{" "}
              <span className="font-bold">AWAITING RETRY</span>.
            </p>
          </div>
        </div>
      )}

      {/* Stats — NEW: 4th card shows awaiting retry count */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatsCard
          title="Total Revenue"
          value={formatPrice(totalRevenue)}
          variant="primary"
        />
        <StatsCard
          title="Pending"
          value={String(pendingCount)}
          variant="default"
        />
        <StatsCard
          title="Confirmed"
          value={String(successCount)}
          variant="primary"
        />
        <StatsCard
          title="Awaiting Payment"
          value={String(awaitingRetryCount)}
          variant="destructive"
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Mobile filter button */}
        <button
          className="sm:hidden inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-lg px-3 py-2 relative"
          onClick={(e) => {
            e.stopPropagation();
            setShowFilterSheet(true);
          }}
        >
          <Filter size={14} className="text-muted-foreground" />
          <span className="text-sm">Filters</span>
          {methodFilter !== "All" && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center font-bold">
              1
            </span>
          )}
        </button>

        {/* Desktop method filter */}
        <div className="hidden sm:flex items-center gap-4">
          <span className="text-xs text-muted-foreground">Method</span>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMethodDD(!showMethodDD);
              }}
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-lg px-3 py-2 hover:bg-secondary/80 transition-colors"
            >
              <span className="text-sm capitalize">{methodFilter}</span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>
            {showMethodDD && (
              <div
                className="absolute top-full left-0 bg-popover border border-border rounded-lg mt-1 shadow-lg z-10 min-w-[180px]"
                onClick={(e) => e.stopPropagation()}
              >
                {methodOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setMethodFilter(opt);
                      setShowMethodDD(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary/70 ${methodFilter === opt ? "text-primary font-medium" : "text-popover-foreground"}`}
                  >
                    {opt === "pod"
                      ? "Pay on Delivery"
                      : opt === "All"
                        ? "All Methods"
                        : "Paystack"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <SearchInput
          placeholder="Search payment ID, reference, or order..."
          value={searchTerm}
          onChange={setSearchTerm}
          className="flex-1 min-w-0 sm:w-80 sm:flex-none ml-auto"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border mb-4">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "pending"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ClipboardList size={15} />
          Pending / Failed
          <span
            className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "pending"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {pendingCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("confirmed")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "confirmed"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <PackageCheck size={15} />
          Confirmed
          <span
            className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "confirmed"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {confirmedCount}
          </span>
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card rounded-xl overflow-hidden border border-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  "Payment ID",
                  "Order",
                  "Type",
                  "Amount",
                  "Delivery Fee",
                  "Method",
                  "Status",
                  "Date",
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
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="p-12 text-center text-muted-foreground italic"
                  >
                    {searchTerm
                      ? "No payments match your search."
                      : activeTab === "pending"
                        ? "No pending payments."
                        : "No confirmed payments yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item._id}
                    onClick={() => setSelectedItem(item)}
                    className={`hover:bg-secondary/50 cursor-pointer transition-colors ${
                      item.isAwaitingRetry ? "bg-orange-50/40" : ""
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-primary font-mono font-medium">
                          {displayPaymentId(item)}
                        </span>
                        {item.isPOD && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                            POD
                          </span>
                        )}
                        {/* NEW: Awaiting retry badge in table */}
                        {item.isAwaitingRetry && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 whitespace-nowrap">
                            AWAITING RETRY
                          </span>
                        )}
                      </div>
                      {!item.isPOD &&
                        !item.isAwaitingRetry &&
                        item.payment_number && (
                          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            ref: {item.reference}
                          </p>
                        )}
                      {item.isAwaitingRetry && (
                        <p className="text-[10px] text-orange-600 mt-0.5">
                          No payment record — customer must retry
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-foreground font-medium font-mono">
                      {item.order_number ??
                        `#${item.order.slice(-8).toUpperCase()}`}
                    </td>
                    <td className="p-4">
                      <FulfillmentBadge type={item.fulfillment_type} />
                    </td>
                    <td className="p-4 text-foreground font-bold">
                      {formatPrice(item.amount)}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {item.fulfillment_type === "pickup" ? (
                        <span className="text-green-600 font-medium">Free</span>
                      ) : item.delivery_fee > 0 ? (
                        formatPrice(item.delivery_fee)
                      ) : (
                        <span className="text-green-600 font-medium">Free</span>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground capitalize">
                      {item.payment_method === "pod"
                        ? "Pay on Delivery"
                        : (item.payment_method ?? "—")}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${statusClass[item.status] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {statusLabel[item.status] ?? item.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-12 italic">
            {searchTerm
              ? "No payments match your search."
              : activeTab === "pending"
                ? "No pending payments."
                : "No confirmed payments yet."}
          </p>
        ) : (
          filtered.map((item) => (
            <PaymentCard
              key={item._id}
              item={item}
              onClick={() => setSelectedItem(item)}
            />
          ))
        )}
      </div>

      {/* Mobile filter sheet */}
      <FilterSheet
        open={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        methodFilter={methodFilter}
        onMethodChange={setMethodFilter}
      />

      {/* Detail modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="bg-popover border-border max-w-sm rounded-2xl shadow-2xl">
          {selectedItem && (
            <div className="flex flex-col items-center text-center py-6">
              <div
                className={`w-16 h-16 rounded-full border-4 flex items-center justify-center mb-4 ${
                  selectedItem.isAwaitingRetry
                    ? "border-orange-400 bg-orange-50"
                    : selectedItem.status === "success"
                      ? "border-green-500 bg-green-50"
                      : selectedItem.status === "pending"
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-destructive bg-destructive/10"
                }`}
              >
                {selectedItem.isAwaitingRetry ? (
                  <span className="text-2xl">⏳</span>
                ) : (
                  <Check
                    size={32}
                    className={
                      selectedItem.status === "success"
                        ? "text-green-600"
                        : selectedItem.status === "pending"
                          ? "text-yellow-600"
                          : "text-destructive"
                    }
                  />
                )}
              </div>

              <h2 className="text-xl font-bold text-foreground mb-1">
                {selectedItem.isAwaitingRetry
                  ? "Awaiting Payment Retry"
                  : `Payment ${statusLabel[selectedItem.status] ?? selectedItem.status}`}
              </h2>

              <div className="flex items-center gap-2 mb-2 flex-wrap justify-center">
                {selectedItem.isPOD && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                    Cash on Delivery
                  </span>
                )}
                {selectedItem.isAwaitingRetry && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                    No Payment Record
                  </span>
                )}
                <FulfillmentBadge type={selectedItem.fulfillment_type} />
              </div>

              {/* Awaiting retry explanation */}
              {selectedItem.isAwaitingRetry && (
                <p className="text-xs text-orange-700 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 mb-3 mx-2 text-left">
                  Paystack initialization failed when this order was placed — no
                  Payment document was created. The customer needs to go to
                  their Orders page and tap <strong>Complete Payment</strong> to
                  retry.
                </p>
              )}

              <p className="text-xs text-muted-foreground mb-1 font-mono bg-muted px-2 py-1 rounded">
                {selectedItem.payment_number ?? selectedItem.reference}
              </p>
              {selectedItem.payment_number &&
                !selectedItem.isPOD &&
                !selectedItem.isAwaitingRetry && (
                  <p className="text-[10px] text-muted-foreground mb-3 font-mono">
                    Gateway ref: {selectedItem.reference}
                  </p>
                )}

              <div className="w-full space-y-3 mb-6 px-4 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order</span>
                  <span className="font-bold font-mono">
                    {selectedItem.order_number ??
                      `#${selectedItem.order.slice(-8).toUpperCase()}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount (total)</span>
                  <span className="font-bold text-primary">
                    {formatPrice(selectedItem.amount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span
                    className={`font-medium ${selectedItem.fulfillment_type === "pickup" || selectedItem.delivery_fee === 0 ? "text-green-600" : ""}`}
                  >
                    {selectedItem.fulfillment_type === "pickup" ||
                    selectedItem.delivery_fee === 0
                      ? "Free"
                      : formatPrice(selectedItem.delivery_fee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium capitalize">
                    {selectedItem.payment_method === "pod"
                      ? "Pay on Delivery"
                      : (selectedItem.payment_method ?? "—")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">
                    {new Date(selectedItem.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                size="sm"
                className="w-full bg-primary text-primary-foreground font-bold"
                onClick={() => setSelectedItem(null)}
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsPage;
