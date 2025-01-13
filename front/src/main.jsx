import { createRoot } from "react-dom/client";
import "./app/index.css";
import AppRoutes from "./app/Routes.jsx";
import { Toaster } from "./components/ui/toaster";
import { ToastProvider } from "./components/ui/toast";

createRoot(document.getElementById("root")).render(
    <ToastProvider swipeDirection="right" duration={5000}>
        <AppRoutes />
        <Toaster />
    </ToastProvider>
);
