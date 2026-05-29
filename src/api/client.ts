import axios from "axios";
import type {
  UserListResponse,
  UserOut,
  ProfileOut,
  AnomalyOut,
  DashboardOut,
  ActorContextOut,
  AuditLogOut,
  IncidentCreate,
  IncidentOut,
  SystemSettingOut,
  SystemUserOut,
  Token,
} from "../types/api";

const api = axios.create({
  baseURL: "/api/v1",
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ueba_jwt_token");
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

export async function fetchUsers(page: number, size: number): Promise<UserListResponse> {
  const r = await api.get("/users/", { params: { page, size } });
  return r.data;
}

export async function fetchUser(id: number): Promise<UserOut> {
  const r = await api.get(`/users/${id}`);
  return r.data;
}

export async function fetchUserProfile(id: number): Promise<ProfileOut> {
  const r = await api.get(`/users/${id}/profile`);
  return r.data;
}

export async function fetchAnomalies(
  status?: string,
  userId?: number
): Promise<AnomalyOut[]> {
  const params: Record<string, string | number> = {};
  if (status) params.status = status;
  if (userId) params.user_id = userId;
  const r = await api.get("/anomalies", { params });
  return r.data;
}

export async function fetchAnomaly(id: number): Promise<AnomalyOut> {
  const r = await api.get(`/anomalies/${id}`);
  return r.data;
}

export async function reviewAnomaly(
  id: number,
  status: "confirmed" | "rejected",
  comment?: string
): Promise<AnomalyOut> {
  const r = await api.patch(`/anomalies/${id}`, { status, comment });
  return r.data;
}

export async function fetchDashboard(): Promise<DashboardOut> {
  const r = await api.get("/dashboard");
  return r.data;
}


export async function fetchActor(): Promise<ActorContextOut> {
  const r = await api.get("/corporate/me");
  return r.data;
}

export async function fetchIncidents(status?: string): Promise<IncidentOut[]> {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  const r = await api.get("/corporate/incidents", { params });
  return r.data;
}

export async function createIncident(payload: IncidentCreate): Promise<IncidentOut> {
  const r = await api.post("/corporate/incidents", payload);
  return r.data;
}

export async function updateIncidentStatus(
  id: number,
  status: "open" | "in_progress" | "resolved" | "closed"
): Promise<IncidentOut> {
  const r = await api.patch(`/corporate/incidents/${id}`, { status });
  return r.data;
}

export async function exportIncident(id: number): Promise<IncidentOut> {
  const r = await api.post(`/corporate/incidents/${id}/export`);
  return r.data;
}

export async function fetchAuditLogs(): Promise<AuditLogOut[]> {
  const r = await api.get("/corporate/audit");
  return r.data;
}

export async function fetchSettings(): Promise<SystemSettingOut[]> {
  const r = await api.get("/corporate/settings");
  return r.data;
}

export async function updateSetting(
  key: string,
  value: Record<string, unknown>,
  description?: string | null
): Promise<SystemSettingOut> {
  const r = await api.patch(`/corporate/settings/${key}`, { value, description });
  return r.data;
}


export async function loginUser(username: string, password: string): Promise<Token> {
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);
  
  const r = await api.post("/auth/login", params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return r.data;
}

export async function fetchMe(): Promise<SystemUserOut> {
  const r = await api.get("/auth/me");
  return r.data;
}


export async function fetchSystemUsers(): Promise<SystemUserOut[]> {
  const r = await api.get("/system-users");
  return r.data;
}

export async function createSystemUser(payload: { username: string; password: string; role: string }): Promise<SystemUserOut> {
  const r = await api.post("/system-users", payload);
  return r.data;
}

export async function updateSystemUserRole(id: number, role: "admin" | "specialist" | "observer"): Promise<SystemUserOut> {
  const r = await api.patch(`/system-users/${id}/role`, { role });
  return r.data;
}

