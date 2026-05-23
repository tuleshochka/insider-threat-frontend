import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  Descriptions,
  Tag,
  Table,
  Spin,
  Button,
  Input,
  Modal,
  Space,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { createIncident, fetchAnomaly, reviewAnomaly } from "../api/client";
import type { AnomalyOut, FeatureOut } from "../types/api";

const statusColors: Record<string, string> = {
  pending: "gold",
  confirmed: "red",
  rejected: "green",
};

const featureColumns: ColumnsType<FeatureOut> = [
  { title: "Признак", dataIndex: "feature_name", key: "feature_name" },
  {
    title: "Значение",
    dataIndex: "feature_value",
    key: "feature_value",
    render: (v: number) => v.toFixed(4),
  },
  {
    title: "SHAP",
    dataIndex: "shap_value",
    key: "shap_value",
    render: (v: number) => (
      <span style={{ color: v > 0 ? "#ff4d4f" : "#52c41a", fontWeight: "bold" }}>
        {v.toFixed(4)}
      </span>
    ),
    sorter: (a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value),
  },
];

export default function AnomalyDetail() {
  const { id } = useParams<{ id: string }>();
  const [anomaly, setAnomaly] = useState<AnomalyOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewComment, setReviewComment] = useState("");
  const [incidentOpen, setIncidentOpen] = useState(false);
  const role = localStorage.getItem("ueba_actor_role") || "security_specialist";
  const canReview = role === "security_specialist" || role === "lead";

  const load = () => {
    if (!id) return;
    setLoading(true);
    fetchAnomaly(parseInt(id))
      .then(setAnomaly)
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleReview = async (status: "confirmed" | "rejected") => {
    if (!id) return;
    await reviewAnomaly(parseInt(id), status, reviewComment || undefined);
    message.success(`Аномалия ${status === "confirmed" ? "подтверждена" : "отклонена"}`);
    setReviewComment("");
    load();
  };

  const handleCreateIncident = async () => {
    if (!anomaly) return;
    await createIncident({
      anomaly_id: anomaly.id,
      severity: anomaly.score >= 0.92 || anomaly.score >= 10 ? "critical" : "high",
      summary: reviewComment || "Создано из карточки аномалии",
    });
    message.success("Инцидент создан");
    setIncidentOpen(false);
  };

  if (loading) return <Spin size="large" style={{ display: "block", marginTop: 100 }} />;
  if (!anomaly) return <div>Аномалия не найдена</div>;

  const chartData = anomaly.features
    .slice()
    .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
    .slice(0, 10)
    .map((f) => ({ name: f.feature_name, value: f.shap_value }));

  return (
    <div>
      <Link to="/anomalies">
        <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }}>
          Назад к списку
        </Button>
      </Link>

      <Card title={`Аномалия #${anomaly.id}`} style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="Пользователь">{anomaly.user_id}</Descriptions.Item>
          <Descriptions.Item label="Оценка">
            <Tag color={anomaly.score > 10 ? "red" : "gold"}>
              {anomaly.score.toFixed(2)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Порог">{anomaly.threshold.toFixed(2)}</Descriptions.Item>
          <Descriptions.Item label="Статус">
            <Tag color={statusColors[anomaly.status]}>{anomaly.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Обнаружено">
            {new Date(anomaly.detected_at).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Рассмотрено">
            {anomaly.reviewed_at ? new Date(anomaly.reviewed_at).toLocaleString() : "-"}
          </Descriptions.Item>
        </Descriptions>

        {anomaly.status === "pending" && canReview && (
          <>
            <Input.TextArea
              rows={3}
              placeholder="Комментарий специалиста ИБ"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              style={{ marginTop: 16 }}
            />
            <Space style={{ marginTop: 16 }}>
              <Button
                type="primary"
                danger
                icon={<CheckOutlined />}
                onClick={() => handleReview("confirmed")}
              >
                Подтвердить
              </Button>
              <Button
                icon={<CloseOutlined />}
                onClick={() => handleReview("rejected")}
              >
                Отклонить
              </Button>
              <Button type="primary" onClick={() => setIncidentOpen(true)}>
                Создать инцидент
              </Button>
            </Space>
          </>
        )}
      </Card>

      <Card title="SHAP-важности признаков (топ-10)" style={{ marginBottom: 16 }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={180} />
            <Tooltip />
            <Bar dataKey="value" fill="#1677ff" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Все признаки">
        <Table
          columns={featureColumns}
          dataSource={anomaly.features}
          rowKey="feature_name"
          pagination={false}
        />
      </Card>

      <Modal
        title="Создание инцидента"
        open={incidentOpen}
        okText="Создать"
        cancelText="Отмена"
        onOk={handleCreateIncident}
        onCancel={() => setIncidentOpen(false)}
      >
        <p>
          Будет создан инцидент по аномалии #{anomaly.id}. В него попадут
          пользователь, уровень риска и комментарий специалиста.
        </p>
      </Modal>
    </div>
  );
}
