"use client";

import { Card, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { DashboardOverview } from "@/types";
import { formatBytes } from "@/lib/utils";

interface NetworkOverviewProps {
  data?: DashboardOverview;
  isLoading: boolean;
}

export function NetworkOverview({ data, isLoading }: NetworkOverviewProps) {
  const cards = [
    {
      title: "Total Devices",
      value: data?.total_devices ?? 0,
      sub: `${data?.online_devices ?? 0} online`,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Bandwidth Today",
      value: formatBytes(data?.total_bandwidth_today ?? 0),
      sub: `${formatBytes(data?.total_upload_today ?? 0)} up / ${formatBytes(data?.total_download_today ?? 0)} down`,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Top Application",
      value: data?.top_applications?.[0]?.application.name ?? "N/A",
      sub: data?.top_applications?.[0]
        ? formatBytes(data.top_applications[0].total_bytes)
        : "",
      color: "text-green-600 dark:text-green-400",
    },
    {
      title: "Active Now",
      value: data?.online_devices ?? 0,
      sub: "devices connected",
      color: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardTitle>{card.title}</CardTitle>
          {isLoading ? (
            <Skeleton className="mt-2 h-8 w-24" />
          ) : (
            <>
              <p className={`mt-2 text-2xl font-bold ${card.color}`}>
                {card.value}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {card.sub}
              </p>
            </>
          )}
        </Card>
      ))}
    </div>
  );
}
