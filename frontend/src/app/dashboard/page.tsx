"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { BandwidthChart } from "@/components/charts/BandwidthChart";
import { AppBreakdownChart } from "@/components/charts/AppBreakdownChart";
import {
  useDashboardOverview,
  useDevicesByCategory,
  useDevicesByUsage,
  useTrafficTimeline,
  useDpiStatus,
  DeviceCategory,
} from "@/hooks/useDashboard";
import { formatBytes, formatDuration } from "@/lib/utils";
import { Device, DeviceUsage } from "@/types";

const CATEGORY_ICONS: Record<string, string> = {
  phones: "phone",
  computers: "computer",
  servers: "server",
  entertainment: "tv",
  smart_home: "home",
  security: "camera",
  network: "wifi",
  other: "box",
};

const CATEGORY_COLORS: Record<string, string> = {
  phones: "bg-blue-500",
  computers: "bg-purple-500",
  servers: "bg-green-500",
  entertainment: "bg-pink-500",
  smart_home: "bg-amber-500",
  security: "bg-red-500",
  network: "bg-cyan-500",
  other: "bg-gray-500",
};

function CategoryIcon({ group }: { group: string }) {
  const icons: Record<string, JSX.Element> = {
    phones: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    computers: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    servers: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
      </svg>
    ),
    entertainment: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    smart_home: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    security: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l-3 3m0 0l-3-3m3 3V3m0 0a9 9 0 11-6.36 2.636" />
      </svg>
    ),
    network: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
      </svg>
    ),
    other: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  };
  return icons[group] || icons.other;
}

function CategoryCard({ category, expanded, onToggle }: { category: DeviceCategory; expanded: boolean; onToggle: () => void }) {
  const colorClass = CATEGORY_COLORS[category.group] || "bg-gray-500";

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white ${colorClass}`}>
          <CategoryIcon group={category.group} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-white">{category.label}</span>
            <Badge variant="default">{category.device_count} device{category.device_count !== 1 ? "s" : ""}</Badge>
            <Badge variant="success">{category.online_count} online</Badge>
          </div>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {formatDuration(category.total_time_seconds)} usage &middot; {formatBytes(category.total_bytes)} transferred
          </p>
        </div>
        <svg
          className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-800">
          {category.devices.map((device) => (
            <Link
              key={device.id}
              href={`/dashboard/devices/${device.id}`}
              className="flex items-center gap-3 border-b border-gray-50 px-4 py-3 last:border-0 hover:bg-gray-50 dark:border-gray-800/50 dark:hover:bg-gray-800/30"
            >
              <div className={`h-2 w-2 shrink-0 rounded-full ${device.is_online ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`} />
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {device.friendly_name || device.hostname || device.mac_address}
                </span>
                <div className="flex gap-3 text-xs text-gray-400">
                  <span>{device.ip_address || "no IP"}</span>
                  <span>{device.device_type}</span>
                  <span>{device.connection_type}</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatDuration(device.usage_seconds)}
                </p>
                <p className="text-xs text-gray-400">{formatBytes(device.usage_bytes)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, sub, color }: { title: string; value: string | number; sub: string; color: string }) {
  return (
    <Card>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
      <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{sub}</p>
    </Card>
  );
}

export default function DashboardPage() {
  const [hours, setHours] = useState(24);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const { data: overview, isLoading: overviewLoading } = useDashboardOverview();
  const { data: categories, isLoading: categoriesLoading } = useDevicesByCategory(hours);
  const { data: traffic } = useTrafficTimeline(hours);
  const { data: dpiStatus } = useDpiStatus();

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const expandAll = () => {
    if (categories) {
      setExpandedGroups(new Set(categories.map((c) => c.group)));
    }
  };

  const collapseAll = () => setExpandedGroups(new Set());

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {overviewLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><Skeleton className="h-16 w-full" /></Card>
          ))
        ) : (
          <>
            <StatCard
              title="Devices Online"
              value={`${overview?.online_devices ?? 0} / ${overview?.total_devices ?? 0}`}
              sub="connected right now"
              color="text-green-600 dark:text-green-400"
            />
            <StatCard
              title="Bandwidth Today"
              value={formatBytes(overview?.total_bandwidth_today ?? 0)}
              sub={`${formatBytes(overview?.total_upload_today ?? 0)} up / ${formatBytes(overview?.total_download_today ?? 0)} down`}
              color="text-blue-600 dark:text-blue-400"
            />
            <StatCard
              title="Top App"
              value={overview?.top_applications?.[0]?.application.name ?? "Collecting..."}
              sub={
                overview?.top_applications?.[0]
                  ? overview.top_applications[0].total_bytes > 0
                    ? formatBytes(overview.top_applications[0].total_bytes)
                    : `${overview.top_applications[0].query_count} queries detected`
                  : "data building up"
              }
              color="text-purple-600 dark:text-purple-400"
            />
            <StatCard
              title="Categories"
              value={categories?.length ?? 0}
              sub="device groups detected"
              color="text-amber-600 dark:text-amber-400"
            />
          </>
        )}
      </div>

      {/* Devices by Category */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Devices by Category</h2>
          <div className="flex items-center gap-3">
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
                  onClick={() => setHours(opt.value)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    hours === opt.value
                      ? "bg-primary-600 text-white"
                      : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
            <button onClick={expandAll} className="text-xs text-primary-600 hover:underline dark:text-primary-400">
              Expand all
            </button>
            <button onClick={collapseAll} className="text-xs text-gray-500 hover:underline dark:text-gray-400">
              Collapse
            </button>
          </div>
        </div>

        {categoriesLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="space-y-3">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.group}
                category={cat}
                expanded={expandedGroups.has(cat.group)}
                onToggle={() => toggleGroup(cat.group)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <p className="py-8 text-center text-sm text-gray-500">No device data available</p>
          </Card>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bandwidth Over Time</CardTitle>
          </CardHeader>
          <BandwidthChart points={traffic?.points ?? []} />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Applications</CardTitle>
          </CardHeader>
          {overview?.top_applications && overview.top_applications.length > 0 ? (
            <AppBreakdownChart applications={overview.top_applications} />
          ) : (
            <div className="flex h-72 flex-col items-center justify-center gap-3 px-6 text-center">
              <svg className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Application tracking needs Traffic Identification
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Open your UniFi controller &rarr; <strong>Settings</strong> &rarr; <strong>Traffic &amp; Security</strong> &rarr; enable <strong>Traffic Identification</strong>.
                {dpiStatus?.syslog?.total_messages ? ` (${dpiStatus.syslog.dns_queries} DNS queries captured)` : ""}
              </p>
              {dpiStatus && (
                <div className="mt-1 flex gap-3 text-xs text-gray-400">
                  <span>Apps tracked: {dpiStatus.applications_tracked}</span>
                  <span>Logs: {dpiStatus.traffic_logs_with_apps}</span>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
