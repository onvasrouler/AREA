import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@features/auth/hooks/auth.hook";
import { LoginPage } from "@features/auth/LoginPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { ProfilePage } from "../features/profile/ProfilePage";
import { CallbackDiscord } from "../features/auth/CallbackDiscord";
import { CallbackGithub } from "../features/auth/CallbackGithub";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ClientApkPage } from "../features/client-apk/clientApk";

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/client.apk" element={<ClientApkPage />} />

        {isAuthenticated ? (
          <>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/settings" element={<ProfilePage />} />
            <Route path="/callback-discord" element={<CallbackDiscord />} />
            <Route path="/callback-github" element={<CallbackGithub />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
    </GoogleOAuthProvider>
  );
};

export default AppRoutes;
