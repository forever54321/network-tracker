export interface Device {
  id: string;
  mac_address: string;
  hostname: string | null;
  friendly_name: string | null;
  ip_address: string | null;
  vendor: string | null;
  device_type: string | null;
  connection_type: string | null;
  is_online: boolean;
  first_seen: string;
  last_seen: string;
  usage_seconds?: number;
  usage_bytes?: number;
}

export interface DeviceListResponse {
  devices: Device[];
  total: number;
  page: number;
  per_page: number;
}

export interface DeviceUsage {
  device: Device;
  total_time_seconds: number;
  total_bytes_sent: number;
  total_bytes_received: number;
  session_count: number;
}

export interface Session {
  id: string;
  device_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  bytes_sent: number;
  bytes_received: number;
}

export interface SessionListResponse {
  sessions: Session[];
  total: number;
  page: number;
  per_page: number;
}

export interface Application {
  id: string;
  name: string;
  category: string | null;
  icon_url: string | null;
}

export interface ApplicationUsage {
  application: Application;
  total_time_seconds: number;
  total_bytes: number;
  query_count: number;
}

export interface DashboardOverview {
  total_devices: number;
  online_devices: number;
  total_bandwidth_today: number;
  total_upload_today: number;
  total_download_today: number;
  top_devices: Device[];
  top_applications: ApplicationUsage[];
}

export interface TrafficPoint {
  timestamp: string;
  bytes_sent: number;
  bytes_received: number;
}

export interface TrafficTimeline {
  points: TrafficPoint[];
}

export interface TimelineEntry {
  device_id: string;
  device_name: string;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
