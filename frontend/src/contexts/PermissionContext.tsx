import { createContext, useContext } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { StaffPermissions } from "@/services/Staff.service";

interface PermissionContextType {
  isAdmin: boolean;
  isStaff: boolean;
  can: (category: keyof StaffPermissions, permission?: string) => boolean;
}

const PermissionContext = createContext<PermissionContextType>({
  isAdmin: false,
  isStaff: false,
  can: () => false,
});

export const PermissionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "staff";

  const can = (
    category: keyof StaffPermissions,
    permission?: string,
  ): boolean => {
    if (isAdmin) return true;
    if (!isStaff || !user?.staffPermissions) return false;

    const section = user.staffPermissions[category] as
      | Record<string, boolean>
      | boolean;
    if (typeof section === "boolean") return section;
    if (!permission) return false;
    return !!section?.[permission];
  };

  return (
    <PermissionContext.Provider value={{ isAdmin, isStaff, can }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = () => useContext(PermissionContext);
