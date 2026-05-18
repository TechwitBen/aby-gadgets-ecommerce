import { useState, useCallback } from "react";

export const usePermissionToast = () => {
  const [message, setMessage] = useState<string | null>(null);

  const deny = useCallback((msg: string) => {
    setMessage(msg);
  }, []);

  const clear = useCallback(() => setMessage(null), []);

  return { message, deny, clear };
};