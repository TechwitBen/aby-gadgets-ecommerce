import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  CreditCard,
  Clock,
  Banknote,
  Smartphone,
  QrCode,
  Wallet,
} from "lucide-react";
import { paymentService } from "@/services/Payment.service";

// ── Types ─────────────────────────────────────────────────────────────────────
type CallbackState = "verifying" | "success" | "failed" | "cancelled" | "error";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

// ── Channel config — mirrors PaymentsPage CHANNEL_CFG ─────────────────────────
// `channel` is the Paystack channel value stored on the Payment doc after
// the transaction completes. null/undefined means it's not yet known.
const CHANNEL_CFG: Record<
  string,
  { label: string; sublabel: string; Icon: React.FC<{ className?: string }> }
> = {
  card:          { label: "Card",           sublabel: "Debit / Credit card",  Icon: CreditCard  },
  bank:          { label: "Bank Transfer",  sublabel: "Direct bank payment",  Icon: Banknote    },
  bank_transfer: { label: "Bank Transfer",  sublabel: "Direct bank payment",  Icon: Banknote    },
  ussd:          { label: "USSD",           sublabel: "Mobile dial code",     Icon: Smartphone  },
  qr:            { label: "QR Code",        sublabel: "Scan to pay",          Icon: QrCode      },
  mobile_money:  { label: "Mobile Money",   sublabel: "Mobile wallet",        Icon: Wallet      },
};

const getChannelCfg = (channel: string | null | undefined) => {
  if (!channel) return null;
  return CHANNEL_CFG[channel.toLowerCase()] ?? null;
};

// ── Channel pill — shown on the success screen ────────────────────────────────
const ChannelPill = ({ channel }: { channel: string | null | undefined }) => {
  const cfg = getChannelCfg(channel);
  if (!cfg) return null;
  const Icon = cfg.Icon;
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-emerald-100 rounded-full text-sm text-emerald-700 font-medium shadow-sm">
      <Icon className="w-4 h-4 text-emerald-500" />
      <span>{cfg.label}</span>
      <span className="text-emerald-400 text-xs">·</span>
      <span className="text-xs text-emerald-500">{cfg.sublabel}</span>
    </div>
  );
};

// ── Safely extract orderId whether order is populated or a raw string ─────────
const extractOrderId = (order: any): string | null => {
  if (!order) return null;
  if (typeof order === "string") return order;
  if (typeof order === "object" && order._id) return String(order._id);
  return null;
};

const extractOrderNumber = (order: any): string | null => {
  if (!order || typeof order !== "object") return null;
  return order.order_number ?? null;
};

