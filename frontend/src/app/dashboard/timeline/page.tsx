"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useActivityTimeline } from "@/hooks/useDashboard";
import { formatTime, formatDuration } from "@/lib/utils";
import { Clock, Monitor } from "lucide-react";

export default function TimelinePage() {
  const [hours, setHours] = useState(24);
  const { data: entries, isLoading } = useActivityTimeline(hours);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Timeline</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Device usage activity log</p>
        </div>
        <div className="flex gap-0.5 rounded-xl bg-gray-100 p-1 dark:bg-white/[0.04]">
          {[
            { label: "6h", value: 6 },
            { label: "12h", value: 12 },
            { label: "24h", value: 24 },
            { label: "2d", value: 48 },
            { label: "7d", value: 168 },
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
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="space-y-0 divide-y divide-gray-50 dark:divide-white/[0.03] p-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : entries && entries.length > 0 ? (
          <div className="divide-y divide-gray-50 dark:divide-white/[0.03]">
            {entries.map((entry, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50/60 dark:hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-600/5 text-primary-600 dark:from-primary-500/15 dark:to-primary-600/5 dark:text-primary-400">
                    <Monitor className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {entry.device_name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(entry.started_at)} - {formatTime(entry.ended_at)}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="info">
                  {formatDuration(entry.duration_seconds)}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 dark:bg-white/[0.04]">
              <Clock className="h-6 w-6 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              No activity recorded
            </p>
            <p className="mt-1 text-[11px] text-gray-400">
              Try selecting a larger time range
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
