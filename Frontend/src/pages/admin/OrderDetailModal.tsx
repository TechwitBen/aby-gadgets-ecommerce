import { useState } from "react";
import { X, Save, Trash2, Loader2 } from "lucide-react";
import React from "react";
import {
  orderService,
  isPopulatedProduct,
  isPopulatedVariant,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_LABEL_TO_STATUS,
  PAYMENT_METHOD_LABELS,
  type OrderDoc,
  type OrderStatus,
  type PaymentStatus,
} from "@/services/Order.service";

// ── Dropdown options ──────────────────────────────────────────────────────────

const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

const PAYMENT_STATUS_OPTIONS = [
  "Awaiting Confirmation",
  "Confirmed",
  "Refunded",
] as const;

// ── Props ─────────────────────────────────────────────────────────────────────

interface OrderDetailModalProps {
  order: OrderDoc;
  open: boolean;
  onClose: () => void;
  onDelete?: (orderId: string) => void;
  onStatusUpdated?: (updated: OrderDoc) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
export const OrderDetailModal = ({
  order,
  open,
  onClose,
  onDelete,
  onStatusUpdated,
}: OrderDetailModalProps) => {
  // ── Local state ─────────────────────────────────────────────────────────────
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(order.status);
  // paymentStatusLabel = the UI label ("Awaiting Confirmation" | "Confirmed" | "Refunded")
  const [paymentStatusLabel, setPaymentStatusLabel] = useState<string>(
    PAYMENT_STATUS_LABELS[order.payment_status] ?? "Awaiting Confirmation",
  );

  const [internalNote, setInternalNote] = useState("");
  const [savedNote, setSavedNote] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderDDOpen, setOrderDDOpen] = useState(false);
  const [paymentDDOpen, setPaymentDDOpen] = useState(false);

  if (!open) return null;

  const fmt = (n: number) => `₦${n.toLocaleString()}`;
  const addr = order.shipping_address;

