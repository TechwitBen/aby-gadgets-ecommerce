import { useState, useEffect, useCallback } from "react";
import { StatsCard } from "@/components/ui/stats-card";
import { SearchInput } from "@/components/ui/search-input";
import { ChevronDown, Check, Loader2, RefreshCw } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { type PaymentDoc } from "@/services/Payment.service";

// ── Admin-only endpoint that returns all payments ─────────────────────────────
// Your backend will need: GET /api/payments/admin/all (admin only)
// or extend payment controller if not yet present.

 const fetchAllPayments = (): Promise<PaymentDoc[]> =>
  axios
    .get<{ payments: PaymentDoc[] }>("/api/v1/payment/admin/all")
    .then((r) => r.data.payments);
const statusOptions = ["All", "pending", "success", "failed", "cancelled"];
const methodOptions = ["All", "paystack", "pod"];

const formatPrice = (n: number) => `₦${n.toLocaleString()}`;

const statusLabel: Record<string, string> = {
  success:   "Confirmed",
  pending:   "Pending",
  failed:    "Failed",
  cancelled: "Cancelled",
};

const statusClass: Record<string, string> = {
  success:   "bg-green-100 text-green-700",
  pending:   "bg-yellow-100 text-yellow-700",
  failed:    "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-700",
};

const PaymentsPage = () => {
  const [payments,        setPayments]        = useState<PaymentDoc[]>([]);
  const [isLoading,       setIsLoading]       = useState(true);
  const [fetchError,      setFetchError]      = useState<string | null>(null);
  const [searchTerm,      setSearchTerm]      = useState("");
  const [statusFilter,    setStatusFilter]    = useState("All");
  const [methodFilter,    setMethodFilter]    = useState("All");
  const [showStatusDD,    setShowStatusDD]    = useState(false);
  const [showMethodDD,    setShowMethodDD]    = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentDoc | null>(null);

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await fetchAllPayments();
      setPayments(data);
    } catch {
      setFetchError("Failed to load payments.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadPayments(); }, [loadPayments]);

  const filtered = payments.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      p.reference.toLowerCase().includes(q) ||
      p.order.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    const matchMethod = methodFilter === "All" || p.payment_method === methodFilter;
    return matchSearch && matchStatus && matchMethod;
  });

  const totalCount    = payments.length;
  const pendingCount  = payments.filter((p) => p.status === "pending").length;
  const successCount  = payments.filter((p) => p.status === "success").length;
  const failedCount   = payments.filter((p) => p.status === "failed").length;

  const closeDropdowns = () => { setShowStatusDD(false); setShowMethodDD(false); };

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
    <div onClick={closeDropdowns}>
      <h1 className="text-2xl font-semibold text-foreground mb-6">Payments</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Payments"     value={String(totalCount)}   variant="primary"     />
        <StatsCard title="Pending"            value={String(pendingCount)} variant="default"     />
        <StatsCard title="Confirmed"          value={String(successCount)} variant="primary"     />
        <StatsCard title="Failed"             value={String(failedCount)}  variant="destructive" />
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">Filter by</span>

          {/* Status */}
          <div className="relative inline-block">
            <button onClick={(e) => { e.stopPropagation(); setShowStatusDD(!showStatusDD); setShowMethodDD(false); }}
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-lg px-3 py-2">
              <span className="text-xs text-muted-foreground">Status</span>
              <span className="text-sm capitalize">{statusFilter}</span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>
            {showStatusDD && (
              <div className="absolute top-full left-0 bg-popover border border-border rounded-lg mt-1 shadow-lg z-10 min-w-[160px]"
                onClick={(e) => e.stopPropagation()}>
                {statusOptions.map((opt) => (
                  <button key={opt} onClick={() => { setStatusFilter(opt); setShowStatusDD(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary/70 capitalize ${statusFilter === opt ? "text-primary font-medium" : "text-popover-foreground"}`}>
                    {opt === "All" ? "All" : statusLabel[opt] ?? opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Method */}
          <div className="relative inline-block">
            <button onClick={(e) => { e.stopPropagation(); setShowMethodDD(!showMethodDD); setShowStatusDD(false); }}
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-lg px-3 py-2">
              <span className="text-xs text-muted-foreground">Method</span>
              <span className="text-sm capitalize">{methodFilter}</span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>
            {showMethodDD && (
              <div className="absolute top-full left-0 bg-popover border border-border rounded-lg mt-1 shadow-lg z-10 min-w-[160px]"
                onClick={(e) => e.stopPropagation()}>
                {methodOptions.map((opt) => (
                  <button key={opt} onClick={() => { setMethodFilter(opt); setShowMethodDD(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary/70 capitalize ${methodFilter === opt ? "text-primary font-medium" : "text-popover-foreground"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <SearchInput placeholder="Search by reference or order ID"
          value={searchTerm} onChange={setSearchTerm} className="w-80" />
      </div>

      <div className="bg-card rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Reference", "Order ID", "Amount", "Method", "Status", "Date"].map((h) => (
                <th key={h} className="text-left p-4 text-muted-foreground font-medium text-sm">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">
                  No payments match your search or filters.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p._id} onClick={() => setSelectedPayment(p)}
                  className="border-b border-border hover:bg-secondary/50 cursor-pointer transition-colors">
                  <td className="p-4 text-primary text-sm font-mono">{p.reference}</td>
                  <td className="p-4 text-primary text-sm">{String(p.order).slice(-8).toUpperCase()}</td>
                  <td className="p-4 text-primary text-sm">{formatPrice(p.amount)}</td>
                  <td className="p-4 text-muted-foreground text-sm capitalize">{p.payment_method ?? "—"}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusClass[p.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {statusLabel[p.status] ?? p.status}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground text-sm">
                    {new Date(p.createdAt).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="bg-[hsl(var(--lavender))] border-none max-w-sm">
          {selectedPayment && (
            <div className="flex flex-col items-center text-center py-6">
              <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center mb-4 ${
                selectedPayment.status === "success"  ? "border-primary"
                : selectedPayment.status === "pending" ? "border-yellow-500"
                : "border-destructive"
              }`}>
                <Check size={32} className={
                  selectedPayment.status === "success"  ? "text-primary"
                  : selectedPayment.status === "pending" ? "text-yellow-500"
                  : "text-destructive"
                } />
              </div>
              <h2 className="text-xl font-semibold text-popover-foreground mb-1">
                Payment {statusLabel[selectedPayment.status] ?? selectedPayment.status}
              </h2>
              <p className="text-xs text-muted-foreground mb-2 font-mono">{selectedPayment.reference}</p>
              <p className="text-xs text-muted-foreground mb-1">
                Order: <span className="font-medium text-popover-foreground">
                  #{String(selectedPayment.order).slice(-8).toUpperCase()}
                </span>
              </p>
              <p className="text-lg font-semibold text-popover-foreground mb-1">
                {formatPrice(selectedPayment.amount)}
              </p>
              <p className="text-xs text-muted-foreground mb-6 capitalize">
                {selectedPayment.payment_method ?? "—"}
              </p>
              <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90"
                onClick={() => setSelectedPayment(null)}>
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