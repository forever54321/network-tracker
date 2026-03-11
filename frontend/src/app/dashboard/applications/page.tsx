"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { AppBreakdownChart } from "@/components/charts/AppBreakdownChart";
import { AppIcon } from "@/components/ui/AppIcon";
import { useApplications, useApplicationHistory, AppListItem } from "@/hooks/useTraffic";
import { formatBytes, formatDuration } from "@/lib/utils";

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
  streaming: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  social: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  messaging: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  conferencing: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  music: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  productivity: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  cloud: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  gaming: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  shopping: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  developer: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  smart_home: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
};

function AppHistoryPanel({ appId, hours }: { appId: string; hours: number }) {
  const { data, isLoading } = useApplicationHistory(appId, hours);

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!data) return null;

  const maxQ = data.devices[0]?.query_count || 1;

  return (
    <div className="space-y-4 border-t border-gray-100 p-4 dark:border-gray-800">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Queries</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{data.total_queries}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">Devices</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{data.total_devices}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">Domains</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{data.domains.length}</p>
        </div>
      </div>

      {/* Activity Timeline */}
      {data.timeline.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Activity Timeline</h4>
          <div className="flex items-end gap-0.5" style={{ height: 48 }}>
            {data.timeline.map((pt, i) => {
              const maxCount = Math.max(...data.timeline.map((t) => t.query_count), 1);
              const h = Math.max((pt.query_count / maxCount) * 100, 4);
              const time = new Date(pt.timestamp);
              return (
                <div
                  key={i}
                  className="group relative flex-1 cursor-default rounded-t bg-primary-500 transition-colors hover:bg-primary-400"
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

      {/* Devices using this app */}
      <div>
        <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Devices ({data.devices.length})
        </h4>
        <div className="space-y-1">
          {data.devices.map((dev) => (
            <Link
              key={dev.id}
              href={`/dashboard/devices/${dev.id}`}
              className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <div className={`h-2 w-2 shrink-0 rounded-full ${dev.is_online ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`} />
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{dev.name}</span>
                <span className="ml-2 text-xs text-gray-400">{dev.ip_address}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {/* Progress bar */}
                <div className="hidden w-20 sm:block">
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full bg-primary-500"
                      style={{ width: `${(dev.query_count / maxQ) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="font-medium">{dev.query_count}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Domains */}
      {data.domains.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Domains ({data.domains.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {data.domains.map((d) => (
              <span
                key={d.domain}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              >
                <span className="font-mono">{d.domain}</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{d.count}</span>
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

  // For the chart, map to the expected format
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
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Application Usage
        </h2>
        <div className="flex gap-1">
          {[
            { label: "Today", value: 1 },
            { label: "7d", value: 7 },
            { label: "30d", value: 30 },
            { label: "90d", value: 90 },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                days === opt.value
                  ? "bg-primary-600 text-white"
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart + Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Distribution</CardTitle>
          </CardHeader>
          {isLoading ? (
            <Skeleton className="h-72 w-full" />
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
            <CardTitle>
              All Applications
              {applications.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({applications.length} detected)
                </span>
              )}
            </CardTitle>
          </CardHeader>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No applications detected yet. Apps appear as DNS queries are captured.
            </p>
          ) : (
            <div className="space-y-1">
              {applications.map((app) => {
                const isExpanded = expandedApp === app.application.id;
                const catColor = CATEGORY_COLORS[app.application.category || ""] || "bg-gray-500";
                const catBadge = CATEGORY_BADGE[app.application.category || ""] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";

                return (
                  <div
                    key={app.application.id}
                    className={`overflow-hidden rounded-xl border transition-colors ${
                      isExpanded
                        ? "border-primary-200 bg-white dark:border-primary-800 dark:bg-gray-900"
                        : "border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900"
                    }`}
                  >
                    <button
                      onClick={() => setExpandedApp(isExpanded ? null : app.application.id)}
                      className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      {/* App icon */}
                      <AppIcon name={app.application.name} category={app.application.category} size="md" />

                      {/* Name + category */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {app.application.name}
                          </span>
                          {app.application.category && (
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${catBadge}`}>
                              {app.application.category}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="hidden items-center gap-1 sm:flex">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                              className={`h-full rounded-full ${catColor}`}
                              style={{ width: `${(app.query_count / maxQueries) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-gray-900 dark:text-white">{app.query_count}</span>
                          <span className="ml-1 text-xs text-gray-400">queries</span>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <span>{app.device_count} device{app.device_count !== 1 ? "s" : ""}</span>
                        </div>
                        <svg
                          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Expanded history panel */}
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
