"use client";

import Link from "next/link";
import { Device } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";

interface DeviceTableProps {
  devices: Device[];
}

export function DeviceTable({ devices }: DeviceTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400">
            <th className="pb-3 pr-4 font-medium">Device</th>
            <th className="pb-3 pr-4 font-medium">IP Address</th>
            <th className="pb-3 pr-4 font-medium">MAC Address</th>
            <th className="pb-3 pr-4 font-medium">Type</th>
            <th className="pb-3 pr-4 font-medium">Connection</th>
            <th className="pb-3 pr-4 font-medium">Status</th>
            <th className="pb-3 font-medium">Last Seen</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device) => (
            <tr
              key={device.id}
              className="border-b border-gray-100 dark:border-gray-800/50"
            >
              <td className="py-3 pr-4">
                <Link
                  href={`/dashboard/devices/${device.id}`}
                  className="font-medium text-gray-900 hover:text-primary-600 dark:text-white dark:hover:text-primary-400"
                >
                  {device.friendly_name || device.hostname || device.mac_address}
                </Link>
                {device.vendor && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {device.vendor}
                  </p>
                )}
              </td>
              <td className="py-3 pr-4 font-mono text-gray-600 dark:text-gray-300">
                {device.ip_address || "-"}
              </td>
              <td className="py-3 pr-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                {device.mac_address}
              </td>
              <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">
                {device.device_type || "-"}
              </td>
              <td className="py-3 pr-4">
                <Badge variant={device.connection_type === "wifi" ? "info" : "default"}>
                  {device.connection_type || "unknown"}
                </Badge>
              </td>
              <td className="py-3 pr-4">
                <Badge variant={device.is_online ? "success" : "danger"}>
                  {device.is_online ? "Online" : "Offline"}
                </Badge>
              </td>
              <td className="py-3 text-gray-500 dark:text-gray-400">
                {formatDateTime(device.last_seen)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
