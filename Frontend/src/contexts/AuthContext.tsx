// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { authAPI } from '@/services/api';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUserManually: (user: User) => void; // Temporary until backend adds /me endpoint
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading] = useState(false); // Not loading since we're not checking auth on mount

  // NOTE: We're NOT checking auth on mount because backend doesn't have /auth/me endpoint yet
  // Once backend adds GET /api/v1/auth/me, uncomment this:
  /*
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authAPI.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  */

  const register = async (username: string, email: string, password: string) => {
    try {
      await authAPI.register({ username, email, password });
      // Temporarily set user manually after successful registration
      // This is a workaround until backend implements /auth/me
      setUser({ 
        id: Date.now().toString(), // temporary ID
        username, 
        email 
      });
    } catch (error) {
      throw error;
    }
  };

  const login = async (username: string, password: string) => {
    try {
      await authAPI.login({ username, password });
      // Temporarily set user manually after successful login
      // This is a workaround until backend implements /auth/me
      setUser({ 
        id: Date.now().toString(), // temporary ID
        username, 
        email: '' // We don't have email from login, so empty string
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if API call fails, clear user state
      setUser(null);
    }
  };

  // Temporary method to set user manually
  const setUserManually = (userData: User) => {
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