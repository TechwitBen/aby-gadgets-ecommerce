import { useState, useEffect, useCallback } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Trash2, X, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { orderService, type OrderDoc } from "@/services/Order.service";
import { OrderDetailModal } from "@/pages/admin/OrderDetailModal";
import { useToast } from "@/hooks/use-toast";

// ── Delete Confirmation Modal ─────────────────────────────────────────────────
const DeleteConfirmModal = ({
  open,
  order,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  order: OrderDoc | null;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!open || !order) return null;

  const isHighRisk =
    order.payment_status === "paid" && order.status === "delivered";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-popover text-popover-foreground rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-border animate-in fade-in zoom-in duration-200">
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${isHighRisk ? "bg-amber-50/50" : ""}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${isHighRisk ? "bg-amber-100" : "bg-destructive/10"}`}
            >
              {isHighRisk ? (
                <AlertTriangle size={20} className="text-amber-600" />
              ) : (
                <Trash2 size={20} className="text-destructive" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {isHighRisk ? "High-Risk Deletion" : "Delete Order"}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to delete order{" "}
            <span className="font-mono font-bold text-foreground">
              #{order._id.slice(-8).toUpperCase()}
            </span>?
          </p>

          {isHighRisk && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-xs text-red-700 font-bold uppercase mb-1">
                Warning:
              </p>
              <p className="text-xs text-red-600">
                This order is marked as <strong>PAID</strong> and{" "}
                <strong>DELIVERED</strong>. Deleting this will permanently
                remove this transaction from your financial records.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-secondary/20">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            className={`${isHighRisk ? "bg-red-600 hover:bg-red-700" : "bg-destructive hover:bg-destructive/90"} text-white font-bold px-6`}
          >
            {isHighRisk ? "Yes, Delete Record" : "Confirm Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const getShippingName = (order: OrderDoc) =>
  order.shipping_address?.full_name ?? "—";
const getShippingPhone = (order: OrderDoc) =>
  order.shipping_address?.phone ?? "—";
const getShippingAddress = (order: OrderDoc) => {
  const a = order.shipping_address;
  if (!a) return "—";
  return [a.street, a.city, a.state].filter(Boolean).join(", ");
};

// ── Main Page ────────────────────────────────────────────────────────────────
const OrdersPage = () => {
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDoc | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<OrderDoc | null>(null);

  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await orderService.getAllOrders();
      // Ensure data is always an array
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setFetchError("Failed to load orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // CRITICAL FIX: Safe filtering with fallback to empty array
  const filteredOrders = (orders || []).filter((o) => {
    if (!o || !o._id) return false;
    const q = searchTerm.toLowerCase();
    const orderIdMatch = o._id.toLowerCase().includes(q);
    const nameMatch = getShippingName(o).toLowerCase().includes(q);
    return orderIdMatch || nameMatch;
  });

  const handleConfirmDelete = async () => {
    if (!deletingOrder) return;

    try {
      await orderService.deleteOrder(deletingOrder._id);

      // Optimistic UI Update
      setOrders((prev) => prev.filter((o) => o._id !== deletingOrder._id));

      if (selectedOrder?._id === deletingOrder._id) {
        setSelectedOrder(null);
      }

      toast({
        title: "Order Deleted",
        description: `Order ${deletingOrder._id.slice(-8).toUpperCase()} has been removed`,
      });
    } catch (error) {
      console.error("Delete failed:", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not remove the order. Please try again.",
      });
    } finally {
      setDeletingOrder(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-muted-foreground">
        <Loader2 size={32} className="animate-spin text-primary" />
        <span className="text-sm font-medium">Fetching orders...</span>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="p-4 bg-destructive/10 rounded-full">
          <RefreshCw size={32} className="text-destructive" />
        </div>
        <p className="text-sm text-destructive font-medium">{fetchError}</p>
        <Button variant="outline" onClick={fetchOrders} className="gap-2">
          <RefreshCw size={14} /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex items-center justify-between bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div>
          <p className="text-muted-foreground text-lg">Welcome back,</p>
          <h1 className="text-primary text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            "It's okay to take breaks, but never stop pushing."
          </p>
        </div>
        <div className="hidden sm:flex w-24 h-24 bg-primary/5 rounded-2xl items-center justify-center border border-primary/10">
          <span className="text-4xl">📦</span>
        </div>
      </div>

      {/* Orders Table section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Customer Orders</h2>
            <p className="text-muted-foreground text-sm">
              Total found: {filteredOrders.length}
            </p>
          </div>
          <SearchInput
            placeholder="Search by ID or name..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="w-full sm:w-80"
            showMenuIcon={false}
          />
        </div>

        <div className="bg-card rounded-xl overflow-hidden border border-border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Order ID", "Customer", "Phone", "Address", "Status", "Total", "Actions"].map((h) => (
                    <th key={h} className="p-4 text-muted-foreground font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-muted-foreground italic">
                      No orders found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-muted/50 transition-colors group cursor-default"
                     onClick={() => setSelectedOrder(order)}
                    >
                      <td
                        className="p-4 font-mono font-medium text-primary cursor-pointer hover:underline"
                       
                      >
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="p-4 font-medium text-foreground">
                        {getShippingName(order)}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {getShippingPhone(order)}
                      </td>
                      <td className="p-4 text-muted-foreground max-w-[200px] truncate">
                        {getShippingAddress(order)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-700"
                              : order.status === "cancelled" || order.status === "refunded"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-foreground">
                        ₦{order.total.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => setDeletingOrder(order)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                          title="Delete Order"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedOrder && (
        <OrderDetailModal
          key={selectedOrder._id}
          order={selectedOrder}
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onDelete={(id) => {
            const o = orders.find((x) => x._id === id);
            if (o) {
              setSelectedOrder(null);
              setDeletingOrder(o);
            }
          }}
          onStatusUpdated={(updated) => {
            setOrders((prev) =>
              prev.map((o) => (o._id === updated._id ? updated : o)),
            );
            setSelectedOrder(updated);
          }}
        />
      )}

      <DeleteConfirmModal
        open={!!deletingOrder}
        order={deletingOrder}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingOrder(null)}
      />
    </div>
  );
};

export default OrdersPage;