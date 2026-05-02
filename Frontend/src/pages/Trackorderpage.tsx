import { useState, useEffect, type ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  orderService,
  type OrderDoc,
  type OrderStatus,
} from "@/services/Order.service";
import { paymentService } from "@/services/Payment.service";

// ── Human-readable ID ─────────────────────────────────────────────────────────
const displayOrderId = (order: OrderDoc): string =>
  order.order_number ?? `#${order._id.slice(-8).toUpperCase()}`;

// ── Delivery timeline steps ───────────────────────────────────────────────────
const DELIVERY_STEPS: {
  label: string;
  description: string;
  icon: ReactNode;
}[] = [
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
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
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
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
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
          d="M8 17H5a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h-3a3 3 0 00-3 3v4a3 3 0 003 3h3m0-10v10"
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
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
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
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
];

const PICKUP_STEPS: { label: string; description: string }[] = [
  {
    label: "Order Placed",
    description: "Your pickup order has been received.",
  },
  { label: "Processing", description: "We are preparing your items." },
  {
    label: "Ready for Pickup",
    description: "Your order is ready! Come collect it at our store.",
  },
  {
    label: "Collected",
    description: "You've collected your order. Thank you!",
  },
];

const STATUS_STEP: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  shipped: 2,
  out_for_delivery: 3,
  delivered: 4,
  cancelled: 0,
  refunded: 0,
  ready_for_pickup: 2,
  collected: 3,
};

const STATUS_BADGE: Record<
  string,
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
  out_for_delivery: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
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
  ready_for_pickup: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
  },
  collected: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
};

// ── Payment status banner ─────────────────────────────────────────────────────
// Shown at the top of the page whenever an order has unpaid status.
// POD orders get an informational notice; Paystack orders get an action button.
const PaymentBanner = ({
  order,
  onRetry,
  isRetrying,
  retryError,
}: {
  order: OrderDoc;
  onRetry: () => void;
  isRetrying: boolean;
  retryError: string | null;
}) => {
  const isPOD = (order as any).payment_method === "pod";
  const isCancelled = order.status === "cancelled";

  if (order.payment_status !== "unpaid" || isCancelled) return null;

  if (isPOD) {
    return (
      <div className="mb-6 flex items-start gap-3 px-4 py-4 bg-blue-50 border border-blue-200 rounded-2xl">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-4 h-4 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-blue-800">Pay on Delivery</p>
          <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
            Your payment of <strong>₦{order.total.toLocaleString()}</strong> is
            due when your order is{" "}
            {order.fulfillment_type === "pickup"
              ? "collected from our store"
              : "delivered to you"}
            . Please have the exact amount ready.
          </p>
        </div>
      </div>
    );
  }

  // Paystack unpaid — show retry banner
  return (
    <div className="mb-6 rounded-2xl overflow-hidden border border-amber-200">
      <div className="flex items-start gap-3 px-4 py-4 bg-amber-50">
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-4 h-4 text-amber-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-amber-800">
            Payment not completed
          </p>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            Your order was placed but payment hasn't been confirmed. Click below
            to open Paystack and complete your payment of{" "}
            <strong>₦{order.total.toLocaleString()}</strong>. Your order will
            only be processed after payment is received.
          </p>
          {retryError && (
            <p className="text-xs text-red-600 font-medium mt-2">
              {retryError}
            </p>
          )}
        </div>
      </div>
      <div className="px-4 py-3 bg-amber-50 border-t border-amber-100 flex items-center gap-3">
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#6426E1" }}
        >
          {isRetrying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
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
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          )}
          {isRetrying ? "Opening Paystack…" : "Complete Payment Now"}
        </button>
        <span className="text-xs text-amber-600">
          Secure payment via Paystack
        </span>
      </div>
    </div>
  );
};

