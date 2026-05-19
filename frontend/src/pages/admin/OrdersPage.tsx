import { useState, useEffect, useCallback, useRef } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  X,
  Package,
  Loader2,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  Banknote,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  orderService,
  type OrderDoc,
  type FulfillmentType,
} from "@/services/order.service";
import { OrderDetailModal } from "@/pages/admin/OrderDetailModal";
import { useToast } from "@/hooks/use-toast";
import { usePermission } from "@/contexts/PermissionContext";
import { PermissionBanner } from "@/components/ui/PermissionBanner";
import { PermissionToast } from "@/components/ui/PermissionToast";
import { usePermissionToast } from "@/hooks/usePermissionToast";

// ── Human-readable ID helper ──────────────────────────────────────────────────
const displayOrderId = (order: OrderDoc): string =>
  order.order_number ?? `#${order._id.slice(-8).toUpperCase()}`;

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-orange-100 text-orange-700",
  ready_for_pickup: "bg-teal-100 text-teal-700",
  collected: "bg-emerald-100 text-emerald-700",
};
const statusClass = (s: string) => STATUS_STYLES[s] ?? "bg-gray-100 text-gray-700";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
  ready_for_pickup: "Ready for Pickup",
  collected: "Collected",
};

const ACTIVE_STATUSES = new Set([
  "pending", "confirmed", "shipped", "out_for_delivery", "ready_for_pickup",
]);
const COMPLETED_STATUSES = new Set([
  "delivered", "collected", "cancelled", "refunded",
]);

// ── Fulfillment badge ─────────────────────────────────────────────────────────
const FulfillmentBadge = ({ type }: { type?: FulfillmentType }) =>
  type === "pickup" ? (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700 whitespace-nowrap">
      🏪 Pickup
    </span>
  ) : (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 whitespace-nowrap">
      🚚 Delivery
    </span>
  );

// ── Payment chip ──────────────────────────────────────────────────────────────
const PaymentChip = ({ order, size = "sm" }: { order: OrderDoc; size?: "sm" | "xs" }) => {
  const cls = size === "xs"
    ? "text-[9px] font-bold px-1.5 py-0.5 rounded-full"
    : "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full";

  if (order.payment_method === "pod") {
    return (
      <span className={`${cls} bg-amber-100 text-amber-700`}>
        {size === "sm" && <Banknote className="w-2.5 h-2.5" />} POD
      </span>
    );
  }
  if (order.payment_status === "paid") {
    return (
      <span className={`${cls} bg-emerald-100 text-emerald-700`}>
        {size === "sm" && <CheckCircle2 className="w-2.5 h-2.5" />} Paid
      </span>
    );
  }
  return (
    <span className={`${cls} bg-amber-100 text-amber-700`}>
      {size === "sm" && <Clock className="w-2.5 h-2.5" />} Unpaid
    </span>
  );
};

// ── Address helpers ───────────────────────────────────────────────────────────
const getShippingName  = (o: OrderDoc) => o.shipping_address?.full_name ?? "—";
const getShippingPhone = (o: OrderDoc) => o.shipping_address?.phone ?? "—";
const getShippingAddress = (o: OrderDoc) => {
  if (o.fulfillment_type === "pickup") return "Store Pickup";
  const a = o.shipping_address;
  if (!a) return "—";
  return [a.street, a.city, a.state].filter(Boolean).join(", ");
};

