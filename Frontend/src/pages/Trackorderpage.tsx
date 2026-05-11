import { useState, useEffect, type ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  CreditCard,
  RefreshCw,
  Truck,
  Store,
  Package,
  MapPin,
  Clock,
  RotateCcw,
  ShieldCheck,
  Wallet,
  BadgeAlert,
} from "lucide-react";
import { orderService, type OrderDoc } from "@/services/Order.service";
import { paymentService, type PaymentDoc } from "@/services/Payment.service";

// ── Helpers ───────────────────────────────────────────────────────────────────
const displayOrderId = (o: OrderDoc) =>
  o.order_number ?? `#${o._id.slice(-8).toUpperCase()}`;

// ── Timeline steps ─────────────────────────────────────────────────────────────
const DELIVERY_STEPS: {
  label: string;
  description: string;
  Icon: React.FC<{
    className?: string;
    style?: React.CSSProperties;
  }>;
}[] = [
  { label: "Order Placed",      description: "We received your order and payment confirmation.", Icon: ShieldCheck  },
  { label: "Processing",        description: "Your order is being prepared and quality-checked.", Icon: Package     },
  { label: "Shipped",           description: "Your order is on its way with our delivery partner.", Icon: Truck     },
  { label: "Out for Delivery",  description: "The courier is near you. Keep your phone handy!",    Icon: MapPin     },
  { label: "Delivered",         description: "Package successfully delivered. Enjoy your purchase!", Icon: CheckCircle2 },
];

const PICKUP_STEPS: { label: string; description: string }[] = [
  { label: "Order Placed",      description: "Your pickup order has been received."                   },
  { label: "Processing",        description: "We are preparing your items."                           },
  { label: "Ready for Pickup",  description: "Your order is ready. Come collect it at our store."     },
  { label: "Collected",         description: "You have collected your order. Thank you!"              },
];

const STATUS_STEP: Record<string, number> = {
  pending: 0, confirmed: 1, shipped: 2, out_for_delivery: 3, delivered: 4,
  cancelled: 0, refunded: 0, ready_for_pickup: 2, collected: 3,
};

