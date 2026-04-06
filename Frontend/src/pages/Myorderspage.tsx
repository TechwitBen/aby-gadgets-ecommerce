import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockOrders, Order } from "@/data/Mockorders";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount);

const PaymentBadge: React.FC<{ status: Order["paymentStatus"] }> = ({ status }) => {
  const styles: Record<Order["paymentStatus"], string> = {
    Paid: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Pending: "bg-amber-50 text-amber-700 border border-amber-200",
  };
  const dots: Record<Order["paymentStatus"], string> = {
    Paid: "bg-emerald-500",
    Pending: "bg-amber-500",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
};

const DeliveryBadge: React.FC<{ status: Order["deliveryStatus"] }> = ({ status }) => {
  const styles: Record<Order["deliveryStatus"], string> = {
    Processing: "bg-blue-50 text-blue-700 border border-blue-200",
    Shipped: "bg-purple-50 text-purple-700 border border-purple-200",
    "Out for Delivery": "bg-orange-50 text-orange-700 border border-orange-200",
    Delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  };
  const dots: Record<Order["deliveryStatus"], string> = {
    Processing: "bg-blue-500",
    Shipped: "bg-purple-500",
    "Out for Delivery": "bg-orange-500",
    Delivered: "bg-emerald-500",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const MyOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"All" | Order["deliveryStatus"]>("All");
  const [search, setSearch] = useState("");

  const filtered = mockOrders.filter((o) => {
    const matchesFilter = filter === "All" || o.deliveryStatus === filter;
    const matchesSearch =
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filterOptions: Array<"All" | Order["deliveryStatus"]> = [
    "All",
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              My Orders
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{mockOrders.length} orders placed</p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition"
              style={{ "--tw-ring-color": "#6426E1" } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="max-w-7xl mx-auto mt-4 flex gap-2 flex-wrap">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                filter === opt
                  ? "text-white border-transparent shadow-sm"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
              style={filter === opt ? { backgroundColor: "#6426E1", borderColor: "#6426E1" } : {}}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {filtered.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
              style={{ backgroundColor: "#F3EEFF" }}
            >
              <svg className="w-10 h-10" style={{ color: "#6426E1" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No orders yet</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              {search || filter !== "All"
                ? "No orders match your current filter."
                : "When you place an order, it will show up here."}
            </p>
          </div>
        ) : (
          /* Orders Grid */
          <div className="grid gap-4">
            {filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onTrack={() => navigate(`/track-order/${order.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Order Card ───────────────────────────────────────────────────────────────

interface OrderCardProps {
  order: Order;
  onTrack: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onTrack }) => {
  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Product image */}
        <div className="sm:w-36 h-36 sm:h-auto flex-shrink-0 bg-gray-50 relative overflow-hidden">
          <img
            src={order.image}
            alt={order.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://via.placeholder.com/200x200?text=No+Image";
            }}
          />
          <div
            className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-md"
            style={{ backgroundColor: "#6426E1" }}
          >
            {order.category}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            {/* Left: name + meta */}
            <div>
              <h3 className="font-semibold text-gray-900 text-base leading-tight">{order.name}</h3>
              <p className="text-xs text-gray-400 mt-1">
                Order #{order.id} &nbsp;·&nbsp; {order.date} &nbsp;·&nbsp; Qty: {order.quantity}
              </p>
              <p className="text-lg font-bold text-gray-900 mt-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {formatPrice(order.price)}
              </p>
            </div>

            {/* Right: badges */}
            <div className="flex flex-row sm:flex-col items-start gap-2 sm:items-end">
              <PaymentBadge status={order.paymentStatus} />
              <DeliveryBadge status={order.deliveryStatus} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={onTrack}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#6426E1" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
              </svg>
              Track Order
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all active:scale-95">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414A1 1 0 0 1 19 9.414V19a2 2 0 0 1-2 2z" />
              </svg>
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;