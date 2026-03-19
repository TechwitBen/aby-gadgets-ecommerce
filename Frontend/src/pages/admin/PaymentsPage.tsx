import { useState } from "react";
import { paymentsData } from "@/pages/admin/data/mockData";
import { StatsCard } from "@/components/ui/stats-card";
import { SearchInput } from "@/components/ui/search-input";
import { ChevronDown, Check } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const PaymentsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("Confirmed");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("Bank transfer");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  return (
    <div className="admin-theme">
      <h1 className="text-2xl font-semibold text-foreground mb-6">Payments</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Payment" value="124" variant="primary" />
        <StatsCard title="Pending Payment" value="3" variant="default" />
        <StatsCard title="Confirmed Payment" value="121" variant="primary" />
        <StatsCard title="Failed Payment" value="0" variant="destructive" />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-xs text-muted-foreground mr-2">Filter by</span>
            <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-lg px-3 py-2">
              <span className="text-xs text-muted-foreground">Payment Status</span>
              <span className="text-sm">{paymentStatusFilter}</span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-lg px-3 py-2">
            <span className="text-xs text-muted-foreground">Payment Method</span>
            <span className="text-sm">{paymentMethodFilter}</span>
            <ChevronDown size={14} className="text-muted-foreground" />
          </div>
        </div>

        <SearchInput
          placeholder="Search by Order ID or customer name"
          value={searchTerm}
          onChange={setSearchTerm}
          className="w-80"
        />
      </div>

      {/* Payments Table */}
      <div className="bg-card rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-muted-foreground font-medium text-sm">Payment ID</th>
              <th className="text-left p-4 text-muted-foreground font-medium text-sm">Order ID</th>
              <th className="text-left p-4 text-muted-foreground font-medium text-sm">Customer Name</th>
              <th className="text-left p-4 text-muted-foreground font-medium text-sm">Amount</th>
              <th className="text-left p-4 text-muted-foreground font-medium text-sm">Payment Method</th>
            </tr>
          </thead>
          <tbody>
            {paymentsData.map((payment) => (
              <tr
                key={payment.paymentId}
                onClick={() => setShowConfirmModal(true)}
                className="border-b border-border hover:bg-secondary/50 cursor-pointer transition-colors"
              >
                <td className="p-4 text-primary text-sm">{payment.paymentId}</td>
                <td className="p-4 text-primary text-sm">{payment.orderId}</td>
                <td className="p-4 text-foreground text-sm">{payment.customerName}</td>
                <td className="p-4 text-primary text-sm">{formatPrice(payment.amount)}</td>
                <td className="p-4 text-muted-foreground text-sm">{payment.paymentMethod}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Confirmed Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="bg-lavender border-none max-w-sm">
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center mb-4">
              <Check size={32} className="text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-popover-foreground mb-2">Payment Confirmed</h2>
            <p className="text-sm text-muted-foreground mb-6">
              This payment has been successfully verified and confirmed.
            </p>
            <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90" onClick={() => setShowConfirmModal(false)}>
              View Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsPage;
