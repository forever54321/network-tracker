"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDevice, useDeviceSessions, useDeviceApplications } from "@/hooks/useDevices";
import { AppIcon } from "@/components/ui/AppIcon";
import { formatBytes, formatDuration, formatDateTime } from "@/lib/utils";
import { ArrowLeft, Globe, Clock, Wifi, Info } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  streaming: "from-pink-500 to-pink-600",
  social: "from-blue-500 to-blue-600",
  messaging: "from-green-500 to-green-600",
  conferencing: "from-indigo-500 to-indigo-600",
  music: "from-purple-500 to-purple-600",
  productivity: "from-amber-500 to-amber-600",
  cloud: "from-cyan-500 to-cyan-600",
  gaming: "from-red-500 to-red-600",
  shopping: "from-orange-500 to-orange-600",
  developer: "from-gray-500 to-gray-600",
  smart_home: "from-teal-500 to-teal-600",
};

const CATEGORY_BG: Record<string, string> = {
  streaming: "bg-pink-500/10",
  social: "bg-blue-500/10",
  messaging: "bg-green-500/10",
  conferencing: "bg-indigo-500/10",
  music: "bg-purple-500/10",
  productivity: "bg-amber-500/10",
  cloud: "bg-cyan-500/10",
  gaming: "bg-red-500/10",
  shopping: "bg-orange-500/10",
  developer: "bg-gray-500/10",
  smart_home: "bg-teal-500/10",
};

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
        <Skeleton className="h-48 w-full rounded-2xl" />
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
      <div>
        <Link
          href="/dashboard/devices"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Devices
        </Link>
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
      </div>

      {/* Device Info + Applications */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-gray-400" />
              <CardTitle>Device Information</CardTitle>
            </div>
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
              <div key={label} className="flex justify-between rounded-lg px-1 py-0.5">
                <dt className="text-sm text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                  {value || "-"}
                </dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <CardTitle>Applications</CardTitle>
              </div>
              <div className="flex gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-white/[0.04]">
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
                    className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-all duration-200 ${
                      appHours === opt.value
                        ? "bg-primary-600 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          {!appsData || appsData.applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 dark:bg-white/[0.04]">
                <Globe className="h-6 w-6 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                No application data yet
              </p>
              <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                Apps appear as DNS queries are captured
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {appsData.applications.map((app) => {
                const catBg = CATEGORY_BG[app.category || ""] || "bg-gray-500/10";
                return (
                  <div
                    key={app.id}
                    className="relative overflow-hidden rounded-xl border border-gray-50 p-3 transition-all hover:border-gray-200 dark:border-white/[0.03] dark:hover:border-white/[0.08]"
                  >
                    <div
                      className={`absolute inset-y-0 left-0 opacity-30 dark:opacity-20 ${catBg}`}
                      style={{ width: `${(app.query_count / maxQueries) * 100}%` }}
                    />
                    <div className="relative flex items-center gap-3">
                      <AppIcon name={app.name} category={app.category} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {app.name}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          {app.category || "uncategorized"}
                          {app.last_seen && (
                            <> &middot; {new Date(app.last_seen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</>
                          )}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {app.query_count}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {app.total_bytes > 0 ? formatBytes(app.total_bytes) : "queries"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Domains + Sessions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {appsData && appsData.domains.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-gray-400" />
                <CardTitle>Recent Domains</CardTitle>
              </div>
            </CardHeader>
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                    <th className="pb-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Domain</th>
                    <th className="pb-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Queries</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                  {appsData.domains.map((d) => (
                    <tr key={d.domain}>
                      <td className="py-2 text-gray-900 dark:text-gray-200">
                        <span className="font-mono text-xs">{d.domain}</span>
                      </td>
                      <td className="py-2 text-right text-sm font-medium text-gray-500 dark:text-gray-400">{d.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <CardTitle>Recent Sessions</CardTitle>
            </div>
          </CardHeader>
          {sessionsData?.sessions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No sessions recorded</p>
          ) : (
            <div className="space-y-2">
              {sessionsData?.sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-xl border border-gray-50 p-3 dark:border-white/[0.03]"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDateTime(session.started_at)}
                      {session.ended_at && ` - ${formatDateTime(session.ended_at)}`}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {session.duration_seconds
                        ? formatDuration(session.duration_seconds)
                        : "Active"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatBytes(session.bytes_sent + session.bytes_received)}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
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
