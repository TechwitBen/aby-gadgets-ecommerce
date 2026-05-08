import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle, AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";
import { paymentService } from "@/services/Payment.service";

type CallbackState = "verifying" | "success" | "failed" | "cancelled" | "already_paid" | "error";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get("reference") ?? searchParams.get("trxref");

  const [state, setState] = useState<CallbackState>("verifying");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const verified = useRef(false);

  useEffect(() => {
    if (!reference) {
      setState("error");
      setErrorMsg("No payment reference found in URL.");
      return;
    }

    if (verified.current) return;
    verified.current = true;

    paymentService
      .verifyPayment(reference)
      .then((res: any) => {
        // res may come from our backend as { status, message, payment } or { alreadyPaid }
        const paymentStatus: string = res.status ?? res.payment?.status ?? "error";
        const payment = res.payment;
        const orderObj =
          typeof payment?.order === "object" ? payment.order : null;

        setOrderNumber(orderObj?.order_number ?? null);
        setOrderId(
          payment?.order?._id
            ? String(payment.order._id)
            : typeof payment?.order === "string"
              ? payment.order
              : null
        );
        setAmount(payment?.amount ?? null);

        if (paymentStatus === "success" || res.alreadyPaid) {
          setState("success");
          // Auto-navigate to order after 3.5s
          setTimeout(() => {
            const id =
              payment?.order?._id
                ? String(payment.order._id)
                : typeof payment?.order === "string"
                  ? payment.order
                  : null;
            if (id) navigate(`/track-order/${id}`);
            else navigate("/orders");
          }, 3500);
        } else if (paymentStatus === "cancelled") {
          setState("cancelled");
        } else if (paymentStatus === "failed") {
          setState("failed");
        } else {
          setState("error");
          setErrorMsg(res.message ?? "An unexpected error occurred.");
        }
      })
      .catch((err: any) => {
        const msg =
          err?.response?.data?.message ?? err?.message ?? "Verification failed.";
        if (msg.includes("not found")) {
          setState("error");
          setErrorMsg("Payment reference not recognised. Please go to your orders.");
        } else if (msg.includes("Unauthorized")) {
          setState("error");
          setErrorMsg("Session expired. Please log in and check your orders.");
        } else {
          setState("error");
          setErrorMsg(msg);
        }
      });
  }, [reference, navigate]);

  const handleRetry = async () => {
    if (!orderId) return;
    setRetrying(true);
    try {
      const res = await paymentService.initializePayment({ orderId });
      if (res.authorization_url) {
        window.location.href = res.authorization_url;
      } else if (res.alreadyPaid) {
        setState("success");
      } else {
        setErrorMsg(res.message ?? "Could not start payment.");
      }
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ?? "Could not restart payment. Please try from your orders page."
      );
    } finally {
      setRetrying(false);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

  // ── Verifying ──────────────────────────────────────────────────────────────
  if (state === "verifying") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center border border-gray-100">
          <div className="w-20 h-20 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-9 h-9 text-violet-600 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying your payment</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Please wait while we confirm your payment with Paystack. Do not close this page.
          </p>
          {reference && (
            <p className="text-[11px] text-gray-400 font-mono mt-4 bg-gray-50 px-3 py-1.5 rounded-lg">
              {reference}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (state === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center border border-emerald-100">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Payment Confirmed!</h2>
          {amount && (
            <p className="text-3xl font-black text-emerald-600 mb-2">{fmt(amount)}</p>
          )}
          {orderNumber && (
            <p className="text-sm text-gray-500 mb-4">
              Order <span className="font-mono font-semibold text-gray-700">#{orderNumber}</span>
            </p>
          )}
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Your order is now confirmed and being prepared. We'll notify you of any updates.
          </p>
          <div className="space-y-3">
            {orderId && (
              <Link
                to={`/track-order/${orderId}`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-semibold text-white text-sm transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #6426E1, #9B6DFF)" }}
              >
                Track Your Order <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <Link
              to="/orders"
              className="flex items-center justify-center w-full py-3 rounded-2xl font-semibold text-gray-600 text-sm bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              View All Orders
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-4">Redirecting automatically in a moment…</p>
        </div>
      </div>
    );
  }

  // ── Failed ─────────────────────────────────────────────────────────────────
  if (state === "failed") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center border border-red-100">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6 border-2 border-red-200">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Payment Failed</h2>
          {amount && (
            <p className="text-2xl font-black text-red-500 mb-2">{fmt(amount)}</p>
          )}
          {orderNumber && (
            <p className="text-sm text-gray-500 mb-4">
              Order <span className="font-mono font-semibold text-gray-700">#{orderNumber}</span>
            </p>
          )}
          <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-6 text-left">
            <p className="text-sm font-semibold text-red-800 mb-1">What happened?</p>
            <p className="text-xs text-red-700 leading-relaxed">
              Your payment was declined by your bank or card issuer. Your order is still reserved — you can try again with a different payment method.
            </p>
          </div>
          {errorMsg && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-4">{errorMsg}</p>
          )}
          <div className="space-y-3">
            {orderId && (
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-semibold text-white text-sm transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #6426E1, #9B6DFF)" }}
              >
                {retrying ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Opening Paystack…</>
                ) : (
                  <><RefreshCw className="w-4 h-4" /> Try Payment Again</>
                )}
              </button>
            )}
            <Link
              to="/orders"
              className="flex items-center justify-center w-full py-3 rounded-2xl font-semibold text-gray-600 text-sm bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Back to My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Cancelled / Abandoned ──────────────────────────────────────────────────
  if (state === "cancelled") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center border border-amber-100">
          <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-6 border-2 border-amber-200">
            <AlertTriangle className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Payment Cancelled</h2>
          {amount && (
            <p className="text-2xl font-black text-amber-500 mb-2">{fmt(amount)}</p>
          )}
          {orderNumber && (
            <p className="text-sm text-gray-500 mb-4">
              Order <span className="font-mono font-semibold text-gray-700">#{orderNumber}</span>
            </p>
          )}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 mb-6 text-left">
            <p className="text-sm font-semibold text-amber-800 mb-1">Payment not completed</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              You closed the payment page before completing. Your order is still saved and you can complete payment any time.
            </p>
          </div>
          <div className="space-y-3">
            {orderId && (
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-semibold text-white text-sm transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #6426E1, #9B6DFF)" }}
              >
                {retrying ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Opening Paystack…</>
                ) : (
                  <>Complete Payment</>
                )}
              </button>
            )}
            <Link
              to="/orders"
              className="flex items-center justify-center w-full py-3 rounded-2xl font-semibold text-gray-600 text-sm bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Back to My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Error / Unknown ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center border border-gray-200">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Something went wrong</h2>
        <p className="text-sm text-gray-500 mb-2 leading-relaxed">
          {errorMsg ?? "We could not verify your payment status. Please check your orders."}
        </p>
        {reference && (
          <p className="text-[11px] text-gray-400 font-mono mb-6 bg-gray-50 px-3 py-1.5 rounded-lg">
            ref: {reference}
          </p>
        )}
        <Link
          to="/orders"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-semibold text-white text-sm"
          style={{ background: "linear-gradient(135deg, #6426E1, #9B6DFF)" }}
        >
          Check My Orders <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default PaymentCallback;