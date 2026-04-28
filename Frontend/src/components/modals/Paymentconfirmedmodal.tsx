import { useNavigate } from "react-router-dom";

interface PaymentConfirmedModalProps {
  open:    boolean;
  orderId: string; // MongoDB _id — used for navigation (intentionally kept as _id)
  onClose: () => void;
}

/**
 * Shown after Paystack callback verification succeeds.
 * orderId is the MongoDB _id of the order (not order_number) because
 * the /track-order/:id route is keyed on _id.
 * The human-readable order_number is displayed inside TrackOrderPage itself.
 */
const PaymentConfirmedModal = ({
  open, orderId, onClose,
}: PaymentConfirmedModalProps) => {
  const navigate = useNavigate();

  if (!open) return null;

  const handleViewOrder = () => {
    onClose();
    navigate(`/track-order/${orderId}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
    >
      <div
        className="w-full max-w-xs rounded-2xl px-8 py-8 text-center shadow-2xl"
        style={{ backgroundColor: "#e9e0ff" }}
      >
        {/* Checkmark circle */}
        <div className="flex justify-center mb-5">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#6426E1" }}
          >
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
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Payment Confirmed
        </h2>

        {/* Subtitle */}
        <p className="text-sm text-gray-600 mb-6">
          This payment has been successfully verified and confirmed.
        </p>

        {/* Button */}
        <button
          onClick={handleViewOrder}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: "#3b1f8c" }}
        >
          View Order
        </button>
      </div>
    </div>
  );
};

export default PaymentConfirmedModal;