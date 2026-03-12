"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { AppBreakdownChart } from "@/components/charts/AppBreakdownChart";
import { AppIcon } from "@/components/ui/AppIcon";
import { useApplications, useApplicationHistory, AppListItem } from "@/hooks/useTraffic";
import { formatBytes } from "@/lib/utils";
import { ChevronDown, PieChart, List } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  streaming: "bg-pink-500",
  social: "bg-blue-500",
  messaging: "bg-green-500",
  conferencing: "bg-indigo-500",
  music: "bg-purple-500",
  productivity: "bg-amber-500",
  cloud: "bg-sky-500",
  gaming: "bg-red-500",
  shopping: "bg-orange-500",
  developer: "bg-gray-600",
  smart_home: "bg-teal-500",
};

const CATEGORY_BADGE: Record<string, string> = {
  streaming: "bg-pink-50 text-pink-700 ring-1 ring-pink-600/10 dark:bg-pink-500/10 dark:text-pink-400 dark:ring-pink-500/20",
  social: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/10 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20",
  messaging: "bg-green-50 text-green-700 ring-1 ring-green-600/10 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20",
  conferencing: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/10 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/20",
  music: "bg-purple-50 text-purple-700 ring-1 ring-purple-600/10 dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-500/20",
  productivity: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  cloud: "bg-sky-50 text-sky-700 ring-1 ring-sky-600/10 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/20",
  gaming: "bg-red-50 text-red-700 ring-1 ring-red-600/10 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
  shopping: "bg-orange-50 text-orange-700 ring-1 ring-orange-600/10 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20",
  developer: "bg-gray-50 text-gray-700 ring-1 ring-gray-500/10 dark:bg-white/[0.04] dark:text-gray-400 dark:ring-white/[0.08]",
  smart_home: "bg-teal-50 text-teal-700 ring-1 ring-teal-600/10 dark:bg-teal-500/10 dark:text-teal-400 dark:ring-teal-500/20",
};