// ── Delete Confirmation Modal ─────────────────────────────────────────────────
const DeleteConfirmModal = ({
  open, order, onConfirm, onCancel,
}: {
  open: boolean;
  order: OrderDoc | null;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!open || !order) return null;
  const isHighRisk =
    order.payment_status === "paid" &&
    (order.status === "delivered" || order.status === "collected");

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-popover text-popover-foreground rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl overflow-hidden border border-border">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className={`flex items-center justify-between px-6 py-4 border-b border-border ${isHighRisk ? "bg-amber-50/50" : ""}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isHighRisk ? "bg-amber-100" : "bg-destructive/10"}`}>
              {isHighRisk
                ? <AlertTriangle size={20} className="text-amber-600" />
                : <Trash2 size={20} className="text-destructive" />}
            </div>
            <p className="text-sm font-bold text-foreground">
              {isHighRisk ? "High-Risk Deletion" : "Delete Order"}
            </p>
          </div>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to delete order{" "}
            <span className="font-mono font-bold text-foreground">{displayOrderId(order)}</span>?
          </p>
          {isHighRisk && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-xs text-red-700 font-bold uppercase mb-1">Warning:</p>
              <p className="text-xs text-red-600">
                This order is marked as <strong>PAID</strong> and{" "}
                <strong>{order.status === "collected" ? "COLLECTED" : "DELIVERED"}</strong>.
                Deleting this will permanently remove this transaction from your financial records.
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-secondary/20">
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
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

// ── Mobile Order Card ─────────────────────────────────────────────────────────
const OrderCard = ({
  order, onSelect, onDelete, canDelete, canViewContact,
}: {
  order: OrderDoc;
  onSelect: (o: OrderDoc) => void;
  onDelete: (o: OrderDoc) => void;
  canDelete: boolean;
  canViewContact: boolean;
}) => (
  <div
    className="bg-card border border-border rounded-xl p-4 active:bg-secondary/30 transition-colors cursor-pointer"
    onClick={() => onSelect(order)}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <p className="text-sm font-mono font-bold text-primary">{displayOrderId(order)}</p>
          <FulfillmentBadge type={order.fulfillment_type} />
        </div>
        <p className="text-sm font-medium text-foreground mt-0.5 truncate">{getShippingName(order)}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{getShippingAddress(order)}</p>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <div className="flex items-center gap-1 flex-wrap justify-end">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusClass(order.status)}`}>
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
          <PaymentChip order={order} size="xs" />
        </div>
        <p className="text-sm font-bold text-foreground">₦{order.total.toLocaleString()}</p>
      </div>
    </div>
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
      <p className="text-xs text-muted-foreground">
        {canViewContact ? getShippingPhone(order) : <span className="italic">Phone hidden</span>}
      </p>
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {canDelete && (
          <button
            onClick={() => onDelete(order)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:bg-destructive/20 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
        <button
          onClick={() => onSelect(order)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  </div>
);

// ── Orders Table ──────────────────────────────────────────────────────────────
const OrdersTable = ({
  orders, onSelect, onDelete, canDelete, canViewContact, emptyMessage,
}: {
  orders: OrderDoc[];
  onSelect: (o: OrderDoc) => void;
  onDelete: (o: OrderDoc) => void;
  canDelete: boolean;
  canViewContact: boolean;
  emptyMessage: string;
}) => {
  const headers = [
    "Order ID",
    "Type",
    "Customer",
    ...(canViewContact ? ["Phone"] : []),
    "Address / Zone",
    "Status",
    "Payment",
    "Total",
    ...(canDelete ? ["Actions"] : []),
  ];

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block bg-card rounded-xl overflow-hidden border border-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {headers.map((h) => (
                  <th key={h} className="p-4 text-muted-foreground font-semibold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={headers.length} className="p-12 text-center text-muted-foreground italic">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => onSelect(order)}
                  >
                    <td className="p-4 font-mono font-medium text-primary">
                      {displayOrderId(order)}
                    </td>
                    <td className="p-4">
                      <FulfillmentBadge type={order.fulfillment_type} />
                    </td>
                    <td className="p-4 font-medium text-foreground">{getShippingName(order)}</td>
                    {canViewContact && (
                      <td className="p-4 text-muted-foreground">{getShippingPhone(order)}</td>
                    )}
                    <td className="p-4 text-muted-foreground max-w-[200px] truncate">
                      {order.fulfillment_type === "pickup" ? (
                        <span className="text-teal-600 font-medium">Store Pickup</span>
                      ) : (
                        order.delivery_city || getShippingAddress(order)
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${statusClass(order.status)}`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <PaymentChip order={order} size="sm" />
                    </td>
                    <td className="p-4 font-bold text-foreground">
                      ₦{order.total.toLocaleString()}
                    </td>
                    {canDelete && (
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onDelete(order)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-2">
        {orders.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-12 italic">{emptyMessage}</p>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onSelect={onSelect}
              onDelete={onDelete}
              canDelete={canDelete}
              canViewContact={canViewContact}
            />
          ))
        )}
      </div>
    </>
  );
};

