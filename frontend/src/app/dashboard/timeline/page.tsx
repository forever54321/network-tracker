"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useActivityTimeline } from "@/hooks/useDashboard";
import { formatTime, formatDuration } from "@/lib/utils";

export default function TimelinePage() {
  const [hours, setHours] = useState(24);
  const { data: entries, isLoading } = useActivityTimeline(hours);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Usage Timeline
        </h2>
        <div className="flex gap-2">
          {[6, 12, 24, 48, 168].map((h) => (
            <button
              key={h}
              onClick={() => setHours(h)}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                hours === h
                  ? "bg-primary-600 text-white"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              {h < 24 ? `${h}h` : `${h / 24}d`}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : entries && entries.length > 0 ? (
          <div className="space-y-2">
            {entries.map((entry, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-4 dark:border-gray-800"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {entry.device_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(entry.started_at)} - {formatTime(entry.ended_at)}
                    </p>
                  </div>
                </div>
                <Badge variant="info">
                  {formatDuration(entry.duration_seconds)}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No activity recorded for this time period
          </p>
        )}
      </Card>
    </div>
  );
}
