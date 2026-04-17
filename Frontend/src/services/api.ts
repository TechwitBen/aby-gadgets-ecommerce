import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true,
});

// ── Interfaces ────────────────────────────────────────────────────────────────

interface RegisterData {
  username: string;
  email:    string;
  password: string;
  
}

interface LoginData {
  username: string;
  password: string;
}

/** The shape of the user object the frontend stores and uses everywhere */
export interface AuthUser {
  id:        string;
  username:  string;
  email:     string;
  name?:     string;
  provider?: string;
  role?:     'user' | 'admin';
}

/**
 * The raw user shape the backend returns.
 * MongoDB documents use _id, not id.
 */
export interface BackendUser {
  _id:       string;
  username:  string;
  email:     string;
  name?:     string;
  provider?: string;
  role:      'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success:  boolean;
  message?: string;
  error?:   string;
  data?:    BackendUser;
  user?:    BackendUser;
}

interface UsersResponse {
  success: boolean;
  users:   BackendUser[];
  error?:  string;
}

// ── Mapper ────────────────────────────────────────────────────────────────────

/** Maps the backend shape (_id) to the frontend AuthUser shape (id) */
export const toAuthUser = (raw: BackendUser): AuthUser => ({
  id:       raw._id,
  username: raw.username,
  email:    raw.email,
  name:     raw.name,
  provider: raw.provider,
  role:     raw.role,
});

// ── Auth API ──────────────────────────────────────────────────────────────────

export const authAPI = {
  register: async (data: RegisterData): Promise<ApiResponse> => {
    const res = await api.post<ApiResponse>('/auth/register', data);
    return res.data;
  },

  login: async (data: LoginData): Promise<ApiResponse> => {
    const res = await api.post<ApiResponse>('/auth/login', data);
    return res.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const res = await api.post<ApiResponse>('/auth/logout');
    return res.data;
  },

  getCurrentUser: async (): Promise<AuthUser | null> => {
    const res = await api.get<ApiResponse>('/auth/me');
    return res.data.user ? toAuthUser(res.data.user) : null;
  },

  forgotPassword: async (email: string): Promise<ApiResponse> => {
    const res = await api.post<ApiResponse>('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (token: string, password: string): Promise<ApiResponse> => {
    const res = await api.post<ApiResponse>(`/auth/reset-password/${token}`, { password });
    return res.data;
  },

  /**
   * Promote a registered user to admin.
   * Requires the caller to be logged in as admin.
   * Calls POST /auth/promote  →  { email }
   */
  promoteToAdmin: async (email: string): Promise<ApiResponse> => {
    const res = await api.post<ApiResponse>('/auth/promote', { email });
    return res.data;
  },

   /**
   * ⚠️  BOOTSTRAP ONLY — comment this out after the first admin is created.
   * Promotes a registered user to admin using the server-side secret.
   * Calls POST /auth/bootstrap-admin  →  { email, password (secret) }
   */
  // bootstrapAdmin: async (email: string, secret: string): Promise<ApiResponse> => {
  //   const res = await api.post<ApiResponse>('/auth/bootstrap-admin', {
  //     email,
  //     secret,
  //   });
  //   return res.data;
  // },
};

// ── Users API (admin-only) ────────────────────────────────────────────────────
// NOTE: Your backend needs a GET /users route protected by isAdmin.
// Add this to your Express router:
//
//   usersRouter.get('/', isAuthenticated, isAdmin, async (req, res) => {
//     const users = await User.find({}, '-hashed_password -salt -resetPasswordToken -resetPasswordExpires');
//     res.json({ success: true, users });
//   });

export const usersAPI = {
  /**
   * Returns all registered users. Admin only.
   */
  getAll: async (): Promise<BackendUser[]> => {
    const res = await api.get<UsersResponse>('/auth/users');
    return Array.isArray(res.data.users) ? res.data.users : [];
  },

  /**
   * Returns only admin-role users. Admin only.
   * Filtered client-side from getAll to avoid an extra endpoint.
   */
  getAdmins: async (): Promise<BackendUser[]> => {
    const all = await usersAPI.getAll();
    return all.filter((u) => u.role === 'admin');
  },

  /**
   * Delete a user by ID. Admin only.
   * Requires DELETE /users/:id on your backend.
   */
  deleteUser: async (id: string): Promise<ApiResponse> => {
    const res = await api.delete<ApiResponse>(`/users/${id}`);
    return res.data;
  },

 
};