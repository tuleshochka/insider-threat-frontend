import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import AppLayout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import AnomalyDetail from "./pages/AnomalyDetail";
import Incidents from "./pages/Incidents";
import CorporateAdmin from "./pages/CorporateAdmin";
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
          background: "#f4f6fa",
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
        algorithm: theme.defaultAlgorithm,
        token: { 
          colorPrimary: "#7b61ff",
          fontFamily: "'Inter', sans-serif",
          borderRadius: 8,
          colorBgContainer: "rgba(255, 255, 255, 0.75)", 
          colorBgElevated: "#ffffff"
        },
        components: {
          Card: {
            colorBorderSecondary: "rgba(0, 0, 0, 0.06)"
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
              <Route path="/anomalies/:id" element={<AnomalyDetail />} />
              <Route path="/incidents" element={<Incidents />} />
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
