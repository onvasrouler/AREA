import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DashboardPage } from "../features/dashboard/DashboardPage";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
