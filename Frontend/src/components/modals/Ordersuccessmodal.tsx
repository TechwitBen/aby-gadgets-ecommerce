import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  Settings2,
  AlertTriangle,
  CheckCircle2,
  Home,
  Clock,
  CreditCard,
  Loader2,
} from "lucide-react";
import type { FulfillmentType } from "@/services/Order.service";
import { paymentService } from "@/services/Payment.service";

interface OrderSuccessModalProps {
  open:               boolean;
  orderId:            string;
  orderNumber?:       string;
  email:              string;
  onClose:            () => void;
  fulfillmentType?:   FulfillmentType;
  pickupCode?:        string;
  pickupAddress?:     string;
  pickupHours?:       string;
  paymentInitFailed?: boolean;
}

const OrderSuccessModal = ({
  open,
  orderId,
  orderNumber,
  email,
  onClose,
  fulfillmentType   = "delivery",
  pickupCode,
  pickupAddress,
  pickupHours,
  paymentInitFailed = false,
}: OrderSuccessModalProps) => {
  const navigate  = useNavigate();
  const isPickup  = fulfillmentType === "pickup";
  const displayId = orderNumber ?? orderId.slice(-8).toUpperCase();

  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  if (!open) return null;

  // ── Go to orders page ──────────────────────────────────────────────────────
  const handleGoToOrders = () => {
    onClose();
    navigate("/orders");
  };

  // ── Pay Now — re-initializes payment and redirects to Paystack immediately ─
  // No timer. User explicitly triggers the redirect by tapping this button.
  // If it fails, we show an inline error and let them dismiss to the orders page
  // where "Complete Payment" also exists as a fallback.
  const handlePayNow = async () => {
    setIsPaying(true);
    setPayError(null);
    try {
      const res = await paymentService.initializePayment({ orderId });

      // Edge case: already paid (e.g. webhook fired before this call)
      if (res.alreadyPaid) {
        onClose();
        navigate(`/track-order/${orderId}`);
        return;
      }

      if (res.authorization_url) {
        // Close modal before navigating so there's no flash on return
        onClose();
        window.location.href = res.authorization_url;
        return;
      }

      setPayError("Could not open the payment page. Please try from your Orders page.");
    } catch (err: any) {
      setPayError(
        err?.response?.data?.message ??
          "Could not open the payment page. You can complete payment from your Orders page.",
      );
    } finally {
      setIsPaying(false);
    }
  };

  // ── Which primary action to render ────────────────────────────────────────
  // paymentInitFailed  → "GO TO MY ORDERS" (no retry inside modal)
  // isPickup           → "VIEW ORDER"       (nothing to pay via Paystack here)
  // online delivery    → "PAY NOW"          (Option B: sole CTA, explicit action)
  const showPayNow = !paymentInitFailed && !isPickup;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl px-8 py-8 text-center shadow-2xl"
        style={{ backgroundColor: "#e9e0ff" }}
      >

        {/* ── Payment init failed banner ── */}
        {paymentInitFailed && (
          <div className="mb-5 flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-left">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-800 mb-0.5">
                Payment page didn't open
              </p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Your order was saved but Paystack couldn't be reached. Tap{" "}
                <strong>"Complete Payment"</strong> on your Orders page whenever
                you're ready — your order won't be lost.
              </p>
            </div>
          </div>
        )}

        {/* ── Pay Now error (shown if handlePayNow fails) ── */}
        {payError && (
          <div className="mb-5 flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-left">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-red-800 mb-0.5">
                Could not open payment
              </p>
              <p className="text-xs text-red-700 leading-relaxed">{payError}</p>
            </div>
          </div>
        )}

        {/* ── Icon circle ── */}
        <div className="flex justify-center mb-5">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: paymentInitFailed ? "#D97706" : "#6426E1" }}
          >
            {paymentInitFailed ? (
              <AlertTriangle className="w-7 h-7 text-white" strokeWidth={2.5} />
            ) : isPickup ? (
              <Store className="w-7 h-7 text-white" strokeWidth={2.5} />
            ) : (
              <CheckCircle2 className="w-7 h-7 text-white" strokeWidth={2.5} />
            )}
          </div>
        </div>

        {/* ── Title ── */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {paymentInitFailed
            ? "Order Placed — Payment Pending"
            : isPickup
              ? "Pickup Order Placed!"
              : "Order Placed Successfully"}
        </h2>

        <p className="text-sm text-gray-600 mb-5">
          {paymentInitFailed
            ? "Your order is saved. Use \"Complete Payment\" on your Orders page whenever you're ready."
            : isPickup
              ? "Your order is confirmed. Visit our store to collect it."
              : "Your order is saved. Complete your payment below to confirm it."}
        </p>

        {/* ── Pills ── */}
        <div className="flex flex-col items-center gap-2 mb-5">
          <span
            className="text-sm font-medium px-4 py-1.5 rounded-full border font-mono"
            style={{ borderColor: "#ca8a04", color: "#92400e" }}
          >
            Order: {displayId}
          </span>
          <span
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-full"
            style={{
              backgroundColor: paymentInitFailed ? "#FEF3C7" : isPickup ? "#dcfce7" : "#fef08a",
              color:           paymentInitFailed ? "#92400e"  : isPickup ? "#166534" : "#713f12",
            }}
          >
            {paymentInitFailed ? (
              <><AlertTriangle size={12} /> Payment Not Completed</>
            ) : isPickup ? (
              <><Store size={12} /> Ready for Pickup</>
            ) : (
              <><Settings2 size={12} /> Awaiting Payment</>
            )}
          </span>
        </div>

        {/* ── Pickup details ── */}
        {isPickup && !paymentInitFailed && (
          <div className="bg-white rounded-xl p-4 text-left space-y-2 mb-5 border border-green-100">
            {pickupCode && (
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Your Pickup Code</p>
                <p className="text-lg font-black text-gray-900 tracking-widest font-mono">
                  {pickupCode}
                </p>
                <p className="text-xs text-gray-400">
                  Show this code when you arrive at the store.
                </p>
              </div>
            )}
            {pickupAddress && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                  <Home size={11} /> Pickup Location
                </p>
                <p className="text-sm text-gray-700">{pickupAddress}</p>
              </div>
            )}
            {pickupHours && (
              <div>
                <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                  <Clock size={11} /> Store Hours
                </p>
                <p className="text-sm text-gray-700">{pickupHours}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Email note ── */}
        <p className="text-xs text-gray-600 mb-6 leading-relaxed">
          We've sent your order details to{" "}
          <a href={`mailto:${email}`} className="font-medium underline" style={{ color: "#6426E1" }}>
            {email}
          </a>
          .
          {paymentInitFailed && (
            <>
              <br />
              <span className="text-amber-700 font-medium">
                Complete payment from your Orders page to confirm your order.
              </span>
            </>
          )}
        </p>

        {/* ── Actions ── */}
        <div className="flex flex-col items-center gap-3">

          {/* Online delivery happy path — explicit Pay Now, no timer */}
          {showPayNow && (
            <button
              onClick={handlePayNow}
              disabled={isPaying}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white tracking-wide transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#6426E1" }}
            >
              {isPaying ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Opening Paystack…</>
              ) : (
                <><CreditCard className="w-4 h-4" /> PAY NOW</>
              )}
            </button>
          )}

          {/* Pickup happy path */}
          {isPickup && !paymentInitFailed && (
            <button
              onClick={handleGoToOrders}
              className="w-full px-5 py-3 rounded-xl text-sm font-bold text-white tracking-wide transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#6426E1" }}
            >
              VIEW ORDER
            </button>
          )}

          {/* Payment init failed */}
          {paymentInitFailed && (
            <button
              onClick={handleGoToOrders}
              className="w-full px-5 py-3 rounded-xl text-sm font-bold text-white tracking-wide transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#6426E1" }}
            >
              GO TO MY ORDERS
            </button>
          )}

          {/* Secondary dismiss — always present */}
          <button
            onClick={handleDismiss}
            className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
          >
            {paymentInitFailed
              ? "Dismiss"
              : isPickup
                ? "Go to Dashboard"
                : "Pay later from Orders"}
          </button>

        </div>
      </div>
    </div>
  );

  function handleDismiss() {
    onClose();
    navigate("/orders");
  }
};

export default OrderSuccessModal;