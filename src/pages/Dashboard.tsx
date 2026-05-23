import { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Statistic,
  Spin,
  Button,
  message,
  Progress,
} from "antd";
import {
  WarningOutlined,
  UserOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  fetchDashboard,
  triggerTraining,
  fetchTrainingStatus,
} from "../api/client";
import type { DashboardOut } from "../types/api";

export default function Dashboard() {
  const [dash, setDash] = useState<DashboardOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard()
      .then(setDash)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!taskId) return;
    const interval = setInterval(async () => {
      const s = await fetchTrainingStatus(taskId);
      if (s.status === "done" || s.status === "failed") {
        clearInterval(interval);
        setTraining(false);
        message.info(s.message);
        fetchDashboard().then(setDash);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [taskId]);

  const handleTrain = async () => {
    setTraining(true);
    const r = await triggerTraining();
    setTaskId(r.task_id);
    message.loading({ content: "Обучение запущено...", key: "train" });
  };

  if (loading) return <Spin size="large" style={{ display: "block", marginTop: 100 }} />;
  if (!dash) return null;

  const statusData = [
    { name: "В ожидании", value: dash.pending_anomalies, fill: "#faad14" },
    { name: "Подтверждено", value: dash.confirmed_anomalies, fill: "#ff4d4f" },
    { name: "Отклонено", value: dash.rejected_anomalies, fill: "#52c41a" },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card className="glass-panel fade-in" style={{ animationDelay: '0.1s' }}>
            <Statistic
              title="Пользователи"
              value={dash.total_users}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="glass-panel fade-in" style={{ animationDelay: '0.2s' }}>
            <Statistic
              title="Всего аномалий"
              value={dash.total_anomalies}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={`glass-panel fade-in ${dash.confirmed_anomalies > 0 ? 'danger-glow' : ''}`} style={{ animationDelay: '0.3s' }}>
            <Statistic
              title="Подтверждено"
              value={dash.confirmed_anomalies}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="glass-panel fade-in" style={{ animationDelay: '0.4s' }}>
            <Statistic
              title="Открытые инциденты"
              value={dash.open_incidents}
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: dash.open_incidents > 0 ? "#faad14" : undefined }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="Статусы аномалий" className="glass-panel fade-in" style={{ animationDelay: '0.5s' }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" name="Количество" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Управление моделью" className="glass-panel fade-in" style={{ animationDelay: '0.6s' }}>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={handleTrain}
              loading={training}
              size="large"
              block
            >
              {training ? "Обучение..." : "Запустить обучение"}
            </Button>
            {training && (
              <Progress
                style={{ marginTop: 16 }}
                percent={0}
                status="active"
              />
            )}
            <p style={{ marginTop: 16, color: "#888" }}>
              Максимальный уровень риска:{" "}
              <strong>{dash.max_score.toFixed(2)}</strong>
            </p>
            <p style={{ color: "#888" }}>
              Критические инциденты: <strong>{dash.critical_incidents}</strong>
            </p>
            <p style={{ color: "#888" }}>
              Отклонённые срабатывания: <strong>{dash.rejected_anomalies}</strong>
            </p>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
