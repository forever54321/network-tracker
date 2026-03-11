"use client";

import useSWR from "swr";
import api from "@/lib/api";
import { DeviceListResponse, Device, SessionListResponse } from "@/types";

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export function useDevices(page: number = 1, search?: string, onlineOnly?: boolean) {
  const params = new URLSearchParams({ page: String(page), per_page: "50" });
  if (search) params.set("search", search);
  if (onlineOnly) params.set("online_only", "true");

  return useSWR<DeviceListResponse>(`/api/devices?${params}`, fetcher, {
    refreshInterval: 30000,
  });
}

export function useDevice(id: string) {
  return useSWR<Device>(`/api/devices/${id}`, fetcher, {
    refreshInterval: 30000,
  });
}

export function useDeviceSessions(id: string, page: number = 1) {
  return useSWR<SessionListResponse>(
    `/api/devices/${id}/sessions?page=${page}`,
    fetcher
  );
}

export interface DeviceApp {
  id: string;
  name: string;
  category: string | null;
  icon_url: string | null;
  query_count: number;
  total_bytes: number;
  first_seen: string | null;
  last_seen: string | null;
}

export interface DeviceDomain {
  domain: string;
  count: number;
}

export interface DeviceAppsResponse {
  applications: DeviceApp[];
  domains: DeviceDomain[];
}

export function useDeviceApplications(id: string, hours: number = 24) {
  return useSWR<DeviceAppsResponse>(
    `/api/devices/${id}/applications?hours=${hours}`,
    fetcher,
    { refreshInterval: 30000 }
  );
}
