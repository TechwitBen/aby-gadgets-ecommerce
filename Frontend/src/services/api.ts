import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true, // sends session cookies automatically
});

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  name?: string;
  provider?: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: AuthUser;   // login returns { success, data: req.user }
  user?: AuthUser;   // kept for any future /me endpoint
}

export const authAPI = {
  register: async (data: RegisterData): Promise<ApiResponse> => {
    // Backend returns { success: true, message: "Signup successful" } — no user object
    const res = await api.post<ApiResponse>('/auth/register', data);
    return res.data;
  },

  login: async (data: LoginData): Promise<ApiResponse> => {
    // Backend returns { success: true, message: "Login successful", data: req.user }
    const res = await api.post<ApiResponse>('/auth/login', data);
    return res.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const res = await api.post<ApiResponse>('/auth/logout');
    return res.data;
  },

  // Uncomment once backend adds GET /api/v1/auth/me
  // getCurrentUser: async (): Promise<AuthUser | null> => {
  //   const res = await api.get<ApiResponse>('/auth/me');
  //   return res.data.user ?? null;
  // },
};