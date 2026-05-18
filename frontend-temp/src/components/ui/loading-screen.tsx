// src/components/ui/loading-screen.tsx
import { Spinner } from "@/components/ui/Spinner";

export const LoadingScreen = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
};