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
  useTrafficTimeline,
  useDpiStatus,
  DeviceCategory,
} from "@/hooks/useDashboard";
import { formatBytes, formatDuration } from "@/lib/utils";
import {
  Smartphone,
  Monitor,
  Server,
  Tv,
  Home,
  Shield,
  Wifi,
  Box,
  ChevronDown,
  Activity,
  HardDrive,
  Globe,
  Layers,
  ChevronsUpDown,
  ChevronsDownUp,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, any> = {
  phones: Smartphone,
  computers: Monitor,
  servers: Server,
  entertainment: Tv,
  smart_home: Home,
  security: Shield,
  network: Wifi,
  other: Box,
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  phones: "from-blue-500 to-blue-600",
  computers: "from-violet-500 to-violet-600",
  servers: "from-emerald-500 to-emerald-600",
  entertainment: "from-pink-500 to-pink-600",
  smart_home: "from-amber-500 to-amber-600",
  security: "from-red-500 to-red-600",
  network: "from-cyan-500 to-cyan-600",
  other: "from-gray-500 to-gray-600",
};

const CATEGORY_SHADOW: Record<string, string> = {
  phones: "shadow-blue-500/20",
  computers: "shadow-violet-500/20",
  servers: "shadow-emerald-500/20",
  entertainment: "shadow-pink-500/20",
  smart_home: "shadow-amber-500/20",
  security: "shadow-red-500/20",
  network: "shadow-cyan-500/20",
  other: "shadow-gray-500/20",
};

function CategoryCard({ category, expanded, onToggle }: { category: DeviceCategory; expanded: boolean; onToggle: () => void }) {
  const gradient = CATEGORY_GRADIENTS[category.group] || "from-gray-500 to-gray-600";
  const shadow = CATEGORY_SHADOW[category.group] || "shadow-gray-500/20";
  const Icon = CATEGORY_ICONS[category.group] || Box;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:shadow-card-hover dark:border-white/[0.06] dark:bg-surface-900/80 dark:hover:shadow-card-dark-hover">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 p-4 text-left transition-colors"
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg ${shadow} text-white`}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-white">{category.label}</span>
            <Badge variant="default">{category.device_count}</Badge>
            <Badge variant="success">{category.online_count} online</Badge>
          </div>
          <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
            {formatDuration(category.total_time_seconds)} usage &middot; {formatBytes(category.total_bytes)} transferred
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>

      {expanded && (
        <div className="animate-fade-in border-t border-gray-100 dark:border-white/[0.04]">
          {category.devices.map((device) => (
            <Link
              key={device.id}
              href={`/dashboard/devices/${device.id}`}
              className="flex items-center gap-3 border-b border-gray-50 px-5 py-3 last:border-0 transition-colors hover:bg-gray-50/80 dark:border-white/[0.02] dark:hover:bg-white/[0.02]"
            >
              <div className="relative flex h-2 w-2 shrink-0">
                {device.is_online && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                )}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${device.is_online ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {device.friendly_name || device.hostname || device.mac_address}
                </span>
                <div className="flex gap-3 text-[11px] text-gray-400">
                  <span className="font-mono">{device.ip_address || "no IP"}</span>
                  <span>{device.device_type}</span>
                  <span>{device.connection_type}</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatDuration(device.usage_seconds)}
                </p>
                <p className="text-[11px] text-gray-400">{formatBytes(device.usage_bytes)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, sub, icon: Icon, gradient }: {
  title: string;
  value: string | number;
  sub: string;
  icon: any;
  gradient: string;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{value}</p>
          <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">{sub}</p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg text-white`}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>
      </div>
    </div>
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
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {overviewLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] w-full rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard
              title="Devices Online"
              value={`${overview?.online_devices ?? 0} / ${overview?.total_devices ?? 0}`}
              sub="connected right now"
              icon={Activity}
              gradient="from-emerald-500 to-emerald-600"
            />
            <StatCard
              title="Bandwidth Today"
              value={formatBytes(overview?.total_bandwidth_today ?? 0)}
              sub={`${formatBytes(overview?.total_upload_today ?? 0)} up / ${formatBytes(overview?.total_download_today ?? 0)} down`}
              icon={HardDrive}
              gradient="from-blue-500 to-blue-600"
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
              icon={Globe}
              gradient="from-violet-500 to-violet-600"
            />
            <StatCard
              title="Categories"
              value={categories?.length ?? 0}
              sub="device groups detected"
              icon={Layers}
              gradient="from-amber-500 to-amber-600"
            />
          </>
        )}
      </div>

      {/* Devices by Category */}
      <div>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Devices by Category</h2>
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5 rounded-xl bg-gray-100 p-1 dark:bg-white/[0.04]">
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
                  className={`time-pill ${hours === opt.value ? "time-pill-active" : "time-pill-inactive"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="h-5 w-px bg-gray-200 dark:bg-white/[0.08]" />
            <button onClick={expandAll} className="flex items-center gap-1 text-xs font-medium text-primary-600 transition-colors hover:text-primary-500 dark:text-primary-400">
              <ChevronsUpDown className="h-3.5 w-3.5" />
              Expand
            </button>
            <button onClick={collapseAll} className="flex items-center gap-1 text-xs font-medium text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300">
              <ChevronsDownUp className="h-3.5 w-3.5" />
              Collapse
            </button>
          </div>
        </div>

        {categoriesLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
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
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-500/10">
                <Globe className="h-6 w-6 text-amber-500" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Application tracking needs Traffic Identification
              </p>
              <p className="max-w-sm text-xs text-gray-500 dark:text-gray-400">
                Open your UniFi controller &rarr; <strong>Settings</strong> &rarr; <strong>Traffic &amp; Security</strong> &rarr; enable <strong>Traffic Identification</strong>.
                {dpiStatus?.syslog?.total_messages ? ` (${dpiStatus.syslog.dns_queries} DNS queries captured)` : ""}
              </p>
              {dpiStatus && (
                <div className="mt-1 flex gap-3 text-[11px] text-gray-400">
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
