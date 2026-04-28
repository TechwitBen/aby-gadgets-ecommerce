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
  Loader2,
  RefreshCw,
  ShoppingBag,
  Truck,
  MapPin,
  AlertCircle,
} from "lucide-react";
import {
  notificationService,
  type NotificationDoc,
  type NotificationType,
} from "@/services/notification.service";
import { useNotifications } from "@/contexts/NotificationContext";
import { useToast } from "@/hooks/use-toast";

// ── Time helpers ──────────────────────────────────────────────────────────────
const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
};

// ── Type config ───────────────────────────────────────────────────────────────
type FilterType = "all" | NotificationType;

const TYPE_CONFIG: Record<
  NotificationType,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    iconColor: string;
    Icon: React.FC<{ className?: string }>;
  }
> = {
  order: {
    label: "Orders",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-400",
    iconColor: "text-blue-500",
    Icon: Package,
  },
  payment: {
    label: "Payments",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-400",
    iconColor: "text-emerald-500",
    Icon: CreditCard,
  },
  account: {
    label: "Account",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-400",
    iconColor: "text-amber-500",
    Icon: User,
  },
  admin_message: {
    label: "Messages",
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-400",
    iconColor: "text-purple-500",
    Icon: MessageSquare,
  },
};

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "order", label: "Orders" },
  { key: "payment", label: "Payments" },
  { key: "account", label: "Account" },
  { key: "admin_message", label: "Messages" },
];

// ── Action button label ───────────────────────────────────────────────────────
const getActionLabel = (n: NotificationDoc): string | null => {
  if (n.actionType === "track_order") return "Track Order";
  if (n.actionType === "view_order") return "View Details";
  if (n.actionType === "view_orders") return "My Orders";
  return null;
};

const getActionPath = (n: NotificationDoc): string => {
  if (n.actionType === "track_order" && n.actionId)
    return `/track-order/${n.actionId}`;
  if (n.actionType === "view_order" && n.actionId)
    return `/track-order/${n.actionId}`;
  return "/orders";
};

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ filter }: { filter: FilterType }) => {
  const icons: Record<FilterType, string> = {
    all: "🔔",
    order: "📦",
    payment: "💳",
    account: "👤",
    admin_message: "💬",
  };
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center text-4xl mb-5 shadow-inner border border-gray-100">
        {icons[filter]}
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-1">
        No notifications yet
      </h3>
      <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
        {filter === "all"
          ? "You're all caught up! Notifications about your orders, payments, and account will appear here."
          : `No ${filter.replace("_", " ")} notifications yet.`}
      </p>
    </div>
  );
};

// ── Notification Card ─────────────────────────────────────────────────────────
const NotificationCard = ({
  notification,
  onRead,
  onDelete,
}: {
  notification: NotificationDoc;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const navigate = useNavigate();
  const cfg = TYPE_CONFIG[notification.type];
  const actionLabel = getActionLabel(notification);
  const actionPath = getActionPath(notification);

  const handleClick = () => {
    if (!notification.isRead) onRead(notification._id);
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.isRead) onRead(notification._id);
    navigate(actionPath);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative group flex gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer
        ${
          notification.isRead
            ? "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
            : `${cfg.bg} border-l-4 ${cfg.border} border-t border-r border-b border-gray-100 shadow-sm`
        }
      `}
    >
      {/* Unread dot */}
      {!notification.isRead && (
        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#6426E1]" />
      )}

      {/* Icon */}
      <div
        className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl
        ${notification.isRead ? "bg-gray-50" : cfg.bg}`}
      >
        {notification.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={`text-sm font-bold leading-tight ${notification.isRead ? "text-gray-700" : "text-gray-900"}`}
          >
            {notification.title}
          </h4>
          <span className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5">
            {timeAgo(notification.createdAt)}
          </span>
        </div>

        <p
          className={`text-xs mt-1 leading-relaxed ${notification.isRead ? "text-gray-400" : "text-gray-600"}`}
        >
          {notification.message}
        </p>

        {/* Action row */}
        {(actionLabel || notification.orderNumber) && (
          <div className="flex items-center gap-3 mt-3">
            {notification.orderNumber && (
              <span className="text-[10px] font-mono font-semibold px-2 py-1 bg-white border border-gray-200 rounded-lg text-gray-500">
                #{notification.orderNumber}
              </span>
            )}
            {actionLabel && (
              <button
                onClick={handleAction}
                className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl transition-all
                  ${
                    notification.isRead
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      : "bg-[#6426E1] text-white hover:bg-purple-700 shadow-sm"
                  }`}
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
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification._id);
        }}
        className="absolute top-3 right-8 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="flex gap-4 p-4 rounded-2xl border border-gray-100 bg-white animate-pulse">
    <div className="w-11 h-11 rounded-xl bg-gray-100 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-gray-100 rounded w-2/3" />
      <div className="h-2.5 bg-gray-100 rounded w-full" />
      <div className="h-2.5 bg-gray-100 rounded w-3/4" />
    </div>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const NotificationsPage = () => {
  const { toast } = useToast();
  const { refreshCount, resetCount } = useNotifications();

  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
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

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    refreshCount();
    try {
      await notificationService.markAsRead(id);
    } catch {
      // revert on failure
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: false } : n)),
      );
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

  const filtered =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === filter);

  const countByType = (type: NotificationType) =>
    notifications.filter((n) => n.type === type && !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #6426E1 0%, #4f1dbf 60%, #3b14a0 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #fff 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #fff 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-2xl mx-auto px-4 pt-8 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Notifications</h1>
                <p className="text-purple-200 text-xs mt-0.5">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => load(true)}
                disabled={isRefreshing}
                className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white/80 hover:bg-white/25 transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-white/15 text-white hover:bg-white/25 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter chips ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {FILTERS.map(({ key, label }) => {
              const typeCount =
                key !== "all"
                  ? countByType(key as NotificationType)
                  : unreadCount;
              const isActive = filter === key;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#6426E1] text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label}
                  {typeCount > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                        isActive
                          ? "bg-white/25 text-white"
                          : "bg-[#6426E1] text-white"
                      }`}
                    >
                      {typeCount}
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
            {[...Array(5)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-sm text-gray-500">{error}</p>
            <button
              onClick={() => load()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:border-purple-400 hover:text-purple-600"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <div className="space-y-2.5">
            {/* Date grouping */}
            {(() => {
              const today = new Date().toDateString();
              const yesterday = new Date(Date.now() - 86400000).toDateString();

              let lastGroup = "";
              return filtered.map((n) => {
                const date = new Date(n.createdAt).toDateString();
                const group =
                  date === today
                    ? "Today"
                    : date === yesterday
                      ? "Yesterday"
                      : new Date(n.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                        });
                const showHeader = group !== lastGroup;
                lastGroup = group;
                return (
                  <div key={n._id}>
                    {showHeader && (
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1 pt-3 pb-1">
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
