import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wraps any route that requires authentication.
 * Unauthenticated users are sent to /login?redirect=<current-path>
 * so after login/signup they are bounced straight back.
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Wait for session rehydration before deciding
 if (isLoading) {
  return (
    <div className="flex items-center justify-center py-32 text-muted-foreground gap-3">
      <Loader2 size={20} className="animate-spin text-primary" />
      <span className="text-sm">Loading</span>
    </div>
  );
}
  if (!isAuthenticated) {
    const redirectTo = location.pathname + location.search;
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirectTo)}`}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;