import { useState } from "react";
import { ordersData as initialOrdersData } from "@/pages/admin/data/mockData";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { OrderDetailModal } from "@/pages/admin/components/orders/OrderDetailModal";
import { Trash2, X } from "lucide-react";

// ── Delete Confirmation Modal ─────────────────────────────────────────────────
const DeleteConfirmModal = ({
  open,
  orderId,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  orderId: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!open) return null;

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-popover text-popover-foreground rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center">
              <Trash2 size={16} className="text-destructive" />
            </div>
            <p className="text-sm font-semibold text-foreground">Delete Order</p>
          </div>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete order{" "}
            <span className="font-semibold text-foreground">{orderId}</span>? This action cannot be undone.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button
            size="sm"
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:opacity-90 gap-1.5"
          >
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

const OrdersPage = () => {
  const [orders, setOrders] = useState(initialOrdersData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<typeof initialOrdersData[0] | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<typeof initialOrdersData[0] | null>(null);

  const filteredOrders = orders.filter(
    (order) =>
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirmDelete = () => {
    if (!deletingOrder) return;
    setOrders((prev) => prev.filter((o) => o.id !== deletingOrder.id));
    setDeletingOrder(null);
  };

  const handleDeleteFromModal = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setSelectedOrder(null);
      setDeletingOrder(order);
    }
  };

  return (
    // No admin-theme here — inherits from AdminLayout root
    <div>
      {/* Welcome Section */}
      <div className="flex items-center justify-between mb-8 bg-card rounded-xl p-6">
        <div>
          <p className="text-muted-foreground text-lg">Welcome,</p>
          <h1 className="text-primary text-2xl font-semibold">Egoh Abraham</h1>
          <p className="text-muted-foreground text-sm mt-1">
            It's okay to take breaks but never stop pushing
          </p>
        </div>
        <div className="w-32 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
          <div className="text-4xl">🛍️</div>
        </div>
      </div>

      {/* Orders Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Orders</h2>
            <p className="text-muted-foreground text-sm">Manage and track customer orders</p>
          </div>
          <SearchInput
            placeholder="Hinted search text"
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
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Order ID</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Name</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Phone number</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Address</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Email</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">
                    No orders match your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border hover:bg-secondary/50 transition-colors"
                  >
                    <td className="p-4 text-primary text-sm cursor-pointer" onClick={() => setSelectedOrder(order)}>{order.id}</td>
                    <td className="p-4 text-foreground text-sm cursor-pointer" onClick={() => setSelectedOrder(order)}>{order.name}</td>
                    <td className="p-4 text-muted-foreground text-sm cursor-pointer" onClick={() => setSelectedOrder(order)}>{order.phone}</td>
                    <td className="p-4 text-muted-foreground text-sm max-w-xs truncate cursor-pointer" onClick={() => setSelectedOrder(order)}>{order.address}</td>
                    <td className="p-4 text-muted-foreground text-sm cursor-pointer" onClick={() => setSelectedOrder(order)}>{order.email}</td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setDeletingOrder(order)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete order"
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
          key={selectedOrder.id}
          order={selectedOrder}
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onDelete={handleDeleteFromModal}
        />
      )}

      <DeleteConfirmModal
        open={!!deletingOrder}
        orderId={deletingOrder?.id || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingOrder(null)}
      />
    </div>
  );
};

export default OrdersPage;