import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import AppLayout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import Anomalies from "./pages/Anomalies";
import AnomalyDetail from "./pages/AnomalyDetail";
import Incidents from "./pages/Incidents";
import CorporateAdmin from "./pages/CorporateAdmin";
import TrainingPlan from "./pages/TrainingPlan";

export default function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: { 
          colorPrimary: "#7b61ff",
          fontFamily: "'Inter', sans-serif",
          borderRadius: 8,
          colorBgContainer: "rgba(20, 20, 25, 0.6)", 
          colorBgElevated: "#1f1f2e"
        },
        components: {
          Card: {
            colorBorderSecondary: "rgba(255, 255, 255, 0.08)"
          }
        }
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="/anomalies" element={<Anomalies />} />
            <Route path="/anomalies/:id" element={<AnomalyDetail />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/training-plan" element={<TrainingPlan />} />
            <Route path="/corporate" element={<CorporateAdmin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
