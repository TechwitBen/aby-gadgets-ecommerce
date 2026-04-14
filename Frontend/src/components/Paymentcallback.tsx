import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { paymentService } from "@/services/Payment.service";
import PaymentConfirmedModal from "@/components/modals/Paymentconfirmedmodal";

/**
 * Paystack redirects here after payment:
 * /payment/callback?reference=PAY-xxx&trxref=PAY-xxx
 *
 * We verify the reference, then show the PaymentConfirmedModal.
 */
const PaymentCallback = () => {
  const [searchParams]   = useSearchParams();
  const navigate         = useNavigate();
  const reference        = searchParams.get("reference") ?? searchParams.get("trxref") ?? "";

  const [status,  setStatus]  = useState<"verifying" | "success" | "failed">("verifying");
  const [orderId, setOrderId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!reference || hasVerified.current) return;
    hasVerified.current = true;

    paymentService
      .verifyPayment(reference)
      .then((res) => {
        setOrderId(res.payment.order);
        setStatus("success");
        setShowModal(true);
      })
      .catch(() => {
        setStatus("failed");
      });
  }, [reference]);

  if (status === "verifying") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="text-sm text-gray-600">Verifying your payment…</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Payment Failed</h2>
        <p className="text-sm text-gray-600 max-w-xs">
          We could not verify your payment. Please try again or contact support.
        </p>
        <button
          onClick={() => navigate("/cart")}
          className="mt-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: "#6426E1" }}
        >
          Back to Cart
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Show confirmed modal over a blank page */}
      <div className="min-h-screen bg-white" />
      <PaymentConfirmedModal
        open={showModal}
        orderId={orderId}
        onClose={() => { setShowModal(false); navigate("/orders"); }}
      />
    </>
  );
};

export default PaymentCallback;