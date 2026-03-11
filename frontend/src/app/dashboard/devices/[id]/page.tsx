"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDevice, useDeviceSessions, useDeviceApplications } from "@/hooks/useDevices";
import { AppIcon } from "@/components/ui/AppIcon";
import { formatBytes, formatDuration, formatDateTime } from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  streaming: "bg-pink-500",
  social: "bg-blue-500",
  messaging: "bg-green-500",
  conferencing: "bg-indigo-500",
  music: "bg-purple-500",
  productivity: "bg-amber-500",
  cloud: "bg-cyan-500",
  gaming: "bg-red-500",
  shopping: "bg-orange-500",
  developer: "bg-gray-600",
};

function getCategoryColor(category: string | null): string {
  return category ? CATEGORY_COLORS[category] || "bg-gray-500" : "bg-gray-500";
}

function getCategoryIcon(category: string | null): JSX.Element {
  const icons: Record<string, JSX.Element> = {
    streaming: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    social: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    messaging: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    conferencing: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    music: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
    productivity: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    gaming: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    cloud: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
  };
  const key = category || "";
  return icons[key] || (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

export default function DeviceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: device, isLoading } = useDevice(id);
  const [sessionPage, setSessionPage] = useState(1);
  const [appHours, setAppHours] = useState(24);
  const { data: sessionsData } = useDeviceSessions(id, sessionPage);
  const { data: appsData } = useDeviceApplications(id, appHours);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!device) {
    return <p className="text-gray-500">Device not found</p>;
  }

  const maxQueries = appsData?.applications?.[0]?.query_count || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {device.friendly_name || device.hostname || device.mac_address}
        </h2>
        <Badge variant={device.is_online ? "success" : "danger"}>
          {device.is_online ? "Online" : "Offline"}
        </Badge>
        {device.device_type && (
          <Badge variant="default">{device.device_type}</Badge>
        )}
      </div>

      {/* Device Info + Applications */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Device Information */}
        <Card>
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
          </CardHeader>
          <dl className="space-y-3">
            {[
              ["Hostname", device.hostname],
              ["MAC Address", device.mac_address],
              ["IP Address", device.ip_address],
              ["Vendor", device.vendor],
              ["Device Type", device.device_type],
              ["Connection", device.connection_type],
              ["First Seen", formatDateTime(device.first_seen)],
              ["Last Seen", formatDateTime(device.last_seen)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">
                  {value || "-"}
                </dd>
              </div>
            ))}
          </dl>
        </Card>

        {/* Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Applications</CardTitle>
              <div className="flex gap-1">
                {[
                  { label: "1h", value: 1 },
                  { label: "6h", value: 6 },
                  { label: "24h", value: 24 },
                  { label: "7d", value: 168 },
                  { label: "30d", value: 720 },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAppHours(opt.value)}
                    className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                      appHours === opt.value
                        ? "bg-primary-600 text-white"
                        : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          {!appsData || appsData.applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <svg className="mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No application data yet for this device
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Apps appear as DNS queries are captured
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {appsData.applications.map((app) => (
                <div
                  key={app.id}
                  className="relative overflow-hidden rounded-lg border border-gray-100 p-3 dark:border-gray-800"
                >
                  {/* Progress bar background */}
                  <div
                    className={`absolute inset-y-0 left-0 opacity-10 ${getCategoryColor(app.category)}`}
                    style={{ width: `${(app.query_count / maxQueries) * 100}%` }}
                  />
                  <div className="relative flex items-center gap-3">
                    <AppIcon name={app.name} category={app.category} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {app.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {app.category || "uncategorized"}
                        {app.last_seen && (
                          <> &middot; last seen {new Date(app.last_seen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</>
                        )}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {app.query_count}
                      </p>
                      <p className="text-xs text-gray-400">
                        {app.total_bytes > 0 ? formatBytes(app.total_bytes) : "queries"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Domains + Sessions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Domains */}
        {appsData && appsData.domains.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Domains</CardTitle>
            </CardHeader>
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="pb-2 text-left font-medium text-gray-500 dark:text-gray-400">Domain</th>
                    <th className="pb-2 text-right font-medium text-gray-500 dark:text-gray-400">Queries</th>
                  </tr>
                </thead>
                <tbody>
                  {appsData.domains.map((d) => (
                    <tr key={d.domain} className="border-b border-gray-50 last:border-0 dark:border-gray-800/50">
                      <td className="py-1.5 text-gray-900 dark:text-gray-200">
                        <span className="font-mono text-xs">{d.domain}</span>
                      </td>
                      <td className="py-1.5 text-right text-gray-500 dark:text-gray-400">{d.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          {sessionsData?.sessions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No sessions recorded</p>
          ) : (
            <div className="space-y-2">
              {sessionsData?.sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDateTime(session.started_at)}
                      {session.ended_at && ` - ${formatDateTime(session.ended_at)}`}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {session.duration_seconds
                        ? formatDuration(session.duration_seconds)
                        : "Active"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatBytes(session.bytes_sent + session.bytes_received)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatBytes(session.bytes_sent)} up / {formatBytes(session.bytes_received)} down
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