// ── Tab type ──────────────────────────────────────────────────────────────────
type Tab = "active" | "completed";

// ── Main Page ─────────────────────────────────────────────────────────────────
const OrdersPage = () => {
  const { isAdmin, can } = usePermission();
  const { message: permMsg, deny, clear: clearPerm } = usePermissionToast();
  const { toast } = useToast();

  const canViewOrders   = isAdmin || can("order", "viewOrder");
  const canDeleteOrders = isAdmin;
  const canViewContact  = isAdmin || can("payments", "contactCustomers");

  const [orders, setOrders]           = useState<OrderDoc[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fetchError, setFetchError]   = useState<string | null>(null);
  const [searchTerm, setSearchTerm]   = useState("");
  const [activeTab, setActiveTab]     = useState<Tab>("active");
  const [selectedOrder, setSelectedOrder] = useState<OrderDoc | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<OrderDoc | null>(null);

  // ── Scroll to top on tab change ────────────────────────────────────────────
  const prevTabRef = useRef<Tab>("active");

  useEffect(() => {
    if (prevTabRef.current !== activeTab) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      prevTabRef.current = activeTab;
    }
  }, [activeTab]);

  // ── Pagination state ──────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const LIMIT = 20;

  const fetchOrders = useCallback(async (page = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setInitialLoading(true);
    }
    setFetchError(null);
    try {
      const res = await orderService.getAllOrders({ page, limit: LIMIT });
      const fetched = Array.isArray(res) ? res : (res?.orders ?? []);

      if (page === 1) {
        setOrders(fetched);
      } else {
        setOrders((prev) => [...prev, ...fetched]); // append
      }

      setCurrentPage(page);
      setTotalPages(res?.pages ?? 1);
    } catch {
      setFetchError("Failed to load orders. Please try again.");
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setInitialLoading(false);
      }
    }
  }, []);

  useEffect(() => { fetchOrders(1, false); }, [fetchOrders]);

  const activeCount    = orders.filter((o) => ACTIVE_STATUSES.has(o.status)).length;
  const completedCount = orders.filter((o) => COMPLETED_STATUSES.has(o.status)).length;

  const tabFiltered = orders.filter((o) =>
    activeTab === "active"
      ? ACTIVE_STATUSES.has(o.status)
      : COMPLETED_STATUSES.has(o.status),
  );

  const filteredOrders = tabFiltered.filter((o) => {
    if (!o?._id) return false;
    const q = searchTerm.toLowerCase();
    return (
      o._id.toLowerCase().includes(q) ||
      (o.order_number ?? "").toLowerCase().includes(q) ||
      getShippingName(o).toLowerCase().includes(q) ||
      (o.delivery_city ?? "").toLowerCase().includes(q)
    );
  });

  const handleDeleteClick = (order: OrderDoc) => {
    if (!canDeleteOrders) {
      deny("You don't have permission to delete orders. Only admins can delete orders.");
      return;
    }
    setDeletingOrder(order);
  };

  const handleConfirmDelete = async () => {
    if (!deletingOrder) return;
    try {
      await orderService.deleteOrder(deletingOrder._id);
      setOrders((prev) => prev.filter((o) => o._id !== deletingOrder._id));
      if (selectedOrder?._id === deletingOrder._id) setSelectedOrder(null);
      toast({
        title: "Order Deleted",
        description: `Order ${displayOrderId(deletingOrder)} has been removed`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not remove the order. Please try again.",
      });
    } finally {
      setDeletingOrder(null);
    }
  };

  // ── Skeleton loading ──────────────────────────────────────────────────────
  if (initialLoading)
    return (
      <div className="space-y-6 animate-pulse">
        {/* Dashboard header skeleton */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="h-6 bg-muted rounded w-1/4 mb-2" />
          <div className="h-8 bg-muted rounded w-1/2" />
        </div>

        {/* Table skeleton */}
        <div className="hidden md:block bg-card rounded-xl border border-border shadow-sm">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border-b border-border p-4 flex gap-4">
              <div className="h-5 bg-muted rounded w-1/6" />
              <div className="h-5 bg-muted rounded w-1/6" />
              <div className="h-5 bg-muted rounded w-1/6" />
              <div className="h-5 bg-muted rounded w-1/6" />
              <div className="h-5 bg-muted rounded w-1/6" />
            </div>
          ))}
        </div>

        {/* Mobile skeleton */}
        <div className="md:hidden space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4">
              <div className="h-4 bg-muted rounded w-1/3 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );

  if (fetchError)
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="p-4 bg-destructive/10 rounded-full">
          <RefreshCw size={32} className="text-destructive" />
        </div>
        <p className="text-sm text-destructive font-medium">{fetchError}</p>
        <Button variant="outline" onClick={() => fetchOrders(1, false)} className="gap-2">
          <RefreshCw size={14} /> Retry
        </Button>
      </div>
    );

  if (!canViewOrders)
    return (
      <PermissionBanner
        message="You don't have permission to view orders."
        hint="Ask your admin to enable the 'View Orders' permission for your account."
      />
    );

  const emptyMessage = searchTerm
    ? `No ${activeTab} orders match "${searchTerm}".`
    : activeTab === "active"
      ? "No active orders at the moment."
      : "No completed orders yet.";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {permMsg && <PermissionToast message={permMsg} onClose={clearPerm} />}

      {/* Dashboard header */}
      <div className="flex items-center justify-between bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
        <div>
          <p className="text-muted-foreground text-sm sm:text-lg">Welcome back,</p>
          <h1 className="text-primary text-xl sm:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1 hidden sm:block">
            "It's okay to take breaks, but never stop pushing."
          </p>
        </div>
        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-primary/5 rounded-2xl items-center justify-center border border-primary/10 hidden sm:flex">
          <Package className="w-8 h-8 sm:w-10 sm:h-10 text-primary/40" />
        </div>
      </div>

      {/* Orders section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Customer Orders</h2>
            <p className="text-muted-foreground text-sm">
              {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""} shown
            </p>
          </div>
          <SearchInput
            placeholder="Search by ID, order number, name, or zone..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="w-full sm:w-80"
            showMenuIcon={false}
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-secondary/50 rounded-xl p-1 w-fit">
          {(["active", "completed"] as Tab[]).map((tab) => {
            const count = tab === "active" ? activeCount : completedCount;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "active" ? "Active" : "Completed"}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === tab
                      ? tab === "active"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <OrdersTable
          orders={filteredOrders}
          onSelect={setSelectedOrder}
          onDelete={handleDeleteClick}
          canDelete={canDeleteOrders}
          canViewContact={canViewContact}
          emptyMessage={emptyMessage}
        />

        {/* ── Load more button ────────────────────────────────────────────── */}
        {currentPage < totalPages && (
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => fetchOrders(currentPage + 1, true)}
              disabled={loadingMore}
              className="gap-2"
            >
              {loadingMore ? <Loader2 size={14} className="animate-spin" /> : null}
              {loadingMore ? "Loading..." : "Load more orders"}
            </Button>
          </div>
        )}
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
              handleDeleteClick(o);
            }
          }}
          onStatusUpdated={(updated) => {
            setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
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