import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AdminRoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Not logged in — send to login with the exact admin path preserved
  if (!user) {
    const redirectTo = location.pathname + location.search;
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirectTo)}`}
        replace
      />
    );
  }

  // Wrong role
  if (user.role !== "admin" && user.role !== "staff") {
    return <Navigate to="/" replace />;
  }

  // Inactive staff — also preserve destination in case they reactivate
  if (user.role === "staff" && user.staffStatus === "inactive") {
    const redirectTo = location.pathname + location.search;
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirectTo)}`}
        replace
      />
    );
  }

  return <Outlet />;
};

export default AdminRoute;