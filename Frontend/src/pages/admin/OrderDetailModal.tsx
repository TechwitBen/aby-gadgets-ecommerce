import { useState } from "react";
import { X, Save, Trash2, Loader2, Lock, Store, MapPin } from "lucide-react";
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
  type FulfillmentType,
} from "@/services/Order.service";
import { usePermission } from "@/contexts/PermissionContext";
import { PermissionToast } from "@/components/ui/PermissionToast";
import { usePermissionToast } from "@/hooks/usePermissionToast";
import { AdminMessagePanel } from "@/pages/admin/Adminmessagepanel";

// ── Human-readable ID helper ──────────────────────────────────────────────────
const displayOrderId = (order: OrderDoc): string =>
  order.order_number ?? `#${order._id.slice(-8).toUpperCase()}`;

// ── Extract user ID safely whether `order.user` is a string or populated object
// getAllOrders populates user as { _id, name, email }, so String() would give "[object Object]"
const extractUserId = (
  user: string | { _id: string; name?: string; email?: string },
): string => {
  if (typeof user === "string") return user;
  return user._id;
};

// ── Status options split by fulfillment type ──────────────────────────────────
const DELIVERY_STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunded",
];

const PICKUP_STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "ready_for_pickup",
  "collected",
  "cancelled",
  "refunded",
];

const PAYMENT_STATUS_OPTIONS = [
  "Awaiting Confirmation",
  "Confirmed",
  "Refunded",
] as const;

const isTerminalStatus = (s: string) =>
  ["delivered", "collected", "cancelled", "refunded"].includes(s);

interface OrderDetailModalProps {
  order: OrderDoc;
  open: boolean;
  onClose: () => void;
  onDelete?: (orderId: string) => void;
  onStatusUpdated?: (updated: OrderDoc) => void;
}

