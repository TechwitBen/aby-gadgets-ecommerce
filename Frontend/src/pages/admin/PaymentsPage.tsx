import { useState, useEffect, useCallback } from "react";
import { StatsCard } from "@/components/ui/stats-card";
import { SearchInput } from "@/components/ui/search-input";
import { ChevronDown, Check, Loader2, RefreshCw } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {paymentService, type PaymentDoc } from "@/services/Payment.service";



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

const PaymentsPage = () => {
  const [payments, setPayments] = useState<PaymentDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const [showStatusDD, setShowStatusDD] = useState(false);
  const [showMethodDD, setShowMethodDD] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentDoc | null>(null);

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await paymentService.getAllPayments();
      // Ensure we always store an array
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Payment load error:", err);
      setFetchError("Failed to load payments.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  // FIX: Added (payments || []) safety guard
  const filtered = (payments || []).filter((p) => {
    if (!p) return false;
    const q = searchTerm.toLowerCase();
    const reference = p.reference || "";
    const orderId = String(p.order || "");

    const matchSearch =
      reference.toLowerCase().includes(q) ||
      orderId.toLowerCase().includes(q);
    
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    const matchMethod = methodFilter === "All" || p.payment_method === methodFilter;
    
    return matchSearch && matchStatus && matchMethod;
  });

  // FIX: Added safety guards for counts
  const safePayments = payments || [];
  const totalCount = safePayments.length;
  const pendingCount = safePayments.filter((p) => p.status === "pending").length;
  const successCount = safePayments.filter((p) => p.status === "success").length;
  const failedCount = safePayments.filter((p) => p.status === "failed").length;

  const closeDropdowns = () => {
    setShowStatusDD(false);
    setShowMethodDD(false);
  };

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
    <div onClick={closeDropdowns} className="animate-in fade-in duration-500">
      <h1 className="text-2xl font-semibold text-foreground mb-6">Payments</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Payments" value={String(totalCount)} variant="primary" />
        <StatsCard title="Pending" value={String(pendingCount)} variant="default" />
        <StatsCard title="Confirmed" value={String(successCount)} variant="primary" />
        <StatsCard title="Failed" value={String(failedCount)} variant="destructive" />
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">Filter by</span>

          {/* Status Dropdown */}
          <div className="relative inline-block">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowStatusDD(!showStatusDD);
                setShowMethodDD(false);
              }}
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-lg px-3 py-2 transition-colors hover:bg-secondary/80"
            >
              <span className="text-xs text-muted-foreground">Status</span>
              <span className="text-sm capitalize">{statusFilter}</span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>
            {showStatusDD && (
              <div
                className="absolute top-full left-0 bg-popover border border-border rounded-lg mt-1 shadow-lg z-10 min-w-[160px] animate-in slide-in-from-top-1"
                onClick={(e) => e.stopPropagation()}
              >
                {statusOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setStatusFilter(opt);
                      setShowStatusDD(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary/70 capitalize ${statusFilter === opt ? "text-primary font-medium" : "text-popover-foreground"}`}
                  >
                    {opt === "All" ? "All" : statusLabel[opt] ?? opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Method Dropdown */}
          <div className="relative inline-block">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMethodDD(!showMethodDD);
                setShowStatusDD(false);
              }}
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-lg px-3 py-2 transition-colors hover:bg-secondary/80"
            >
              <span className="text-xs text-muted-foreground">Method</span>
              <span className="text-sm capitalize">{methodFilter}</span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>
            {showMethodDD && (
              <div
                className="absolute top-full left-0 bg-popover border border-border rounded-lg mt-1 shadow-lg z-10 min-w-[160px] animate-in slide-in-from-top-1"
                onClick={(e) => e.stopPropagation()}
              >
                {methodOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setMethodFilter(opt);
                      setShowMethodDD(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary/70 capitalize ${methodFilter === opt ? "text-primary font-medium" : "text-popover-foreground"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <SearchInput
          placeholder="Search by reference or order ID"
          value={searchTerm}
          onChange={setSearchTerm}
          className="w-full md:w-80"
        />
      </div>

      <div className="bg-card rounded-xl overflow-hidden border border-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Reference", "Order ID", "Amount", "Method", "Status", "Date"].map((h) => (
                  <th key={h} className="p-4 text-muted-foreground font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground italic">
                    No payments match your search or filters.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p._id}
                    onClick={() => setSelectedPayment(p)}
                    className="hover:bg-secondary/50 cursor-pointer transition-colors group"
                  >
                    <td className="p-4 text-primary font-mono font-medium">{p.reference}</td>
                    <td className="p-4 text-foreground font-medium">
                      #{String(p.order).slice(-8).toUpperCase()}
                    </td>
                    <td className="p-4 text-foreground font-bold">{formatPrice(p.amount)}</td>
                    <td className="p-4 text-muted-foreground capitalize">
                      {p.payment_method ?? "—"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${statusClass[p.status] ?? "bg-gray-100 text-gray-700"}`}
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

      {/* Detail modal */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
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
                Payment {statusLabel[selectedPayment.status] ?? selectedPayment.status}
              </h2>
              <p className="text-xs text-muted-foreground mb-4 font-mono bg-muted px-2 py-1 rounded">
                Ref: {selectedPayment.reference}
              </p>
              
              <div className="w-full space-y-3 mb-6 px-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-bold">#{String(selectedPayment.order).slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-primary">{formatPrice(selectedPayment.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium capitalize">{selectedPayment.payment_method ?? "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{new Date(selectedPayment.createdAt).toLocaleString()}</span>
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