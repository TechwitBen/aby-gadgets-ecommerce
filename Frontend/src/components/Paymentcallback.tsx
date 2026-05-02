import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { paymentService } from "@/services/Payment.service";
import PaymentConfirmedModal from "@/components/modals/Paymentconfirmedmodal";

/**
 * Paystack redirects here after a card / transfer payment:
 *   /payment/callback?reference=PAY-xxx&trxref=PAY-xxx
 *
 * Strategy:
 *   1. Call verifyPayment(reference) immediately — this hits the Paystack API
 *      and confirms the payment if the charge was successful.
 *   2. If verifyPayment returns "success", show the modal and we're done.
 *   3. If verifyPayment returns "failed" or throws, show the failure screen.
 *
 * The webhook (payment.controller.js → handleWebhook) also runs independently
 * on the backend. Calling verifyPayment first ensures the frontend sees the
 * result even if the webhook hasn't fired yet.  The backend verifyPayment
 * handler is idempotent — if the webhook already confirmed the payment, it just
 * returns the cached success immediately.
 *
 * NOTE: orderId is the MongoDB _id — used for navigation.
 *       The human-readable order_number is shown inside TrackOrderPage.
 */
const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const reference =
    searchParams.get("reference") ?? searchParams.get("trxref") ?? "";

  const [stage, setStage] = useState<"verifying" | "confirmed" | "failed">(
    "verifying",
  );
  const [orderId, setOrderId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!reference || hasRun.current) return;
    hasRun.current = true;

    (async () => {
      try {
        // Primary path: call verify endpoint — this checks Paystack directly and
        // updates the DB (payment.status = success, order.payment_status = paid).
        const { payment } = await paymentService.verifyPayment(reference);

        if (payment.status === "success") {
          const orderIdStr =
            typeof payment.order === "string"
              ? payment.order
              : ((payment.order as any)?._id ?? "");

          setOrderId(orderIdStr);
          setStage("confirmed");
          setShowModal(true);
          return;
        }

        // Payment was not successful (failed / abandoned / cancelled)
        setStage("failed");
      } catch {
        // verifyPayment threw (network error, server error, etc.)
        // Fall back to polling getPaymentStatus in case the webhook
        // confirmed it before we could reach the verify endpoint.
        try {
          const confirmed = await paymentService.pollUntilConfirmed(
            reference,
            2000,
            15000,
          );

          if (confirmed.status === "success") {
            const orderIdStr =
              typeof confirmed.order === "string"
                ? confirmed.order
                : ((confirmed.order as any)?._id ?? "");

            setOrderId(orderIdStr);
            setStage("confirmed");
            setShowModal(true);
          } else {
            setStage("failed");
          }
        } catch {
          setStage("failed");
        }
      }
    })();
  }, [reference]);

  // ── Verifying ─────────────────────────────────────────────────────────────
  if (stage === "verifying") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="text-sm text-gray-600">Verifying your payment…</p>
        <p className="text-xs text-gray-400 max-w-xs text-center">
          Please don't close this tab. This usually takes just a few seconds.
        </p>
      </div>
    );
  }

  // ── Failed ────────────────────────────────────────────────────────────────
  if (stage === "failed") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
          <svg
            className="w-7 h-7 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Payment Failed</h2>
        <p className="text-sm text-gray-600 max-w-xs">
          We couldn't verify your payment. If money was deducted, it will be
          refunded automatically. Please contact us if this persists.
        </p>
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => navigate("/cart")}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: "#6426E1" }}
          >
            Back to Cart
          </button>
          <button
            onClick={() => navigate("/orders")}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            My Orders
          </button>
        </div>
      </div>
    );
  }

  // ── Confirmed — show modal over blank page ────────────────────────────────
  return (
    <>
      <div className="min-h-screen bg-white" />
      <PaymentConfirmedModal
        open={showModal}
        orderId={orderId}
        onClose={() => {
          setShowModal(false);
          navigate("/orders");
        }}
      />
    </>
  );
};

export default PaymentCallback;
