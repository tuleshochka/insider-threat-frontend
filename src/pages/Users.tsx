import { useEffect, useState } from "react";
import { Table, Tag, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { fetchUsers } from "../api/client";
import type { UserOut } from "../types/api";

const riskColor = (score: number) => {
  if (score > 10) return "#ff4d4f";
  if (score > 5) return "#faad14";
  if (score > 0) return "#ffec3d";
  return "#52c41a";
};

const columns: ColumnsType<UserOut> = [
  { title: "ID", dataIndex: "id", key: "id", width: 60 },
  { title: "Анонимный ID", dataIndex: "anon_id", key: "anon_id" },
  { title: "Роль", dataIndex: "role", key: "role" },
  { title: "Отдел", dataIndex: "department", key: "department" },
  {
    title: "Уровень риска",
    dataIndex: "risk_score",
    key: "risk_score",
    sorter: (a, b) => a.risk_score - b.risk_score,
    render: (v: number) => (
      <Tag color={riskColor(v)}>{v.toFixed(2)}</Tag>
    ),
  },
];

export default function Users() {
  const [data, setData] = useState<UserOut[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchUsers(page, 20)
      .then((r) => {
        setData(r.items);
        setTotal(r.total);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <Input.Search
        placeholder="Поиск по анонимному ID..."
        style={{ marginBottom: 16, width: 320 }}
        onSearch={(v) => {
          const id = parseInt(v);
          if (!isNaN(id)) navigate(`/users/${id}`);
        }}
      />
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: 20,
          onChange: setPage,
          showTotal: (t) => `Всего: ${t}`,
        }}
        onRow={(r) => ({
          onClick: () => navigate(`/users/${r.id}`),
          style: { cursor: "pointer" },
        })}
      />
    </div>
  );
}
