export interface UserOut {
  id: number;
  anon_id: string;
  role: string | null;
  department: string | null;
  business_unit: string | null;
  is_active: boolean;
  risk_score: number;
}

export interface UserListResponse {
  items: UserOut[];
  total: number;
  page: number;
  size: number;
}

export interface ProfileOut {
  id: number;
  user_id: number;
  anomaly_threshold: number | null;
  trained_at: string | null;
  model_version: string | null;
}

export interface FeatureOut {
  feature_name: string;
  feature_value: number;
  shap_value: number;
}

export interface AnomalyOut {
  id: number;
  user_id: number;
  score: number;
  threshold: number;
  status: string;
  detected_at: string;
  reviewed_at: string | null;
  features: FeatureOut[];
}

export interface DashboardOut {
  total_users: number;
  total_anomalies: number;
  pending_anomalies: number;
  confirmed_anomalies: number;
  rejected_anomalies: number;
  open_incidents: number;
  critical_incidents: number;
  max_score: number;
}

export interface TrainResponse {
  task_id: string;
  message: string;
}

export interface TrainStatus {
  task_id: string;
  status: string;
  progress: number;
  message: string;
}

export interface ActorContextOut {
  name: string;
  role: string;
  permissions: string[];
}

export interface IncidentOut {
  id: number;
  anomaly_id: number | null;
  user_id: number | null;
  title: string;
  severity: string;
  status: string;
  assignee: string | null;
  summary: string | null;
  exported: boolean;
  created_by: string;
  created_at: string;
  updated_at: string | null;
}

export interface IncidentCreate {
  anomaly_id: number;
  title?: string;
  severity: "low" | "medium" | "high" | "critical";
  assignee?: string;
  summary?: string;
}

export interface AuditLogOut {
  id: number;
  actor: string;
  actor_role: string;
  action: string;
  object_type: string;
  object_id: string | null;
  result: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface SystemSettingOut {
  key: string;
  value: Record<string, unknown>;
  description: string | null;
  updated_by: string | null;
  updated_at: string | null;
}

export interface DatasetReleaseOut {
  id: string;
  path: string;
  recommended: boolean;
  purpose: string;
  schema_notes: string[];
}

export interface TrainingPlanOut {
  execution_target: string;
  baseline_release: string;
  recommended_releases: string[];
  excluded_by_default: string[];
  storage_format: string;
  feature_grain: string;
  required_artifacts: string[];
  validation_strategy: string[];
  releases: DatasetReleaseOut[];
}
