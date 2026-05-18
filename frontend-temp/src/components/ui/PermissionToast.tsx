import { ShieldX, X } from "lucide-react";
import { useState, useEffect } from "react";

interface PermissionToastProps {
  message: string;
  onClose: () => void;
}

export const PermissionToast = ({ message, onClose }: PermissionToastProps) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 bg-destructive text-destructive-foreground px-4 py-3 rounded-xl shadow-2xl max-w-sm">
        <ShieldX size={16} className="flex-shrink-0" />
        <p className="text-sm font-medium flex-1">{message}</p>
        <button onClick={onClose} className="flex-shrink-0 hover:opacity-70 transition-opacity">
          <X size={14} />
        </button>
      </div>
    </div>
  );
};