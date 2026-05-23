import { useEffect, useState } from "react";
import { Card, Col, Row, Spin, Table, Tag, Timeline, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CloudServerOutlined, DatabaseOutlined } from "@ant-design/icons";
import { fetchTrainingPlan } from "../api/client";
import type { DatasetReleaseOut, TrainingPlanOut } from "../types/api";

const releaseColumns: ColumnsType<DatasetReleaseOut> = [
  {
    title: "Релиз",
    dataIndex: "id",
    key: "id",
    width: 90,
    render: (v: string) => <Tag color="blue">{v}</Tag>,
  },
  {
    title: "Назначение",
    dataIndex: "purpose",
    key: "purpose",
  },
  {
    title: "Статус",
    dataIndex: "recommended",
    key: "recommended",
    width: 160,
    render: (v: boolean) => (
      <Tag color={v ? "green" : "default"}>{v ? "Основной набор" : "Доп. проверка"}</Tag>
    ),
  },
  {
    title: "Особенности схемы",
    dataIndex: "schema_notes",
    key: "schema_notes",
    render: (notes: string[]) => notes.map((note) => <Tag key={note}>{note}</Tag>),
  },
];

export default function TrainingPlan() {
  const [plan, setPlan] = useState<TrainingPlanOut | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainingPlan()
      .then(setPlan)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: "block", marginTop: 100 }} />;
  if (!plan) return null;

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Среда обучения" className="glass-panel">
            <Typography.Title level={3} style={{ marginTop: 0 }}>
              <CloudServerOutlined /> {plan.execution_target}
            </Typography.Title>
            <Typography.Paragraph>
              Базовый релиз для сопоставимости: <Tag color="purple">{plan.baseline_release}</Tag>
            </Typography.Paragraph>
            <Typography.Paragraph>
              Формат хранения: <strong>{plan.storage_format}</strong>
            </Typography.Paragraph>
            <Typography.Paragraph>
              Гранулярность признаков: <strong>{plan.feature_grain}</strong>
            </Typography.Paragraph>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Основные релизы" className="glass-panel">
            {plan.recommended_releases.map((release) => (
              <Tag color="green" key={release} style={{ marginBottom: 8 }}>
                {release}
              </Tag>
            ))}
            <Typography.Paragraph style={{ marginTop: 16 }}>
              Исключаются по умолчанию:{" "}
              {plan.excluded_by_default.map((release) => (
                <Tag key={release}>{release}</Tag>
              ))}
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>

      <Card title="Релизы CERT" className="glass-panel" style={{ marginTop: 16 }}>
        <Table
          columns={releaseColumns}
          dataSource={plan.releases}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="Артефакты Colab" className="glass-panel">
            <Timeline
              items={plan.required_artifacts.map((artifact) => ({
                dot: <DatabaseOutlined />,
                children: <code>{artifact}</code>,
              }))}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Проверка качества" className="glass-panel">
            <Timeline
              items={plan.validation_strategy.map((item) => ({
                color: "blue",
                children: item,
              }))}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
