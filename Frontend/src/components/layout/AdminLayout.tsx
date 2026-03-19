import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

export const AdminLayout = () => {
  return (
    // Apply the admin-theme class to scope variables
    <div className="admin-theme flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-auto bg-background text-foreground">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
