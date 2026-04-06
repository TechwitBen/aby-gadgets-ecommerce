// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  setUserManually: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── localStorage keys ─────────────────────────────────────────────────────────
const USERS_KEY   = "abygadget_users";
const SESSION_KEY = "abygadget_session";

interface StoredUser extends User {
  password: string;
}

const getStoredUsers = (): StoredUser[] => {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]"); }
  catch { return []; }
};

const saveStoredUsers = (users: StoredUser[]) =>
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

const getSession = (): User | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const saveSession = (user: User) =>
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));

const clearSession = () =>
  localStorage.removeItem(SESSION_KEY);

// ── Provider ──────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]         = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate session on mount
  useEffect(() => {
    const session = getSession();
    if (session) setUser(session);
    setIsLoading(false);
  }, []);

  const register = async (username: string, email: string, password: string) => {
    const users = getStoredUsers();

    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase()))
      throw new Error("An account with this email already exists.");

    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase()))
      throw new Error("This username is already taken.");

    const newUser: StoredUser = { id: crypto.randomUUID(), username, email, password };
    saveStoredUsers([...users, newUser]);

    const session: User = { id: newUser.id, username, email };
    saveSession(session);
    setUser(session);
  };

  const login = async (username: string, password: string) => {
    const users = getStoredUsers();

    const match = users.find(
      (u) =>
        (u.username.toLowerCase() === username.toLowerCase() ||
          u.email.toLowerCase() === username.toLowerCase()) &&
        u.password === password
    );

    if (!match) throw new Error("Invalid username/email or password.");

    const session: User = { id: match.id, username: match.username, email: match.email };
    saveSession(session);
    setUser(session);
  };

  const logout = async () => {
    clearSession();
    setUser(null);
  };

  const setUserManually = (userData: User) => {
    saveSession(userData);
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