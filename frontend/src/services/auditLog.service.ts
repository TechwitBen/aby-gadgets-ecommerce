import axios from "axios";

export interface AuditLog {
  _id: string;
  action: string;
  performedBy: { _id: string; name: string; username: string; email: string; role: string } | null;
  targetId: string | null;
  details: Record<string, unknown>;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  UPDATE_ORDER_STATUS:       "Updated order status",
  UPDATE_PAYMENT_STATUS:     "Updated payment status",
  CREATE_STAFF:              "Created staff member",
  UPDATE_STAFF_PERMISSIONS:  "Updated staff permissions",
  ACTIVATE_STAFF:            "Activated staff member",
  DEACTIVATE_STAFF:          "Deactivated staff member",
  DELETE_STAFF:              "Deleted staff member",
  UPDATE_SETTINGS:           "Updated settings",
  DELETE_ORDER:              "Deleted order",
  PROMOTE_ADMIN:             "Promoted user to admin",
};

export const getActionLabel = (action: string) =>
  ACTION_LABELS[action] ?? action.replace(/_/g, " ").toLowerCase();

// ── Axios instance with credentials ──────────────────────────────────────────
const auditApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  withCredentials: true,
});

export const auditService = {
  getLogs: async (page = 1): Promise<{ logs: AuditLog[]; total: number }> => {
    const { data } = await auditApi.get(`/audit?page=${page}&limit=50`);

    if (!data.success) throw new Error(data.error ?? "Failed to fetch audit logs.");

    return { logs: data.logs ?? [], total: data.total ?? 0 };
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await auditApi.get("/audit/unread");

    if (!data.success) throw new Error(data.error ?? "Failed to fetch count.");

    return data.count ?? 0;
  },
};