import React from 'react';
import { AppRoutes } from "./routes.jsx";
import { AuthProvider } from "@features/auth/hooks/auth.hook";
import { Toaster } from "@/components/ui/Toaster";
import { ToastProvider } from "@/components/ui/toast";

export const App = () => {
  return (
    <React.StrictMode>
      <ToastProvider swipeDirection="right" duration={5000}>
        <div className="min-h-screen bg-background text-foreground">
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
          <Toaster />
        </div>
      </ToastProvider>
    </React.StrictMode>
  );
};

