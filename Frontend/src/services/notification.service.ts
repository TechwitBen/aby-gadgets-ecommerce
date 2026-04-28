import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/v1/notifications",
  withCredentials: true,
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type NotificationType = "order" | "payment" | "account" | "admin_message";
export type ActionType       = "view_order" | "track_order" | "view_orders" | null;

export interface NotificationDoc {
  _id:          string;
  type:         NotificationType;
  title:        string;
  message:      string;
  icon:         string;
  isRead:       boolean;
  orderId?:     string;
  orderNumber?: string;
  actionType?:  ActionType;
  actionId?:    string;
  data?:        Record<string, unknown>;
  createdAt:    string;
  updatedAt:    string;
}

export interface NotificationListResponse {
  notifications: NotificationDoc[];
  total:         number;
  unreadCount:   number;
  page:          number;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const notificationService = {
  /** GET /notifications */
  getNotifications: (params?: { page?: number; limit?: number; type?: string }) =>
    api.get<NotificationListResponse>("", { params }).then((r) => r.data),

  /** GET /notifications/unread-count */
  getUnreadCount: () =>
    api.get<{ count: number }>("/unread-count").then((r) => r.data.count),

  /** PATCH /notifications/:id/read */
  markAsRead: (id: string) =>
    api.patch<NotificationDoc>(`/${id}/read`).then((r) => r.data),

  /** PATCH /notifications/read-all */
  markAllAsRead: () =>
    api.patch<{ message: string }>("/read-all").then((r) => r.data),

  /** DELETE /notifications/:id */
  deleteNotification: (id: string) =>
    api.delete<{ message: string }>(`/${id}`).then((r) => r.data),

  /** POST /notifications/admin-message  (admin only) */
  sendAdminMessage: (payload: {
    userId:       string;
    title:        string;
    message:      string;
    orderId?:     string;
    orderNumber?: string;
  }) =>
    api.post<{ message: string }>("/admin-message", payload).then((r) => r.data),
};