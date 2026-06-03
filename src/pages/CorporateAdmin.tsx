import { useEffect, useState } from "react";
import { Card, Input, Space, Typography, message, Button } from "antd";
import { fetchSettings, updateSetting } from "../api/client";
import type { SystemSettingOut } from "../types/api";
import { useAuth } from "../contexts/AuthContext";

export default function CorporateAdmin() {
  const [settings, setSettings] = useState<SystemSettingOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const { role } = useAuth();
  const canEditSettings = role === "admin";

  const load = async () => {
    setLoading(true);
    const settingRows = await fetchSettings();
    // Фильтруем source_policy — модель обучена на фиксированном наборе данных CERT
    const filtered = settingRows.filter((s) => s.key !== "source_policy");
    setSettings(filtered);
    setDrafts(
      Object.fromEntries(filtered.map((row) => [row.key, JSON.stringify(row.value, null, 2)]))
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ maxWidth: 700 }}>
      <Typography.Title level={3} style={{ marginBottom: 24 }}>
        Настройки системы
      </Typography.Title>
      <Card className="glass-panel" loading={loading}>
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
    </div>
  );
}