const STATUS_BADGE: Record<string, { bg: string; text: string; border: string }> = {
  pending:          { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200"   },
  confirmed:        { bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200"    },
  shipped:          { bg: "bg-purple-50",  text: "text-purple-700", border: "border-purple-200"  },
  out_for_delivery: { bg: "bg-indigo-50",  text: "text-indigo-700", border: "border-indigo-200"  },
  delivered:        { bg: "bg-emerald-50", text: "text-emerald-700",border: "border-emerald-200" },
  cancelled:        { bg: "bg-red-50",     text: "text-red-700",    border: "border-red-200"     },
  refunded:         { bg: "bg-gray-50",    text: "text-gray-700",   border: "border-gray-200"    },
  ready_for_pickup: { bg: "bg-teal-50",    text: "text-teal-700",   border: "border-teal-200"    },
  collected:        { bg: "bg-emerald-50", text: "text-emerald-700",border: "border-emerald-200" },
};

// ── Payment banner ─────────────────────────────────────────────────────────────
type PaymentDocState = "success" | "pending" | "failed" | "cancelled" | "no_doc" | null;

const PaymentBanner = ({
  order, payState, onRetry, isRetrying, retryError,
}: {
  order: OrderDoc;
  payState: PaymentDocState;
  onRetry: () => void;
  isRetrying: boolean;
  retryError: string | null;
}) => {
  const isPOD = (order as any).payment_method === "pod";
  if (order.payment_status === "paid" || order.status === "cancelled") return null;

  if (isPOD) {
    return (
      <div className="mb-6 flex items-start gap-3 px-4 py-4 bg-blue-50 border border-blue-200 rounded-2xl">
        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Wallet className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-blue-800">Pay on Delivery</p>
          <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
            Your payment of <strong>₦{order.total.toLocaleString()}</strong> is due when your order is{" "}
            {order.fulfillment_type === "pickup" ? "collected from our store" : "delivered to you"}.
          </p>
        </div>
      </div>
    );
  }

  if (payState === "success") return null;

  if (payState === "failed") {
    return (
      <div className="mb-6 rounded-2xl overflow-hidden border border-red-200">
        <div className="flex items-start gap-3 px-4 py-4 bg-red-50">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-red-800">Payment Failed</p>
            <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
              Your payment of <strong>₦{order.total.toLocaleString()}</strong> was declined by your bank or card issuer
              (insufficient funds, wrong OTP, card restrictions, or failed transfer).
              Your order is still saved — try a different card or payment method.
            </p>
            {retryError && <p className="text-xs text-red-600 font-medium mt-2">{retryError}</p>}
          </div>
        </div>
        <div className="px-4 py-3 bg-red-50 border-t border-red-100 flex items-center gap-3">
          <button onClick={onRetry} disabled={isRetrying}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "#6426E1" }}>
            {isRetrying
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening Paystack…</>
              : <><RefreshCw className="w-4 h-4" /> Try Again with Different Card</>}
          </button>
        </div>
      </div>
    );
  }

  if (payState === "cancelled") {
    return (
      <div className="mb-6 rounded-2xl overflow-hidden border border-amber-200">
        <div className="flex items-start gap-3 px-4 py-4 bg-amber-50">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">Payment Not Completed</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              You closed the Paystack payment page before completing your payment of{" "}
              <strong>₦{order.total.toLocaleString()}</strong>.
              Your order is still saved — complete payment to confirm it.
            </p>
            {retryError && <p className="text-xs text-red-600 font-medium mt-2">{retryError}</p>}
          </div>
        </div>
        <div className="px-4 py-3 bg-amber-50 border-t border-amber-100 flex items-center gap-3">
          <button onClick={onRetry} disabled={isRetrying}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "#6426E1" }}>
            {isRetrying
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening Paystack…</>
              : <><CreditCard className="w-4 h-4" /> Complete Payment Now</>}
          </button>
          <span className="text-xs text-amber-600">Secure via Paystack</span>
        </div>
      </div>
    );
  }

  if (payState === "no_doc") {
    return (
      <div className="mb-6 rounded-2xl overflow-hidden border border-orange-200">
        <div className="flex items-start gap-3 px-4 py-4 bg-orange-50">
          <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-orange-800">Payment Not Started</p>
            <p className="text-xs text-orange-700 mt-0.5 leading-relaxed">
              Payment was not initialised for this order — no payment record exists yet.
              This can happen if there was a network error during checkout. Tap below to start
              your payment of <strong>₦{order.total.toLocaleString()}</strong>.
            </p>
            {retryError && <p className="text-xs text-red-600 font-medium mt-2">{retryError}</p>}
          </div>
        </div>
        <div className="px-4 py-3 bg-orange-50 border-t border-orange-100 flex items-center gap-3">
          <button onClick={onRetry} disabled={isRetrying}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "#6426E1" }}>
            {isRetrying
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening Paystack…</>
              : <><CreditCard className="w-4 h-4" /> Start Payment</>}
          </button>
        </div>
      </div>
    );
  }

  if (payState === "pending") {
    return (
      <div className="mb-6 flex items-start gap-3 px-4 py-4 bg-blue-50 border border-blue-200 rounded-2xl">
        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Clock className="w-4 h-4 text-blue-600 animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-bold text-blue-800">Payment Verification in Progress</p>
          <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
            We're waiting for payment confirmation from Paystack for{" "}
            <strong>₦{order.total.toLocaleString()}</strong>.
            This usually resolves within a minute. Your order will confirm automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-2xl">
      <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
        <CreditCard className="w-4 h-4 text-amber-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-amber-800">Payment Required</p>
        <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
          This order has not been paid yet. Complete payment to confirm your order.
        </p>
        {retryError && <p className="text-xs text-red-600 font-medium mt-2">{retryError}</p>}
        <button onClick={onRetry} disabled={isRetrying}
          className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: "#6426E1" }}>
          {isRetrying
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening Paystack…</>
            : <><CreditCard className="w-4 h-4" /> Pay Now</>}
        </button>
      </div>
    </div>
  );
};

