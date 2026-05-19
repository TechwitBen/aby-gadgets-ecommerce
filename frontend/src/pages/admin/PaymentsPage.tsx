import { useState, useCallback, useEffect, useRef } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  RefreshCw,
  X,
  Filter,
  Truck,
  Store,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  RotateCcw,
  CreditCard,
  TrendingUp,
  ChevronDown,
  Banknote,
  Smartphone,
  QrCode,
  Wallet,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { paymentService, type PaymentDoc } from "@/services/payment.service";
import { orderService, type OrderDoc } from "@/services/order.service";
import { useToast } from "@/hooks/use-toast";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number) => `₦${(n || 0).toLocaleString()}`;

const fmtDateTime = (iso: string) => {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }),
    time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  };
};

// ── Channel config ─────────────────────────────────────────────────────────────
// payment_method stores Paystack channel values: "card", "bank", "bank_transfer",
// "ussd", "qr", "mobile_money" — or "pod" for pay-on-delivery.
// "paystack" is the fallback for pending payments where channel isn't known yet.
const CHANNEL_CFG: Record<
  string,
  { label: string; sublabel: string; Icon: React.FC<{ className?: string }> }
> = {
  card:          { label: "Card",          sublabel: "Debit / Credit",    Icon: CreditCard  },
  bank:          { label: "Bank Transfer", sublabel: "Direct transfer",   Icon: Banknote    },
  bank_transfer: { label: "Bank Transfer", sublabel: "Direct transfer",   Icon: Banknote    },
  ussd:          { label: "USSD",          sublabel: "Mobile dial code",  Icon: Smartphone  },
  qr:            { label: "QR Code",       sublabel: "Scan to pay",       Icon: QrCode      },
  mobile_money:  { label: "Mobile Money",  sublabel: "Mobile wallet",     Icon: Wallet      },
  pod:           { label: "Pay on Delivery", sublabel: "Cash on arrival", Icon: Banknote    },
  paystack:      { label: "Paystack",      sublabel: "Method pending",    Icon: CreditCard  },
};

const getChannelCfg = (method: string) =>
  CHANNEL_CFG[method?.toLowerCase()] ?? { label: method ?? "Paystack", sublabel: "Online", Icon: CreditCard };

// ── Display status ────────────────────────────────────────────────────────────
type DisplayStatus = "success" | "pending" | "failed" | "cancelled" | "no_doc";

const STATUS_CFG: Record<
  DisplayStatus,
  {
    label: string;
    tabLabel: string;
    badgeCls: string;
    rowHighlight: string;
    Icon: React.FC<{ className?: string }>;
    adminNote: string;
    customerNote: string;
  }
> = {
  success: {
    label: "Confirmed",
    tabLabel: "Confirmed",
    badgeCls: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    rowHighlight: "",
    Icon: CheckCircle2,
    adminNote: "Payment confirmed by Paystack. Order is active.",
    customerNote: "Payment fully confirmed.",
  },
  pending: {
    label: "Pending",
    tabLabel: "Pending",
    badgeCls: "bg-amber-100 text-amber-700 border border-amber-200",
    rowHighlight: "",
    Icon: Clock,
    adminNote:
      "Payment initialised — awaiting webhook confirmation from Paystack. Bank may still be processing.",
    customerNote: "Payment is being processed by Paystack.",
  },
  failed: {
    label: "Failed",
    tabLabel: "Failed",
    badgeCls: "bg-red-100 text-red-700 border border-red-200",
    rowHighlight: "bg-red-50/20",
    Icon: XCircle,
    adminNote:
      "Payment declined by customer's bank or card issuer (insufficient funds, wrong OTP, card rejected, transfer failed). Customer must retry with a different method.",
    customerNote: "Your card or bank declined the payment.",
  },
  cancelled: {
    label: "Cancelled",
    tabLabel: "Cancelled",
    badgeCls: "bg-gray-100 text-gray-600 border border-gray-200",
    rowHighlight: "bg-gray-50/20",
    Icon: RotateCcw,
    adminNote:
      "Customer closed the Paystack payment page or abandoned the flow before completing payment.",
    customerNote: "Payment was cancelled or abandoned.",
  },
  no_doc: {
    label: "No Record",
    tabLabel: "No Record",
    badgeCls: "bg-orange-100 text-orange-700 border border-orange-200",
    rowHighlight: "bg-orange-50/20",
    Icon: AlertCircle,
    adminNote:
      "Payment initialisation crashed before a Payment document was created (backend error, DB write failed, Paystack unreachable). The order exists but no payment record exists yet. Customer must retry from their Orders page.",
    customerNote: "Payment could not be started.",
  },
};

// ── Tab config ─────────────────────────────────────────────────────────────────
type TabKey = "all" | DisplayStatus;

const TABS: { key: TabKey; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { key: "all",       label: "All",       Icon: TrendingUp   },
  { key: "success",   label: "Confirmed", Icon: CheckCircle2 },
  { key: "pending",   label: "Pending",   Icon: Clock        },
  { key: "failed",    label: "Failed",    Icon: XCircle      },
  { key: "cancelled", label: "Cancelled", Icon: RotateCcw    },
  { key: "no_doc",    label: "No Record", Icon: AlertCircle  },
];

// ── Method filter options ──────────────────────────────────────────────────────
// IMPORTANT: payment_method is now always "paystack" or "pod" (permanent gateway field).
// channel holds the actual payment method once Paystack confirms (card, bank, ussd, etc.).
// The filter uses payment_method for gateway (online vs POD), not channel.
const METHOD_OPTIONS = [
  { value: "All",      label: "All Methods"      },
  { value: "online",   label: "Online (Paystack)" },
  { value: "pod",      label: "Pay on Delivery"  },
];

// ── Display item ──────────────────────────────────────────────────────────────
interface PaymentDisplayItem {
  _id:              string;
  payment_number:   string | undefined;
  reference:        string;
  orderId:          string;
  order_number:     string | undefined;
  fulfillment_type: "delivery" | "pickup" | undefined;
  amount:           number;
  delivery_fee:     number;
  // Raw channel value from Paystack: "card" | "bank" | "ussd" | "pod" | "paystack" | etc.
  channel:          string;
  displayStatus:    DisplayStatus;
  createdAt:        string;
  isPOD:            boolean;
  rawPayment?:      PaymentDoc;
}

// ── Safely extract the order's ObjectId string whether populated or not ───────
const extractOrderId = (order: PaymentDoc["order"]): string => {
  if (!order) return "";
  if (typeof order === "string") return order;
  if (typeof order === "object" && "_id" in order) return String((order as any)._id);
  return String(order);
};

const paymentDocToItem = (p: PaymentDoc): PaymentDisplayItem => {
  const o = typeof p.order === "object" && p.order !== null ? (p.order as any) : null;

  // ── Channel resolution ─────────────────────────────────────────────────────
  // payment_method is now always "paystack" or "pod" — it never holds the
  // channel value anymore. The actual channel ("card", "bank", "ussd", etc.)
  // lives in p.channel (null until Paystack confirms the transaction).
  //
  // Display logic:
  //   POD order          → show "pod"      (no Paystack channel exists)
  //   Paystack + channel → show the channel ("card", "ussd", etc.)
  //   Paystack + pending → show "paystack" fallback (channel not yet known)
  const isPOD = (p as any).payment_method === "pod";
  const resolvedChannel = isPOD
    ? "pod"
    : ((p as any).channel ?? "paystack");

  return {
    _id:              p._id,
    payment_number:   p.payment_number,
    reference:        p.reference,
    orderId:          extractOrderId(p.order),
    order_number:     o?.order_number,
    fulfillment_type: o?.fulfillment_type,
    amount:           p.amount,
    delivery_fee:     o?.shipping_fee ?? 0,
    channel:          resolvedChannel,
    displayStatus:
      p.status === "success"     ? "success"
      : p.status === "failed"    ? "failed"
      : p.status === "cancelled" ? "cancelled"
      : "pending",
    createdAt:  p.createdAt,
    isPOD,
    rawPayment: p,
  };
};

const podOrderToItem = (o: OrderDoc): PaymentDisplayItem => ({
  _id:              `pod-${o._id}`,
  payment_number:   undefined,
  // POD has no Paystack reference — use a human-readable pseudo-ref
  reference:        o.order_number ? `POD-${o.order_number}` : `POD-${o._id.slice(-8).toUpperCase()}`,
  orderId:          o._id,
  order_number:     o.order_number,
  fulfillment_type: o.fulfillment_type,
  amount:           o.total,
  delivery_fee:     o.shipping_fee ?? 0,
  // POD orders have no Paystack channel — "pod" is the display sentinel value
  channel:          "pod",
  displayStatus:    o.payment_status === "paid" ? "success" : o.payment_status === "refunded" ? "cancelled" : "pending",
  createdAt:        o.createdAt,
  isPOD:            true,
});

const noDocOrderToItem = (o: OrderDoc): PaymentDisplayItem => ({
  _id:              `nodoc-${o._id}`,
  payment_number:   undefined,
  reference:        `NOPAY-${o._id.slice(-8).toUpperCase()}`,
  orderId:          o._id,
  order_number:     o.order_number,
  fulfillment_type: o.fulfillment_type,
  amount:           o.total,
  delivery_fee:     o.shipping_fee ?? 0,
  channel:          "paystack",
  displayStatus:    "no_doc",
  createdAt:        o.createdAt,
  isPOD:            false,
});

// ── Sub-components ────────────────────────────────────────────────────────────
const FulfillmentChip = ({ type }: { type?: string }) =>
  type === "pickup" ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 whitespace-nowrap">
      <Store className="w-2.5 h-2.5" /> Pickup
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 whitespace-nowrap">
      <Truck className="w-2.5 h-2.5" /> Delivery
    </span>
  );

const StatusBadge = ({ status }: { status: DisplayStatus }) => {
  const cfg = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${cfg.badgeCls}`}>
      <cfg.Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
};

const ChannelBadge = ({ channel, size = "sm" }: { channel: string; size?: "sm" | "xs" }) => {
  const cfg = getChannelCfg(channel);
  const Icon = cfg.Icon;
  if (size === "xs") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
        <Icon className="w-3 h-3" />
        {cfg.label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{cfg.label}</span>
      {channel === "paystack" && (
        <span className="text-[10px] text-muted-foreground/60 italic">pending</span>
      )}
    </span>
  );
};

// ── DateTime cell ──────────────────────────────────────────────────────────────
const DateTimeCell = ({ iso, className = "" }: { iso: string; className?: string }) => {
  const { date, time } = fmtDateTime(iso);
  return (
    <div className={className}>
      <div className="text-xs text-muted-foreground">{date}</div>
      <div className="text-[11px] text-muted-foreground/60 mt-0.5">{time}</div>
    </div>
  );
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({
  label, value, accentBg, accentText, Icon,
}: {
  label: string; value: string; accentBg: string; accentText: string;
  Icon: React.FC<{ className?: string }>;
}) => (
  <div className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accentBg}`}>
      <Icon className={`w-5 h-5 ${accentText}`} />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="text-lg font-bold text-foreground leading-tight truncate">{value}</p>
    </div>
  </div>
);

// ── Mobile card ───────────────────────────────────────────────────────────────
const MobileCard = ({ item, onClick }: { item: PaymentDisplayItem; onClick: () => void }) => {
  const { date, time } = fmtDateTime(item.createdAt);
  return (
    <div
      onClick={onClick}
      className={`bg-card border border-border rounded-xl p-4 cursor-pointer active:bg-secondary/30 transition-colors ${
        item.displayStatus === "failed"    ? "border-l-4 border-l-red-400"    :
        item.displayStatus === "cancelled" ? "border-l-4 border-l-gray-300"   :
        item.displayStatus === "no_doc"    ? "border-l-4 border-l-orange-400" :
        item.displayStatus === "success"   ? "border-l-4 border-l-emerald-400": ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <p className="text-sm font-mono font-bold text-primary truncate">
              {item.payment_number ?? item.reference}
            </p>
            {item.isPOD && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">POD</span>
            )}
            {item.displayStatus === "no_doc" && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">NO DOC</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {item.order_number ?? `#${item.orderId.slice(-8).toUpperCase()}`}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <StatusBadge status={item.displayStatus} />
          <p className="text-sm font-bold text-foreground">{fmt(item.amount)}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border">
        <div className="flex items-center gap-2 flex-wrap">
          <FulfillmentChip type={item.fulfillment_type} />
          <ChannelBadge channel={item.channel} size="xs" />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-muted-foreground">{date}</span>
          <span className="text-[11px] text-muted-foreground/60">{time}</span>
        </div>
      </div>
    </div>
  );
};

// ── Filter sheet (mobile) ─────────────────────────────────────────────────────
const FilterSheet = ({
  open, onClose, methodFilter, onMethodChange,
}: {
  open: boolean; onClose: () => void; methodFilter: string; onMethodChange: (v: string) => void;
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:hidden"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-popover w-full rounded-t-2xl p-6 shadow-2xl">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between mb-5">
          <p className="text-base font-semibold text-foreground">Filter by Method</p>
          <button onClick={onClose}><X size={18} className="text-muted-foreground" /></button>
        </div>
        <div className="flex flex-wrap gap-2">
          {METHOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onMethodChange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                methodFilter === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <Button className="w-full mt-6" onClick={onClose}>Apply</Button>
      </div>
    </div>
  );
};

// ── Detail Modal ───────────────────────────────────────────────────────────────
const DetailModal = ({ item, onClose }: { item: PaymentDisplayItem | null; onClose: () => void }) => {
  if (!item) return null;
  const cfg = STATUS_CFG[item.displayStatus];
  // channelCfg is null for pending payments (channel not yet known)
  const channelCfg = getChannelCfg(item.channel);
  const ChannelIcon = channelCfg?.Icon ?? CreditCard;

  const accentBar: Record<DisplayStatus, string> = {
    success:   "bg-emerald-500",
    pending:   "bg-amber-400",
    failed:    "bg-red-500",
    cancelled: "bg-gray-400",
    no_doc:    "bg-orange-500",
  };
  const ringCls: Record<DisplayStatus, string> = {
    success:   "border-emerald-400 bg-emerald-50",
    pending:   "border-amber-400 bg-amber-50",
    failed:    "border-red-400 bg-red-50",
    cancelled: "border-gray-300 bg-gray-50",
    no_doc:    "border-orange-400 bg-orange-50",
  };
  const iconCls: Record<DisplayStatus, string> = {
    success:   "text-emerald-600",
    pending:   "text-amber-600",
    failed:    "text-red-500",
    cancelled: "text-gray-500",
    no_doc:    "text-orange-500",
  };
  const noteCls: Record<DisplayStatus, string> = {
    success:   "bg-emerald-50 border-emerald-100 text-emerald-800",
    pending:   "bg-amber-50 border-amber-100 text-amber-800",
    failed:    "bg-red-50 border-red-100 text-red-800",
    cancelled: "bg-gray-50 border-gray-200 text-gray-700",
    no_doc:    "bg-orange-50 border-orange-100 text-orange-800",
  };

  const { date, time } = fmtDateTime(item.createdAt);

  // Gateway = which service processed the payment (permanent)
  const gatewayLabel = item.isPOD ? "Pay on Delivery" : "Paystack";
  // Channel = how the customer actually paid (null until Paystack confirms)
  const channelLabel = channelCfg
    ? channelCfg.label
    : item.channel === "paystack"
      ? "Pending"
      : null;

  const rows = [
    { label: "Payment ID",   value: item.payment_number ?? item.reference },
    ...(item.payment_number ? [{ label: "Gateway Ref", value: item.reference }] : []),
    { label: "Order",        value: item.order_number ?? `#${item.orderId.slice(-8).toUpperCase()}` },
    { label: "Amount",       value: fmt(item.amount) },
    {
      label: "Delivery Fee",
      value: item.delivery_fee === 0 || item.fulfillment_type === "pickup" ? "Free" : fmt(item.delivery_fee),
    },
    // Gateway — always shown ("Paystack" or "Pay on Delivery")
    { label: "Gateway",      value: gatewayLabel },
    // Channel — shown when known ("Card", "USSD", etc.) or "Pending" for online awaiting
    ...(channelLabel ? [{ label: "Channel",  value: channelLabel }] : []),
    { label: "Date",  value: date },
    { label: "Time",  value: time },
  ];

  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent className="bg-popover border-border max-w-sm rounded-2xl shadow-2xl p-0 overflow-hidden">
        <div className={`h-1.5 w-full ${accentBar[item.displayStatus]}`} />
        <div className="p-6">
          <div className="flex flex-col items-center text-center mb-5">
            <div
              className={`w-14 h-14 rounded-full border-4 flex items-center justify-center mb-3 ${ringCls[item.displayStatus]}`}
            >
              <cfg.Icon className={`w-7 h-7 ${iconCls[item.displayStatus]}`} />
            </div>
            <h2 className="text-lg font-bold text-foreground">{cfg.tabLabel} Payment</h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
              {item.isPOD && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  Pay on Delivery
                </span>
              )}
              <FulfillmentChip type={item.fulfillment_type} />
              {/* Channel chip — only shown when channel is known */}
              {channelCfg ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  <ChannelIcon className="w-2.5 h-2.5" />
                  {channelCfg.sublabel}
                </span>
              ) : !item.isPOD && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground/60">
                  <CreditCard className="w-2.5 h-2.5" />
                  Method pending
                </span>
              )}
            </div>
          </div>

          {/* Admin note */}
          <div className={`rounded-xl px-3 py-2.5 mb-4 text-xs leading-relaxed border ${noteCls[item.displayStatus]}`}>
            <p className="font-semibold mb-0.5">{cfg.label}</p>
            <p>{cfg.adminNote}</p>
          </div>

          {/* Details */}
          <div className="space-y-2.5 mb-5">
            {rows.map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-4 text-sm">
                <span className="text-muted-foreground flex-shrink-0">{label}</span>
                <span className="font-medium text-foreground text-right font-mono text-xs break-all">{value}</span>
              </div>
            ))}
          </div>

          <Button className="w-full" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const REFRESH_INTERVAL_MS = 30_000;

const PaymentsPage = () => {
  const { toast } = useToast();

  const [allItems,        setAllItems]        = useState<PaymentDisplayItem[]>([]);
  const [isLoading,       setIsLoading]       = useState(true);
  const [fetchError,      setFetchError]      = useState<string | null>(null);
  const [searchTerm,      setSearchTerm]      = useState("");
  const [activeTab,       setActiveTab]       = useState<TabKey>("all");
  const [methodFilter,    setMethodFilter]    = useState("All");
  const [showMethodDD,    setShowMethodDD]    = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [selectedItem,    setSelectedItem]    = useState<PaymentDisplayItem | null>(null);
  const [lastRefreshed,   setLastRefreshed]   = useState<Date | null>(null);

  // ── Fix 1: Scroll to top on tab or method change ──────────────────────────
  const prevTabRef = useRef<TabKey>("all");
  const prevMethodFilterRef = useRef("All");

  useEffect(() => {
    if (
      prevTabRef.current !== activeTab || 
      prevMethodFilterRef.current !== methodFilter
    ) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      prevTabRef.current = activeTab;
      prevMethodFilterRef.current = methodFilter;
    }
  }, [activeTab, methodFilter]);

  const activeTabRef = useRef(activeTab);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

  // ── Load All ──────────────────────────────────────────────────────────────
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

      const paystackOrderIds = new Set(payments.map((p) => extractOrderId(p.order)));

      const paystackItems = payments.map(paymentDocToItem);

      const podItems = orders
        .filter((o) => o.payment_method === "pod" && !paystackOrderIds.has(o._id))
        .map(podOrderToItem);

      const noDocItems = orders
        .filter(
          (o) =>
            o.payment_method === "paystack" &&
            o.payment_status === "unpaid" &&
            o.status !== "cancelled" &&
            !paystackOrderIds.has(o._id),
        )
        .map(noDocOrderToItem);

      const merged = [...paystackItems, ...podItems, ...noDocItems].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setAllItems(merged);
      setLastRefreshed(new Date());
    } catch (err) {
      // ── Fix 2: Silent refresh failure notification ────────────────────────
      if (!silent) {
        setFetchError("Failed to load payments. Please try again.");
      } else {
        toast({
          title: "Auto-refresh failed",
          description: "Unable to update payments. Please pull-to-refresh manually.",
          variant: "destructive",
        });
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Auto-refresh every 30s, skip on confirmed tab
  useEffect(() => {
    const id = setInterval(() => {
      if (activeTabRef.current !== "success") loadAll(true);
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [loadAll]);

  const countOf = (s: DisplayStatus) => allItems.filter((i) => i.displayStatus === s).length;
  const totalRevenue = allItems
    .filter((i) => i.displayStatus === "success")
    .reduce((s, i) => s + i.amount, 0);
  const tabCount = (key: TabKey) =>
    key === "all" ? allItems.length : countOf(key as DisplayStatus);

  const tabFiltered =
    activeTab === "all" ? allItems : allItems.filter((i) => i.displayStatus === activeTab);

  const filtered = tabFiltered.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      (item.payment_number ?? "").toLowerCase().includes(q) ||
      item.reference.toLowerCase().includes(q) ||
      item.orderId.toLowerCase().includes(q) ||
      (item.order_number ?? "").toLowerCase().includes(q);

    // Method filter:
    // "online" = any non-POD payment (card, bank, ussd, paystack fallback, etc.)
    // "pod"    = pay on delivery
    // "All"    = everything
    const matchMethod =
      methodFilter === "All" ||
      (methodFilter === "pod"    && item.channel === "pod") ||
      (methodFilter === "online" && item.channel !== "pod");

    return matchSearch && matchMethod;
  });

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading)
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-muted-foreground">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading payments…</span>
      </div>
    );

  // ── Error state ────────────────────────────────────────────────────────────
  if (fetchError)
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertCircle size={32} className="text-destructive" />
        <p className="text-sm text-destructive">{fetchError}</p>
        <Button variant="outline" onClick={() => loadAll()} className="gap-2">
          <RefreshCw size={14} /> Retry
        </Button>
      </div>
    );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="space-y-5 animate-in fade-in duration-500"
      onClick={() => setShowMethodDD(false)}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
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

      {/* ── Auto-refresh notice ── */}
      {activeTab !== "success" && (
        <div className="px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2 text-xs text-blue-700">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
          Auto-refreshing every 30 s — Paystack webhook confirmations appear automatically.
        </div>
      )}

      {/* ── Alert callouts ── */}
      {countOf("failed") > 0 && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              {countOf("failed")} payment{countOf("failed") > 1 ? "s" : ""} failed
            </p>
            <p className="text-xs text-red-700 mt-0.5">
              Bank or card declined. Customer needs to retry with a different payment method.
            </p>
          </div>
        </div>
      )}
      {countOf("no_doc") > 0 && (
        <div className="px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-orange-800">
              {countOf("no_doc")} order{countOf("no_doc") > 1 ? "s have" : " has"} no payment record
            </p>
            <p className="text-xs text-orange-700 mt-0.5">
              Initialisation crashed before a Payment document was saved. Customer must retry from
              their Orders page.
            </p>
          </div>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Total Revenue" value={fmt(totalRevenue)}          accentBg="bg-emerald-100" accentText="text-emerald-600" Icon={TrendingUp}  />
        <StatCard label="Confirmed"     value={String(countOf("success"))} accentBg="bg-emerald-100" accentText="text-emerald-600" Icon={CheckCircle2} />
        <StatCard label="Pending"       value={String(countOf("pending"))} accentBg="bg-amber-100"   accentText="text-amber-600"   Icon={Clock}        />
        <StatCard label="Failed"        value={String(countOf("failed"))}  accentBg="bg-red-100"     accentText="text-red-600"     Icon={XCircle}      />
        <StatCard
          label="Cancelled"
          value={String(countOf("cancelled") + countOf("no_doc"))}
          accentBg="bg-gray-100"
          accentText="text-gray-600"
          Icon={RotateCcw}
        />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Mobile filter button */}
        <button
          className="sm:hidden inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-lg px-3 py-2 relative"
          onClick={(e) => { e.stopPropagation(); setShowFilterSheet(true); }}
        >
          <Filter size={14} className="text-muted-foreground" />
          <span className="text-sm">Method</span>
          {methodFilter !== "All" && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center font-bold">
              1
            </span>
          )}
        </button>

        {/* Desktop method dropdown */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Method</span>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMethodDD(!showMethodDD); }}
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-lg px-3 py-2 hover:bg-secondary/80 text-sm"
            >
              {METHOD_OPTIONS.find((o) => o.value === methodFilter)?.label ?? "All Methods"}
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>
            {showMethodDD && (
              <div
                className="absolute top-full left-0 bg-popover border border-border rounded-xl mt-1 shadow-lg z-20 min-w-[180px] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {METHOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setMethodFilter(opt.value); setShowMethodDD(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-secondary/70 transition-colors ${
                      methodFilter === opt.value ? "text-primary font-semibold" : "text-popover-foreground"
                    }`}
                  >
                    {opt.label}
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

      {/* ── Status Tabs ── */}
      <div className="flex items-center overflow-x-auto no-scrollbar border-b border-border">
        {TABS.map(({ key, label, Icon }) => {
          const count = tabCount(key);
          const isActive = activeTab === key;
          const hasAlert = (key === "failed" || key === "no_doc") && count > 0;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex-shrink-0 -mb-px ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ml-0.5 ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : hasAlert
                      ? "bg-red-100 text-red-600"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden md:block bg-card rounded-xl overflow-hidden border border-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Payment ID", "Order", "Type", "Amount", "Delivery Fee", "Method", "Status", "Date & Time"].map(
                  (h) => (
                    <th
                      key={h}
                      className="p-4 text-muted-foreground font-semibold whitespace-nowrap text-xs uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-muted-foreground italic text-sm">
                    {searchTerm
                      ? "No payments match your search."
                      : `No ${
                          activeTab === "all"
                            ? ""
                            : (STATUS_CFG[activeTab as DisplayStatus]?.label.toLowerCase() ?? "") + " "
                        }payments found.`}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item._id}
                    onClick={() => setSelectedItem(item)}
                    className={`cursor-pointer transition-colors hover:bg-secondary/40 ${STATUS_CFG[item.displayStatus].rowHighlight}`}
                  >
                    {/* Payment ID */}
                    <td className="p-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-primary font-mono font-medium">
                          {item.payment_number ?? item.reference}
                        </span>
                        {item.isPOD && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                            POD
                          </span>
                        )}
                        {item.displayStatus === "no_doc" && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">
                            NO DOC
                          </span>
                        )}
                      </div>
                      {item.payment_number && !item.isPOD && item.displayStatus !== "no_doc" && (
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          ref: {item.reference}
                        </p>
                      )}
                      {item.displayStatus === "no_doc" && (
                        <p className="text-[10px] text-orange-600 mt-0.5">No payment document exists</p>
                      )}
                      {item.displayStatus === "failed" && (
                        <p className="text-[10px] text-red-600 mt-0.5">Declined by bank or card issuer</p>
                      )}
                      {item.displayStatus === "cancelled" && !item.isPOD && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">Customer abandoned payment flow</p>
                      )}
                      {item.displayStatus === "pending" && !item.isPOD && (
                        <p className="text-[10px] text-amber-600 mt-0.5">Awaiting Paystack webhook</p>
                      )}
                    </td>

                    {/* Order */}
                    <td className="p-4 font-mono font-medium text-foreground">
                      {item.order_number ?? `#${item.orderId.slice(-8).toUpperCase()}`}
                    </td>

                    {/* Type */}
                    <td className="p-4">
                      <FulfillmentChip type={item.fulfillment_type} />
                    </td>

                    {/* Amount */}
                    <td className="p-4 font-bold text-foreground">{fmt(item.amount)}</td>

                    {/* Delivery Fee */}
                    <td className="p-4 text-muted-foreground">
                      {item.delivery_fee === 0 || item.fulfillment_type === "pickup" ? (
                        <span className="text-emerald-600 font-medium">Free</span>
                      ) : (
                        fmt(item.delivery_fee)
                      )}
                    </td>

                    {/* Method — channel-aware */}
                    <td className="p-4">
                      <ChannelBadge channel={item.channel} size="sm" />
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <StatusBadge status={item.displayStatus} />
                    </td>

                    {/* Date & Time */}
                    <td className="p-4">
                      <DateTimeCell iso={item.createdAt} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile list ── */}
      <div className="md:hidden space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-12 italic">
            {searchTerm ? "No payments match your search." : "No payments found."}
          </p>
        ) : (
          filtered.map((item) => (
            <MobileCard key={item._id} item={item} onClick={() => setSelectedItem(item)} />
          ))
        )}
      </div>

      <FilterSheet
        open={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        methodFilter={methodFilter}
        onMethodChange={setMethodFilter}
      />
      <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
};

export default PaymentsPage; 