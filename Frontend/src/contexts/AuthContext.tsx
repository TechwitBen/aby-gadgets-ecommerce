import { createContext, useContext, useState, ReactNode } from 'react';
import { authAPI, AuthUser } from '@/services/api';
import axios from 'axios';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUserManually: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading] = useState(false);

  // NOTE: Uncomment once backend adds GET /api/v1/auth/me
  /*
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authAPI.getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  */

  const register = async (username: string, email: string, password: string) => {
    try {
      await authAPI.register({ username, email, password });
      // Backend auto-logs in after register but returns no user object yet.
      // Populate what we know from the form until /me is available.
      setUser({ id: '', username, email });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        throw new Error(err.response?.data?.error || 'Registration failed');
      }
      throw err;
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const result = await authAPI.login({ username, password });
      // Backend returns the full user under `data`
      if (result.data) {
        setUser({
          id:        result.data._id ?? result.data.id ?? '',
          username: result.data.username ?? username,
          email:    result.data.email ?? '',
          name:     result.data.name,
          provider: result.data.provider,
        });
      } else {
        // Fallback until /me is available
        setUser({ id: '', username, email: '' });
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        throw new Error(err.response?.data?.error || 'Login failed');
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
    }
  };

  const setUserManually = (userData: AuthUser) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        setUserManually,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};