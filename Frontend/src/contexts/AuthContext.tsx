import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { authAPI, toAuthUser, type AuthUser } from "@/services/api";
import axios from "axios";
import { LoadingScreen } from "@/components/ui/loading-screen";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logoutReason: "manual" | "expired" | null;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  setUserManually: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
const [user, setUser] = useState<AuthUser | null>(null);
const [isLoading, setIsLoading] = useState(true);

const [logoutReason, setLogoutReason] = useState<"manual" | "expired" | null>(null);

  // ── Check session on app load ─────────────────────────────
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authAPI.getCurrentUser();
      // Block inactive staff from proceeding
      if (
        currentUser.role === "staff" &&
        currentUser.staffStatus === "inactive"
      ) {
        await authAPI.logout();
        setUser(null);
        
      } else {
        setUser(currentUser);
      }
    } catch {
        setLogoutReason("expired");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ── REGISTER ───────────────────────────────────────────────
  const register = async (
    username: string,
    email: string,
    password: string,
  ) => {
    try {
      await authAPI.register({ username, email, password });
      setLogoutReason(null); 

      // Always fetch real user from backend (NO fake user)
      const currentUser = await authAPI.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        throw new Error(err.response?.data?.error || "Registration failed");
      }
      throw err;
    }
  };

  // ── LOGIN ──────────────────────────────────────────────────
  const login = async (username: string, password: string) => {
  try {
    const result = await authAPI.login({ username, password });
    setLogoutReason(null); // ← reset it
    if (result.data) {
      setUser(toAuthUser(result.data));
    } else {
      const currentUser = await authAPI.getCurrentUser();
      setUser(currentUser);
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw new Error(err.response?.data?.error || "Login failed");
    }
    throw err;
  }
};
  // ── LOGOUT ────────────────────────────────────────────────
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
       setLogoutReason("manual");
      setUser(null);
    }
  };

  // ── MANUAL SET (admin use/debug only) ─────────────────────
  const setUserManually = (userData: AuthUser) => setUser(userData);

  // ── Prevent UI flash before auth check completes ──────────
  if (isLoading) {
    return <LoadingScreen message="Checking session..." />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        logoutReason,
        setUserManually,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ────────────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
