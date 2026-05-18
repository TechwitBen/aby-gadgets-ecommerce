import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1`,
  withCredentials: true,
});

const STAFF_API = "/staff";

// ── Types ─────────────────────────────────────────────

export interface StaffPermissions {
  order: {
    viewOrder: boolean;
    updateOrderStatus: boolean;
    addInternalNotes: boolean;
  };
  payments: { contactCustomers: boolean };
  delivery: { confirmDelivery: boolean };
  products: {
    viewProducts: boolean;
    addProducts: boolean;
    editProducts: boolean;
    deleteProducts: boolean;
  };
  customers: {
    viewCustomers: boolean;
    viewContactInfo: boolean;
  };
  confirmPaymentStatus: boolean;
}

export interface StaffMember {
  _id: string;
  username: string;
  email: string;
  name: string;
  phone: string;
  homeAddress: string;
  role: "staff";
  staffStatus: "active" | "inactive";
  staffPermissions: StaffPermissions;
  createdAt: string;
}

export const DEFAULT_PERMISSIONS: StaffPermissions = {
  order: {
    viewOrder: false,
    updateOrderStatus: false,
    addInternalNotes: false,
  },
  payments: { contactCustomers: false },
  delivery: { confirmDelivery: false },
  products: {
    viewProducts: false,
    addProducts: false,
    editProducts: false,
    deleteProducts: false,
  },
  customers: {
    viewCustomers: false,
    viewContactInfo: false,
  },
  confirmPaymentStatus: false,
};

// ── Staff CRUD ─────────────────────────────────────────

export const staffService = {
  getAll: async (): Promise<StaffMember[]> => {
    const { data } = await api.get(STAFF_API);
    return data.staff ?? [];
  },

  getById: async (id: string): Promise<StaffMember> => {
    const { data } = await api.get(`${STAFF_API}/${id}`);
    return data.staff;
  },

  create: async (payload: {
    username: string;
    email: string;
    password: string;
    name?: string;
    phone?: string;
    homeAddress?: string;
  }) => {
    const { data } = await api.post(STAFF_API, payload);
    return data;
  },

  updatePermissions: async (id: string, permissions: StaffPermissions) => {
    const { data } = await api.patch(`${STAFF_API}/${id}/permissions`, {
      permissions,
    });
    return data;
  },

  updateStatus: async (id: string, staffStatus: "active" | "inactive") => {
    const { data } = await api.patch(`${STAFF_API}/${id}/status`, {
      staffStatus,
    });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`${STAFF_API}/${id}`);
    return data;
  },
};

// ── Invite API (IMPORTANT SEPARATION) ──────────────────

export const inviteAPI = {
  // validate invite token
  getInviteInfo: async (token: string) => {
    const { data } = await api.get(`/staff/invite/${token}`);
    return data;
  },

  // accept invite
  acceptInvite: async (
    token: string,
    payload: { username: string; password: string; name?: string },
  ) => {
    const { data } = await api.post(`/staff/invite/${token}`, payload);
    return data;
  },

  // ✅ THIS IS THE MISSING ONE (ADMIN INVITE)
  inviteStaff: async (payload: {
    email: string;
    staffPermissions?: StaffPermissions;
  }) => {
    const { data } = await api.post(`/staff/invite`, payload);
    return data;
  },
};
