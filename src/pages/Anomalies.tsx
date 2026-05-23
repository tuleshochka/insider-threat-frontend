import { useEffect, useState } from "react";
import { Table, Tag, Select, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { fetchAnomalies } from "../api/client";
import type { AnomalyOut } from "../types/api";

const statusColors: Record<string, string> = {
  pending: "gold",
  confirmed: "red",
  rejected: "green",
};

const columns: ColumnsType<AnomalyOut> = [
  { title: "ID", dataIndex: "id", key: "id", width: 60 },
  { title: "Пользователь", dataIndex: "user_id", key: "user_id" },
  {
    title: "Оценка",
    dataIndex: "score",
    key: "score",
    sorter: (a, b) => a.score - b.score,
    render: (v: number) => <Tag color={v > 10 ? "red" : v > 5 ? "orange" : "gold"}>{v.toFixed(2)}</Tag>,
  },
  {
    title: "Порог",
    dataIndex: "threshold",
    key: "threshold",
    render: (v: number) => v.toFixed(2),
  },
  {
    title: "Статус",
    dataIndex: "status",
    key: "status",
    render: (v: string) => (
      <Tag color={statusColors[v] || "default"}>{v}</Tag>
    ),
  },
  {
    title: "Обнаружено",
    dataIndex: "detected_at",
    key: "detected_at",
    render: (v: string) => new Date(v).toLocaleString(),
  },
];

export default function Anomalies() {
  const [data, setData] = useState<AnomalyOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchAnomalies(statusFilter)
      .then(setData)
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <span>Фильтр по статусу:</span>
        <Select
          allowClear
          placeholder="Все статусы"
          style={{ width: 160 }}
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "pending", label: "В ожидании" },
            { value: "confirmed", label: "Подтверждено" },
            { value: "rejected", label: "Отклонено" },
          ]}
        />
      </Space>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20, showTotal: (t) => `Всего: ${t}` }}
        onRow={(r) => ({
          onClick: () => navigate(`/anomalies/${r.id}`),
          style: { cursor: "pointer" },
        })}
      />
    </div>
  );
}
