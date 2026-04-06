import { useState } from "react";
import { X, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ordersData, orderStatuses, paymentStatuses } from "@/pages/admin/data/mockData";

interface OrderDetailModalProps {
  order: typeof ordersData[0] | null;
  open: boolean;
  onClose: () => void;
  /** Called with the order ID when the admin confirms deletion inside this modal */
  onDelete?: (orderId: string) => void;
}

export const OrderDetailModal = ({ order, open, onClose, onDelete }: OrderDetailModalProps) => {
  const [orderStatus, setOrderStatus] = useState(order?.orderStatus || "Processing");
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus || "Awaiting Confirmation");
  const [internalNote, setInternalNote] = useState("");
  const [savedNote, setSavedNote] = useState(order?.internalNote || "");
  const [orderDropdownOpen, setOrderDropdownOpen] = useState(false);
  const [paymentDropdownOpen, setPaymentDropdownOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Inline delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!open || !order) return null;

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  const handleSave = () => {
    if (internalNote.trim()) setSavedNote(internalNote.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 1800);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    onDelete?.(order.id);
  };

  const totalItems = order.items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white text-gray-900 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto relative shadow-2xl">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-800">{order.id}</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">{order.date}</span>

            {/* Delete button */}
            <button
              onClick={handleDeleteClick}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
              Delete
            </button>

            {/* Save button */}
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                saveSuccess
                  ? "bg-green-500 text-white"
                  : "bg-violet-600 text-white hover:bg-violet-700"
              }`}
            >
              <Save size={14} />
              {saveSuccess ? "Saved!" : "Save"}
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <X size={18} />
        </button>

        {/* ── Inline Delete Confirmation Banner ── */}
        {showDeleteConfirm && (
          <div className="mx-5 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-sm text-red-700">
              Delete order <span className="font-semibold">{order.id}</span>? This cannot be undone.
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="text-xs text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash2 size={12} />
                Confirm Delete
              </button>
            </div>
          </div>
        )}

        {/* ── Body ── */}
        <div className="px-5 py-5 space-y-6">

          {/* Customer Details */}
          <section>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Customer Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Customer Name</label>
                <div className="bg-violet-50 rounded-xl px-3 py-2.5 text-sm text-gray-800">{order.name}</div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Customer Phone Number</label>
                <div className="bg-violet-50 rounded-xl px-3 py-2.5 text-sm text-gray-800">{order.phone}</div>
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs text-gray-400 mb-1 block">Address</label>
              <div className="bg-violet-50 rounded-xl px-3 py-2.5 text-sm text-gray-800">{order.address}</div>
            </div>
          </section>

          {/* Order Details + Update Order Status */}
          <section className="grid grid-cols-2 gap-6">
            {/* Left – items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800">Order Details</h3>
                <span className="text-xs text-gray-400">Total Item: {totalItems}</span>
              </div>

              <div className="space-y-3">
                {order.items.length === 0 ? (
                  <p className="text-xs text-gray-400">No items in this order.</p>
                ) : (
                  order.items.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-100 rounded-xl p-3 flex gap-3 bg-white shadow-sm"
                    >
                      <div className="w-16 h-16 bg-violet-50 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-2xl">{item.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-gray-900">{item.name}</span>
                          {item.tag && (
                            <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                              {item.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 leading-snug line-clamp-2">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-1">Price {formatPrice(item.price)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-xs font-medium text-gray-700">
                          {item.quantity}
                        </div>
                        <span className="text-[10px] text-gray-400">Subtotal</span>
                        <span className="text-sm font-semibold text-gray-800">{formatPrice(item.subtotal)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right – order status dropdown */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Update Order Status</h3>
              <div className="relative">
                <button
                  onClick={() => setOrderDropdownOpen(!orderDropdownOpen)}
                  className="w-full bg-violet-50 rounded-xl px-3 py-2.5 text-sm text-left flex justify-between items-center focus:outline-none hover:bg-violet-100 transition-colors"
                >
                  <span className="text-gray-800">{orderStatus}</span>
                  <span className="text-violet-500 text-xs">{orderDropdownOpen ? "▲" : "▼"}</span>
                </button>
                {orderDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-xl mt-1 shadow-lg z-20 overflow-hidden">
                    {orderStatuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setOrderStatus(status);
                          setOrderDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-violet-50 ${
                          status === orderStatus ? "text-violet-600 font-medium" : "text-gray-700"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Payment Info + Update Payment Status */}
          <section className="grid grid-cols-2 gap-6">
            {/* Left – payment info */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-sm font-semibold text-gray-800">Payment Info</h3>
                <span className="bg-violet-50 text-gray-700 text-xs px-3 py-1.5 rounded-lg font-medium">
                  {order.paymentMethod}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-gray-800 font-medium">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Delivery</span>
                  <span className="text-gray-800">
                    {typeof order.delivery === "number"
                      ? order.delivery === 0
                        ? "Free"
                        : formatPrice(order.delivery)
                      : order.delivery}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-100 pt-2 mt-1">
                  <span className="text-violet-600 font-semibold">Total</span>
                  <span className="text-violet-600 font-bold">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Right – payment status dropdown */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Update Payment Status</h3>
              <div className="relative">
                <button
                  onClick={() => setPaymentDropdownOpen(!paymentDropdownOpen)}
                  className="w-full bg-violet-50 rounded-xl px-3 py-2.5 text-sm text-left flex justify-between items-center focus:outline-none hover:bg-violet-100 transition-colors"
                >
                  <span className="text-gray-800">{paymentStatus}</span>
                  <span className="text-violet-500 text-xs">{paymentDropdownOpen ? "▲" : "▼"}</span>
                </button>
                {paymentDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-xl mt-1 shadow-lg z-20 overflow-hidden">
                    {paymentStatuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setPaymentStatus(status);
                          setPaymentDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-violet-50 ${
                          status === paymentStatus ? "text-violet-600 font-medium" : "text-gray-700"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Internal Note */}
          <section>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Internal Note</h3>
            <div className="bg-violet-50 rounded-xl px-3 py-2.5 min-h-[40px] text-sm text-gray-700 mb-2">
              {savedNote || <span className="text-gray-400">No internal notes</span>}
            </div>
            <input
              type="text"
              placeholder="Add new note (Only visible to staffs)"
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
            />
          </section>

        </div>
      </div>
    </div>
  );
};