// ── Shared sub-components ─────────────────────────────────────────────────────
const OrderSummaryCard = ({ order }: { order: OrderDoc }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <h2 className="font-bold text-xl text-gray-900 font-mono">
      Order {displayOrderId(order)}
    </h2>
    <p className="text-xs text-gray-400 mt-1">
      {new Date(order.createdAt).toLocaleDateString("en-GB")}
    </p>

    {/* Inline payment status pill */}
    <div className="mt-3 flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
          order.payment_status === "paid"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : order.payment_status === "refunded"
              ? "bg-gray-50 text-gray-600 border-gray-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            order.payment_status === "paid"
              ? "bg-emerald-500"
              : order.payment_status === "refunded"
                ? "bg-gray-400"
                : "bg-amber-500"
          }`}
        />
        {order.payment_status === "paid"
          ? "Paid"
          : order.payment_status === "refunded"
            ? "Refunded"
            : (order as any).payment_method === "pod"
              ? "Pay on Delivery"
              : "Payment Pending"}
      </span>
    </div>

    <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Subtotal</span>
        <span className="font-medium">₦{order.subtotal.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">
          {order.fulfillment_type === "pickup" ? "Pickup" : "Delivery"}
        </span>
        <span
          className={
            order.shipping_fee === 0
              ? "font-medium text-green-600"
              : "font-medium"
          }
        >
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
);

// ── Pickup-specific view ──────────────────────────────────────────────────────
const PickupView = ({
  order,
  onBack,
  onRetry,
  isRetrying,
  retryError,
}: {
  order: OrderDoc;
  onBack: () => void;
  onRetry: () => void;
  isRetrying: boolean;
  retryError: string | null;
}) => {
  const isCollected = order.status === "collected";
  const isReadyForPickup = order.status === "ready_for_pickup";
  const currentStep = STATUS_STEP[order.status] ?? 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 space-y-6">
        {/* Payment banner inside left column on mobile; above grid on desktop it's handled at page level */}
        <OrderSummaryCard order={order} />

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Pickup Details
          </h3>

          {order.pickup_code && (
            <div
              className={`rounded-xl p-4 ${isReadyForPickup ? "bg-teal-50 border border-teal-200" : "bg-gray-50 border border-gray-200"}`}
            >
              <p
                className={`text-xs font-semibold mb-1 ${isReadyForPickup ? "text-teal-600" : "text-gray-500"}`}
              >
                Pickup Code
              </p>
              <p
                className={`text-2xl font-black tracking-widest font-mono ${isReadyForPickup ? "text-teal-800" : "text-gray-700"}`}
              >
                {order.pickup_code}
              </p>
              <p
                className={`text-xs mt-1 ${isReadyForPickup ? "text-teal-600" : "text-gray-400"}`}
              >
                {isReadyForPickup
                  ? "✅ Show this code at the store when collecting."
                  : "Keep this code — you'll need it when collecting."}
              </p>
            </div>
          )}

          {order.pickup_location && (
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">
                  Store Location
                </p>
                <p className="text-sm text-gray-800 font-medium">
                  {order.pickup_location}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-7">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8">
          {isCollected ? (
            <div className="flex flex-col items-center text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-5 shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                }}
              >
                <svg
                  className="w-10 h-10 text-white"
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
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🎉 Order Collected!
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Your order has been successfully collected from our store.
              </p>
              <button
                onClick={onBack}
                className="px-8 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                style={{
                  background: "linear-gradient(135deg, #6426E1, #9B6DFF)",
                }}
              >
                Back to My Orders
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Pickup Progress
              </h3>
              <div className="relative">
                {PICKUP_STEPS.map((step, index) => {
                  const isStepDone = index < currentStep;
                  const isCurrent = index === currentStep;
                  const isLast = index === PICKUP_STEPS.length - 1;
                  return (
                    <div
                      key={step.label}
                      className={`relative flex gap-5 ${!isLast ? "pb-8" : ""}`}
                    >
                      {!isLast && (
                        <div
                          className="absolute left-5 top-10 w-0.5"
                          style={{
                            backgroundColor: isStepDone ? "#0d9488" : "#E5E7EB",
                            height: "calc(100% - 2rem)",
                          }}
                        />
                      )}
                      <div
                        className={`relative z-10 flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${
                          isStepDone
                            ? "shadow-lg"
                            : isCurrent
                              ? "border-2 bg-teal-50"
                              : "border-2 border-gray-200 bg-gray-50"
                        }`}
                        style={
                          isStepDone
                            ? { backgroundColor: "#0d9488" }
                            : isCurrent
                              ? { borderColor: "#0d9488" }
                              : {}
                        }
                      >
                        {isStepDone ? (
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
                          <span
                            className={`text-xs font-bold ${isCurrent ? "text-teal-600" : "text-gray-400"}`}
                          >
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p
                            className={`text-base font-semibold ${isStepDone || isCurrent ? "text-gray-900" : "text-gray-400"}`}
                          >
                            {step.label}
                          </p>
                          {isCurrent && (
                            <span
                              className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full text-white"
                              style={{ backgroundColor: "#0d9488" }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              Current
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm ${index > currentStep ? "text-gray-300" : "text-gray-600"}`}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Delivery celebration card ─────────────────────────────────────────────────
const DeliveredCard = ({
  order,
  onBack,
}: {
  order: OrderDoc;
  onBack: () => void;
}) => (
  <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
    <div
      className="h-2 w-full"
      style={{ background: "linear-gradient(90deg, #10b981, #34d399)" }}
    />
    <div className="p-6 sm:p-8 flex flex-col items-center text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-5 shadow-lg"
        style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
      >
        <svg
          className="w-10 h-10 text-white"
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
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        🎉 Delivered!
      </h2>
      <p className="text-gray-500 text-sm mb-1">
        Your order has been successfully delivered.
      </p>
      <p className="text-gray-400 text-xs mb-6 font-mono">
        Order {displayOrderId(order)} · ₦{order.total.toLocaleString()}
      </p>
      <div className="w-full grid grid-cols-2 gap-3 mb-6 max-w-sm">
        <div className="bg-emerald-50 rounded-xl p-3">
          <p className="text-xs text-emerald-600 font-medium mb-0.5">Payment</p>
          <p className="text-sm font-bold text-emerald-800">
            {order.payment_status === "paid" ? "Confirmed ✓" : "Pending"}
          </p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3">
          <p className="text-xs text-emerald-600 font-medium mb-0.5">
            Delivered on
          </p>
          <p className="text-sm font-bold text-emerald-800">
            {new Date().toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            })}
          </p>
        </div>
      </div>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-6">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Tracking Complete — No further updates
      </div>
      <button
        onClick={onBack}
        className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #6426E1, #9B6DFF)" }}
      >
        Back to My Orders
      </button>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const TrackOrderPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [order, setOrder] = useState<OrderDoc | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

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
        toast({
          title: "Order Found",
          description: `Viewing order ${displayOrderId(data)}`,
        });
      })
      .catch(() => {
        setNotFound(true);
        toast({
          title: "Order Not Found",
          description: "This order doesn't exist",
          variant: "destructive",
        });
      })
      .finally(() => setIsLoading(false));
  }, [id, toast]);

  const handleRetryPayment = async () => {
    if (!order) return;
    setIsRetrying(true);
    setRetryError(null);
    try {
      const { authorization_url } = await paymentService.initializePayment({
        orderId: order._id,
      });
      window.location.href = authorization_url;
    } catch (err: any) {
      setRetryError(
        err?.response?.data?.message ??
          "Could not open payment page. Please try again or contact support.",
      );
      setIsRetrying(false);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "#6426E1" }}
        />
      </div>
    );

  if (notFound || !order)
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
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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

  const isPickup = order.fulfillment_type === "pickup";
  const isDelivered = order.status === "delivered";
  const currentStep = STATUS_STEP[order.status] ?? 0;
  const badge = STATUS_BADGE[order.status] ?? STATUS_BADGE.pending;
  const progress = isDelivered
    ? 100
    : Math.round((currentStep / (DELIVERY_STEPS.length - 1)) * 100);
  const trackingNum = `TRK${order._id.slice(-8).toUpperCase()}`;

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
                  {isPickup
                    ? "Pickup Order"
                    : isDelivered
                      ? "Order Delivered"
                      : "Track Order"}
                </h1>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  {displayOrderId(order)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isPickup && (
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-teal-100 text-teal-700">
                  🏪 Pickup
                </span>
              )}
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full bg-current ${isDelivered || order.status === "collected" ? "" : "animate-pulse"}`}
                />
                <span className="capitalize">
                  {order.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-10">
        {/* ── Payment banner — shown for ALL unpaid orders regardless of type ── */}
        <PaymentBanner
          order={order}
          onRetry={handleRetryPayment}
          isRetrying={isRetrying}
          retryError={retryError}
        />

        {/* ── PICKUP ORDER ── */}
        {isPickup && (
          <PickupView
            order={order}
            onBack={() => navigate("/orders")}
            onRetry={handleRetryPayment}
            isRetrying={isRetrying}
            retryError={retryError}
          />
        )}

        {/* ── DELIVERY — DELIVERED ── */}
        {!isPickup && isDelivered && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <OrderSummaryCard order={order} />
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Delivery Details
                </h3>
                {order.shipping_address && (
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">
                        Shipping Address
                      </p>
                      <p className="text-sm text-gray-800 font-medium">
                        {[
                          order.shipping_address.street,
                          order.shipping_address.city,
                          order.shipping_address.state,
                        ]
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
                        d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3"
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
            <div className="lg:col-span-7">
              <DeliveredCard order={order} onBack={() => navigate("/orders")} />
            </div>
          </div>
        )}

        {/* ── DELIVERY — ACTIVE TRACKING ── */}
        {!isPickup && !isDelivered && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <OrderSummaryCard order={order} />
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Delivery Details
                </h3>
                {order.shipping_address && (
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">
                        Shipping Address
                      </p>
                      <p className="text-sm text-gray-800 font-medium">
                        {[
                          order.shipping_address.street,
                          order.shipping_address.city,
                          order.shipping_address.state,
                        ]
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
                        d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3"
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

            {/* Timeline */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">
                    Tracking Timeline
                  </h3>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Progress</p>
                    <p
                      className="text-sm font-bold"
                      style={{ color: "#6426E1" }}
                    >
                      {progress}%
                    </p>
                  </div>
                </div>
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
                <div className="relative">
                  {DELIVERY_STEPS.map((step, index) => {
                    const isStepDone = index < currentStep;
                    const isCurrent = index === currentStep;
                    const isLast = index === DELIVERY_STEPS.length - 1;
                    return (
                      <div
                        key={step.label}
                        className={`relative flex gap-5 ${!isLast ? "pb-8" : ""} group`}
                      >
                        {!isLast && (
                          <div
                            className="absolute left-5 top-10 w-0.5 transition-all"
                            style={{
                              backgroundColor: isStepDone
                                ? "#6426E1"
                                : "#E5E7EB",
                              height: "calc(100% - 2rem)",
                            }}
                          />
                        )}
                        <div
                          className={`relative z-10 flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${
                            isStepDone
                              ? "shadow-lg"
                              : isCurrent
                                ? "border-2 bg-purple-50"
                                : "border-2 border-gray-200 bg-gray-50"
                          }`}
                          style={
                            isStepDone
                              ? { backgroundColor: "#6426E1" }
                              : isCurrent
                                ? { borderColor: "#6426E1" }
                                : {}
                          }
                        >
                          {isStepDone ? (
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
                              className={`text-base font-semibold ${isStepDone || isCurrent ? "text-gray-900" : "text-gray-400"}`}
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
                            {isStepDone && (
                              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                Completed
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-sm leading-relaxed ${index > currentStep ? "text-gray-300" : "text-gray-600"}`}
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
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;