// ─────────────────────────────────────────────────────────────────────────────
const PaymentCallback = () => {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();

  // Paystack sends both `reference` and `trxref` — handle either
  const reference = searchParams.get("reference") ?? searchParams.get("trxref");

  const [state,      setState]      = useState<CallbackState>("verifying");
  const [orderId,    setOrderId]    = useState<string | null>(null);
  const [orderNum,   setOrderNum]   = useState<string | null>(null);
  const [amount,     setAmount]     = useState<number | null>(null);
  // channel: the Paystack channel value ("card", "bank", "ussd", etc.)
  // Populated from payment.channel after verify returns success.
  const [channel,    setChannel]    = useState<string | null>(null);
  const [errorMsg,   setErrorMsg]   = useState<string | null>(null);
  const [retrying,   setRetrying]   = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  // Guard against React StrictMode double-invocation
  const hasRun = useRef(false);

  useEffect(() => {
    if (!reference) {
      setState("error");
      setErrorMsg("No payment reference found in the URL.");
      return;
    }
    if (hasRun.current) return;
    hasRun.current = true;

    paymentService
      .verifyPayment(reference)
      .then((res) => {
        const payment = res.payment;

        // ── Robustly extract orderId whether order is populated or raw ID ──
        const oid = extractOrderId(payment?.order);
        const onum = extractOrderNumber(payment?.order);

        setOrderId(oid);
        setOrderNum(onum);
        setAmount(payment?.amount ?? null);

        // ── Extract channel from payment doc ──────────────────────────────
        // payment.channel is set by verifyPayment on the backend when
        // Paystack returns a success status. It holds the raw channel value:
        // "card" | "bank" | "bank_transfer" | "ussd" | "qr" | "mobile_money"
        setChannel((payment as any)?.channel ?? null);

        const s = res.status ?? payment?.status;

        if (s === "success" || res.alreadyPaid) {
          setState("success");
        } else if (s === "failed") {
          setState("failed");
        } else if (s === "cancelled") {
          setState("cancelled");
        } else {
          setState("error");
          setErrorMsg(
            res.message ?? "An unexpected error occurred verifying your payment.",
          );
        }
      })
      .catch((err: any) => {
        const msg =
          err?.response?.data?.message ??
          err?.message ??
          "Verification failed.";
        setState("error");
        setErrorMsg(msg);
      });
  }, [reference]);

  // ── Retry payment handler ─────────────────────────────────────────────────
  const handleRetry = async () => {
    if (!orderId) return;
    setRetrying(true);
    setRetryError(null);
    try {
      const res = await paymentService.initializePayment({ orderId });
      if (res.alreadyPaid) {
        setState("success");
        return;
      }
      if (res.authorization_url) {
        window.location.href = res.authorization_url;
        return;
      }
      setRetryError(
        res.message ?? "Could not restart payment. Please try from your orders.",
      );
    } catch (err: any) {
      setRetryError(
        err?.response?.data?.message ??
          "Could not restart payment. Please try from your orders page.",
      );
    } finally {
      setRetrying(false);
    }
  };

  // ── Verifying ─────────────────────────────────────────────────────────────
  if (state === "verifying") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center border border-gray-100">
          <div className="w-20 h-20 rounded-full bg-violet-50 border-2 border-violet-200 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-9 h-9 text-violet-500 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Verifying your payment
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            Please wait while we confirm your payment with Paystack. Do not
            close this page.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
            <span className="text-xs text-gray-400">Checking with Paystack…</span>
          </div>
          {reference && (
            <p className="text-[11px] text-gray-400 font-mono mt-4 bg-gray-50 px-3 py-1.5 rounded-lg break-all">
              {reference}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (state === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center border border-emerald-100">
          {/* Icon */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Payment Confirmed!
          </h2>

          {/* Amount */}
          {amount && (
            <p className="text-3xl font-black text-emerald-600 mb-2">
              {fmt(amount)}
            </p>
          )}

          {/* Order number */}
          {orderNum && (
            <p className="text-sm text-gray-500 mb-4">
              Order{" "}
              <span className="font-mono font-semibold text-gray-800">
                #{orderNum}
              </span>
            </p>
          )}

          {/* Channel pill — shown when Paystack tells us how they paid */}
          {channel && (
            <div className="flex justify-center mb-5">
              <ChannelPill channel={channel} />
            </div>
          )}

          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Your order is confirmed and being prepared. We'll notify you at
            every step.
          </p>

          <div className="space-y-3">
            {orderId && (
              <Link
                to={`/track-order/${orderId}`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-semibold text-white text-sm hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #6426E1, #9B6DFF)",
                }}
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
        </div>
      </div>
    );
  }

  // ── Failed ────────────────────────────────────────────────────────────────
  if (state === "failed") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center border border-red-100">
          <div className="w-20 h-20 rounded-full bg-red-50 border-4 border-red-200 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Payment Failed
          </h2>
          {amount && (
            <p className="text-2xl font-black text-red-500 mb-2">{fmt(amount)}</p>
          )}
          {orderNum && (
            <p className="text-sm text-gray-500 mb-4">
              Order{" "}
              <span className="font-mono font-semibold text-gray-800">
                #{orderNum}
              </span>
            </p>
          )}

          {/* Show which channel failed if we know */}
          {channel && (
            <div className="flex justify-center mb-4">
              <ChannelPill channel={channel} />
            </div>
          )}

          <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-5 text-left">
            <p className="text-sm font-semibold text-red-800 mb-1">
              What happened?
            </p>
            <p className="text-xs text-red-700 leading-relaxed">
              Your bank or card issuer declined the payment. This can happen due
              to insufficient funds, a wrong OTP, card restrictions, or a failed
              bank transfer. Your order is still saved — try again with a
              different card or payment method.
            </p>
          </div>

          {retryError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-4">
              {retryError}
            </p>
          )}

          <div className="space-y-3">
            {orderId && (
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-semibold text-white text-sm hover:opacity-90 disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, #6426E1, #9B6DFF)",
                }}
              >
                {retrying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Opening
                    Paystack…
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" /> Try Payment Again
                  </>
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

  // ── Cancelled / Abandoned ─────────────────────────────────────────────────
  if (state === "cancelled") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center border border-amber-100">
          <div className="w-20 h-20 rounded-full bg-amber-50 border-4 border-amber-200 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Payment Cancelled
          </h2>
          {amount && (
            <p className="text-2xl font-black text-amber-500 mb-2">
              {fmt(amount)}
            </p>
          )}
          {orderNum && (
            <p className="text-sm text-gray-500 mb-4">
              Order{" "}
              <span className="font-mono font-semibold text-gray-800">
                #{orderNum}
              </span>
            </p>
          )}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 mb-5 text-left">
            <p className="text-sm font-semibold text-amber-800 mb-1">
              Payment not completed
            </p>
            <p className="text-xs text-amber-700 leading-relaxed">
              You closed the payment page before completing. Your order is still
              saved and you can complete payment any time from your Orders page.
            </p>
          </div>

          {retryError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-4">
              {retryError}
            </p>
          )}

          <div className="space-y-3">
            {orderId && (
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-semibold text-white text-sm hover:opacity-90 disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, #6426E1, #9B6DFF)",
                }}
              >
                {retrying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Opening
                    Paystack…
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" /> Complete Payment
                  </>
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

  // ── Error / Unknown ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center border border-gray-200">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Something went wrong
        </h2>
        <p className="text-sm text-gray-500 mb-2 leading-relaxed">
          {errorMsg ??
            "We could not verify your payment status. Please check your orders."}
        </p>
        {reference && (
          <p className="text-[11px] text-gray-400 font-mono mb-6 bg-gray-50 px-3 py-1.5 rounded-lg break-all">
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