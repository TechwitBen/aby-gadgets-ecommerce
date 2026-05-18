import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/contexts/Notificationcontext";
import { useAuth } from "@/contexts/AuthContext";
 
interface NotificationBellProps {
  /** true when header is purple/transparent so icons should be white */
  isLight?: boolean;
}
 
export const NotificationBell = ({ isLight = false }: NotificationBellProps) => {
  const navigate            = useNavigate();
  const { isAuthenticated } = useAuth();
  const { unreadCount }     = useNotifications();
 
  if (!isAuthenticated) return null;
 
  return (
    <Button
      variant="ghost"
      size="icon"
      className={`relative rounded-xl ${
        isLight
          ? "text-white hover:text-white hover:bg-white/10"
          : "text-gray-600 hover:text-[#6426E1] hover:bg-purple-50"
      }`}
      onClick={() => navigate("/notifications")}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Button>
  );
};