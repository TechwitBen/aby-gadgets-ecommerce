// src/services/api.ts
const API_BASE_URL = 'http://localhost:3000/api/v1';

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
  user?: {
    id: string;
    username: string;
    email: string;
    name?: string;
    provider?: string;
  };
}

export const authAPI = {
  register: async (data: RegisterData): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies/sessions
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Registration failed');
      }

      return result;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  login: async (data: LoginData): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }

      return result;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async (): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Logout failed');
      }

      return result;
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // COMMENTED OUT - Backend needs to implement this endpoint
  // Once backend adds GET /api/v1/auth/me endpoint, uncomment this
  /*
  getCurrentUser: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      
      if (result.success && result.user) {
        return result.user;
      }
      
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
  */
};