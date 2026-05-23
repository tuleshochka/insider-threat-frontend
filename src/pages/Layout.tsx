import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Select, Space, Tag, Typography } from "antd";
import {
  DashboardOutlined,
  ExperimentOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: "/", icon: <DashboardOutlined />, label: "Панель управления" },
  { key: "/users", icon: <UserOutlined />, label: "Пользователи" },
  { key: "/anomalies", icon: <WarningOutlined />, label: "Аномалии" },
  { key: "/incidents", icon: <SafetyCertificateOutlined />, label: "Инциденты" },
  { key: "/training-plan", icon: <ExperimentOutlined />, label: "Colab и датасеты" },
  { key: "/corporate", icon: <SettingOutlined />, label: "Корп. режим" },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("ueba_actor_role") || "security_specialist";
  const roleLabels: Record<string, string> = {
    security_specialist: "Специалист ИБ",
    lead: "Техлид",
    observer: "Наблюдатель",
  };

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
          <Space>
            <Tag color="blue">{roleLabels[role]}</Tag>
            <Select
              value={role}
              style={{ width: 190 }}
              onChange={(value) => {
                localStorage.setItem("ueba_actor_role", value);
                localStorage.setItem(
                  "ueba_actor_name",
                  value === "lead" ? "demo.lead" : value === "observer" ? "demo.audit" : "demo.specialist"
                );
                window.location.reload();
              }}
              options={[
                { value: "security_specialist", label: "Специалист ИБ" },
                { value: "lead", label: "Техлид" },
                { value: "observer", label: "Наблюдатель" },
              ]}
            />
          </Space>
        </Header>
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