export const OrderDetailModal = ({
  order,
  open,
  onClose,
  onDelete,
  onStatusUpdated,
}: OrderDetailModalProps) => {
  const { isAdmin, can } = usePermission();
  const { message: permMsg, deny, clear: clearPerm } = usePermissionToast();

  const canUpdateStatus = isAdmin || can("order", "updateOrderStatus");
  const canAddNotes = isAdmin || can("order", "addInternalNotes");
  const canConfirmPayment = isAdmin || (can as any)("confirmPaymentStatus");
  const canViewContact = isAdmin || can("payments", "contactCustomers");
  const canDeleteOrder = isAdmin;

  const isPickup = order.fulfillment_type === "pickup";

  const [orderStatus, setOrderStatus] = useState<OrderStatus>(order.status);
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
  const orderStatusDisplay = ORDER_STATUS_LABELS[orderStatus] ?? orderStatus;
  const paymentMethodDisplay =
    PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method;

  // ── Safe user ID — handles both string and populated object ──────────────────
  const orderUserId = extractUserId(order.user as any);

  const isFullyCompleted =
    isTerminalStatus(order.status) && order.payment_status === "paid";

  const statusOptions = isPickup
    ? PICKUP_STATUS_OPTIONS
    : DELIVERY_STATUS_OPTIONS;

  const handleSave = async () => {
    if (!canUpdateStatus && !canConfirmPayment && !canAddNotes) {
      deny("You don't have permission to update this order.");
      return;
    }
    setSaveError(null);

    if (!isPickup && orderStatus === "delivered") {
      const paymentWillBePaid =
        PAYMENT_LABEL_TO_STATUS[paymentStatusLabel] === "paid" ||
        order.payment_status === "paid";
      if (!paymentWillBePaid) {
        setSaveError(
          "⚠ Payment must be confirmed before marking this order as Delivered.",
        );
        return;
      }
    }

    if (isPickup && orderStatus === "collected") {
      const paymentWillBePaid =
        PAYMENT_LABEL_TO_STATUS[paymentStatusLabel] === "paid" ||
        order.payment_status === "paid";
      if (!paymentWillBePaid) {
        setSaveError(
          "⚠ Payment must be confirmed before marking this order as Collected.",
        );
        return;
      }
    }

    setIsSaving(true);
    try {
      let updated = order;
      if (canUpdateStatus) {
        updated = await orderService.updateStatus(order._id, orderStatus);
      }
      if (canConfirmPayment) {
        const newPaymentStatus = PAYMENT_LABEL_TO_STATUS[paymentStatusLabel];
        if (newPaymentStatus && newPaymentStatus !== order.payment_status) {
          updated = await orderService.updatePaymentStatus(
            order._id,
            newPaymentStatus,
          );
        }
      }
      if (canAddNotes && internalNote.trim()) setSavedNote(internalNote.trim());
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

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white text-gray-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto relative shadow-2xl"
        onClick={() => {
          setOrderDDOpen(false);
          setPaymentDDOpen(false);
        }}
      >
        {permMsg && <PermissionToast message={permMsg} onClose={clearPerm} />}

        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Completed lock banner */}
        {isFullyCompleted && (
          <div className="mx-4 sm:mx-6 mt-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <Lock size={16} className="text-emerald-600 flex-shrink-0" />
            <p className="text-sm text-emerald-700 font-medium">
              This order is{" "}
              <span className="font-bold">
                {isPickup ? "Collected & Paid" : "Delivered & Paid"}
              </span>{" "}
              — statuses are locked to protect transaction records.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm sm:text-base font-bold text-gray-900 truncate max-w-[130px] sm:max-w-none font-mono">
              {displayOrderId(order)}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                isPickup
                  ? "bg-teal-100 text-teal-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {isPickup ? "🏪 Pickup" : "🚚 Delivery"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:block">
              {new Date(order.createdAt).toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            {canDeleteOrder && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="flex items-center gap-1 text-xs font-medium px-2 sm:px-4 py-2 rounded-lg border border-red-400 text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}

            {!isFullyCompleted && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                disabled={isSaving}
                className={`flex items-center gap-1 text-xs font-semibold px-2 sm:px-4 py-2 rounded-lg transition-colors disabled:opacity-60 ${
                  saveSuccess
                    ? "bg-green-500 text-white"
                    : "bg-violet-600 text-white hover:bg-violet-700"
                }`}
              >
                {isSaving ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Save size={13} />
                )}
                <span className="hidden sm:inline">
                  {isSaving ? "Saving…" : saveSuccess ? "Saved!" : "Save"}
                </span>
              </button>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-700 transition-colors p-1 z-10"
        >
          <X size={16} />
        </button>

        <div className="border-t border-gray-100" />

        {saveError && (
          <div className="mx-4 sm:mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">
            {saveError}
          </div>
        )}

        {showDeleteConfirm && (
          <div className="mx-4 sm:mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-red-700">
              Delete order{" "}
              <span className="font-semibold font-mono">
                {displayOrderId(order)}
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

        {/* Body */}
        <div className="px-4 sm:px-6 py-5 space-y-6">
          {/* ── Fulfillment Info Banner ── */}
          {isPickup ? (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Store size={15} className="text-teal-600" />
                <p className="text-sm font-bold text-teal-800">Pickup Order</p>
                {order.pickup_code && (
                  <span className="ml-auto font-mono font-black text-teal-700 tracking-widest text-sm">
                    {order.pickup_code}
                  </span>
                )}
              </div>
              {order.pickup_location && (
                <p className="text-xs text-teal-700">
                  📍 {order.pickup_location}
                </p>
              )}
              {order.pickup_code && (
                <p className="text-xs text-teal-600">
                  Customer must show pickup code{" "}
                  <strong>{order.pickup_code}</strong> when collecting.
                </p>
              )}
            </div>
          ) : order.delivery_city ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <MapPin size={15} className="text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-blue-500 font-semibold">
                  Delivery Zone
                </p>
                <p className="text-sm font-bold text-blue-800">
                  {order.delivery_city}
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-blue-500 font-semibold">
                  Delivery Fee
                </p>
                <p className="text-sm font-bold text-blue-800">
                  {order.shipping_fee === 0 ? "Free" : fmt(order.shipping_fee)}
                </p>
              </div>
            </div>
          ) : null}

          {/* ── Customer Details ── */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Customer Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
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
                  Phone Number
                </label>
                <div className="bg-violet-50 rounded-xl px-4 py-3 text-sm text-gray-800 font-medium">
                  {canViewContact ? (
                    (addr?.phone ?? "—")
                  ) : (
                    <span className="italic text-gray-400 text-xs">
                      Hidden — contact info permission required
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">
                {isPickup ? "Pickup — No Delivery Address" : "Delivery Address"}
              </label>
              <div className="bg-violet-50 rounded-xl px-4 py-3 text-sm text-gray-800 font-medium">
                {isPickup ? (
                  <span className="text-teal-600 font-semibold">
                    🏪 Customer will collect in-store
                  </span>
                ) : (
                  [addr?.street, addr?.city, addr?.state]
                    .filter(Boolean)
                    .join(", ") || "—"
                )}
              </div>
            </div>
          </section>

          {/* ── Order Items + Status ── */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900">
                  Order Details
                </h3>
                <span className="text-xs text-gray-400">
                  Total Items: {totalQty}
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
                  const specParts = [
                    variant?.storage,
                    variant?.ram,
                    condition ? `${condition.slice(0, 2)}...` : null,
                  ].filter(Boolean);

                  return (
                    <div
                      key={idx}
                      className="border border-gray-100 rounded-2xl p-3 flex gap-3 bg-white"
                    >
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={productName}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-xl">📦</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 leading-tight truncate">
                          {productName}
                        </p>
                        {condition && (
                          <span className="inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                            {condition}
                          </span>
                        )}
                        {specParts.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            {specParts.join(" • ")}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Price {fmt(item.unit_price)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end justify-between flex-shrink-0 gap-1">
                        <div className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">
                          {item.quantity}
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400">Subtotal</p>
                          <p className="text-sm font-bold text-gray-800">
                            {fmt(item.unit_price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Order Status Dropdown ── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-bold text-gray-900">
                  Update Order Status
                </h3>
                {(isFullyCompleted || !canUpdateStatus) && (
                  <Lock size={13} className="text-gray-400" />
                )}
              </div>

              {isFullyCompleted || !canUpdateStatus ? (
                <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm flex items-center justify-between">
                  <span
                    className={
                      isFullyCompleted
                        ? "font-medium text-emerald-700"
                        : "text-gray-600"
                    }
                  >
                    {ORDER_STATUS_LABELS[orderStatus] ?? orderStatus}
                  </span>
                  <div className="flex items-center gap-2">
                    {!canUpdateStatus && !isFullyCompleted && (
                      <span className="text-xs text-amber-500 italic">
                        View only
                      </span>
                    )}
                    <Lock size={14} className="text-gray-300" />
                  </div>
                </div>
              ) : (
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
                      {statusOptions.map((s) => {
                        const paymentWillBePaid =
                          PAYMENT_LABEL_TO_STATUS[paymentStatusLabel] ===
                            "paid" || order.payment_status === "paid";
                        const isBlocked =
                          (s === "delivered" || s === "collected") &&
                          !paymentWillBePaid;

                        return (
                          <button
                            key={s}
                            onClick={() => {
                              if (isBlocked) return;
                              setOrderStatus(s);
                              setOrderDDOpen(false);
                            }}
                            title={
                              isBlocked ? "Confirm payment first" : undefined
                            }
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                              isBlocked
                                ? "opacity-40 cursor-not-allowed bg-gray-50"
                                : "hover:bg-violet-50"
                            } ${s === orderStatus ? "text-violet-600 font-medium" : "text-gray-700"}`}
                          >
                            <span>{ORDER_STATUS_LABELS[s] ?? s}</span>
                            {isBlocked && (
                              <span className="ml-2 text-[10px] text-red-400">
                                (confirm payment first)
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Quick-action buttons for pickup orders */}
              {isPickup && !isFullyCompleted && canUpdateStatus && (
                <div className="mt-3 flex gap-2">
                  {orderStatus !== "ready_for_pickup" && (
                    <button
                      onClick={() => setOrderStatus("ready_for_pickup")}
                      className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg bg-teal-50 border border-teal-300 text-teal-700 hover:bg-teal-100 transition-colors"
                    >
                      ✅ Mark Ready for Pickup
                    </button>
                  )}
                  {orderStatus !== "collected" && (
                    <button
                      onClick={() => {
                        const paymentOk =
                          PAYMENT_LABEL_TO_STATUS[paymentStatusLabel] ===
                            "paid" || order.payment_status === "paid";
                        if (!paymentOk) {
                          setSaveError(
                            "⚠ Confirm payment before marking as Collected.",
                          );
                          return;
                        }
                        setOrderStatus("collected");
                      }}
                      className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      📦 Mark Collected
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* ── Payment Info + Status ── */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-sm font-bold text-gray-900">
                  Payment Info
                </h3>
                <span className="text-xs font-medium px-3 py-1 rounded-lg bg-gray-100 text-gray-600">
                  {paymentMethodDisplay}
                </span>
                {order.payment_method === "pod" && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    {isPickup ? "Pay at Pickup" : "Cash on Delivery"}
                  </span>
                )}
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-gray-800 font-medium">
                    {fmt(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">
                    {isPickup ? "Pickup Fee" : "Delivery Fee"}
                  </span>
                  <span
                    className={`font-medium ${order.shipping_fee === 0 ? "text-green-600" : "text-gray-800"}`}
                  >
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

            {/* ── Payment Status Dropdown ── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-bold text-gray-900">
                  Update Payment Status
                </h3>
                {(isFullyCompleted ||
                  !canConfirmPayment ||
                  order.payment_method === "paystack") && (
                  <Lock size={13} className="text-gray-400" />
                )}
              </div>

              {order.payment_method === "paystack" ? (
                <div className="space-y-2">
                  <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm flex items-center justify-between">
                    <span
                      className={
                        order.payment_status === "paid"
                          ? "font-medium text-emerald-700"
                          : "text-gray-600"
                      }
                    >
                      {PAYMENT_STATUS_LABELS[order.payment_status] ??
                        "Awaiting Confirmation"}
                    </span>
                    <Lock size={14} className="text-gray-300" />
                  </div>
                  <p className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    💳 This is a Paystack payment — status updates automatically
                    via webhook. Manual changes are disabled to keep payment
                    records in sync.
                  </p>
                </div>
              ) : isFullyCompleted || !canConfirmPayment ? (
                <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm flex items-center justify-between">
                  <span
                    className={
                      isFullyCompleted
                        ? "font-medium text-emerald-700"
                        : "text-gray-600"
                    }
                  >
                    {isFullyCompleted ? "Confirmed" : paymentStatusLabel}
                  </span>
                  <div className="flex items-center gap-2">
                    {!canConfirmPayment && !isFullyCompleted && (
                      <span className="text-xs text-amber-500 italic">
                        View only
                      </span>
                    )}
                    <Lock size={14} className="text-gray-300" />
                  </div>
                </div>
              ) : (
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
              )}

              {order.payment_method === "pod" &&
                !isFullyCompleted &&
                canConfirmPayment && (
                  <p className="text-xs text-amber-600 mt-2">
                    💡{" "}
                    {isPickup
                      ? "For pickup orders, confirm payment once the customer has paid at the store."
                      : "For cash payments, confirm here once you've received the money."}
                  </p>
                )}
            </div>
          </section>

          {/* ── Internal Note ── */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 mb-2">
              Internal Note
            </h3>
            {savedNote && (
              <div className="bg-violet-50 rounded-xl px-4 py-3 text-sm text-gray-700 mb-2">
                {savedNote}
              </div>
            )}
            <input
              type="text"
              placeholder={
                !canAddNotes
                  ? "You don't have permission to add notes"
                  : isFullyCompleted
                    ? "Order completed — notes are read-only"
                    : "Add new note (Only visible to staff)"
              }
              value={internalNote}
              readOnly={!canAddNotes || isFullyCompleted}
              onChange={(e) => {
                if (!canAddNotes) {
                  deny(
                    "You don't have permission to add internal notes. Ask your admin to enable 'Add Internal Notes'.",
                  );
                  return;
                }
                if (!isFullyCompleted) setInternalNote(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canAddNotes && !isFullyCompleted) {
                  e.stopPropagation();
                  handleSave();
                }
              }}
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition ${
                !canAddNotes || isFullyCompleted
                  ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white border-gray-200 placeholder:text-gray-300"
              }`}
            />
            {!canAddNotes && (
              <p className="text-xs text-amber-600 mt-1.5">
                Ask your admin to enable the "Add Internal Notes" permission.
              </p>
            )}
          </section>

          {/* ── Admin Message Panel ── */}
          {isAdmin && (
            <AdminMessagePanel
              userId={orderUserId}
              orderId={order._id}
              orderNumber={order.order_number}
            />
          )}
        </div>
      </div>
    </div>
  );
};
