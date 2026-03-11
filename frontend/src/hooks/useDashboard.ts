"use client";

import useSWR from "swr";
import api from "@/lib/api";
import { DashboardOverview, TrafficTimeline, TimelineEntry, DeviceUsage } from "@/types";

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export function useDashboardOverview() {
  return useSWR<DashboardOverview>("/api/dashboard/overview", fetcher, {
    refreshInterval: 30000,
  });
}

export function useDevicesByUsage(hours: number = 24) {
  return useSWR<DeviceUsage[]>(
    `/api/dashboard/devices-by-usage?hours=${hours}`,
    fetcher,
    { refreshInterval: 30000 }
  );
}

export interface DeviceCategory {
  group: string;
  label: string;
  devices: (import("@/types").Device & { usage_seconds: number; usage_bytes: number })[];
  total_bytes: number;
  total_time_seconds: number;
  online_count: number;
  device_count: number;
}

export function useDevicesByCategory(hours: number = 24) {
  return useSWR<DeviceCategory[]>(
    `/api/dashboard/devices-by-category?hours=${hours}`,
    fetcher,
    { refreshInterval: 30000 }
  );
}

export function useTrafficTimeline(hours: number = 24) {
  return useSWR<TrafficTimeline>(
    `/api/dashboard/traffic-timeline?hours=${hours}`,
    fetcher,
    { refreshInterval: 60000 }
  );
}

export function useActivityTimeline(hours: number = 24) {
  return useSWR<TimelineEntry[]>(
    `/api/dashboard/activity-timeline?hours=${hours}`,
    fetcher,
    { refreshInterval: 30000 }
  );
}

export interface DpiStatus {
  dpi_available: boolean;
  dpi_client_count: number;
  applications_tracked: number;
  traffic_logs_with_apps: number;
  syslog: { total_messages: number; dns_queries: number; pending_batch: number };
  message: string;
}

export function useDpiStatus() {
  return useSWR<DpiStatus>("/api/dashboard/dpi-status", fetcher, {
    refreshInterval: 60000,
  });
}