  const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);

  // Display label for order status
  const orderStatusDisplay = ORDER_STATUS_LABELS[orderStatus] ?? orderStatus;

  // Payment method display label
  const paymentMethodDisplay =
    PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method;

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      // Always update order status
      let updated = await orderService.updateStatus(order._id, orderStatus);

      // Update payment status if it changed
      const newPaymentStatus = PAYMENT_LABEL_TO_STATUS[paymentStatusLabel];
      if (newPaymentStatus && newPaymentStatus !== order.payment_status) {
        updated = await orderService.updatePaymentStatus(
          order._id,
          newPaymentStatus,
        );
      }

      if (internalNote.trim()) setSavedNote(internalNote.trim());
      onStatusUpdated?.(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1800);
    } catch (err: any) {
      setSaveError(
        err.response?.data?.message || "Failed to save. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  // Close dropdowns when clicking elsewhere inside modal
  const handleModalClick = () => {
    setOrderDDOpen(false);
    setPaymentDDOpen(false);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white text-gray-900 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto relative shadow-2xl"
        onClick={handleModalClick}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-base font-bold text-gray-900">
            {order._id
              .slice(-13)
              .toUpperCase()
              .replace(/(.{3})(.{4})(.+)/, "Aby-$2-$3")}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              {new Date(order.createdAt).toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {/* Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg border border-red-400 text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} /> Delete
            </button>
            {/* Save */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              disabled={isSaving}
              className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60 ${
                saveSuccess
                  ? "bg-green-500 text-white"
                  : "bg-violet-600 text-white hover:bg-violet-700"
              }`}
            >
              {isSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {isSaving ? "Saving…" : saveSuccess ? "Saved!" : "Save"}
            </button>
          </div>
        </div>

        {/* Close X */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors p-1"
        >
          <X size={16} />
        </button>

        {/* Divider */}
        <div className="border-t border-gray-100 mx-0" />

        {/* ── Error / Delete banners ── */}
        {saveError && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {saveError}
          </div>
        )}

        {showDeleteConfirm && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-sm text-red-700">
              Delete order{" "}
              <span className="font-semibold">
                #{order._id.slice(-8).toUpperCase()}
              </span>
              ? This cannot be undone.
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="text-xs text-gray-500 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                  onDelete?.(order._id);
                }}
                className="text-xs text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash2 size={12} /> Confirm
              </button>
            </div>
          </div>
        )}

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-6">
          {/* ── Customer Details ── */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Customer Details
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">
                  Customer Name
                </label>
                <div className="bg-violet-50 rounded-xl px-4 py-3 text-sm text-gray-800 font-medium">
                  {addr?.full_name ?? "—"}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">
                  Customer Phone Number
                </label>
                <div className="bg-violet-50 rounded-xl px-4 py-3 text-sm text-gray-800 font-medium">
                  {addr?.phone ?? "—"}
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">
                Address
              </label>
              <div className="bg-violet-50 rounded-xl px-4 py-3 text-sm text-gray-800 font-medium">
                {[addr?.street, addr?.city, addr?.state]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </div>
            </div>
          </section>

          {/* ── Order Details + Update Order Status ── */}
          <section className="grid grid-cols-2 gap-6">
            {/* Left — items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900">
                  Order Details
                </h3>
                <span className="text-xs text-gray-400">
                  Total Item: {totalQty}
                </span>
              </div>

              <div className="space-y-3">
                {order.items.map((item, idx) => {
                  const product = isPopulatedProduct(item.product)
                    ? item.product
                    : null;
                  const variant = isPopulatedVariant(item.variant)
                    ? item.variant
                    : null;

                  const productName = product?.name ?? `Product ${idx + 1}`;
                  const productImage = product?.images?.[0];
                  const condition = product?.condition ?? null;

                  // Build spec string: storage • RAM • condition snippet
                  const specParts = [
                    variant?.storage,
                    variant?.ram,
                    condition ? `${condition.slice(0, 2)}...` : null,
                  ].filter(Boolean);
                  const specStr = specParts.join("•");

                  const itemPrice = item.unit_price;
                  const itemTotal = item.unit_price * item.quantity;

                  return (
                    <div
                      key={idx}
                      className="border border-gray-100 rounded-2xl p-3 flex gap-3 bg-white"
                    >
                      {/* Product thumbnail */}
                      <div className="w-14 h-14 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={productName}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-2xl">📦</span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 leading-tight">
                          {productName}
                        </p>

                        {/* Condition tag */}
                        {condition && (
                          <span className="inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                            {condition}
                          </span>
                        )}

                        {specStr && (
                          <p className="text-xs text-gray-400 mt-1 leading-snug">
                            {specStr}
                          </p>
                        )}

                        <p className="text-xs text-gray-500 mt-1">
                          Price {fmt(itemPrice)}
                        </p>
                      </div>

                      {/* Qty + Subtotal */}
                      <div className="flex flex-col items-end justify-between flex-shrink-0 gap-1">
                        <div className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">
                          {item.quantity}
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400">Subtotal</p>
                          <p className="text-sm font-bold text-gray-800">
                            {fmt(itemTotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right — Order status dropdown */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                Update Order Status
              </h3>
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => {
                    setOrderDDOpen(!orderDDOpen);
                    setPaymentDDOpen(false);
                  }}
                  className="w-full bg-violet-50 rounded-xl px-4 py-3 text-sm text-left flex justify-between items-center hover:bg-violet-100 transition-colors"
                >
                  <span className="text-gray-800">{orderStatusDisplay}</span>
                  <span className="text-violet-500 text-xs">▼</span>
                </button>
                {orderDDOpen && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-xl mt-1 shadow-xl z-30 overflow-hidden">
                    {ORDER_STATUS_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setOrderStatus(s);
                          setOrderDDOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-violet-50 ${
                          s === orderStatus
                            ? "text-violet-600 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {ORDER_STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── Payment Info + Update Payment Status ── */}
          <section className="grid grid-cols-2 gap-6">
            {/* Left — payment amounts */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-sm font-bold text-gray-900">
                  Payment Info
                </h3>
                <span className="text-xs font-medium px-3 py-1 rounded-lg bg-gray-100 text-gray-600">
                  {paymentMethodDisplay}
                </span>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-gray-800 font-medium">
                    {fmt(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Delivery</span>
                  <span className="text-gray-800 font-medium">
                    {order.shipping_fee === 0
                      ? "Free"
                      : fmt(order.shipping_fee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                  <span className="text-violet-600 font-bold">Total</span>
                  <span className="text-violet-600 font-bold text-base">
                    {fmt(order.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right — payment status dropdown */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                Update Payment Status
              </h3>
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => {
                    setPaymentDDOpen(!paymentDDOpen);
                    setOrderDDOpen(false);
                  }}
                  className="w-full bg-violet-50 rounded-xl px-4 py-3 text-sm text-left flex justify-between items-center hover:bg-violet-100 transition-colors"
                >
                  <span className="text-gray-800">{paymentStatusLabel}</span>
                  <span className="text-violet-500 text-xs">▼</span>
                </button>
                {paymentDDOpen && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-xl mt-1 shadow-xl z-30 overflow-hidden">
                    {PAYMENT_STATUS_OPTIONS.map((label) => (
                      <button
                        key={label}
                        onClick={() => {
                          setPaymentStatusLabel(label);
                          setPaymentDDOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-violet-50 ${
                          label === paymentStatusLabel
                            ? "text-violet-600 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── Internal Note ── */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 mb-2">
              Internal Note
            </h3>

            {/* Saved note display */}
            {savedNote && (
              <div className="bg-violet-50 rounded-xl px-4 py-3 text-sm text-gray-700 mb-2">
                {savedNote}
              </div>
            )}

            <input
              type="text"
              placeholder="Add new note (Only visible to staff)"
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.stopPropagation();
                  handleSave();
                }
              }}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
            />
          </section>
        </div>
      </div>
    </div>
  );
};
