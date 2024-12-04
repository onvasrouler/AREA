import { AppRoutes } from "./routes.jsx";
import { AuthProvider } from "@/features/authentification/hooks/auth.hook.jsx";

export const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}