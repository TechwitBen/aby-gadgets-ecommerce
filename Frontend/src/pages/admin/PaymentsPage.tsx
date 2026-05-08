import { useState, useCallback, useEffect, useRef } from "react";
import { StatsCard } from "@/components/ui/stats-card";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Loader2,
  RefreshCw,
  X,
  Filter,
  ClipboardList,
  PackageCheck,
  Truck,
  Store,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  RotateCcw,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { paymentService, type PaymentDoc } from "@/services/Payment.service";
import { orderService, type OrderDoc } from "@/services/Order.service";

// ── Constants ─────────────────────────────────────────────────────────────────
const CONFIRMED_STATUSES  = new Set(["success", "cancelled"]);
const isConfirmedPayment  = (s: string) => CONFIRMED_STATUSES.has(s);

const methodOptions = ["All", "paystack", "pod"];

const formatPrice = (n: number) => `₦${(n || 0).toLocaleString()}`;

// ── Status display config ─────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; className: string; Icon: React.FC<any> }> = {
  success:   { label: "Confirmed",  className: "bg-emerald-100 text-emerald-700", Icon: CheckCircle2  },
  pending:   { label: "Pending",    className: "bg-amber-100 text-amber-700",     Icon: Clock         },
  failed:    { label: "Failed",     className: "bg-red-100 text-red-700",         Icon: XCircle       },
  cancelled: { label: "Cancelled",  className: "bg-gray-100 text-gray-600",       Icon: RotateCcw     },
};

// ── Unified display type ──────────────────────────────────────────────────────
interface PaymentDisplayItem {
  _id:              string;
  payment_number:   string | undefined;
  reference:        string;
  order:            string;
  order_number:     string | undefined;
  fulfillment_type: "delivery" | "pickup" | undefined;
  amount:           number;
  delivery_fee:     number;
  payment_method:   string;
  status:           "pending" | "success" | "failed" | "cancelled";
  createdAt:        string;
  isPOD:            boolean;
  isNoPaymentDoc:   boolean; // Paystack order, no Payment doc at all
  rawPayment?:      PaymentDoc;
}

const orderPaymentStatusToDisplay = (ps: string): PaymentDisplayItem["status"] => {
  if (ps === "paid")     return "success";
  if (ps === "refunded") return "cancelled";
  return "pending";
};

const orderToDisplayItem = (o: OrderDoc): PaymentDisplayItem => ({
  _id:            `pod-${o._id}`,
  payment_number: undefined,
  reference:      o.order_number ? `POD-${o.order_number}` : `POD-${o._id.slice(-8).toUpperCase()}`,
  order:          o._id,
  order_number:   o.order_number,
  fulfillment_type: o.fulfillment_type,
  amount:         o.total,
  delivery_fee:   o.shipping_fee ?? 0,
  payment_method: "pod",
  status:         orderPaymentStatusToDisplay(o.payment_status),
  createdAt:      o.createdAt,
  isPOD:          true,
  isNoPaymentDoc: false,
});

const paymentToDisplayItem = (p: PaymentDoc): PaymentDisplayItem => {
  const orderObj = typeof p.order === "object" && p.order !== null ? (p.order as any) : null;
  return {
    _id:            p._id,
    payment_number: p.payment_number,
    reference:      p.reference,
    order:          String(p.order),
    order_number:   orderObj?.order_number,
    fulfillment_type: orderObj?.fulfillment_type,
    amount:         p.amount,
    delivery_fee:   orderObj?.shipping_fee ?? 0,
    payment_method: p.payment_method ?? "paystack",
    status:         p.status,
    createdAt:      p.createdAt,
    isPOD:          false,
    isNoPaymentDoc: false,
    rawPayment:     p,
  };
};

const noPaymentDocItem = (o: OrderDoc): PaymentDisplayItem => ({
  _id:            `nodoc-${o._id}`,
  payment_number: undefined,
  reference:      o.order_number ? `NOPAY-${o.order_number}` : `NOPAY-${o._id.slice(-8).toUpperCase()}`,
  order:          o._id,
  order_number:   o.order_number,
  fulfillment_type: o.fulfillment_type,
  amount:         o.total,
  delivery_fee:   o.shipping_fee ?? 0,
  payment_method: "paystack",
  status:         "pending",
  createdAt:      o.createdAt,
  isPOD:          false,
  isNoPaymentDoc: true,
});

