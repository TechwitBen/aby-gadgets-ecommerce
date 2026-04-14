import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true,
});

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
}

/**
 * The raw user shape the backend returns inside `data`.
 * MongoDB documents use _id, not id.
 */
interface BackendUser {
  _id:       string;
  username:  string;
  email:     string;
  name?:     string;
  provider?: string;
}

interface ApiResponse {
  success:  boolean;
  message?: string;
  error?:   string;
  data?:    BackendUser;
  user?:    BackendUser;
}

/** Maps the backend shape (_id) to the frontend AuthUser shape (id) */
export const toAuthUser = (raw: BackendUser): AuthUser => ({
  id:       raw._id,
  username: raw.username,
  email:    raw.email,
  name:     raw.name,
  provider: raw.provider,
});

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
};