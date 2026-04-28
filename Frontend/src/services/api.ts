import axios from "axios";
import type { StaffPermissions } from "@/services/staff.service";

const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  withCredentials: true,
});

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  name?: string;
  phone?: string;
  profilePhoto?: string;
  provider?: string;
  role: "user" | "admin" | "staff";
  staffStatus?: "active" | "inactive";
  staffPermissions?: StaffPermissions;
  notificationPreferences?: {
    orderUpdates: boolean;
    emailNotifications: boolean;
    paymentAlerts: boolean;
  };
}

export interface BackendUser {
  _id: string;
  username: string;
  email: string;
  name?: string;
  phone?: string;
  profilePhoto?: string;
  provider?: string;
  role: "user" | "admin" | "staff";
  createdAt: string;
  updatedAt: string;
  staffStatus?: "active" | "inactive";
  staffPermissions?: StaffPermissions;
  notificationPreferences?: {
    orderUpdates: boolean;
    emailNotifications: boolean;
    paymentAlerts: boolean;
  };
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}
interface LoginData {
  username: string;
  password: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: BackendUser;
  user?: BackendUser;
}

interface UsersResponse {
  success: boolean;
  users: BackendUser[];
}

// ── Mapper ────────────────────────────────────────────────────────────────────
export const toAuthUser = (raw: BackendUser): AuthUser => ({
  id: raw._id,
  username: raw.username ?? "",
  email: raw.email,
  name: raw.name,
  phone: raw.phone,
  profilePhoto: raw.profilePhoto,
  provider: raw.provider,
  role: raw.role ?? "user",
  staffStatus: raw.staffStatus,
  staffPermissions: raw.staffPermissions,
  notificationPreferences: raw.notificationPreferences,
});

// ── Auth API ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register: async (data: RegisterData): Promise<ApiResponse> => {
    const res = await api.post<ApiResponse>("/auth/register", data);
    return res.data;
  },

  login: async (data: LoginData): Promise<ApiResponse> => {
    const res = await api.post<ApiResponse>("/auth/login", data);
    return res.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const res = await api.post<ApiResponse>("/auth/logout");
    return res.data;
  },

  getCurrentUser: async (): Promise<AuthUser | null> => {
    try {
      const res = await api.get<ApiResponse>("/auth/me");
      return res.data.user ? toAuthUser(res.data.user) : null;
    } catch {
      return null;
    }
  },

  forgotPassword: async (email: string): Promise<ApiResponse> => {
    const res = await api.post<ApiResponse>("/auth/forgot-password", { email });
    return res.data;
  },

  resetPassword: async (
    token: string,
    password: string,
  ): Promise<ApiResponse> => {
    const res = await api.post<ApiResponse>(`/auth/reset-password/${token}`, {
      password,
    });
    return res.data;
  },

  promoteToAdmin: async (email: string): Promise<ApiResponse> => {
    const res = await api.post<ApiResponse>("/auth/promote", { email });
    return res.data;
  },
};

// ── Users API ─────────────────────────────────────────────────────────────────
export const usersAPI = {
  getAll: async (): Promise<BackendUser[]> => {
    const res = await api.get<UsersResponse>("/auth/users");
    return Array.isArray(res.data.users) ? res.data.users : [];
  },

  getAdmins: async (): Promise<BackendUser[]> => {
    const all = await usersAPI.getAll();
    return all.filter((u) => u.role === "admin");
  },

  deleteUser: async (id: string): Promise<ApiResponse> => {
    const res = await api.delete<ApiResponse>(`/auth/users/${id}`);
    return res.data;
  },
};
