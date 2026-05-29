import { useState } from "react";
import { Card, Typography, Button, message, Space, Alert } from "antd";
import { DownloadOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";

export default function ExportData() {
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleExport = async () => {
    setLoading(true);
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

      // Скачивание файла как Blob
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
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", marginTop: 40 }}>
      <Card 
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: "#7b61ff" }} />
            <span>Выгрузка данных для обучения ML-модели</span>
          </Space>
        } 
        className="glass-panel"
      >
        <Alert
          message="Внимание: Встроенное обучение отключено"
          description="В целях безопасности и разграничения сред, функционал обучения модели отсутствует в самом приложении. Система предоставляет только возможности потокового сбора, разметки инцидентов и выгрузки агрегированных данных."
          type="info"
          showIcon
          style={{ marginBottom: 24, background: "rgba(24, 144, 255, 0.1)", border: "1px solid rgba(24, 144, 255, 0.2)" }}
        />
        
        <Typography.Paragraph style={{ fontSize: 16 }}>
          Специалист по информационной безопасности должен выгрузить размеченный набор данных (логи и результаты ручного разбора аномалий), чтобы произвести дообучение нейросети во внешней, специализированной ML-среде (например, защищенный Jupyter Notebook или Google Colab).
        </Typography.Paragraph>

        <Typography.Paragraph type="secondary">
          Формат выгрузки: CSV. Файл включает в себя идентификаторы, признаки, оценки системы и подтвержденные вердикты (confirmed / false_positive).
        </Typography.Paragraph>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <Button 
            type="primary" 
            size="large" 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
            loading={loading}
            style={{ minWidth: 200, height: 48, borderRadius: 8 }}
          >
            Скачать датасет (CSV)
          </Button>
        </div>
      </Card>
    </div>
  );
}
