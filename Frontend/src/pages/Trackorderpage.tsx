import { useState, useEffect, type ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  orderService,
  type OrderDoc,
  type OrderStatus,
} from "@/services/Order.service";

// ── Timeline ──────────────────────────────────────────────────────────────────
const STEPS: { label: string; description: string; icon: ReactNode }[] = [
  {
    label: "Order Placed",
    description: "We received your order and payment confirmation.",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z"
        />
      </svg>
    ),
  },
  {
    label: "Processing",
    description: "Your order is being prepared and quality-checked.",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
        />
      </svg>
    ),
  },
  {
    label: "Shipped",
    description: "Your order is on its way with our delivery partner.",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3m0 0h-3a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3h3m0-10v10"
        />
      </svg>
    ),
  },
  {
    label: "Out for Delivery",
    description: "The courier is near you. Keep your phone handy!",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
        />
      </svg>
    ),
  },
  {
    label: "Delivered",
    description: "Package successfully delivered. Enjoy your purchase!",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6"
        />
      </svg>
    ),
  },
];

// Map order status → current step index
const STATUS_STEP: Record<OrderStatus, number> = {
  pending: 1,
  confirmed: 1,
  shipped: 2,
  out_for_delivery:     3,  // ← NEW
  delivered: 4,
  cancelled: 1,
  refunded: 1,
};

const STATUS_BADGE: Record<
  OrderStatus,
  { bg: string; text: string; border: string }
> = {
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  confirmed: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  shipped: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  delivered: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  cancelled: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
  refunded: {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
  },
   out_for_delivery: {   // ✅ ADD THIS
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
const TrackOrderPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderDoc | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

 const { toast }    = useToast();

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
   
    orderService
      .getOrderById(id)
      .then((data) => {
        setOrder(data);
        // ADD SUCCESS FEEDBACK:
        toast({
          title: "Order Found",
          description: `Tracking order ${id.slice(-8).toUpperCase()}`,
        });
      })
      .catch((error) => {
        console.error("Track order error:", error);
        setNotFound(true);
        // ADD ERROR TOAST:
        toast({
          title: "Order Not Found",
          description: error.response?.data?.message || "This order doesn't exist",
          variant: "destructive",
        });
      })
      .finally(() => setIsLoading(false));
  }, [id, toast]);
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "#6426E1" }}
        />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 0 1 5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order not found
          </h2>
          <p className="text-gray-500 mb-6">
            We couldn't find order{" "}
            <span className="font-mono font-semibold bg-gray-100 px-2 py-1 rounded-md">
              {id}
            </span>
            .
          </p>
          <button
            onClick={() => navigate("/orders")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "#6426E1" }}
          >
            Back to My Orders
          </button>
        </div>
      </div>
    );
  }

  const currentStep = STATUS_STEP[order.status] ?? 1;
  const badge = STATUS_BADGE[order.status] ?? STATUS_BADGE.pending;
  const progress = Math.round((currentStep / (STEPS.length - 1)) * 100);
  const trackingNum = `TRK${order._id.slice(-8).toUpperCase()}`;
  const addr = order.shipping_address;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/orders")}
                className="group flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                <span className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </span>
                <span className="hidden sm:inline">Back to Orders</span>
              </button>
              <div className="h-6 w-px bg-gray-200" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  Track Order
                </h1>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  #{order._id.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              <span className="capitalize">{order.status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left — Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-xl text-gray-900">
                #{order._id.slice(-8).toUpperCase()}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(order.createdAt).toLocaleDateString("en-GB")}
              </p>
              <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">
                    ₦{order.subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span>
                    {order.shipping_fee === 0
                      ? "Free"
                      : `₦${order.shipping_fee.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-1 border-t border-gray-100">
                  <span>Total</span>
                  <span>₦{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Delivery info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Delivery Details
              </h3>
              {addr && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">
                      Shipping Address
                    </p>
                    <p className="text-sm text-gray-800 font-medium">
                      {[addr.street, addr.city, addr.state]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 15v-1a4 4 0 0 0-4-4H8m0 0l3 3m-3-3l3-3"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">
                    Tracking Number
                  </p>
                  <p className="text-sm text-gray-800 font-mono font-semibold">
                    {trackingNum}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Timeline */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  Tracking Timeline
                </h3>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Progress</p>
                  <p className="text-sm font-bold" style={{ color: "#6426E1" }}>
                    {progress}%
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-8">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${progress}%`,
                      background: "linear-gradient(90deg, #6426E1, #9B6DFF)",
                    }}
                  />
                </div>
              </div>

              {/* Steps */}
              <div className="relative">
                {STEPS.map((step, index) => {
                  const isCompleted = index < currentStep;
                  const isCurrent = index === currentStep;
                  const isRemaining = index > currentStep;
                  const isLast = index === STEPS.length - 1;

                  return (
                    <div
                      key={step.label}
                      className={`relative flex gap-5 ${!isLast ? "pb-8" : ""} group`}
                    >
                      {!isLast && (
                        <div
                          className="absolute left-5 top-10 w-0.5 transition-all"
                          style={{
                            backgroundColor: isCompleted
                              ? "#6426E1"
                              : "#E5E7EB",
                            height: "calc(100% - 2rem)",
                          }}
                        />
                      )}
                      <div
                        className={`relative z-10 flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${
                          isCompleted
                            ? "shadow-lg"
                            : isCurrent
                              ? "border-2 bg-purple-50"
                              : "border-2 border-gray-200 bg-gray-50"
                        }`}
                        style={
                          isCompleted
                            ? { backgroundColor: "#6426E1" }
                            : isCurrent
                              ? { borderColor: "#6426E1" }
                              : {}
                        }
                      >
                        {isCompleted ? (
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <div
                            style={
                              isCurrent
                                ? { color: "#6426E1" }
                                : { color: "#9CA3AF" }
                            }
                          >
                            {step.icon}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <p
                            className={`text-base font-semibold ${isCompleted || isCurrent ? "text-gray-900" : "text-gray-400"}`}
                          >
                            {step.label}
                          </p>
                          {isCurrent && (
                            <span
                              className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full text-white"
                              style={{ backgroundColor: "#6426E1" }}
                            >
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
                          className={`text-sm leading-relaxed ${isRemaining ? "text-gray-300" : "text-gray-600"}`}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;
