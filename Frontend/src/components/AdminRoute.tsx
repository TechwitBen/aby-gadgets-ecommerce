// src/components/AdminRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext"; // adjust path to your auth context

const AdminRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Still fetching session — don't flash a redirect
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Not logged in → send to sign up / login
  if (!user) {
    return <Navigate to="/signup" replace />;
  }

  // Logged in but not admin → send back home
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // ✅ Authenticated admin — render the admin layout
  return <Outlet />;
};

export default AdminRoute;