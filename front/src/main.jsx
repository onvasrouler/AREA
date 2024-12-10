import { createRoot } from "react-dom/client";
import "./app/index.css";
import AppRoutes from "./app/Routes.jsx";

createRoot(document.getElementById("root")).render(
    <AppRoutes />
);
