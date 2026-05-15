import { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Permission map ────────────────────────────────────────────────────────────
const ROUTE_PERMISSIONS: Record<string, { area: string; action: string; label: string }> = {
  "/admin/orders":        { area: "order",    action: "viewOrder",        label: "View Orders"        },
  "/admin/payments":      { area: "payments", action: "contactCustomers", label: "View Payments"      },
  "/admin/products":      { area: "products", action: "viewProducts",     label: "View Products"      },
  "/admin/products/add":  { area: "products", action: "addProducts",      label: "Add Products"       },
  "/admin/customers":     { area: "customers",action: "viewCustomers",    label: "View Customers"     },
  "/admin/staffs":        { area: "__admin_only__", action: "", label: "Manage Staff"        },
  "/admin/manage-admins": { area: "__admin_only__", action: "", label: "Manage Admins"       },
  "/admin/activity":      { area: "__admin_only__", action: "", label: "View Audit Logs"     },
  "/admin/settings":      { area: "__admin_only__", action: "", label: "Manage Settings"     },
};

const STAFF_ROUTE_PRIORITY = [
  { path: "/admin/orders",    area: "order",    action: "viewOrder"        },
  { path: "/admin/products",  area: "products", action: "viewProducts"     },
  { path: "/admin/customers", area: "customers",action: "viewCustomers"    },
  { path: "/admin/payments",  area: "payments", action: "contactCustomers" },
];

const hasPermission = (user: any, area: string, action: string): boolean => {
  if (area === "__admin_only__") return false;
  return user?.staffPermissions?.[area]?.[action] === true;
};

const getStaffLandingPage = (user: any): string | null => {
  for (const route of STAFF_ROUTE_PRIORITY) {
    if (user?.staffPermissions?.[route.area]?.[route.action] === true) {
      return route.path;
    }
  }
  return null;
};

// ── No permissions screen ─────────────────────────────────────────────────────
const NoAccessScreen = () => (
  <div className="flex flex-col items-center justify-center h-screen gap-4 text-center px-4">
    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
      <ShieldX className="w-8 h-8 text-destructive" />
    </div>
    <h1 className="text-xl font-bold text-foreground">No Access</h1>
    <p className="text-sm text-muted-foreground max-w-xs">
      Your account has no active permissions. Contact your admin to grant you
      access to at least one section.
    </p>
  </div>
);

// ── Restriction Modal ─────────────────────────────────────────────────────────
const RestrictedModal = ({
  permissionLabel,
  onClose,
}: {
  permissionLabel: string;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
    <div className="bg-popover text-popover-foreground rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-border animate-in fade-in zoom-in-95 duration-200">

      {/* Top accent bar */}
      <div className="h-1.5 w-full bg-destructive" />

      <div className="p-6 flex flex-col items-center text-center gap-4">
        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-destructive/10 border-4 border-destructive/20 flex items-center justify-center">
          <ShieldX className="w-7 h-7 text-destructive" />
        </div>

        {/* Text */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-1">
            Access Restricted
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You don't have permission to access{" "}
            <span className="font-semibold text-foreground">
              {permissionLabel}
            </span>
            .
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Contact your admin to enable this permission for your account.
          </p>
        </div>

        {/* Button */}
        <Button
          onClick={onClose}
          className="w-full bg-destructive hover:bg-destructive/90 text-white font-semibold rounded-xl h-11"
        >
          Go Back
        </Button>
      </div>
    </div>
  </div>
);

// ── Main AdminRoute ───────────────────────────────────────────────────────────
const AdminRoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [restrictedLabel, setRestrictedLabel] = useState("");
  const [landingPage, setLandingPage] = useState<string | null>(null);

  useEffect(() => {
    // Reset modal when path changes
    setShowModal(false);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Not logged in
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

  // Inactive staff
  if (user.role === "staff" && user.staffStatus === "inactive") {
    const redirectTo = location.pathname + location.search;
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirectTo)}`}
        replace
      />
    );
  }

  // Admins bypass everything
  if (user.role === "admin") {
    return <Outlet />;
  }

  // ── Staff checks ──────────────────────────────────────────────────────────
  const staffLanding = getStaffLandingPage(user);

  // Staff with zero permissions at all
  if (!staffLanding) {
    return <NoAccessScreen />;
  }

  const currentPath = location.pathname;

  // Staff hitting /admin root — send to their first permitted page
  if (currentPath === "/admin" || currentPath === "/admin/") {
    return <Navigate to={staffLanding} replace />;
  }

  // Check if current path requires a permission staff doesn't have
  const routeKey = Object.keys(ROUTE_PERMISSIONS).find(
    (key) => currentPath === key || currentPath.startsWith(key + "/")
  );

  if (routeKey) {
    const { area, action, label } = ROUTE_PERMISSIONS[routeKey];
    const allowed = hasPermission(user, area, action);

    if (!allowed) {
      return (
        <>
          {/* Render nothing behind the modal — just a blank admin shell */}
          <div className="min-h-screen bg-background" />

          <RestrictedModal
            permissionLabel={label}
            onClose={() => {
              // Navigate back to their landing page after closing
              navigate(staffLanding, { replace: true });
            }}
          />
        </>
      );
    }
  }

  return <Outlet />;
};

export default AdminRoute;