import { useState } from "react";
import { paymentsData } from "@/pages/admin/data/mockData";
import { StatsCard } from "@/components/ui/stats-card";
import { SearchInput } from "@/components/ui/search-input";
import { ChevronDown, Check } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const paymentStatusOptions = ["All", "Confirmed", "Pending", "Failed"];
const paymentMethodOptions = ["All", "Bank Transfer", "Cash", "Pay On Delivery"];

const PaymentsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<typeof paymentsData[0] | null>(null);

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  const filteredPayments = paymentsData.filter((payment) => {
    const matchesSearch =
      payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = paymentStatusFilter === "All" || payment.status === paymentStatusFilter;
    const matchesMethod = paymentMethodFilter === "All" || payment.paymentMethod === paymentMethodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const totalCount     = paymentsData.length;
  const pendingCount   = paymentsData.filter((p) => p.status === "Pending").length;
  const confirmedCount = paymentsData.filter((p) => p.status === "Confirmed").length;
  const failedCount    = paymentsData.filter((p) => p.status === "Failed").length;

  const closeDropdowns = () => {
    setShowStatusDropdown(false);
    setShowMethodDropdown(false);
  };

  return (
    // No admin-theme here — inherits from AdminLayout root
    <div onClick={closeDropdowns}>
      <h1 className="text-2xl font-semibold text-foreground mb-6">Payments</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Payment"     value={String(totalCount)}     variant="primary"     />
        <StatsCard title="Pending Payment"   value={String(pendingCount)}   variant="default"     />
        <StatsCard title="Confirmed Payment" value={String(confirmedCount)} variant="primary"     />
        <StatsCard title="Failed Payment"    value={String(failedCount)}    variant="destructive" />
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-xs text-muted-foreground mr-2">Filter by</span>

            {/* Payment Status */}
            <div className="relative inline-block">
              <button
                onClick={(e) => { e.stopPropagation(); setShowStatusDropdown(!showStatusDropdown); setShowMethodDropdown(false); }}
                className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-lg px-3 py-2"
              >
                <span className="text-xs text-muted-foreground">Payment Status</span>
                <span className="text-sm">{paymentStatusFilter}</span>
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>
              {showStatusDropdown && (
                <div className="absolute top-full left-0 bg-popover border border-border rounded-lg mt-1 shadow-lg z-10 min-w-[160px]" onClick={(e) => e.stopPropagation()}>
                  {paymentStatusOptions.map((opt) => (
                    <button key={opt} onClick={() => { setPaymentStatusFilter(opt); setShowStatusDropdown(false); }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-secondary/70 ${paymentStatusFilter === opt ? "text-primary font-medium" : "text-popover-foreground"}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="relative inline-block">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMethodDropdown(!showMethodDropdown); setShowStatusDropdown(false); }}
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-lg px-3 py-2"
            >
              <span className="text-xs text-muted-foreground">Payment Method</span>
              <span className="text-sm">{paymentMethodFilter}</span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>
            {showMethodDropdown && (
              <div className="absolute top-full left-0 bg-popover border border-border rounded-lg mt-1 shadow-lg z-10 min-w-[160px]" onClick={(e) => e.stopPropagation()}>
                {paymentMethodOptions.map((opt) => (
                  <button key={opt} onClick={() => { setPaymentMethodFilter(opt); setShowMethodDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-secondary/70 ${paymentMethodFilter === opt ? "text-primary font-medium" : "text-popover-foreground"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <SearchInput placeholder="Search by Order ID or customer name" value={searchTerm} onChange={setSearchTerm} className="w-80" />
      </div>

      <div className="bg-card rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-muted-foreground font-medium text-sm">Payment ID</th>
              <th className="text-left p-4 text-muted-foreground font-medium text-sm">Order ID</th>
              <th className="text-left p-4 text-muted-foreground font-medium text-sm">Customer Name</th>
              <th className="text-left p-4 text-muted-foreground font-medium text-sm">Amount</th>
              <th className="text-left p-4 text-muted-foreground font-medium text-sm">Payment Method</th>
              <th className="text-left p-4 text-muted-foreground font-medium text-sm">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">No payments match your search or filters.</td>
              </tr>
            ) : (
              filteredPayments.map((payment) => (
                <tr key={payment.paymentId} onClick={() => setSelectedPayment(payment)}
                  className="border-b border-border hover:bg-secondary/50 cursor-pointer transition-colors">
                  <td className="p-4 text-primary text-sm">{payment.paymentId}</td>
                  <td className="p-4 text-primary text-sm">{payment.orderId}</td>
                  <td className="p-4 text-foreground text-sm">{payment.customerName}</td>
                  <td className="p-4 text-primary text-sm">{formatPrice(payment.amount)}</td>
                  <td className="p-4 text-muted-foreground text-sm">{payment.paymentMethod}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      payment.status === "Confirmed" ? "bg-green-100 text-green-700"
                      : payment.status === "Pending"  ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="bg-[hsl(var(--lavender))] border-none max-w-sm">
          {selectedPayment && (
            <div className="flex flex-col items-center text-center py-6">
              <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center mb-4 ${
                selectedPayment.status === "Confirmed" ? "border-primary"
                : selectedPayment.status === "Pending" ? "border-yellow-500"
                : "border-destructive"
              }`}>
                <Check size={32} className={
                  selectedPayment.status === "Confirmed" ? "text-primary"
                  : selectedPayment.status === "Pending" ? "text-yellow-500"
                  : "text-destructive"
                } />
              </div>
              <h2 className="text-xl font-semibold text-popover-foreground mb-1">Payment {selectedPayment.status}</h2>
              <p className="text-xs text-muted-foreground mb-1">{selectedPayment.paymentId}</p>
              <p className="text-sm text-muted-foreground mb-1">
                <span className="font-medium text-popover-foreground">{selectedPayment.customerName}</span>
              </p>
              <p className="text-lg font-semibold text-popover-foreground mb-1">₦{selectedPayment.amount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mb-6">{selectedPayment.paymentMethod}</p>
              <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90" onClick={() => setSelectedPayment(null)}>
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