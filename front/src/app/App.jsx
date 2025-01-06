import { AppRoutes } from "./routes.jsx";
import { Toaster } from "@/components/ui/Toaster";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@features/auth/hooks/auth.hook";

export const App = () => {
  return (
      <ToastProvider swipeDirection="right" duration={5000}>
        <div className="min-h-screen bg-background text-foreground">
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
          <Toaster />
        </div>
      </ToastProvider>
  );
};

