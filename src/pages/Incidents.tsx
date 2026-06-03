import { useEffect, useState } from "react";
import { Button, Select, Space, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DownloadOutlined } from "@ant-design/icons";
import { fetchAnomalies, reviewAnomaly } from "../api/client";
import type { AnomalyOut } from "../types/api";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

export default function Incidents() {
  const [data, setData] = useState<AnomalyOut[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const { role, token } = useAuth();
  const canManage = role === "admin" || role === "specialist";

  const load = () => {
    setLoading(true);
    fetchAnomalies(statusFilter)
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(load, [statusFilter]);

  const handleExportCSV = async () => {
    setExportLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
      const response = await fetch(`${API_URL}/export/csv`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Ошибка при скачивании файла");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "labeled_anomalies_export.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      message.success("Данные успешно выгружены!");
    } catch (error) {
      console.error(error);
      message.error("Не удалось выгрузить данные.");
    } finally {
      setExportLoading(false);
    }
  };

  const columns: ColumnsType<AnomalyOut> = [
    { title: "ID", dataIndex: "id", key: "id", width: 70 },
    {
      title: "Пользователь",
      key: "user_id",
      render: (_, row: any) => <Link to={`/users/${row.user_id}`}>{row.user_anon_id || `#${row.user_id}`}</Link>,
    },
    {
      title: "Уровень риска",
      dataIndex: "score",
      key: "score",
      render: (v: number) => {
        const color = v > 0.8 ? "red" : v > 0.5 ? "orange" : "green";
        return <Tag color={color}>{v.toFixed(1)}</Tag>;
      },
    },
    {
      title: "Детали",
      key: "details",
      render: (_, row) => <Link to={`/anomalies/${row.id}`}>SHAP Анализ</Link>,
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
          render: (v: string, row) => (
        <Select
          value={v as "confirmed" | "rejected"}
          style={{ width: 170 }}
          disabled={!canManage}
          onClick={(e) => e.stopPropagation()}
          onChange={async (newStatus: "confirmed" | "rejected") => {
            await reviewAnomaly(row.id, newStatus, "Изменено со страницы событий");
            message.success("Статус обновлён");
            load();
          }}
          options={[
            { value: "pending", label: "Ожидает проверки", disabled: true },
            { value: "confirmed", label: "Подтвержден (Инцидент)" },
            { value: "rejected", label: "Отклонен" },
          ]}
        />
      ),
    },
    {
      title: "Дата",
      dataIndex: "detected_at",
      key: "detected_at",
      render: (v: string) => new Date(v).toLocaleString(),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Space>
          <span>Статус:</span>
          <Select
            allowClear
            placeholder="Все"
            style={{ width: 200 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "pending", label: "Ожидает проверки" },
              { value: "confirmed", label: "Подтвержден (Инциденты)" },
              { value: "rejected", label: "Отклонен" },
            ]}
          />
        </Space>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExportCSV}
          loading={exportLoading}
        >
          Выгрузить датасет (CSV)
        </Button>
      </div>
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

