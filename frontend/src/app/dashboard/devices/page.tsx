"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDevicesByUsage } from "@/hooks/useDashboard";
import { useDevices } from "@/hooks/useDevices";
import { formatBytes, formatDuration, formatDateTime } from "@/lib/utils";
import { Search, BarChart3, List } from "lucide-react";

export default function DevicesPage() {
  const [search, setSearch] = useState("");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [hours, setHours] = useState(24);
  const [view, setView] = useState<"usage" | "all">("usage");

  const { data: usageData, isLoading: usageLoading } = useDevicesByUsage(hours);
  const { data: allDevices, isLoading: allLoading } = useDevices(1, search, onlineOnly);

  const filteredUsage = usageData?.filter((item) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const d = item.device;
    return (
      (d.friendly_name || "").toLowerCase().includes(s) ||
      (d.hostname || "").toLowerCase().includes(s) ||
      (d.mac_address || "").toLowerCase().includes(s) ||
      (d.ip_address || "").toLowerCase().includes(s)
    );
  }).filter((item) => !onlineOnly || item.device.is_online);

  const isLoading = view === "usage" ? usageLoading : allLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Devices</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {view === "usage" ? "Ranked by usage time" : "All network devices"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" strokeWidth={1.8} />
            <input
              type="text"
              placeholder="Search devices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field w-64 pl-9"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400">
            <input
              type="checkbox"
              checked={onlineOnly}
              onChange={(e) => setOnlineOnly(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600"
            />
            Online only
          </label>
          <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-white/[0.04]">
            <button
              onClick={() => setView("usage")}
              className={`flex items-center gap-1.5 time-pill ${view === "usage" ? "time-pill-active" : "time-pill-inactive"}`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Usage
            </button>
            <button
              onClick={() => setView("all")}
              className={`flex items-center gap-1.5 time-pill ${view === "all" ? "time-pill-active" : "time-pill-inactive"}`}
            >
              <List className="h-3.5 w-3.5" />
              All
            </button>
          </div>
        </div>
      </div>

      {/* Time range for usage view */}
      {view === "usage" && (
        <div className="flex gap-0.5 rounded-xl bg-gray-100 p-1 w-fit dark:bg-white/[0.04]">
          {[
            { label: "Last hour", value: 1 },
            { label: "Last 6h", value: 6 },
            { label: "Today", value: 24 },
            { label: "This week", value: 168 },
            { label: "This month", value: 720 },
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
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : view === "usage" ? (
        <div className="space-y-2">
          {filteredUsage && filteredUsage.length > 0 ? (
            filteredUsage.map((item, i) => {
              const d = item.device;
              const name = d.friendly_name || d.hostname || d.mac_address;
              const totalBytes = item.total_bytes_sent + item.total_bytes_received;
              const maxTime = filteredUsage[0]?.total_time_seconds || 1;
              const pct = Math.min((item.total_time_seconds / maxTime) * 100, 100);

              return (
                <Link
                  key={d.id}
                  href={`/dashboard/devices/${d.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 dark:border-white/[0.06] dark:bg-surface-900/80 dark:hover:shadow-card-dark-hover"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-600/5 text-sm font-bold text-primary-600 dark:from-primary-500/15 dark:to-primary-600/5 dark:text-primary-400">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-gray-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400 transition-colors">
                        {name}
                      </span>
                      <Badge variant={d.is_online ? "success" : "danger"}>
                        {d.is_online ? "Online" : "Offline"}
                      </Badge>
                      {d.device_type && (
                        <span className="text-[11px] text-gray-400">{d.device_type}</span>
                      )}
                    </div>
                    <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.04]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-1.5 flex gap-3 text-[11px] text-gray-400 dark:text-gray-500">
                      <span className="font-mono">{d.ip_address || "No IP"}</span>
                      <span>{d.connection_type || "unknown"}</span>
                      {d.vendor && <span>{d.vendor}</span>}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {formatDuration(item.total_time_seconds)}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {formatBytes(totalBytes)} total
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {formatBytes(item.total_bytes_sent)} up / {formatBytes(item.total_bytes_received)} down
                    </p>
                  </div>
                </Link>
              );
            })
          ) : (
            <Card>
              <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No devices found
              </p>
            </Card>
          )}
        </div>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Device</th>
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">IP Address</th>
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">MAC</th>
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Connection</th>
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                {allDevices?.devices.map((d) => (
                  <tr key={d.id} className="transition-colors hover:bg-gray-50/60 dark:hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/devices/${d.id}`}
                        className="font-medium text-gray-900 transition-colors hover:text-primary-600 dark:text-white dark:hover:text-primary-400"
                      >
                        {d.friendly_name || d.hostname || d.mac_address}
                      </Link>
                      {d.vendor && <p className="mt-0.5 text-[11px] text-gray-400">{d.vendor}</p>}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-300">
                      {d.ip_address || "-"}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-gray-400">{d.mac_address}</td>
                    <td className="px-6 py-4">
                      <Badge variant={d.connection_type === "wifi" ? "info" : "default"}>
                        {d.connection_type || "?"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={d.is_online ? "success" : "danger"}>
                        {d.is_online ? "Online" : "Offline"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-[11px] text-gray-400">{formatDateTime(d.last_seen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
