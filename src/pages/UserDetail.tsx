import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Descriptions, Tag, Table, Spin, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { fetchUser, fetchUserProfile, fetchAnomalies } from "../api/client";
import type { UserOut, ProfileOut, AnomalyOut } from "../types/api";

const riskColor = (score: number) => {
  if (score > 10) return "#ff4d4f";
  if (score > 5) return "#faad14";
  if (score > 0) return "#ffec3d";
  return "#52c41a";
};

const anomalyColumns: ColumnsType<AnomalyOut> = [
  { title: "ID", dataIndex: "id", key: "id" },
  {
    title: "Оценка",
    dataIndex: "score",
    key: "score",
    render: (v: number) => <Tag color={riskColor(v)}>{v.toFixed(2)}</Tag>,
  },
  { title: "Порог", dataIndex: "threshold", key: "threshold", render: (v: number) => v.toFixed(2) },
  { title: "Статус", dataIndex: "status", key: "status" },
  { title: "Обнаружено", dataIndex: "detected_at", key: "detected_at", render: (v: string) => new Date(v).toLocaleString() },
];

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserOut | null>(null);
  const [profile, setProfile] = useState<ProfileOut | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyOut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const userId = parseInt(id);
    setLoading(true);
    Promise.all([
      fetchUser(userId),
      fetchUserProfile(userId).catch(() => null),
      fetchAnomalies(undefined, userId),
    ])
      .then(([u, p, a]) => {
        setUser(u);
        setProfile(p);
        setAnomalies(a);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spin size="large" style={{ display: "block", marginTop: 100 }} />;
  if (!user) return <div>Пользователь не найден</div>;

  return (
    <div>
      <Link to="/users">
        <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }}>
          Назад к списку
        </Button>
      </Link>

      <Card title={`Пользователь ${user.anon_id}`} style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="ID">{user.id}</Descriptions.Item>
          <Descriptions.Item label="Анонимный ID">{user.anon_id}</Descriptions.Item>
          <Descriptions.Item label="Роль">{user.role || "-"}</Descriptions.Item>
          <Descriptions.Item label="Отдел">{user.department || "-"}</Descriptions.Item>
          <Descriptions.Item label="Бизнес-единица">{user.business_unit || "-"}</Descriptions.Item>
          <Descriptions.Item label="Активен">{user.is_active ? "Да" : "Нет"}</Descriptions.Item>
          <Descriptions.Item label="Уровень риска">
            <Tag color={riskColor(user.risk_score)}>{user.risk_score.toFixed(2)}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {profile && (
        <Card title="Профиль пользователя" style={{ marginBottom: 16 }}>
          <Descriptions column={2}>
            <Descriptions.Item label="Порог аномалии">
              {profile.anomaly_threshold?.toFixed(4) || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Версия модели">
              {profile.model_version || "-"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Card title="Аномалии">
        <Table
          columns={anomalyColumns}
          dataSource={anomalies}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
