import { useState } from "react";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ordersData, orderStatuses, paymentStatuses } from "@/pages/admin/data/mockData";

interface OrderDetailModalProps {
  order: typeof ordersData[0] | null;
  open: boolean;
  onClose: () => void;
}

export const OrderDetailModal = ({ order, open, onClose }: OrderDetailModalProps) => {
  const [orderStatus, setOrderStatus] = useState(order?.orderStatus || "Processing");
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus || "Awaiting Confirmation");
  const [internalNote, setInternalNote] = useState(order?.internalNote || "");
  const [paymentDropdownOpen, setPaymentDropdownOpen] = useState(false);

  if (!open || !order) return null;

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-popover text-popover-foreground rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="text-sm font-medium">{order.id}</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{order.date}</span>
            <Button size="sm" className="gap-1">
              <Save size={14} />
              Save
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Customer Details */}
          <div>
            <h3 className="text-sm font-medium mb-3">Customer Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Customer Name</label>
                <div className="bg-lavender rounded-lg p-3 text-sm">{order.name}</div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Customer Phone Number</label>
                <div className="bg-lavender rounded-lg p-3 text-sm">09030834028</div>
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs text-muted-foreground block mb-1">Address</label>
              <div className="bg-lavender rounded-lg p-3 text-sm">{order.address}</div>
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Order Details</h3>
                <span className="text-xs text-muted-foreground">Total Item: 2</span>
              </div>
              
              {/* Product Item */}
              <div className="border border-border rounded-lg p-3 flex gap-3">
                <div className="w-16 h-16 bg-lavender rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">iPhone 11 pro</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Uk Used.</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    256GB•Battery 89%•UK Used•Fully tested.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Price ₦275,000</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-sm">
                    2
                  </div>
                  <span className="text-xs text-muted-foreground">Subtotal</span>
                  <span className="text-sm font-medium">₦550,000</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Update Order Status</h3>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="w-full bg-lavender rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-8 mb-4">
                <h3 className="text-sm font-medium">Payment Info</h3>
                <span className="bg-lavender px-4 py-2 rounded-lg text-sm">{order.paymentMethod}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{typeof order.delivery === "number" ? formatPrice(order.delivery) : order.delivery}</span>
                </div>
                <div className="flex justify-between text-sm text-primary font-medium">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Update Payment Status</h3>
              <div className="relative">
                <button
                  onClick={() => setPaymentDropdownOpen(!paymentDropdownOpen)}
                  className="w-full bg-lavender rounded-lg p-3 text-sm text-left flex justify-between items-center"
                >
                  {paymentStatus}
                  <span className="text-muted-foreground">▼</span>
                </button>
                {paymentDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 bg-popover border border-border rounded-lg mt-1 shadow-lg z-10">
                    {paymentStatuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setPaymentStatus(status);
                          setPaymentDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-lavender/50 transition-colors"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Internal Note */}
          <div>
            <h3 className="text-sm font-medium mb-2">Internal Note</h3>
            <div className="bg-lavender rounded-lg p-3 mb-2 min-h-[40px] text-sm">
              {order.internalNote || "No internal notes"}
            </div>
            <input
              type="text"
              placeholder="Add new note (Only visible to staffs)"
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              className="w-full bg-background border border-border rounded-lg p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
