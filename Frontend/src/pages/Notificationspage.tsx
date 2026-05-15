import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Trash2,
  Package,
  CreditCard,
  User,
  MessageSquare,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  ShoppingBag,
  CheckCircle2,
  Truck,
  Store,
  XCircle,
  RotateCcw,
  Clock,
  Shield,
  Mail,
  Key,
} from "lucide-react";
import {
  notificationService,
  type NotificationDoc,
  type NotificationType,
} from "@/services/Notification.service";
import { useNotifications } from "@/contexts/Notificationcontext";
import { useToast } from "@/hooks/use-toast";

// ── Brand colour ──────────────────────────────────────────────────────────────
const BRAND        = "#6426E1";
const BRAND_LIGHT  = "#F0EBFF";
const BRAND_BORDER = "#D9CAFF";

// ── Icon type — includes style so Lucide icons accept both props ──────────────
type IconProps = { className?: string; style?: React.CSSProperties };

// ── Icon Mapping ──────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.FC<IconProps>> = {
  "order-placed":       ShoppingBag,
  "order-confirmed":    CheckCircle2,
  "order-shipped":      Truck,
  "order-delivery":     Truck,
  "order-delivered":    CheckCircle2,
  "order-pickup-ready": Store,
  "order-collected":    CheckCircle2,
  "order-cancelled":    XCircle,
  "order-refunded":     RotateCcw,
  "payment-success":    CreditCard,
  "payment-pending":    Clock,
  "payment-failed":     XCircle,
  "payment-cancelled":  AlertCircle,
  "payment-refunded":   RotateCcw,
  "account-security":   Shield,
  "account-email":      Mail,
  "account-profile":    User,
  "account-login":      Key,
  "admin-message":      Bell,
  "bell":               Bell,
};

// ── Time helpers ──────────────────────────────────────────────────────────────
const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

type FilterType = "all" | NotificationType;

const TYPE_CONFIG: Record<
  NotificationType,
  { label: string; color: string; bg: string; dot: string; Icon: React.FC<IconProps> }
> = {
  order: {
    label: "Orders",
    color: "text-blue-600",
    bg: "bg-blue-50",
    dot: "bg-blue-500",
    Icon: Package,
  },
  payment: {
    label: "Payments",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    dot: "bg-emerald-500",
    Icon: CreditCard,
  },
  account: {
    label: "Account",
    color: "text-amber-600",
    bg: "bg-amber-50",
    dot: "bg-amber-500",
    Icon: User,
  },
  admin_message: {
    label: "Messages",
    color: "text-violet-600",
    bg: "bg-violet-50",
    dot: "bg-violet-500",
    Icon: MessageSquare,
  },
};

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all",           label: "All"      },
  { key: "order",         label: "Orders"   },
  { key: "payment",       label: "Payments" },
  { key: "account",       label: "Account"  },
  { key: "admin_message", label: "Messages" },
];

const getActionLabel = (n: NotificationDoc): string | null => {
  if (n.actionType === "track_order")  return "Track Order";
  if (n.actionType === "view_order")   return "View Details";
  if (n.actionType === "view_orders")  return "My Orders";
  return null;
};

const getActionPath = (n: NotificationDoc): string => {
  if (n.actionType === "track_order" && n.actionId) return `/track-order/${n.actionId}`;
  if (n.actionType === "view_order"  && n.actionId) return `/track-order/${n.actionId}`;
  return "/orders";
};

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ filter }: { filter: FilterType }) => {
  const icons: Record<FilterType, string> = {
    all: "🔔", order: "📦", payment: "💳", account: "👤", admin_message: "💬",
  };
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5 shadow-inner"
        style={{ backgroundColor: BRAND_LIGHT }}
      >
        {icons[filter]}
      </div>
      <h3 className="text-base font-bold text-gray-800 mb-1.5">No notifications yet</h3>
      <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
        {filter === "all"
          ? "You're all caught up! Updates about your orders, payments, and account will appear here."
          : `No ${filter.replace("_", " ")} notifications yet.`}
      </p>
    </div>
  );
};

