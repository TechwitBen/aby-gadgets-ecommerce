import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, toAuthUser, type AuthUser } from '@/services/api';
import axios from 'axios';
import { LoadingScreen } from "@/components/ui/loading-screen";

interface AuthContextType {
  user:            AuthUser | null;
  isLoading:       boolean;
  isAuthenticated: boolean;
  login:           (username: string, password: string) => Promise<void>;
  register:        (username: string, email: string, password: string) => Promise<void>;
  logout:          () => Promise<void>;
  setUserManually: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user,      setUser]      = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true until /me resolves

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

  const register = async (username: string, email: string, password: string) => {
    try {
      await authAPI.register({ username, email, password });
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
      if (result.data) {
        setUser(toAuthUser(result.data));
      } else {
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

  const setUserManually = (userData: AuthUser) => setUser(userData);

  // Block render until session check completes — prevents flash of logged-out UI
 if (isLoading) return <LoadingScreen message="Checking session..." />;

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