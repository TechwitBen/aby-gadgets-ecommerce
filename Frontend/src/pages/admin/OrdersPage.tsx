import { useState, useEffect, useCallback } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Trash2, X, Loader2, RefreshCw } from "lucide-react";
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

  // Check for High-Risk deletion
  const isHighRisk =
    order.payment_status === "paid" && order.status === "delivered";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-popover text-popover-foreground rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-border">
        {/* Header - Changes color if High Risk */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${isHighRisk ? "bg-amber-50" : ""}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${isHighRisk ? "bg-amber-100" : "bg-destructive/10"}`}
            >
              <Trash2
                size={20}
                className={isHighRisk ? "text-amber-600" : "text-destructive"}
              />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {isHighRisk ? "⚠️ High-Risk Deletion" : "Delete Order"}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to delete order{" "}
            <span className="font-mono font-bold text-foreground">
              {order._id.slice(-8).toUpperCase()}
            </span>
            ?
          </p>

          {/* Additional Warning for Paid/Delivered Orders */}
          {isHighRisk && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-xs text-red-700 font-semibold uppercase mb-1">
                Warning:
              </p>
              <p className="text-xs text-red-600">
                This order is marked as <strong>PAID</strong> and{" "}
                <strong>DELIVERED</strong>. Deleting this will permanently
                remove this transaction from your financial records. This action
                cannot be reversed.
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

// ── Helper ────────────────────────────────────────────────────────────────────
const getShippingName = (order: OrderDoc) =>
  order.shipping_address?.full_name ?? "—";
const getShippingPhone = (order: OrderDoc) =>
  order.shipping_address?.phone ?? "—";
const getShippingAddress = (order: OrderDoc) => {
  const a = order.shipping_address;
  if (!a) return "—";
  return [a.street, a.city, a.state].filter(Boolean).join(", ");
};

// ─────────────────────────────────────────────────────────────────────────────
const OrdersPage = () => {
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDoc | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<OrderDoc | null>(null);

 const { toast }    = useToast();

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch {
      setFetchError("Failed to load orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((o) => {
    const q = searchTerm.toLowerCase();
    return (
      o._id.toLowerCase().includes(q) ||
      getShippingName(o).toLowerCase().includes(q)
    );
  });

  // Delete is a soft operation — in production you'd call a DELETE endpoint
  const handleConfirmDelete = async () => {
    if (!deletingOrder) return;

    try {
      // 1. Tell the backend to delete it
      await orderService.deleteOrder(deletingOrder._id);

      // 2. Only if the backend succeeds, update the UI state
      setOrders((prev) => prev.filter((o) => o._id !== deletingOrder._id));

      // 3. Close the modal and clean up
      if (selectedOrder?._id === deletingOrder._id) setSelectedOrder(null);

      // Success feedback (optional)
      // ADD SUCCESS FEEDBACK:
    toast?.({
      title: "Order Deleted",
      description: `Order ${deletingOrder._id.slice(-8).toUpperCase()} has been removed`,
    });
      console.log("Order deleted from database.");
    } catch (error) {
      // 4. If the backend fails (e.g., 401 Unauthorized or 500 Server Error)
      console.error("Failed to delete order:", error);
      alert("Delete failed. Please check your admin permissions.");
    } finally {
      setDeletingOrder(null);
    }
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-muted-foreground">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading orders…</span>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-sm text-destructive">{fetchError}</p>
        <Button variant="outline" onClick={fetchOrders} className="gap-2">
          <RefreshCw size={14} /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome section */}
      <div className="flex items-center justify-between mb-8 bg-card rounded-xl p-6">
        <div>
          <p className="text-muted-foreground text-lg">Welcome,</p>
          <h1 className="text-primary text-2xl font-semibold">Admin</h1>
          <p className="text-muted-foreground text-sm mt-1">
            It's okay to take breaks but never stop pushing
          </p>
        </div>
        <div className="w-32 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
          <div className="text-4xl">🛍️</div>
        </div>
      </div>

      {/* Orders section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Orders</h2>
            <p className="text-muted-foreground text-sm">
              Manage and track customer orders
            </p>
          </div>
          <SearchInput
            placeholder="Search by name or order ID"
            value={searchTerm}
            onChange={setSearchTerm}
            className="w-72"
            showMenuIcon={false}
          />
        </div>

        <div className="bg-card rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {[
                  "Order ID",
                  "Name",
                  "Phone",
                  "Address",
                  "Status",
                  "Total",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left p-4 text-muted-foreground font-medium text-sm"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-muted-foreground text-sm"
                  >
                    No orders match your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-border hover:bg-secondary/50 transition-colors"
                  >
                    <td
                      className="p-4 text-primary text-sm cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      {order._id.slice(-8).toUpperCase()}
                    </td>
                    <td
                      className="p-4 text-foreground text-sm cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      {getShippingName(order)}
                    </td>
                    <td
                      className="p-4 text-muted-foreground text-sm cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      {getShippingPhone(order)}
                    </td>
                    <td
                      className="p-4 text-muted-foreground text-sm max-w-xs truncate cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      {getShippingAddress(order)}
                    </td>
                    <td
                      className="p-4 text-sm cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "shipped"
                              ? "bg-blue-100 text-blue-700"
                              : order.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td
                      className="p-4 text-primary text-sm font-medium cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      ₦{order.total.toLocaleString()}
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setDeletingOrder(order)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
        order={deletingOrder} // Pass the whole object
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingOrder(null)}
      />
    </div>
  );
};

export default OrdersPage;
