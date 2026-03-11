"use client";

import useSWR from "swr";
import api from "@/lib/api";

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export interface AppListItem {
  application: {
    id: string;
    name: string;
    category: string | null;
    icon_url: string | null;
  };
  total_bytes: number;
  query_count: number;
  device_count: number;
  total_time_seconds: number;
}

export interface AppListResponse {
  applications: AppListItem[];
}

export function useApplications(days: number = 7) {
  return useSWR<AppListResponse>(`/api/applications?days=${days}`, fetcher, {
    refreshInterval: 30000,
  });
}

export interface AppHistoryDevice {
  id: string;
  name: string;
  hostname: string | null;
  mac_address: string;
  ip_address: string | null;
  is_online: boolean;
  device_type: string | null;
  query_count: number;
  total_bytes: number;
  first_seen: string | null;
  last_seen: string | null;
}

export interface AppTimelinePoint {
  timestamp: string;
  query_count: number;
  device_count: number;
}

export interface AppHistoryResponse {
  application: {
    id: string;
    name: string;
    category: string | null;
    icon_url: string | null;
  };
  devices: AppHistoryDevice[];
  domains: { domain: string; count: number }[];
  timeline: AppTimelinePoint[];
  total_queries: number;
  total_devices: number;
}

export function useApplicationHistory(appId: string, hours: number = 24) {
  return useSWR<AppHistoryResponse>(
    appId ? `/api/applications/${appId}/history?hours=${hours}` : null,
    fetcher,
    { refreshInterval: 30000 }
  );
}
