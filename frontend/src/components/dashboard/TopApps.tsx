"use client";

import { ApplicationUsage } from "@/types";
import { AppIcon } from "@/components/ui/AppIcon";
import { formatBytes, formatDuration } from "@/lib/utils";

interface TopAppsProps {
  applications: ApplicationUsage[];
}

export function TopApps({ applications }: TopAppsProps) {
  return (
    <ul className="space-y-3">
      {applications.map((app) => (
        <li key={app.application.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AppIcon name={app.application.name} category={app.application.category} size="sm" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {app.application.name}
              </p>
              {app.application.category && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {app.application.category}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {app.total_bytes > 0 ? formatBytes(app.total_bytes) : `${app.query_count} queries`}
            </p>
            {app.total_time_seconds > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDuration(app.total_time_seconds)}
              </p>
            )}
          </div>
        </li>
      ))}
      {applications.length === 0 && (
        <li className="text-sm text-gray-500 dark:text-gray-400">No applications tracked yet</li>
      )}
    </ul>
  );
}
