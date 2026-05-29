import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Space, Tag, Typography, Button } from "antd";
import {
  DashboardOutlined,
  DownloadOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  UserOutlined,
  WarningOutlined,
  TeamOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";

const { Header, Sider, Content } = Layout;

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, user, logout } = useAuth();

  const roleLabels: Record<string, string> = {
    admin: "Администратор",
    specialist: "Специалист ИБ",
    observer: "Наблюдатель",
  };

  const roleColors: Record<string, string> = {
    admin: "magenta",
    specialist: "purple",
    observer: "blue",
  };

  const menuItems = [
    { key: "/", icon: <DashboardOutlined />, label: "Панель управления" },
    { key: "/users", icon: <UserOutlined />, label: "Пользователи" },
    { key: "/anomalies", icon: <WarningOutlined />, label: "Аномалии" },
    { key: "/incidents", icon: <SafetyCertificateOutlined />, label: "Инциденты" },
    { key: "/export", icon: <DownloadOutlined />, label: "Выгрузка данных" },
    { key: "/corporate", icon: <SettingOutlined />, label: "Корп. режим" },
  ];

  // Добавляем раздел управления пользователями только для администратора
  if (role === "admin") {
    menuItems.push({
      key: "/system-users",
      icon: <TeamOutlined />,
      label: "Пользователи системы",
    });
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider 
        collapsible 
        style={{ 
          background: "rgba(10, 10, 15, 0.4)", 
          backdropFilter: "blur(16px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.05)"
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid rgba(255,255,255,0.05)"
          }}
        >
          <Typography.Title level={4} style={{ color: "#fff", margin: 0 }}>
            UEBA Monitor
          </Typography.Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          style={{ background: "transparent", borderRight: 0 }}
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout style={{ background: "transparent" }}>
        <Header
          style={{
            padding: "0 24px",
            background: "rgba(10, 10, 15, 0.6)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <Typography.Text style={{ color: "#fff", fontSize: 16 }}>
            Система мониторинга поведения пользователей
          </Typography.Text>
          <Space size="middle">
            <span style={{ color: "rgba(255, 255, 255, 0.85)", fontWeight: 500 }}>
              {user?.username}
            </span>
            {role && (
              <Tag color={roleColors[role] || "blue"}>
                {roleLabels[role] || role}
              </Tag>
            )}
            <Button
              type="text"
              icon={<LogoutOutlined style={{ color: "rgba(255,255,255,0.65)" }} />}
              onClick={logout}
              style={{ color: "rgba(255, 255, 255, 0.65)" }}
            >
              Выйти
            </Button>
          </Space>
        </Header>
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
