import { AppRoutes } from "./routes.jsx";
import { AuthProvider } from "@features/auth/hooks/auth.hook";

export const App = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </div>
  );
};

