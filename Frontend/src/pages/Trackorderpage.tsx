import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockOrders, Order } from "@/data/Mockorders";

// ─── Timeline Config ──────────────────────────────────────────────────────────

type TimelineStep = {
  label: string;
  description: string;
  icon: React.ReactNode;
};

const TIMELINE_STEPS: TimelineStep[] = [
  {
    label: "Order Placed",
    description: "We received your order and payment confirmation.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" />
      </svg>
    ),
  },
  {
    label: "Processing",
    description: "Your order is being prepared and quality-checked.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
      </svg>
    ),
  },
  {
    label: "Shipped",
    description: "Your order is on its way with our delivery partner.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3m0 0h-3a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3h3m0-10v10m0 0h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2" />
      </svg>
    ),
  },
  {
    label: "Out for Delivery",
    description: "The courier is near you. Keep your phone handy!",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
      </svg>
    ),
  },
  {
    label: "Delivered",
    description: "Package successfully delivered. Enjoy your purchase!",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6" />
      </svg>
    ),
  },
];

// Maps delivery status → index of the CURRENT (active) step
const STATUS_INDEX: Record<Order["deliveryStatus"], number> = {
  Processing: 1,
  Shipped: 2,
  "Out for Delivery": 3,
  Delivered: 4,
};

// Helper: get status color and label
const getStatusBadge = (status: Order["deliveryStatus"]) => {
  switch (status) {
    case "Processing":
      return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Processing" };
    case "Shipped":
      return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Shipped" };
    case "Out for Delivery":
      return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", label: "Out for Delivery" };
    case "Delivered":
      return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Delivered" };
    default:
      return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", label: status };
  }
};

// ─── Main Component ───────────────────────────────────────────────────────────

const TrackOrderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const order = mockOrders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 0 1 5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Order not found</h2>
          <p className="text-gray-500 mb-6">
            We couldn't find an order with ID <span className="font-mono font-semibold bg-gray-100 px-2 py-1 rounded-md">{id}</span>.
          </p>
          <button
            onClick={() => navigate("/orders")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white shadow-lg shadow-purple-200 transition-all hover:shadow-purple-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: "#6426E1" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to My Orders
          </button>
        </div>
      </div>
    );
  }

  const currentStepIndex = STATUS_INDEX[order.deliveryStatus];
  const statusBadge = getStatusBadge(order.deliveryStatus);
  const trackingNumber = `TRK${order.id.slice(-8).toUpperCase()}`;
  const progressPercentage = Math.round((currentStepIndex / (TIMELINE_STEPS.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
      {/* ── Modern Header with Glassmorphism ── */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-gray-100/80 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/orders")}
                className="group flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-all"
              >
                <span className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-all shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </span>
                <span className="hidden sm:inline">Back to Orders</span>
              </button>
              <div className="h-6 w-px bg-gray-200" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent tracking-tight">
                  Track Order
                </h1>
                <p className="text-xs text-gray-400 font-mono mt-0.5">#{order.id}</p>
              </div>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border} shadow-sm`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {statusBadge.label}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Left: Order Summary Card (Modern) ── */}
          <div className="lg:col-span-5 space-y-6">
            {/* Product card with elevated design */}
            <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-50">
                <img
                  src={order.image}
                  alt={order.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/400x200?text=No+Image";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                <div className="absolute top-3 right-3">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                    Qty: {order.quantity}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h2 className="font-bold text-xl text-gray-900 leading-tight tracking-tight">{order.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-400 font-mono">#{order.id}</p>
                  <span className="text-gray-300">•</span>
                  <p className="text-xs text-gray-400">{order.date}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total Amount</span>
                    <span className="text-xl font-bold text-gray-900">
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency", currency: "NGN", maximumFractionDigits: 0,
                      }).format(order.price * order.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery info card with modern layout */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5 transition-all hover:shadow-md">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Delivery Details</h3>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Shipping Address</p>
                    <p className="text-sm text-gray-800 font-medium leading-relaxed">{order.deliveryAddress}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Estimated Delivery</p>
                    <p className="text-sm text-gray-800 font-semibold">{order.estimatedDelivery}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 15v-1a4 4 0 0 0-4-4H8m0 0l3 3m-3-3l3-3m9 4V9a2 2 0 0 0-2-2h-1" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Tracking Number</p>
                    <p className="text-sm text-gray-800 font-mono font-semibold tracking-wide">{trackingNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help card */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-5 border border-purple-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636L9.172 14.828M8 6h.01M16 18h.01M12 21a9 9 0 100-18 9 9 0 000 18z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">Need help with your order?</p>
                  <p className="text-xs text-gray-600">Contact our support team 24/7</p>
                </div>
                <button className="text-sm font-medium text-purple-700 bg-white/60 hover:bg-white px-4 py-2 rounded-xl transition-all shadow-sm">
                  Contact
                </button>
              </div>
            </div>
          </div>

          {/* ── Right: Modern Timeline ── */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8 transition-all">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Tracking Timeline</h3>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Progress</p>
                  <p className="text-sm font-bold text-purple-600">{progressPercentage}%</p>
                </div>
              </div>

              {/* Progress bar modern */}
              <div className="mb-8">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${progressPercentage}%`,
                      background: "linear-gradient(90deg, #6426E1, #9B6DFF)",
                    }}
                  />
                </div>
              </div>

              {/* Vertical Timeline with modern styling */}
              <div className="relative">
                {TIMELINE_STEPS.map((step, index) => {
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const isRemaining = index > currentStepIndex;
                  const isLast = index === TIMELINE_STEPS.length - 1;

                  return (
                    <div key={step.label} className={`relative flex gap-5 ${!isLast ? "pb-8" : ""} group`}>
                      {/* Connector line */}
                      {!isLast && (
                        <div
                          className="absolute left-5 top-10 w-0.5 transition-all duration-500"
                          style={{
                            backgroundColor: isCompleted ? "#6426E1" : "#E5E7EB",
                            height: "calc(100% - 2rem)",
                          }}
                        />
                      )}

                      {/* Icon Circle with animations */}
                      <div
                        className={`relative z-10 flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isCompleted
                            ? "bg-purple-600 shadow-lg shadow-purple-200"
                            : isCurrent
                            ? "bg-purple-50 border-2 border-purple-600 shadow-md"
                            : "bg-gray-50 border-2 border-gray-200"
                        } group-hover:scale-105`}
                      >
                        {isCompleted ? (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className={isCurrent ? "text-purple-600" : "text-gray-400"}>
                            {step.icon}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <p
                            className={`text-base font-semibold ${
                              isCompleted || isCurrent ? "text-gray-900" : "text-gray-400"
                            }`}
                          >
                            {step.label}
                          </p>
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-purple-600 text-white shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              Current
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              Completed
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm leading-relaxed transition-colors duration-200 ${
                            isRemaining ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {step.description}
                        </p>
                        {isCurrent && order.deliveryStatus !== "Delivered" && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-purple-600 bg-purple-50/50 rounded-lg px-3 py-2 w-fit">
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Status update in progress</span>
                          </div>
                        )}
                        {order.deliveryStatus === "Delivered" && isCurrent && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2 w-fit">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Package delivered successfully</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Estimated delivery note for undelivered orders */}
              {order.deliveryStatus !== "Delivered" && (
                <div className="mt-8 pt-6 border-t border-gray-100 bg-amber-50/30 rounded-xl p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-amber-800">Expected delivery date</p>
                    <p className="text-xs text-amber-700">{order.estimatedDelivery}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;