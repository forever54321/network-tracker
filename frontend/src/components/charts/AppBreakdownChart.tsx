"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { ApplicationUsage } from "@/types";
import { formatBytes } from "@/lib/utils";

ChartJS.register(ArcElement, Tooltip, Legend);

interface AppBreakdownChartProps {
  applications: ApplicationUsage[];
}

const COLORS = [
  "#6366f1", "#ec4899", "#22c55e", "#f59e0b", "#a855f7",
  "#14b8a6", "#f97316", "#3b82f6", "#ef4444", "#64748b",
];

export function AppBreakdownChart({ applications }: AppBreakdownChartProps) {
  const top8 = applications.slice(0, 8);

  const hasBytes = top8.some((a) => a.total_bytes > 0);
  const useQueryCount = !hasBytes;

  const labels = top8.map((a) => a.application.name);
  const dataValues = top8.map((a) => useQueryCount ? (a.query_count || 1) : a.total_bytes);

  const remaining = applications.slice(8);
  const otherValue = remaining.reduce(
    (sum, a) => sum + (useQueryCount ? (a.query_count || 1) : a.total_bytes),
    0
  );
  if (otherValue > 0) {
    labels.push("Other");
    dataValues.push(otherValue);
  }

  const data = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: COLORS.slice(0, labels.length),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 8,
          padding: 14,
          font: { size: 12, family: "Inter" },
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleFont: { size: 12, family: "Inter" },
        bodyFont: { size: 12, family: "Inter" },
        padding: 12,
        cornerRadius: 12,
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          label: (ctx: any) =>
            useQueryCount
              ? `${ctx.label}: ${ctx.raw} queries`
              : `${ctx.label}: ${formatBytes(ctx.raw)}`,
        },
      },
    },
  };

  return (
    <div className="h-72">
      {useQueryCount && (
        <p className="mb-1 text-center text-[11px] text-gray-400">Based on DNS query frequency</p>
      )}
      <Doughnut data={data} options={options} />
    </div>
  );
}
