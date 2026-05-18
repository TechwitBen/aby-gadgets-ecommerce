import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { notificationService } from "@/services/Notification.service";
import { useAuth } from "@/contexts/AuthContext";

interface NotificationContextType {
  unreadCount: number;
  refreshCount: () => void;
  decrementCount: (by?: number) => void;
  resetCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // silently fail — don't break the app
    }
  }, [isAuthenticated]);

  // Poll every 60 seconds when authenticated
  useEffect(() => {
    refreshCount();
    if (!isAuthenticated) return;
    const interval = setInterval(refreshCount, 60_000);
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshCount]);

  const decrementCount = (by = 1) =>
    setUnreadCount((prev) => Math.max(0, prev - by));

  const resetCount = () => setUnreadCount(0);

  return (
    <NotificationContext.Provider
      value={{ unreadCount, refreshCount, decrementCount, resetCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  return ctx;
};
