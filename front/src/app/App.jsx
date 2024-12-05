import { AppRoutes } from "./routes.jsx";
import { AuthProvider } from "@features/auth/hooks/auth.hook";


export const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};
