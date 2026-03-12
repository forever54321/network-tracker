"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { TrafficPoint } from "@/types";
import { formatBytes } from "@/lib/utils";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface BandwidthChartProps {
  points: TrafficPoint[];
}

export function BandwidthChart({ points }: BandwidthChartProps) {
  const labels = points.map((p) =>
    new Date(p.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Download",
        data: points.map((p) => p.bytes_received),
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.08)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: "rgb(99, 102, 241)",
      },
      {
        label: "Upload",
        data: points.map((p) => p.bytes_sent),
        borderColor: "rgb(168, 85, 247)",
        backgroundColor: "rgba(168, 85, 247, 0.05)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: "rgb(168, 85, 247)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
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
          label: (ctx: any) => `${ctx.dataset.label}: ${formatBytes(ctx.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, family: "Inter" }, color: "#94a3b8", maxTicksLimit: 8 },
        border: { display: false },
      },
      y: {
        grid: { color: "rgba(148, 163, 184, 0.08)" },
        ticks: {
          callback: (value: any) => formatBytes(value),
          font: { size: 11, family: "Inter" },
          color: "#94a3b8",
        },
        border: { display: false },
      },
    },
  };

  return (
    <div className="h-72">
      <Line data={data} options={options} />
    </div>
  );
}
