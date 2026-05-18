import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // ── Redirect when session expires while user is on a protected page ───────
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirectTo = location.pathname + location.search;
      navigate(
        `/login?redirect=${encodeURIComponent(redirectTo)}`,
        { replace: true }
      );
    }
  }, [isAuthenticated, isLoading]);

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