// ── Notification Card ─────────────────────────────────────────────────────────
const NotificationCard = ({
  notification, onRead, onDelete,
}: {
  notification: NotificationDoc;
  onRead:   (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const navigate      = useNavigate();
  const actionLabel   = getActionLabel(notification);
  const actionPath    = getActionPath(notification);
  const IconComponent = ICON_MAP[notification.icon] ?? Bell;

  return (
    <div
      onClick={() => { if (!notification.isRead) onRead(notification._id); }}
      className="group relative flex gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all duration-200"
      style={
        notification.isRead
          ? { background: "#fff", borderColor: "#f3f4f6" }
          : {
              background: "#fff",
              borderLeft: `3px solid ${BRAND}`,
              borderTop: "1px solid #f3f4f6",
              borderRight: "1px solid #f3f4f6",
              borderBottom: "1px solid #f3f4f6",
              boxShadow: "0 1px 4px rgba(100,38,225,0.07)",
            }
      }
    >
      {/* Unread dot */}
      {!notification.isRead && (
        <span
          className="absolute top-4 right-4 w-2 h-2 rounded-full"
          style={{ backgroundColor: BRAND }}
        />
      )}

      {/* Icon */}
      <div
        className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center"
        style={notification.isRead ? { backgroundColor: "#f9fafb" } : { backgroundColor: BRAND_LIGHT }}
      >
        {/* IconProps now includes style — no TS error */}
        <IconComponent
          className="w-5 h-5"
          style={notification.isRead ? { color: "#9ca3af" } : { color: BRAND }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={`text-sm font-semibold leading-snug ${
              notification.isRead ? "text-gray-600" : "text-gray-900"
            }`}
          >
            {notification.title}
          </h4>
          <span className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5 whitespace-nowrap">
            {timeAgo(notification.createdAt)}
          </span>
        </div>

        <p
          className={`text-xs mt-1 leading-relaxed ${
            notification.isRead ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {notification.message}
        </p>

        {(actionLabel || notification.orderNumber) && (
          <div className="flex items-center gap-2.5 mt-3 flex-wrap">
            {notification.orderNumber && (
              <span className="text-[10px] font-mono font-semibold px-2 py-1 bg-gray-100 border border-gray-200 rounded-lg text-gray-500">
                #{notification.orderNumber}
              </span>
            )}
            {actionLabel && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!notification.isRead) onRead(notification._id);
                  navigate(actionPath);
                }}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
                style={
                  notification.isRead
                    ? { backgroundColor: "#f3f4f6", color: "#4b5563" }
                    : { backgroundColor: BRAND, color: "#fff" }
                }
              >
                {actionLabel}
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete on hover */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(notification._id); }}
        className="absolute top-3 right-7 sm:right-8 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="flex gap-3 p-4 rounded-2xl border border-gray-100 bg-white animate-pulse">
    <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
    <div className="flex-1 space-y-2 pt-1">
      <div className="h-3 bg-gray-100 rounded w-2/3" />
      <div className="h-2.5 bg-gray-100 rounded w-full" />
      <div className="h-2.5 bg-gray-100 rounded w-3/4" />
    </div>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const NotificationsPage = () => {
  const { toast }                        = useToast();
  const { refreshCount, resetCount }     = useNotifications();

  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [filter, setFilter]               = useState<FilterType>("all");
  const [isLoading, setIsLoading]         = useState(true);
  const [isRefreshing, setIsRefreshing]   = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else         setIsRefreshing(true);
    setError(null);
    try {
      const res = await notificationService.getNotifications({ limit: 50 });
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch {
      setError("Failed to load notifications. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    refreshCount();
    try {
      await notificationService.markAsRead(id);
    } catch {
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: false } : n)));
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    resetCount();
    try {
      await notificationService.markAllAsRead();
    } catch {
      toast({ variant: "destructive", title: "Failed to mark all as read" });
      load(true);
    }
  };

  const handleDelete = async (id: string) => {
    const deleted = notifications.find((n) => n._id === id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (deleted && !deleted.isRead) {
      setUnreadCount((c) => Math.max(0, c - 1));
      refreshCount();
    }
    try {
      await notificationService.deleteNotification(id);
    } catch {
      toast({ variant: "destructive", title: "Failed to delete notification" });
      load(true);
    }
  };

  const filtered    = filter === "all" ? notifications : notifications.filter((n) => n.type === filter);
  const countByType = (type: NotificationType) =>
    notifications.filter((n) => n.type === type && !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50/60">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
                style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #8B5CF6 100%)` }}
              >
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                  Notifications
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  {unreadCount > 0
                    ? `${unreadCount} unread message${unreadCount !== 1 ? "s" : ""}`
                    : "You're all caught up"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => load(true)}
                disabled={isRefreshing}
                className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors"
                  style={{ backgroundColor: BRAND_LIGHT, color: BRAND, borderColor: BRAND_BORDER }}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Mobile mark-all */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="sm:hidden mt-3 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors"
              style={{ backgroundColor: BRAND_LIGHT, color: BRAND, borderColor: BRAND_BORDER }}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* ── Filter chips ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {FILTERS.map(({ key, label }) => {
              const count    = key !== "all" ? countByType(key as NotificationType) : unreadCount;
              const isActive = filter === key;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all"
                  style={
                    isActive
                      ? { backgroundColor: BRAND, color: "#fff" }
                      : { backgroundColor: "#f3f4f6", color: "#4b5563" }
                  }
                >
                  {label}
                  {count > 0 && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                      style={
                        isActive
                          ? { backgroundColor: "rgba(255,255,255,0.25)", color: "#fff" }
                          : { backgroundColor: BRAND, color: "#fff" }
                      }
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-2xl mx-auto px-4 py-5">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-sm text-gray-500">{error}</p>
            <button
              onClick={() => load()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:border-gray-300"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <div className="space-y-2.5">
            {(() => {
              const today     = new Date().toDateString();
              const yesterday = new Date(Date.now() - 86400000).toDateString();
              let lastGroup   = "";
              return filtered.map((n) => {
                const date  = new Date(n.createdAt).toDateString();
                const group =
                  date === today
                    ? "Today"
                    : date === yesterday
                      ? "Yesterday"
                      : new Date(n.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric", month: "long",
                        });
                const showHeader = group !== lastGroup;
                lastGroup = group;
                return (
                  <div key={n._id}>
                    {showHeader && (
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1 pt-4 pb-1.5">
                        {group}
                      </p>
                    )}
                    <NotificationCard
                      notification={n}
                      onRead={handleMarkRead}
                      onDelete={handleDelete}
                    />
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;