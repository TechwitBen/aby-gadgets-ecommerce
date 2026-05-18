import { ShieldX } from "lucide-react";

interface PermissionBannerProps {
  message: string;
  hint?: string;
}

export const PermissionBanner = ({ message, hint }: PermissionBannerProps) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
      <ShieldX size={28} className="text-destructive" />
    </div>
    <h2 className="text-base font-semibold text-foreground mb-2">Access Restricted</h2>
    <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
    {hint && (
      <p className="text-xs text-muted-foreground/70 mt-2 max-w-xs">
        {hint}
      </p>
    )}
  </div>
);