import { useState, createContext, useContext } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

interface MobileSidebarCtx {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export const MobileSidebarContext = createContext<MobileSidebarCtx>({
  mobileOpen: false,
  setMobileOpen: () => {},
});

export const useMobileSidebar = () => useContext(MobileSidebarContext);

/**
 * AdminLayout — fully responsive
 *
 * Mobile  (<lg): sidebar is an off-canvas overlay triggered by AdminHeader hamburger.
 * Desktop (≥lg): sidebar is always visible in the flex row.
 *
 * .admin-theme stays on the root div so AdminSidebar's existing toggle still works.
 */
export const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <MobileSidebarContext.Provider value={{ mobileOpen, setMobileOpen }}>
      <div className="admin-theme flex h-screen overflow-hidden">

        {/* ── Mobile backdrop ─────────────────────────────────── */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── Sidebar ─────────────────────────────────────────── */}
        {/*
          On mobile: fixed, off-canvas, slides in from left.
          On desktop: static in the flex row.
        */}
        <div
          className={[
            // base
            "fixed inset-y-0 left-0 z-30",
            // desktop: back to normal flow
            "lg:relative lg:z-auto lg:translate-x-0",
            // mobile slide transition
            "transition-transform duration-300 ease-in-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          ].join(" ")}
        >
          <AdminSidebar onMobileClose={() => setMobileOpen(false)} />
        </div>

        {/* ── Main area ────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AdminHeader onMobileMenuToggle={() => setMobileOpen((v) => !v)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background text-foreground">
            <Outlet />
          </main>
        </div>

      </div>
    </MobileSidebarContext.Provider>
  );
};