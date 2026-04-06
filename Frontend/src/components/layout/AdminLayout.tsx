import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

/**
 * AdminLayout
 *
 * - .admin-theme is on THIS root div — it's the single toggle target
 *   that AdminSidebar's handleToggle queries with document.querySelector(".admin-theme").
 * - h-screen + overflow-hidden on root keeps sidebar fixed.
 * - Only <main> scrolls via overflow-y-auto.
 */
export const AdminLayout = () => {
  return (
    <div className="admin-theme flex h-screen overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6 bg-background text-foreground">
          <Outlet />
        </main>
      </div>
    </div>
  );
};