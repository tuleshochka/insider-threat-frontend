import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import AppLayout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import Anomalies from "./pages/Anomalies";
import AnomalyDetail from "./pages/AnomalyDetail";
import Incidents from "./pages/Incidents";
import CorporateAdmin from "./pages/CorporateAdmin";
import ExportData from "./pages/ExportData";
import Login from "./pages/Login";
import SystemUsers from "./pages/SystemUsers";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#0a0a0f",
          color: "#7b61ff",
          fontSize: 18,
          fontWeight: 500,
        }}
      >
        Загрузка...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

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
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/users/:id" element={<UserDetail />} />
              <Route path="/anomalies" element={<Anomalies />} />
              <Route path="/anomalies/:id" element={<AnomalyDetail />} />
              <Route path="/incidents" element={<Incidents />} />
              <Route path="/export" element={<ExportData />} />
              <Route path="/corporate" element={<CorporateAdmin />} />
              <Route path="/system-users" element={<SystemUsers />} />
            </Route>
            {/* Fallback to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}
