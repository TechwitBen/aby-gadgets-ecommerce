import { useNavigate } from "react-router-dom";
import type { FulfillmentType } from "@/services/order.service";

interface OrderSuccessModalProps {
  open: boolean;
  orderId: string;
  orderNumber?: string;
  email: string;
  onClose: () => void;
  fulfillmentType?: FulfillmentType;
  pickupCode?: string;
  pickupAddress?: string;
  pickupHours?: string;
  paymentInitFailed?: boolean; // ← new: true when Paystack redirect failed
}

const OrderSuccessModal = ({
  open,
  orderId,
  orderNumber,
  email,
  onClose,
  fulfillmentType = "delivery",
  pickupCode,
  pickupAddress,
  pickupHours,
  paymentInitFailed = false,
}: OrderSuccessModalProps) => {
  const navigate = useNavigate();
  const isPickup = fulfillmentType === "pickup";
  const displayId = orderNumber ?? orderId.slice(-8).toUpperCase();

  if (!open) return null;

  const handlePrimary = () => {
    onClose();
    navigate(`/track-order/${orderId}`);
  };

  const handleDashboard = () => {
    onClose();
    navigate("/orders");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl px-8 py-8 text-center shadow-2xl"
        style={{ backgroundColor: "#e9e0ff" }}
      >
        {/* ── Payment failed warning banner ─────────────────────────── */}
        {paymentInitFailed && (
          <div className="mb-5 flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-left">
            <svg
              className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-xs font-bold text-amber-800 mb-0.5">
                Payment page didn't open
              </p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Your order was saved, but we couldn't redirect you to Paystack.
                Use the <strong>"Complete Payment"</strong> button on your
                Orders page to pay.
              </p>
            </div>
          </div>
        )}

        {/* Checkmark / store icon circle */}
        <div className="flex justify-center mb-5">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: paymentInitFailed ? "#D97706" : "#6426E1",
            }}
          >
            {paymentInitFailed ? (
              /* Warning icon when payment failed */
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            ) : isPickup ? (
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
                <polyline
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  points="9 22 9 12 15 12 15 22"
                />
              </svg>
            ) : (
              <svg
                className="w-7 h-7 text-white"
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
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {paymentInitFailed
            ? "Order Placed — Payment Pending"
            : isPickup
              ? "Pickup Order Placed!"
              : "Order Placed Successfully"}
        </h2>

        <p className="text-sm text-gray-600 mb-5">
          {paymentInitFailed
            ? "Your order is saved. Head to your Orders page to complete the payment when ready."
            : isPickup
              ? "Your order is confirmed. Visit our store to collect it."
              : "Your order has been received and is now being processed."}
        </p>

        {/* Pills */}
        <div className="flex flex-col items-center gap-2 mb-5">
          <span
            className="text-sm font-medium px-4 py-1.5 rounded-full border font-mono"
            style={{ borderColor: "#ca8a04", color: "#92400e" }}
          >
            Order: {displayId}
          </span>
          <span
            className="text-sm font-semibold px-4 py-1.5 rounded-full"
            style={{
              backgroundColor: paymentInitFailed
                ? "#FEF3C7"
                : isPickup
                  ? "#dcfce7"
                  : "#fef08a",
              color: paymentInitFailed
                ? "#92400e"
                : isPickup
                  ? "#166534"
                  : "#713f12",
            }}
          >
            {paymentInitFailed
              ? "⚠️ Payment Not Completed"
              : isPickup
                ? "🏪 Ready for Pickup"
                : "⚙ Order Status: Processing"}
          </span>
        </div>

        {/* Pickup details (only for successful pickup orders) */}
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
                <p className="text-xs text-gray-500 mb-0.5">
                  📍 Pickup Location
                </p>
                <p className="text-sm text-gray-700">{pickupAddress}</p>
              </div>
            )}
            {pickupHours && (
              <div>
                <p className="text-xs text-gray-500 mb-0.5">🕐 Store Hours</p>
                <p className="text-sm text-gray-700">{pickupHours}</p>
              </div>
            )}
          </div>
        )}

        {/* Email note */}
        <p className="text-xs text-gray-600 mb-6 leading-relaxed">
          We've sent your order details to{" "}
          <a
            href={`mailto:${email}`}
            className="font-medium underline"
            style={{ color: "#6426E1" }}
          >
            {email}
          </a>
          .
          {paymentInitFailed && (
            <>
              <br />
              <span className="text-amber-700 font-medium">
                Complete your payment from the Orders page to confirm your
                order.
              </span>
            </>
          )}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          {paymentInitFailed ? (
            /* When payment failed, primary action is "Go to Orders" to retry */
            <button
              onClick={handleDashboard}
              className="px-5 py-2.5 rounded-lg text-sm font-bold text-white tracking-wide transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#6426E1" }}
            >
              GO TO MY ORDERS
            </button>
          ) : (
            <button
              onClick={handlePrimary}
              className="px-5 py-2.5 rounded-lg text-sm font-bold text-white tracking-wide transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#6426E1" }}
            >
              {isPickup ? "VIEW ORDER" : "TRACK ORDER"}
            </button>
          )}
          <button
            onClick={handleDashboard}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            {paymentInitFailed ? "Dismiss" : "Go To Dashboard"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessModal;