const displayPaymentId = (item: PaymentDisplayItem): string =>
  item.payment_number ?? item.reference;

// ── Fulfillment badge (no emojis) ─────────────────────────────────────────────
const FulfillmentChip = ({ type }: { type?: "delivery" | "pickup" }) =>
  type === "pickup" ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700">
      <Store className="w-2.5 h-2.5" /> Pickup
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
      <Truck className="w-2.5 h-2.5" /> Delivery
    </span>
  );

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: "bg-gray-100 text-gray-600", Icon: Clock };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${cfg.className}`}>
      <cfg.Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
};

// ── Mobile payment card ───────────────────────────────────────────────────────
const PaymentCard = ({ item, onClick }: { item: PaymentDisplayItem; onClick: () => void }) => {
  const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
  return (
    <div
      className={`bg-card border border-border rounded-xl p-4 active:bg-secondary/30 transition-colors cursor-pointer ${
        item.status === "failed" ? "border-l-4 border-l-red-400" :
        item.status === "cancelled" ? "border-l-4 border-l-gray-400" :
        item.isNoPaymentDoc ? "border-l-4 border-l-orange-400" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-mono font-bold text-primary truncate">{displayPaymentId(item)}</p>
            {item.isPOD && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">POD</span>}
            {item.isNoPaymentDoc && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">NO PAYMENT DOC</span>}
            {item.status === "failed"    && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">FAILED</span>}
            {item.status === "cancelled" && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">CANCELLED</span>}
            <FulfillmentChip type={item.fulfillment_type} />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {item.order_number ?? `#${item.order.slice(-8).toUpperCase()}`}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <StatusBadge status={item.status} />
          <p className="text-sm font-bold text-foreground">{formatPrice(item.amount)}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground capitalize">
          {item.payment_method === "pod" ? "Pay on Delivery" : item.payment_method}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(item.createdAt).toLocaleDateString("en-GB")}
        </span>
      </div>
    </div>
  );
};

// ── Mobile filter sheet ───────────────────────────────────────────────────────
const FilterSheet = ({
  open, onClose, methodFilter, onMethodChange,
}: {
  open: boolean; onClose: () => void; methodFilter: string; onMethodChange: (v: string) => void;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:hidden" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-popover w-full rounded-t-2xl p-6 shadow-2xl">
        <div className="flex justify-center mb-4"><div className="w-10 h-1 rounded-full bg-border" /></div>
        <div className="flex items-center justify-between mb-5">
          <p className="text-base font-semibold text-foreground">Filters</p>
          <button onClick={onClose}><X size={18} className="text-muted-foreground" /></button>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Method</p>
          <div className="flex flex-wrap gap-2">
            {methodOptions.map((opt) => (
              <button key={opt} onClick={() => onMethodChange(opt)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${methodFilter === opt ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {opt === "pod" ? "Pay on Delivery" : opt}
              </button>
            ))}
          </div>
        </div>
        <Button className="w-full mt-6" onClick={onClose}>Apply</Button>
      </div>
    </div>
  );
};

type Tab = "pending" | "confirmed";
const PENDING_REFRESH_MS = 30_000;

// ─────────────────────────────────────────────────────────────────────────────
const PaymentsPage = () => {
  const [allItems,         setAllItems]         = useState<PaymentDisplayItem[]>([]);
  const [isLoading,        setIsLoading]        = useState(true);
  const [fetchError,       setFetchError]       = useState<string | null>(null);
  const [searchTerm,       setSearchTerm]       = useState("");
  const [activeTab,        setActiveTab]        = useState<Tab>("pending");
  const [methodFilter,     setMethodFilter]     = useState("All");
  const [showMethodDD,     setShowMethodDD]     = useState(false);
  const [showFilterSheet,  setShowFilterSheet]  = useState(false);
  const [selectedItem,     setSelectedItem]     = useState<PaymentDisplayItem | null>(null);
  const [lastRefreshed,    setLastRefreshed]    = useState<Date | null>(null);

  const activeTabRef = useRef(activeTab);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

  const loadAll = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setFetchError(null);
    try {
      const [paymentsRaw, ordersRaw] = await Promise.all([
        paymentService.getAllPayments().catch(() => ({ payments: [] as PaymentDoc[], total: 0 })),
        orderService.getAllOrders().catch(() => [] as OrderDoc[]),
      ]);

      const payments: PaymentDoc[] = Array.isArray(paymentsRaw)
        ? paymentsRaw
        : ((paymentsRaw as any)?.payments ?? []);
      const orders: OrderDoc[] = Array.isArray(ordersRaw) ? ordersRaw : [];

      const paystackItems  = payments.map(paymentToDisplayItem);
      const paystackOrderIds = new Set(payments.map((p) => String(p.order)));

      // POD orders with no Payment doc
      const podItems = orders
        .filter((o) => o.payment_method === "pod" && !paystackOrderIds.has(o._id))
        .map(orderToDisplayItem);

      // Paystack orders with NO Payment doc at all (init failed entirely)
      const noDocItems = orders
        .filter(
          (o) =>
            o.payment_method === "paystack" &&
            o.payment_status === "unpaid" &&
            o.status !== "cancelled" &&
            !paystackOrderIds.has(o._id)
        )
        .map(noPaymentDocItem);

      const merged = [...paystackItems, ...podItems, ...noDocItems].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setAllItems(merged);
      setLastRefreshed(new Date());
    } catch {
      setFetchError("Failed to load payments.");
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    const id = setInterval(() => {
      if (activeTabRef.current === "pending") loadAll(true);
    }, PENDING_REFRESH_MS);
    return () => clearInterval(id);
  }, [loadAll]);

  // ── Derived ───────────────────────────────────────────────────────────────
  // "Pending" tab = pending + failed + cancelled (needs attention)
  // "Confirmed" tab = success + (pod) cancelled orders that were completed
  const tabItems = allItems.filter((item) =>
    activeTab === "pending" ? !isConfirmedPayment(item.status) : isConfirmedPayment(item.status)
  );

  const filtered = tabItems.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      (item.payment_number ?? "").toLowerCase().includes(q) ||
      item.reference.toLowerCase().includes(q) ||
      item.order.toLowerCase().includes(q) ||
      (item.order_number ?? "").toLowerCase().includes(q);
    const matchMethod = methodFilter === "All" || item.payment_method === methodFilter;
    return matchSearch && matchMethod;
  });

  const pendingCount   = allItems.filter((i) => i.status === "pending").length;
  const failedCount    = allItems.filter((i) => i.status === "failed").length;
  const cancelledCount = allItems.filter((i) => i.status === "cancelled" && !isConfirmedPayment("cancelled")).length;
  const needsAttention = allItems.filter((i) => !isConfirmedPayment(i.status)).length;
  const successCount   = allItems.filter((i) => i.status === "success").length;
  const noDocCount     = allItems.filter((i) => i.isNoPaymentDoc).length;
  const totalRevenue   = allItems.filter((i) => i.status === "success").reduce((s, i) => s + i.amount, 0);

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
    <div className="animate-in fade-in duration-500" onClick={() => setShowMethodDD(false)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Payments</h1>
        <div className="flex items-center gap-2">
          {lastRefreshed && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              Updated {lastRefreshed.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
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

      {/* Auto-refresh notice */}
      {activeTab === "pending" && (
        <div className="mb-4 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2 text-xs text-blue-700">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
          Auto-refreshes every 30 seconds. Paystack webhook confirmations appear automatically.
        </div>
      )}

      {/* Attention callouts */}
      {failedCount > 0 && (
        <div className="mb-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              {failedCount} payment{failedCount > 1 ? "s" : ""} failed
            </p>
            <p className="text-xs text-red-700 mt-0.5">
              Customer's card/bank declined. They need to retry with a different payment method from their Orders page.
            </p>
          </div>
        </div>
      )}
      {noDocCount > 0 && (
        <div className="mb-3 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-orange-800">
              {noDocCount} order{noDocCount > 1 ? "s have" : " has"} no payment record
            </p>
            <p className="text-xs text-orange-700 mt-0.5">
              Payment initialization failed before a Payment doc was created. Customer must retry from their Orders page.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatsCard title="Total Revenue"     value={formatPrice(totalRevenue)} variant="primary" />
        <StatsCard title="Confirmed"         value={String(successCount)}      variant="primary" />
        <StatsCard title="Needs Attention"   value={String(needsAttention)}    variant="default" />
        <StatsCard title="Failed / No Doc"   value={String(failedCount + noDocCount)} variant="destructive" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button
          className="sm:hidden inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-lg px-3 py-2 relative"
          onClick={(e) => { e.stopPropagation(); setShowFilterSheet(true); }}
        >
          <Filter size={14} className="text-muted-foreground" />
          <span className="text-sm">Filters</span>
          {methodFilter !== "All" && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center font-bold">1</span>
          )}
        </button>

        <div className="hidden sm:flex items-center gap-4">
          <span className="text-xs text-muted-foreground">Method</span>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMethodDD(!showMethodDD); }}
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-lg px-3 py-2 hover:bg-secondary/80"
            >
              <span className="text-sm capitalize">{methodFilter}</span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>
            {showMethodDD && (
              <div className="absolute top-full left-0 bg-popover border border-border rounded-lg mt-1 shadow-lg z-10 min-w-[180px]" onClick={(e) => e.stopPropagation()}>
                {methodOptions.map((opt) => (
                  <button key={opt} onClick={() => { setMethodFilter(opt); setShowMethodDD(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary/70 ${methodFilter === opt ? "text-primary font-medium" : "text-popover-foreground"}`}>
                    {opt === "pod" ? "Pay on Delivery" : opt === "All" ? "All Methods" : "Paystack"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <SearchInput
          placeholder="Search payment ID, reference, order…"
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
            activeTab === "pending" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ClipboardList size={15} />
          Pending / Failed / Cancelled
          <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === "pending" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {needsAttention}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("confirmed")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "confirmed" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <PackageCheck size={15} />
          Confirmed
          <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === "confirmed" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {allItems.filter((i) => isConfirmedPayment(i.status)).length}
          </span>
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card rounded-xl overflow-hidden border border-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Payment ID", "Order", "Type", "Amount", "Delivery Fee", "Method", "Status", "Date"].map((h) => (
                  <th key={h} className="p-4 text-muted-foreground font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-muted-foreground italic">
                    {searchTerm ? "No payments match your search." : activeTab === "pending" ? "No pending payments." : "No confirmed payments yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item._id}
                    onClick={() => setSelectedItem(item)}
                    className={`hover:bg-secondary/50 cursor-pointer transition-colors ${
                      item.status === "failed"    ? "bg-red-50/30 hover:bg-red-50/60" :
                      item.status === "cancelled" && !item.isPOD ? "bg-gray-50/50" :
                      item.isNoPaymentDoc         ? "bg-orange-50/30" : ""
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-primary font-mono font-medium">{displayPaymentId(item)}</span>
                        {item.isPOD && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">POD</span>}
                        {item.isNoPaymentDoc && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">NO DOC</span>}
                        {item.status === "failed"    && !item.isPOD && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">FAILED</span>}
                        {item.status === "cancelled" && !item.isPOD && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">CANCELLED</span>}
                      </div>
                      {!item.isPOD && !item.isNoPaymentDoc && item.payment_number && (
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">ref: {item.reference}</p>
                      )}
                      {item.isNoPaymentDoc && <p className="text-[10px] text-orange-600 mt-0.5">No payment record — customer must retry</p>}
                      {item.status === "failed" && <p className="text-[10px] text-red-600 mt-0.5">Declined by bank/issuer</p>}
                      {item.status === "cancelled" && !item.isPOD && <p className="text-[10px] text-gray-500 mt-0.5">Customer closed payment page</p>}
                    </td>
                    <td className="p-4 text-foreground font-medium font-mono">
                      {item.order_number ?? `#${item.order.slice(-8).toUpperCase()}`}
                    </td>
                    <td className="p-4"><FulfillmentChip type={item.fulfillment_type} /></td>
                    <td className="p-4 text-foreground font-bold">{formatPrice(item.amount)}</td>
                    <td className="p-4 text-muted-foreground">
                      {item.fulfillment_type === "pickup" || item.delivery_fee === 0
                        ? <span className="text-green-600 font-medium">Free</span>
                        : formatPrice(item.delivery_fee)}
                    </td>
                    <td className="p-4 text-muted-foreground capitalize">
                      {item.payment_method === "pod" ? "Pay on Delivery" : (item.payment_method ?? "—")}
                    </td>
                    <td className="p-4"><StatusBadge status={item.status} /></td>
                    <td className="p-4 text-muted-foreground">{new Date(item.createdAt).toLocaleDateString("en-GB")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-12 italic">
            {searchTerm ? "No payments match your search." : activeTab === "pending" ? "No pending payments." : "No confirmed payments yet."}
          </p>
        ) : (
          filtered.map((item) => <PaymentCard key={item._id} item={item} onClick={() => setSelectedItem(item)} />)
        )}
      </div>

      <FilterSheet open={showFilterSheet} onClose={() => setShowFilterSheet(false)} methodFilter={methodFilter} onMethodChange={setMethodFilter} />

      {/* Detail modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="bg-popover border-border max-w-sm rounded-2xl shadow-2xl">
          {selectedItem && (() => {
            const cfg = STATUS_CONFIG[selectedItem.status] ?? STATUS_CONFIG.pending;
            const isIssue = selectedItem.status === "failed" || selectedItem.status === "cancelled" || selectedItem.isNoPaymentDoc;
            return (
              <div className="flex flex-col items-center text-center py-6 px-2">
                <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center mb-4 ${
                  selectedItem.status === "success"   ? "border-green-500  bg-green-50"  :
                  selectedItem.status === "failed"    ? "border-red-400    bg-red-50"    :
                  selectedItem.status === "cancelled" ? "border-gray-300   bg-gray-50"   :
                  selectedItem.isNoPaymentDoc         ? "border-orange-400 bg-orange-50" :
                                                        "border-yellow-400 bg-yellow-50"
                }`}>
                  <cfg.Icon className={`w-8 h-8 ${
                    selectedItem.status === "success"   ? "text-green-600"  :
                    selectedItem.status === "failed"    ? "text-red-500"    :
                    selectedItem.status === "cancelled" ? "text-gray-500"   :
                    selectedItem.isNoPaymentDoc         ? "text-orange-500" :
                                                          "text-yellow-600"
                  }`} />
                </div>

                <h2 className="text-lg font-bold text-foreground mb-1">
                  {selectedItem.isNoPaymentDoc ? "No Payment Record" :
                   selectedItem.status === "failed"    ? "Payment Failed"    :
                   selectedItem.status === "cancelled" ? "Payment Cancelled" :
                   selectedItem.status === "success"   ? "Payment Confirmed" :
                   "Payment Pending"}
                </h2>

                <div className="flex items-center gap-2 mb-3 flex-wrap justify-center">
                  {selectedItem.isPOD        && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Pay on Delivery</span>}
                  {selectedItem.isNoPaymentDoc && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">No Payment Doc</span>}
                  <FulfillmentChip type={selectedItem.fulfillment_type} />
                </div>

                {/* Context explanations */}
                {selectedItem.status === "failed" && (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3 text-left w-full">
                    <p className="text-xs text-red-700 leading-relaxed">
                      Payment was declined by the customer's bank or card issuer. The customer needs to retry with a different card or payment method from their Orders page.
                    </p>
                  </div>
                )}
                {selectedItem.status === "cancelled" && !selectedItem.isPOD && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 mb-3 text-left w-full">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      The customer closed the Paystack payment page before completing payment. They can retry from their Orders page.
                    </p>
                  </div>
                )}
                {selectedItem.isNoPaymentDoc && (
                  <div className="bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 mb-3 text-left w-full">
                    <p className="text-xs text-orange-700 leading-relaxed">
                      Payment initialization failed before a Payment document was created. The order exists but no payment record exists yet. The customer must go to their Orders page and tap <strong>Complete Payment</strong>.
                    </p>
                  </div>
                )}
                {selectedItem.status === "pending" && !selectedItem.isNoPaymentDoc && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-3 text-left w-full">
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Payment is in progress. The Paystack webhook confirmation has not arrived yet. This will auto-update when confirmed.
                    </p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mb-1 font-mono bg-muted px-2 py-1 rounded">
                  {selectedItem.payment_number ?? selectedItem.reference}
                </p>

                <div className="w-full space-y-3 mb-6 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order</span>
                    <span className="font-bold font-mono">{selectedItem.order_number ?? `#${selectedItem.order.slice(-8).toUpperCase()}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-bold text-primary">{formatPrice(selectedItem.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className={`font-medium ${selectedItem.delivery_fee === 0 || selectedItem.fulfillment_type === "pickup" ? "text-green-600" : ""}`}>
                      {selectedItem.delivery_fee === 0 || selectedItem.fulfillment_type === "pickup" ? "Free" : formatPrice(selectedItem.delivery_fee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Method</span>
                    <span className="font-medium capitalize">{selectedItem.payment_method === "pod" ? "Pay on Delivery" : (selectedItem.payment_method ?? "—")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{new Date(selectedItem.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <Button size="sm" className="w-full bg-primary text-primary-foreground font-bold" onClick={() => setSelectedItem(null)}>
                  Close
                </Button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsPage;