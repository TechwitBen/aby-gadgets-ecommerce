import { useState, useCallback, useEffect } from "react";
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
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { paymentService, type PaymentDoc } from "@/services/Payment.service";

const statusOptions = ["All", "pending", "success", "failed", "cancelled"];
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

// ── Payment Card (mobile) ─────────────────────────────────────────────────────
const PaymentCard = ({
  p,
  onClick,
}: {
  p: PaymentDoc;
  onClick: () => void;
}) => (
  <div
    className="bg-card border border-border rounded-xl p-4 active:bg-secondary/30 transition-colors"
    onClick={onClick}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-sm font-mono font-bold text-primary truncate">
          {p.reference}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Order #{String(p.order).slice(-8).toUpperCase()}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
            statusClass[p.status] ?? "bg-gray-100 text-gray-700"
          }`}
        >
          {statusLabel[p.status] ?? p.status}
        </span>
        <p className="text-sm font-bold text-foreground">
          {formatPrice(p.amount)}
        </p>
      </div>
    </div>
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
      <span className="text-xs text-muted-foreground capitalize">
        {p.payment_method ?? "—"}
      </span>
      <span className="text-xs text-muted-foreground">
        {new Date(p.createdAt).toLocaleDateString("en-GB")}
      </span>
    </div>
  </div>
);

// ── Filter Pill (mobile) ──────────────────────────────────────────────────────
const FilterSheet = ({
  open,
  onClose,
  statusFilter,
  methodFilter,
  onStatusChange,
  onMethodChange,
}: {
  open: boolean;
  onClose: () => void;
  statusFilter: string;
  methodFilter: string;
  onStatusChange: (v: string) => void;
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
        <div className="space-y-5">
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
              Status
            </p>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => onStatusChange(opt)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === opt
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {opt === "All" ? "All" : (statusLabel[opt] ?? opt)}
                </button>
              ))}
            </div>
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
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
        <Button className="w-full mt-6" onClick={onClose}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const PaymentsPage = () => {
  const [payments, setPayments] = useState<PaymentDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const [showStatusDD, setShowStatusDD] = useState(false);
  const [showMethodDD, setShowMethodDD] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentDoc | null>(
    null
  );

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await paymentService.getAllPayments();
      setPayments(Array.isArray(data) ? data : []);
    } catch {
      setFetchError("Failed to load payments.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const filtered = (payments || []).filter((p) => {
    if (!p) return false;
    const q = searchTerm.toLowerCase();
    const matchSearch =
      (p.reference || "").toLowerCase().includes(q) ||
      String(p.order || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    const matchMethod =
      methodFilter === "All" || p.payment_method === methodFilter;
    return matchSearch && matchStatus && matchMethod;
  });

  const safePayments = payments || [];
  const totalCount = safePayments.length;
  const pendingCount = safePayments.filter((p) => p.status === "pending").length;
  const successCount = safePayments.filter((p) => p.status === "success").length;
  const failedCount = safePayments.filter((p) => p.status === "failed").length;

  const activeFilterCount = [
    statusFilter !== "All",
    methodFilter !== "All",
  ].filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-muted-foreground">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading payments…</span>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-sm text-destructive">{fetchError}</p>
        <Button variant="outline" onClick={loadPayments} className="gap-2">
          <RefreshCw size={14} /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div
      className="animate-in fade-in duration-500"
      onClick={() => {
        setShowStatusDD(false);
        setShowMethodDD(false);
      }}
    >
      <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-5">
        Payments
      </h1>

      {/* Stats — 2×2 on mobile, 4 cols on lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatsCard
          title="Total"
          value={String(totalCount)}
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
          title="Failed"
          value={String(failedCount)}
          variant="destructive"
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {/* Mobile: single filter button */}
        <button
          className="sm:hidden inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-lg px-3 py-2 relative"
          onClick={(e) => {
            e.stopPropagation();
            setShowFilterSheet(true);
          }}
        >
          <Filter size={14} className="text-muted-foreground" />
          <span className="text-sm">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Desktop: inline dropdowns */}
        <div className="hidden sm:flex items-center gap-4">
          <span className="text-xs text-muted-foreground">Filter by</span>

          {/* Status */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowStatusDD(!showStatusDD);
                setShowMethodDD(false);
              }}
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-lg px-3 py-2 hover:bg-secondary/80 transition-colors"
            >
              <span className="text-xs text-muted-foreground">Status</span>
              <span className="text-sm capitalize">{statusFilter}</span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>
            {showStatusDD && (
              <div
                className="absolute top-full left-0 bg-popover border border-border rounded-lg mt-1 shadow-lg z-10 min-w-[160px]"
                onClick={(e) => e.stopPropagation()}
              >
                {statusOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setStatusFilter(opt);
                      setShowStatusDD(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary/70 capitalize ${
                      statusFilter === opt
                        ? "text-primary font-medium"
                        : "text-popover-foreground"
                    }`}
                  >
                    {opt === "All" ? "All" : (statusLabel[opt] ?? opt)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Method */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMethodDD(!showMethodDD);
                setShowStatusDD(false);
              }}
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-lg px-3 py-2 hover:bg-secondary/80 transition-colors"
            >
              <span className="text-xs text-muted-foreground">Method</span>
              <span className="text-sm capitalize">{methodFilter}</span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>
            {showMethodDD && (
              <div
                className="absolute top-full left-0 bg-popover border border-border rounded-lg mt-1 shadow-lg z-10 min-w-[160px]"
                onClick={(e) => e.stopPropagation()}
              >
                {methodOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setMethodFilter(opt);
                      setShowMethodDD(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary/70 capitalize ${
                      methodFilter === opt
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
        </div>

        <SearchInput
          placeholder="Search reference or order"
          value={searchTerm}
          onChange={setSearchTerm}
          className="flex-1 min-w-0 sm:w-80 sm:flex-none ml-auto"
        />
      </div>

      {/* ── Desktop table ──────────────────────────────────────────────── */}
      <div className="hidden md:block bg-card rounded-xl overflow-hidden border border-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  "Reference",
                  "Order ID",
                  "Amount",
                  "Method",
                  "Status",
                  "Date",
                ].map((h) => (
                  <th
                    key={h}
                    className="p-4 text-muted-foreground font-semibold"
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
                    colSpan={6}
                    className="p-12 text-center text-muted-foreground italic"
                  >
                    No payments match your search or filters.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p._id}
                    onClick={() => setSelectedPayment(p)}
                    className="hover:bg-secondary/50 cursor-pointer transition-colors"
                  >
                    <td className="p-4 text-primary font-mono font-medium">
                      {p.reference}
                    </td>
                    <td className="p-4 text-foreground font-medium">
                      #{String(p.order).slice(-8).toUpperCase()}
                    </td>
                    <td className="p-4 text-foreground font-bold">
                      {formatPrice(p.amount)}
                    </td>
                    <td className="p-4 text-muted-foreground capitalize">
                      {p.payment_method ?? "—"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          statusClass[p.status] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {statusLabel[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile card list ─────────────────────────────────────────────── */}
      <div className="md:hidden space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-12 italic">
            No payments match your search or filters.
          </p>
        ) : (
          filtered.map((p) => (
            <PaymentCard
              key={p._id}
              p={p}
              onClick={() => setSelectedPayment(p)}
            />
          ))
        )}
      </div>

      {/* Mobile filter sheet */}
      <FilterSheet
        open={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        statusFilter={statusFilter}
        methodFilter={methodFilter}
        onStatusChange={(v) => setStatusFilter(v)}
        onMethodChange={(v) => setMethodFilter(v)}
      />

      {/* Detail modal */}
      <Dialog
        open={!!selectedPayment}
        onOpenChange={() => setSelectedPayment(null)}
      >
        <DialogContent className="bg-popover border-border max-w-sm rounded-2xl shadow-2xl">
          {selectedPayment && (
            <div className="flex flex-col items-center text-center py-6">
              <div
                className={`w-16 h-16 rounded-full border-4 flex items-center justify-center mb-4 ${
                  selectedPayment.status === "success"
                    ? "border-green-500 bg-green-50"
                    : selectedPayment.status === "pending"
                    ? "border-yellow-500 bg-yellow-50"
                    : "border-destructive bg-destructive/10"
                }`}
              >
                <Check
                  size={32}
                  className={
                    selectedPayment.status === "success"
                      ? "text-green-600"
                      : selectedPayment.status === "pending"
                      ? "text-yellow-600"
                      : "text-destructive"
                  }
                />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">
                Payment{" "}
                {statusLabel[selectedPayment.status] ?? selectedPayment.status}
              </h2>
              <p className="text-xs text-muted-foreground mb-4 font-mono bg-muted px-2 py-1 rounded">
                Ref: {selectedPayment.reference}
              </p>

              <div className="w-full space-y-3 mb-6 px-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-bold">
                    #{String(selectedPayment.order).slice(-8).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-primary">
                    {formatPrice(selectedPayment.amount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium capitalize">
                    {selectedPayment.payment_method ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">
                    {new Date(selectedPayment.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                size="sm"
                className="w-full bg-primary text-primary-foreground font-bold"
                onClick={() => setSelectedPayment(null)}
              >
                Close Transaction
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsPage;