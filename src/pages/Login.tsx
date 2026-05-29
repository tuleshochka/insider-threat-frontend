import { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success("Вход выполнен успешно");
      navigate("/");
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || "Ошибка авторизации";
      message.error(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "radial-gradient(circle at center, #1b1236 0%, #0a0a0f 100%)",
      }}
    >
      <Card
        style={{
          width: 420,
          background: "rgba(15, 15, 25, 0.7)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(123, 97, 255, 0.2)",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.5), 0 0 15px rgba(123, 97, 255, 0.1)",
          borderRadius: 16,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <Title level={2} style={{ color: "#fff", marginBottom: 5, fontFamily: "Outfit, Inter" }}>
            UEBA Monitor
          </Title>
          <Text style={{ color: "rgba(255, 255, 255, 0.55)" }}>
            Вход в систему контроля инсайдерских угроз
          </Text>
        </div>

        <Form name="login_form" onFinish={onFinish} size="large">
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Пожалуйста, введите имя пользователя!" }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "rgba(255, 255, 255, 0.3)" }} />}
              placeholder="Имя пользователя"
              style={{
                background: "rgba(0,0,0,0.2)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#fff",
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Пожалуйста, введите пароль!" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "rgba(255, 255, 255, 0.3)" }} />}
              placeholder="Пароль"
              style={{
                background: "rgba(0,0,0,0.2)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#fff",
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 40 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                width: "100%",
                background: "linear-gradient(90deg, #7b61ff 0%, #aa61ff 100%)",
                border: "none",
                fontWeight: 600,
                height: 45,
                borderRadius: 8,
                boxShadow: "0 4px 15px rgba(123, 97, 255, 0.3)",
              }}
            >
              Войти
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