// ── Order summary card ─────────────────────────────────────────────────────────
const OrderSummaryCard = ({
  order, payState,
}: { order: OrderDoc; payState: PaymentDocState }) => {
  const isPOD = (order as any).payment_method === "pod";

  const payBadge = (() => {
    if (order.payment_status === "paid")     return { label: "Paid",              cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" };
    if (order.payment_status === "refunded") return { label: "Refunded",          cls: "bg-gray-50 text-gray-600 border-gray-200",           dot: "bg-gray-400"   };
    if (isPOD)                               return { label: "Pay on Delivery",    cls: "bg-blue-50 text-blue-700 border-blue-200",           dot: "bg-blue-500"   };
    if (payState === "failed")               return { label: "Payment Failed",     cls: "bg-red-50 text-red-700 border-red-200",              dot: "bg-red-500"    };
    if (payState === "cancelled")            return { label: "Payment Cancelled",  cls: "bg-amber-50 text-amber-700 border-amber-200",         dot: "bg-amber-500"  };
    if (payState === "pending")              return { label: "Verifying Payment",  cls: "bg-blue-50 text-blue-700 border-blue-200",           dot: "bg-blue-400"   };
    if (payState === "no_doc")               return { label: "Payment Not Started",cls: "bg-orange-50 text-orange-700 border-orange-200",     dot: "bg-orange-500" };
    return                                          { label: "Payment Pending",    cls: "bg-amber-50 text-amber-700 border-amber-200",         dot: "bg-amber-500"  };
  })();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-bold text-xl text-gray-900 font-mono">{displayOrderId(order)}</h2>
      <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString("en-GB")}</p>

      <div className="mt-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${payBadge.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${payBadge.dot}`} />
          {payBadge.label}
        </span>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium">₦{order.subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">{order.fulfillment_type === "pickup" ? "Pickup" : "Delivery"}</span>
          <span className={order.shipping_fee === 0 ? "font-medium text-green-600" : "font-medium"}>
            {order.shipping_fee === 0 ? "Free" : `₦${order.shipping_fee.toLocaleString()}`}
          </span>
        </div>
        <div className="flex justify-between text-sm font-bold pt-1 border-t border-gray-100">
          <span>Total</span>
          <span>₦{order.total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

// ── Pickup view ────────────────────────────────────────────────────────────────
const PickupView = ({
  order, payState, onBack,
}: { order: OrderDoc; payState: PaymentDocState; onBack: () => void }) => {
  const isCollected      = order.status === "collected";
  const isReadyForPickup = order.status === "ready_for_pickup";
  const currentStep      = STATUS_STEP[order.status] ?? 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 space-y-6">
        <OrderSummaryCard order={order} payState={payState} />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Pickup Details</h3>
          {order.pickup_code && (
            <div className={`rounded-xl p-4 ${isReadyForPickup ? "bg-teal-50 border border-teal-200" : "bg-gray-50 border border-gray-200"}`}>
              <div className="flex items-center gap-2 mb-1">
                <Store className={`w-3.5 h-3.5 ${isReadyForPickup ? "text-teal-600" : "text-gray-500"}`} />
                <p className={`text-xs font-semibold ${isReadyForPickup ? "text-teal-600" : "text-gray-500"}`}>Pickup Code</p>
              </div>
              <p className={`text-2xl font-black tracking-widest font-mono ${isReadyForPickup ? "text-teal-800" : "text-gray-700"}`}>
                {order.pickup_code}
              </p>
              <p className={`text-xs mt-1 ${isReadyForPickup ? "text-teal-600" : "text-gray-400"}`}>
                {isReadyForPickup ? "Show this code at the store when collecting." : "Keep this code — you'll need it when collecting."}
              </p>
            </div>
          )}
          {order.pickup_location && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Store Location</p>
                <p className="text-sm text-gray-800 font-medium">{order.pickup_location}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="lg:col-span-7">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8">
          {isCollected ? (
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5 shadow-lg"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Collected!</h2>
              <p className="text-gray-500 text-sm mb-6">Your order has been collected from our store.</p>
              <button onClick={onBack} className="px-8 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #6426E1, #9B6DFF)" }}>
                Back to My Orders
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-bold text-gray-900 mb-6">Pickup Progress</h3>
              <div className="relative">
                {PICKUP_STEPS.map((step, i) => {
                  const done    = i < currentStep;
                  const current = i === currentStep;
                  const last    = i === PICKUP_STEPS.length - 1;
                  return (
                    <div key={step.label} className={`relative flex gap-5 ${!last ? "pb-8" : ""}`}>
                      {!last && (
                        <div className="absolute left-5 top-10 w-0.5"
                          style={{ backgroundColor: done ? "#0d9488" : "#E5E7EB", height: "calc(100% - 2rem)" }} />
                      )}
                      <div className={`relative z-10 flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${
                        done ? "shadow-lg" : current ? "border-2 bg-teal-50" : "border-2 border-gray-200 bg-gray-50"}`}
                        style={done ? { backgroundColor: "#0d9488" } : current ? { borderColor: "#0d9488" } : {}}>
                        {done
                          ? <CheckCircle2 className="w-5 h-5 text-white" />
                          : <span className={`text-xs font-bold ${current ? "text-teal-600" : "text-gray-400"}`}>{i + 1}</span>}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className={`text-base font-semibold ${done || current ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
                          {current && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: "#0d9488" }}>
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Current
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${i > currentStep ? "text-gray-300" : "text-gray-600"}`}>{step.description}</p>
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

// ── Delivered card ─────────────────────────────────────────────────────────────
const DeliveredCard = ({ order, onBack }: { order: OrderDoc; onBack: () => void }) => {
  const deliveredDate = new Date(
    (order as any).deliveredAt || order.updatedAt || order.createdAt
  ).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const isPaid = order.payment_status === "paid";

  return (
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
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Delivered!</h2>
        <p className="text-gray-500 text-sm mb-1">Your order has been successfully delivered.</p>
        <p className="text-gray-400 text-xs mb-6 font-mono">
          {displayOrderId(order)} · ₦{order.total.toLocaleString()}
        </p>

        <div className="w-full grid grid-cols-2 gap-3 mb-6 max-w-sm">
          <div className="bg-emerald-50 rounded-xl p-3">
            <p className="text-xs text-emerald-600 font-medium mb-0.5">Payment</p>
            <p className="text-sm font-bold text-emerald-800">
              {isPaid ? "Confirmed ✓" : "Pending"}
            </p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3">
            <p className="text-xs text-emerald-600 font-medium mb-0.5">Delivered on</p>
            <p className="text-sm font-bold text-emerald-800">{deliveredDate}</p>
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
};

// ── Delivery details card ──────────────────────────────────────────────────────
const DeliveryDetailsCard = ({ order, trackingNum }: { order: OrderDoc; trackingNum: string }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Delivery Details</h3>
    {order.shipping_address && (
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-4 h-4 text-gray-500" />
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium">Shipping Address</p>
          <p className="text-sm text-gray-800 font-medium">
            {[order.shipping_address.street, order.shipping_address.city, order.shipping_address.state]
              .filter(Boolean).join(", ")}
          </p>
        </div>
      </div>
    )}
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
        <Package className="w-4 h-4 text-gray-500" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">Tracking Number</p>
        <p className="text-sm text-gray-800 font-mono font-semibold">{trackingNum}</p>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const TrackOrderPage = () => {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const { toast } = useToast();

  const [order,      setOrder]      = useState<OrderDoc | null>(null);
  const [isLoading,  setIsLoading]  = useState(true);
  const [notFound,   setNotFound]   = useState(false);
  const [payState,   setPayState]   = useState<PaymentDocState>(null);
  const [payLoaded,  setPayLoaded]  = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  // FIX A: removed "Order Found" success toast — navigation is its own
  //        confirmation. Only the error toasts remain.
  // FIX B: `toast` removed from the dependency array. It is not data and
  //        including it risks infinite re-fetches if the useToast
  //        implementation recreates the reference each render.
  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setIsLoading(false);
      toast({
        title: "Order Not Found",
        description: "No order ID provided.",
        variant: "destructive",
      });
      return;
    }

    orderService
      .getOrderById(id)
      .then((data) => {
        setOrder(data);
        // ✂ "Order Found" toast removed — loading data is not a user-facing event.
      })
      .catch(() => {
        setNotFound(true);
        toast({
          title: "Order Not Found",
          description: "This order doesn't exist.",
          variant: "destructive",
        });
      })
      .finally(() => setIsLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps — toast intentionally excluded

  // Fetch payment doc state once order is loaded
  useEffect(() => {
    if (!order) return;
    const method = (order as any).payment_method;
    if (method === "pod" || order.payment_status === "paid" || order.status === "cancelled") {
      setPayLoaded(true);
      return;
    }
    paymentService.getPaymentForOrder(order._id)
      .then((p: PaymentDoc) => setPayState(p.status as PaymentDocState))
      .catch(() => setPayState("no_doc"))
      .finally(() => setPayLoaded(true));
  }, [order]);

  const handleRetry = async () => {
    if (!order) return;
    setIsRetrying(true);
    setRetryError(null);
    try {
      const res = await paymentService.initializePayment({ orderId: order._id });
      if (res.alreadyPaid) {
        const updated = await orderService.getOrderById(order._id);
        setOrder(updated);
        setPayState("success");
        return;
      }
      if (res.stillPending) { setPayState("pending"); return; }
      if (res.authorization_url) { window.location.href = res.authorization_url; return; }
      setRetryError(res.message ?? "Could not open payment. Try from your orders page.");
    } catch (err: any) {
      setRetryError(err?.response?.data?.message ?? "Could not open payment page. Please try again.");
    } finally {
      setIsRetrying(false);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#6426E1" }} />
      </div>
    );

  if (notFound || !order)
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
          <p className="text-gray-500 mb-6">
            We couldn't find order{" "}
            <span className="font-mono font-semibold bg-gray-100 px-2 py-1 rounded-md">{id}</span>.
          </p>
          <button onClick={() => navigate("/orders")}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "#6426E1" }}>
            Back to My Orders
          </button>
        </div>
      </div>
    );

  const isPickup    = order.fulfillment_type === "pickup";
  const isDelivered = order.status === "delivered";
  const currentStep = STATUS_STEP[order.status] ?? 0;
  const badge       = STATUS_BADGE[order.status] ?? STATUS_BADGE.pending;
  const progress    = isDelivered ? 100 : Math.round((currentStep / (DELIVERY_STEPS.length - 1)) * 100);
  const trackingNum = `TRK${order._id.slice(-8).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/orders")}
                className="group flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                <span className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center">
                  <ArrowLeft className="w-4 h-4" />
                </span>
                <span className="hidden sm:inline">Back to Orders</span>
              </button>
              <div className="h-6 w-px bg-gray-200" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  {isPickup ? "Pickup Order" : isDelivered ? "Order Delivered" : "Track Order"}
                </h1>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{displayOrderId(order)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isPickup && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-teal-100 text-teal-700">
                  <Store className="w-3 h-3" /> Pickup
                </span>
              )}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full bg-current ${isDelivered || order.status === "collected" ? "" : "animate-pulse"}`} />
                <span className="capitalize">{order.status.replace(/_/g, " ")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-10">
        {/* Payment banner */}
        {payLoaded && (
          <PaymentBanner
            order={order}
            payState={payState}
            onRetry={handleRetry}
            isRetrying={isRetrying}
            retryError={retryError}
          />
        )}

        {/* Pickup flow */}
        {isPickup && (
          <PickupView order={order} payState={payState} onBack={() => navigate("/orders")} />
        )}

        {/* Delivery — delivered */}
        {!isPickup && isDelivered && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <OrderSummaryCard order={order} payState={payState} />
              <DeliveryDetailsCard order={order} trackingNum={trackingNum} />
            </div>
            <div className="lg:col-span-7">
              <DeliveredCard order={order} onBack={() => navigate("/orders")} />
            </div>
          </div>
        )}

        {/* Delivery — in progress */}
        {!isPickup && !isDelivered && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <OrderSummaryCard order={order} payState={payState} />
              <DeliveryDetailsCard order={order} trackingNum={trackingNum} />
            </div>
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Tracking Timeline</h3>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Progress</p>
                    <p className="text-sm font-bold" style={{ color: "#6426E1" }}>{progress}%</p>
                  </div>
                </div>
                <div className="mb-8">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${progress}%`, background: "linear-gradient(90deg, #6426E1, #9B6DFF)" }} />
                  </div>
                </div>
                <div className="relative">
                  {DELIVERY_STEPS.map((step, i) => {
                    const done    = i < currentStep;
                    const current = i === currentStep;
                    const last    = i === DELIVERY_STEPS.length - 1;
                    return (
                      <div key={step.label} className={`relative flex gap-5 ${!last ? "pb-8" : ""} group`}>
                        {!last && (
                          <div className="absolute left-5 top-10 w-0.5 transition-all"
                            style={{ backgroundColor: done ? "#6426E1" : "#E5E7EB", height: "calc(100% - 2rem)" }} />
                        )}
                        <div className={`relative z-10 flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${
                          done ? "shadow-lg" : current ? "border-2 bg-purple-50" : "border-2 border-gray-200 bg-gray-50"}`}
                          style={done ? { backgroundColor: "#6426E1" } : current ? { borderColor: "#6426E1" } : {}}>
                          {done
                            ? <CheckCircle2 className="w-5 h-5 text-white" />
                            : <step.Icon className="w-5 h-5" style={current ? { color: "#6426E1" } : { color: "#9CA3AF" }} />}
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <p className={`text-base font-semibold ${done || current ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
                            {current && (
                              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: "#6426E1" }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Current
                              </span>
                            )}
                            {done && <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Completed</span>}
                          </div>
                          <p className={`text-sm leading-relaxed ${i > currentStep ? "text-gray-300" : "text-gray-600"}`}>{step.description}</p>
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