function AppHistoryPanel({ appId, hours }: { appId: string; hours: number }) {
  const { data, isLoading } = useApplicationHistory(appId, hours);

  if (isLoading) {
    return (
      <div className="space-y-3 p-5">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  const maxQ = data.devices[0]?.query_count || 1;

  return (
    <div className="animate-fade-in space-y-5 border-t border-gray-100 p-5 dark:border-white/[0.04]">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Queries", value: data.total_queries },
          { label: "Devices", value: data.total_devices },
          { label: "Domains", value: data.domains.length },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-gray-50 p-3 dark:bg-white/[0.03]">
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Activity Timeline */}
      {data.timeline.length > 0 && (
        <div>
          <h4 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Activity</h4>
          <div className="flex items-end gap-0.5" style={{ height: 48 }}>
            {data.timeline.map((pt, i) => {
              const maxCount = Math.max(...data.timeline.map((t) => t.query_count), 1);
              const h = Math.max((pt.query_count / maxCount) * 100, 4);
              const time = new Date(pt.timestamp);
              return (
                <div
                  key={i}
                  className="group relative flex-1 cursor-default rounded-t-sm bg-primary-500/80 transition-all hover:bg-primary-400"
                  style={{ height: `${h}%` }}
                  title={`${time.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}: ${pt.query_count} queries, ${pt.device_count} devices`}
                />
              );
            })}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-gray-400">
            <span>{data.timeline.length > 0 && new Date(data.timeline[0].timestamp).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
            <span>{data.timeline.length > 0 && new Date(data.timeline[data.timeline.length - 1].timestamp).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
          </div>
        </div>
      )}

      {/* Devices */}
      <div>
        <h4 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Devices ({data.devices.length})
        </h4>
        <div className="space-y-0.5">
          {data.devices.map((dev) => (
            <Link
              key={dev.id}
              href={`/dashboard/devices/${dev.id}`}
              className="flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03]"
            >
              <div className="relative flex h-2 w-2 shrink-0">
                {dev.is_online && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${dev.is_online ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{dev.name}</span>
                <span className="ml-2 font-mono text-[11px] text-gray-400">{dev.ip_address}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="hidden w-20 sm:block">
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.04]">
                    <div
                      className="h-full rounded-full bg-primary-500"
                      style={{ width: `${(dev.query_count / maxQ) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="font-semibold">{dev.query_count}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Domains */}
      {data.domains.length > 0 && (
        <div>
          <h4 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Domains ({data.domains.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {data.domains.map((d) => (
              <span
                key={d.domain}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1 text-[11px] text-gray-600 ring-1 ring-gray-200/60 dark:bg-white/[0.03] dark:text-gray-400 dark:ring-white/[0.06]"
              >
                <span className="font-mono">{d.domain}</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">{d.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApplicationsPage() {
  const [days, setDays] = useState(7);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const { data, isLoading } = useApplications(days);
  const applications: AppListItem[] = data?.applications ?? [];

  const hoursFromDays = days * 24;

  const chartApps = applications.map((a) => ({
    application: a.application,
    total_time_seconds: a.total_time_seconds,
    total_bytes: a.total_bytes,
    query_count: a.query_count,
  }));

  const maxQueries = applications[0]?.query_count || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Applications</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {applications.length} applications detected
          </p>
        </div>
        <div className="flex gap-0.5 rounded-xl bg-gray-100 p-1 dark:bg-white/[0.04]">
          {[
            { label: "Today", value: 1 },
            { label: "7 days", value: 7 },
            { label: "30 days", value: 30 },
            { label: "90 days", value: 90 },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`time-pill ${days === opt.value ? "time-pill-active" : "time-pill-inactive"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart + List */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-gray-400" />
              <CardTitle>Distribution</CardTitle>
            </div>
          </CardHeader>
          {isLoading ? (
            <Skeleton className="h-72 w-full rounded-xl" />
          ) : chartApps.length > 0 ? (
            <AppBreakdownChart applications={chartApps} />
          ) : (
            <div className="flex h-72 items-center justify-center text-sm text-gray-500">
              No app data yet
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <List className="h-4 w-4 text-gray-400" />
              <CardTitle>All Applications</CardTitle>
            </div>
          </CardHeader>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No applications detected yet. Apps appear as DNS queries are captured.
            </p>
          ) : (
            <div className="space-y-1.5">
              {applications.map((app) => {
                const isExpanded = expandedApp === app.application.id;
                const catColor = CATEGORY_COLORS[app.application.category || ""] || "bg-gray-500";
                const catBadge = CATEGORY_BADGE[app.application.category || ""] || "bg-gray-50 text-gray-600 ring-1 ring-gray-500/10 dark:bg-white/[0.04] dark:text-gray-400 dark:ring-white/[0.08]";

                return (
                  <div
                    key={app.application.id}
                    className={`overflow-hidden rounded-xl border transition-all duration-200 ${
                      isExpanded
                        ? "border-primary-200 shadow-glow dark:border-primary-500/20"
                        : "border-gray-100 hover:border-gray-200 dark:border-white/[0.04] dark:hover:border-white/[0.08]"
                    } bg-white dark:bg-surface-900/80`}
                  >
                    <button
                      onClick={() => setExpandedApp(isExpanded ? null : app.application.id)}
                      className="flex w-full items-center gap-3 p-3.5 text-left transition-colors"
                    >
                      <AppIcon name={app.application.name} category={app.application.category} size="md" />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {app.application.name}
                          </span>
                          {app.application.category && (
                            <span className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold ${catBadge}`}>
                              {app.application.category}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="hidden items-center gap-1.5 sm:flex">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.04]">
                            <div
                              className={`h-full rounded-full ${catColor}`}
                              style={{ width: `${(app.query_count / maxQueries) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-gray-900 dark:text-white">{app.query_count}</span>
                          <span className="ml-1 text-[11px] text-gray-400">queries</span>
                        </div>
                        <div className="text-right text-[11px] text-gray-500">
                          <span>{app.device_count} device{app.device_count !== 1 ? "s" : ""}</span>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                          strokeWidth={2}
                        />
                      </div>
                    </button>

                    {isExpanded && (
                      <AppHistoryPanel appId={app.application.id} hours={hoursFromDays} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
