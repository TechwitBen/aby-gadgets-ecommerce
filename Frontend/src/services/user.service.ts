import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/v1/user",
  withCredentials: true,
});

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserAddress {
  _id:         string;
  label:       string;
  full_name:   string;
  phone:       string;
  street:      string;
  city:        string;
  state:       string;
  country:     string;
  postal_code: string;
  isDefault:   boolean;
}

export interface UserProfile {
  _id:          string;
  username:     string;
  email:        string;
  name?:        string;
  phone?:       string;
  profilePhoto?: string;
  role:         string;
  addresses:    UserAddress[];
  notificationPreferences?: {
    orderUpdates:       boolean;
    emailNotifications: boolean;
    paymentAlerts:      boolean;
  };
  createdAt:    string;
}

export interface NotificationPreferences {
  orderUpdates:       boolean;
  emailNotifications: boolean;
  paymentAlerts:      boolean;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const userService = {
  /** GET /user/profile */
  getProfile: () =>
    api.get<UserProfile>("/profile").then((r) => r.data),

  /** PATCH /user/profile */
  updateProfile: (payload: { name?: string; phone?: string; profilePhoto?: string }) =>
    api.patch<UserProfile>("/profile", payload).then((r) => r.data),

  /** PATCH /user/change-password */
  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    api.patch<{ message: string }>("/change-password", payload).then((r) => r.data),

  // ── Addresses ──────────────────────────────────────────────────────────────

  /** GET /user/addresses */
  getAddresses: () =>
    api.get<UserAddress[]>("/addresses").then((r) => r.data),

  /** POST /user/addresses */
  addAddress: (payload: Omit<UserAddress, "_id">) =>
    api.post<UserAddress[]>("/addresses", payload).then((r) => r.data),

  /** PUT /user/addresses/:addrId */
  updateAddress: (addrId: string, payload: Partial<Omit<UserAddress, "_id">>) =>
    api.put<UserAddress[]>(`/addresses/${addrId}`, payload).then((r) => r.data),

  /** DELETE /user/addresses/:addrId */
  deleteAddress: (addrId: string) =>
    api.delete<UserAddress[]>(`/addresses/${addrId}`).then((r) => r.data),

  /** PATCH /user/addresses/:addrId/default */
  setDefaultAddress: (addrId: string) =>
    api.patch<UserAddress[]>(`/addresses/${addrId}/default`).then((r) => r.data),

  // ── Notification Preferences ───────────────────────────────────────────────

  /** GET /user/notification-preferences */
  getNotificationPreferences: () =>
    api.get<NotificationPreferences>("/notification-preferences").then((r) => r.data),

  /** PATCH /user/notification-preferences */
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) =>
    api.patch<NotificationPreferences>("/notification-preferences", prefs).then((r) => r.data),
};