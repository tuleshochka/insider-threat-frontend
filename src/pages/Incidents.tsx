import { useEffect, useState } from "react";
import { Button, Select, Space, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ExportOutlined } from "@ant-design/icons";
import { exportIncident, fetchIncidents, updateIncidentStatus } from "../api/client";
import type { IncidentOut } from "../types/api";

type IncidentStatus = "open" | "in_progress" | "resolved" | "closed";

const severityColors: Record<string, string> = {
  low: "green",
  medium: "gold",
  high: "orange",
  critical: "red",
};

export default function Incidents() {
  const [data, setData] = useState<IncidentOut[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("ueba_actor_role") || "security_specialist";
  const canManage = role === "lead";

  const load = () => {
    setLoading(true);
    fetchIncidents(statusFilter)
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(load, [statusFilter]);

  const columns: ColumnsType<IncidentOut> = [
    { title: "ID", dataIndex: "id", key: "id", width: 70 },
    { title: "Название", dataIndex: "title", key: "title" },
    {
      title: "Критичность",
      dataIndex: "severity",
      key: "severity",
      render: (v: string) => <Tag color={severityColors[v]}>{v}</Tag>,
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (v: string, row) => (
        <Select
          value={v as IncidentStatus}
          style={{ width: 150 }}
          disabled={!canManage}
          onClick={(e) => e.stopPropagation()}
          onChange={async (status: IncidentStatus) => {
            await updateIncidentStatus(row.id, status);
            message.success("Статус инцидента обновлён");
            load();
          }}
          options={[
            { value: "open", label: "Открыт" },
            { value: "in_progress", label: "В работе" },
            { value: "resolved", label: "Решён" },
            { value: "closed", label: "Закрыт" },
          ]}
        />
      ),
    },
    { title: "Ответственный", dataIndex: "assignee", key: "assignee", render: (v) => v || "-" },
    {
      title: "Экспорт",
      dataIndex: "exported",
      key: "exported",
      render: (v: boolean, row) =>
        v ? (
          <Tag color="green">Экспортирован</Tag>
        ) : (
          <Button
            icon={<ExportOutlined />}
            disabled={!canManage}
            onClick={async () => {
              await exportIncident(row.id);
              message.success("Инцидент помечен как экспортированный");
              load();
            }}
          >
            Экспорт
          </Button>
        ),
    },
    {
      title: "Создан",
      dataIndex: "created_at",
      key: "created_at",
      render: (v: string) => new Date(v).toLocaleString(),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <span>Статус:</span>
        <Select
          allowClear
          placeholder="Все"
          style={{ width: 170 }}
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "open", label: "Открыт" },
            { value: "in_progress", label: "В работе" },
            { value: "resolved", label: "Решён" },
            { value: "closed", label: "Закрыт" },
          ]}
        />
      </Space>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20, showTotal: (total) => `Всего: ${total}` }}
      />
    </div>
  );
}
