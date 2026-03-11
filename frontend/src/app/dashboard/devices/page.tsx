"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDevicesByUsage } from "@/hooks/useDashboard";
import { useDevices } from "@/hooks/useDevices";
import { formatBytes, formatDuration, formatDateTime } from "@/lib/utils";

export default function DevicesPage() {
  const [search, setSearch] = useState("");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [hours, setHours] = useState(24);
  const [view, setView] = useState<"usage" | "all">("usage");

  // Usage view
  const { data: usageData, isLoading: usageLoading } = useDevicesByUsage(hours);
  // All devices view
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
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Devices</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search by name, IP, MAC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={onlineOnly}
              onChange={(e) => setOnlineOnly(e.target.checked)}
              className="rounded"
            />
            Online only
          </label>
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-700">
            <button
              onClick={() => setView("usage")}
              className={`px-3 py-1.5 text-xs font-medium ${
                view === "usage"
                  ? "bg-primary-600 text-white"
                  : "text-gray-500 dark:text-gray-400"
              } rounded-l-lg`}
            >
              By Usage
            </button>
            <button
              onClick={() => setView("all")}
              className={`px-3 py-1.5 text-xs font-medium ${
                view === "all"
                  ? "bg-primary-600 text-white"
                  : "text-gray-500 dark:text-gray-400"
              } rounded-r-lg`}
            >
              All Devices
            </button>
          </div>
        </div>
      </div>

      {/* Time range for usage view */}
      {view === "usage" && (
        <div className="flex gap-2">
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
              className={`rounded-lg px-3 py-1.5 text-sm ${
                hours === opt.value
                  ? "bg-primary-600 text-white"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
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
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : view === "usage" ? (
        /* Usage ranked view */
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
                  className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {name}
                      </span>
                      <Badge variant={d.is_online ? "success" : "danger"}>
                        {d.is_online ? "Online" : "Offline"}
                      </Badge>
                      {d.device_type && (
                        <span className="text-xs text-gray-400">{d.device_type}</span>
                      )}
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-1 flex gap-3 text-xs text-gray-400 dark:text-gray-500">
                      <span>{d.ip_address || "No IP"}</span>
                      <span>{d.connection_type || "unknown"}</span>
                      {d.vendor && <span>{d.vendor}</span>}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatDuration(item.total_time_seconds)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatBytes(totalBytes)} total
                    </p>
                    <p className="text-xs text-gray-400">
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
        /* All devices table view */
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  <th className="pb-3 pr-4 font-medium">Device</th>
                  <th className="pb-3 pr-4 font-medium">IP Address</th>
                  <th className="pb-3 pr-4 font-medium">MAC</th>
                  <th className="pb-3 pr-4 font-medium">Connection</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {allDevices?.devices.map((d) => (
                  <tr key={d.id} className="border-b border-gray-100 dark:border-gray-800/50">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/dashboard/devices/${d.id}`}
                        className="font-medium text-gray-900 hover:text-primary-600 dark:text-white"
                      >
                        {d.friendly_name || d.hostname || d.mac_address}
                      </Link>
                      {d.vendor && <p className="text-xs text-gray-400">{d.vendor}</p>}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-gray-600 dark:text-gray-300">
                      {d.ip_address || "-"}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-gray-400">{d.mac_address}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={d.connection_type === "wifi" ? "info" : "default"}>
                        {d.connection_type || "?"}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={d.is_online ? "success" : "danger"}>
                        {d.is_online ? "Online" : "Offline"}
                      </Badge>
                    </td>
                    <td className="py-3 text-xs text-gray-400">{formatDateTime(d.last_seen)}</td>
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
