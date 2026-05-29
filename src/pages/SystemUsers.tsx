import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Tag, Card, Typography, Space, message } from "antd";
import { UserAddOutlined, KeyOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { fetchSystemUsers, createSystemUser, updateSystemUserRole } from "../api/client";
import type { SystemUserOut } from "../types/api";
import { useAuth } from "../contexts/AuthContext";

const { Title, Text } = Typography;

export default function SystemUsers() {
  const { role } = useAuth();
  const [users, setUsers] = useState<SystemUserOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchSystemUsers();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      message.error("Не удалось загрузить список пользователей");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === "admin") {
      loadUsers();
    }
  }, [role]);

  if (role !== "admin") {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <SafetyCertificateOutlined style={{ fontSize: 64, color: "#ff4d4f", marginBottom: 20 }} />
        <Title level={3} style={{ color: "#fff" }}>Доступ ограничен</Title>
        <Text style={{ color: "rgba(255,255,255,0.6)" }}>
          Только администраторы могут просматривать и редактировать пользователей системы.
        </Text>
      </div>
    );
  }

  const handleCreate = async (values: any) => {
    try {
      await createSystemUser(values);
      message.success("Пользователь системы успешно зарегистрирован");
      setIsModalOpen(false);
      form.resetFields();
      loadUsers();
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || "Ошибка при регистрации пользователя";
      message.error(detail);
    }
  };

  const handleRoleChange = async (userId: number, newRole: "admin" | "specialist" | "observer") => {
    try {
      await updateSystemUserRole(userId, newRole);
      message.success("Роль пользователя успешно изменена");
      loadUsers();
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || "Не удалось изменить роль";
      message.error(detail);
    }
  };

  const columns = [
    {
      title: "Имя пользователя",
      dataIndex: "username",
      key: "username",
      render: (text: string) => <strong style={{ color: "#fff" }}>{text}</strong>,
    },
    {
      title: "Роль",
      dataIndex: "role",
      key: "role",
      render: (val: string, record: SystemUserOut) => {
        return (
          <Select
            value={val}
            onChange={(newRole) => handleRoleChange(record.id, newRole as "admin" | "specialist" | "observer")}
            style={{ width: 160 }}
            dropdownStyle={{ background: "#1f1f2e" }}
          >
            <Select.Option value="admin">
              <Tag color="magenta">Администратор</Tag>
            </Select.Option>
            <Select.Option value="specialist">
              <Tag color="purple">Специалист ИБ</Tag>
            </Select.Option>
            <Select.Option value="observer">
              <Tag color="blue">Наблюдатель</Tag>
            </Select.Option>
          </Select>
        );
      },
    },
    {
      title: "Статус",
      dataIndex: "is_active",
      key: "is_active",
      render: (active: boolean) => (
        <Tag color={active ? "green" : "red"}>{active ? "Активен" : "Заблокирован"}</Tag>
      ),
    },
    {
      title: "Дата регистрации",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => new Date(date).toLocaleString("ru-RU"),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card
        style={{
          background: "rgba(10, 10, 15, 0.4)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "12px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, alignItems: "center" }}>
          <div>
            <Title level={2} style={{ color: "#fff", margin: 0 }}>
              Пользователи системы
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.6)" }}>
              Управление операторами системы UEBA Monitor и разграничением ролевого доступа.
            </Text>
          </div>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setIsModalOpen(true)}
            style={{
              background: "linear-gradient(90deg, #7b61ff 0%, #aa61ff 100%)",
              border: "none",
            }}
          >
            Добавить оператора
          </Button>
        </div>

        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          style={{ background: "transparent" }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <KeyOutlined style={{ color: "#7b61ff" }} />
            <span style={{ color: "#fff" }}>Новый оператор системы</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Зарегистрировать"
        cancelText="Отмена"
        okButtonProps={{
          style: { background: "linear-gradient(90deg, #7b61ff 0%, #aa61ff 100%)", border: "none" },
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} style={{ marginTop: 20 }}>
          <Form.Item
            name="username"
            label={<span style={{ color: "rgba(255,255,255,0.85)" }}>Имя пользователя</span>}
            rules={[{ required: true, message: "Введите имя пользователя" }]}
          >
            <Input placeholder="Например, ivan_sec" />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ color: "rgba(255,255,255,0.85)" }}>Пароль</span>}
            rules={[{ required: true, message: "Введите пароль" }]}
          >
            <Input.Password placeholder="Минимум 6 символов" />
          </Form.Item>

          <Form.Item
            name="role"
            label={<span style={{ color: "rgba(255,255,255,0.85)" }}>Роль</span>}
            initialValue="observer"
            rules={[{ required: true, message: "Выберите роль" }]}
          >
            <Select>
              <Select.Option value="admin">Администратор</Select.Option>
              <Select.Option value="specialist">Специалист ИБ</Select.Option>
              <Select.Option value="observer">Наблюдатель</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
