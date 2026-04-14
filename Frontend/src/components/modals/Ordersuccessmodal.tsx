import { useNavigate } from "react-router-dom";

interface OrderSuccessModalProps {
  open:    boolean;
  orderId: string;
  email:   string;
  onClose: () => void;
}

const OrderSuccessModal = ({ open, orderId, email, onClose }: OrderSuccessModalProps) => {
  const navigate = useNavigate();

  if (!open) return null;

  const handleTrack = () => {
    onClose();
    navigate(`/track-order/${orderId}`);
  };

  const handleDashboard = () => {
    onClose();
    navigate("/orders");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
      <div
        className="w-full max-w-sm rounded-2xl px-8 py-8 text-center shadow-2xl"
        style={{ backgroundColor: "#e9e0ff" }}
      >
        {/* Checkmark circle */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#6426E1" }}>
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Order Placed Successfully
        </h2>

        {/* Subtitle */}
        <p className="text-sm text-gray-600 mb-5">
          Your order has been received and is now being processed.
        </p>

        {/* Pills */}
        <div className="flex flex-col items-center gap-2 mb-5">
          <span
            className="text-sm font-medium px-4 py-1.5 rounded-full border"
            style={{ borderColor: "#ca8a04", color: "#92400e", backgroundColor: "transparent" }}
          >
            Order ID: {orderId}
          </span>
          <span
            className="text-sm font-semibold px-4 py-1.5 rounded-full"
            style={{ backgroundColor: "#fef08a", color: "#713f12" }}
          >
            Order Status: Processing
          </span>
        </div>

        {/* Email note */}
        <p className="text-xs text-gray-600 mb-6 leading-relaxed">
          We've sent your order details to{" "}
          <a href={`mailto:${email}`} className="font-medium underline" style={{ color: "#6426E1" }}>
            {email}
          </a>
          .<br />
          You'll receive updates as your order progresses.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleTrack}
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-white tracking-wide transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "#6426E1" }}
          >
            TRACK ORDER
          </button>
          <button
            onClick={handleDashboard}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Go To Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessModal;