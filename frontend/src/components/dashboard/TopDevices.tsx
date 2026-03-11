"use client";

import Link from "next/link";
import { Device } from "@/types";
import { Badge } from "@/components/ui/Badge";

interface TopDevicesProps {
  devices: Device[];
}

export function TopDevices({ devices }: TopDevicesProps) {
  return (
    <ul className="space-y-3">
      {devices.map((device, i) => (
        <li key={device.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              {i + 1}
            </span>
            <Link
              href={`/dashboard/devices/${device.id}`}
              className="text-sm font-medium text-gray-900 hover:text-primary-600 dark:text-white dark:hover:text-primary-400"
            >
              {device.friendly_name || device.hostname || device.mac_address}
            </Link>
          </div>
          <Badge variant={device.is_online ? "success" : "danger"}>
            {device.is_online ? "Online" : "Offline"}
          </Badge>
        </li>
      ))}
      {devices.length === 0 && (
        <li className="text-sm text-gray-500 dark:text-gray-400">No devices found</li>
      )}
    </ul>
  );
}
