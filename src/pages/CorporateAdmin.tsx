import { useEffect, useState } from "react";
import { Card, Col, Input, Row, Space, Table, Tag, Typography, message, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { fetchAuditLogs, fetchSettings, updateSetting } from "../api/client";
import type { AuditLogOut, SystemSettingOut } from "../types/api";

export default function CorporateAdmin() {
  const [audit, setAudit] = useState<AuditLogOut[]>([]);
  const [settings, setSettings] = useState<SystemSettingOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const role = localStorage.getItem("ueba_actor_role") || "security_specialist";
  const canEditSettings = role === "lead";

  const load = async () => {
    setLoading(true);
    const [auditRows, settingRows] = await Promise.all([fetchAuditLogs(), fetchSettings()]);
    setAudit(auditRows);
    setSettings(settingRows);
    setDrafts(
      Object.fromEntries(settingRows.map((row) => [row.key, JSON.stringify(row.value, null, 2)]))
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const auditColumns: ColumnsType<AuditLogOut> = [
    { title: "Время", dataIndex: "created_at", key: "created_at", render: (v: string) => new Date(v).toLocaleString() },
    { title: "Пользователь", dataIndex: "actor", key: "actor" },
    { title: "Роль", dataIndex: "actor_role", key: "actor_role", render: (v: string) => <Tag>{v}</Tag> },
    { title: "Действие", dataIndex: "action", key: "action" },
    { title: "Объект", dataIndex: "object_type", key: "object_type" },
    { title: "Результат", dataIndex: "result", key: "result", render: (v: string) => <Tag color="green">{v}</Tag> },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={10}>
          <Card title="Корпоративные настройки" className="glass-panel" loading={loading}>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              {settings.map((setting) => (
                <div key={setting.key}>
                  <Typography.Text strong>{setting.key}</Typography.Text>
                  <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
                    {setting.description}
                  </Typography.Paragraph>
                  <Input.TextArea
                    rows={7}
                    value={drafts[setting.key]}
                    disabled={!canEditSettings}
                    onChange={(e) => setDrafts({ ...drafts, [setting.key]: e.target.value })}
                  />
                  <Button
                    type="primary"
                    style={{ marginTop: 8 }}
                    disabled={!canEditSettings}
                    onClick={async () => {
                      try {
                        const parsed = JSON.parse(drafts[setting.key]);
                        await updateSetting(setting.key, parsed, setting.description);
                        message.success("Настройка сохранена");
                        load();
                      } catch {
                        message.error("JSON содержит ошибку");
                      }
                    }}
                  >
                    Сохранить
                  </Button>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
        <Col span={14}>
          <Card title="Журнал аудита" className="glass-panel">
            <Table
              columns={auditColumns}
              dataSource={audit}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 12 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
