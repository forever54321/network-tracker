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
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Upload",
        data: points.map((p) => p.bytes_sent),
        borderColor: "rgb(168, 85, 247)",
        backgroundColor: "rgba(168, 85, 247, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label}: ${formatBytes(ctx.raw)}`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: any) => formatBytes(value),
        },
      },
    },
  };

  return (
    <div className="h-72">
      <Line data={data} options={options} />
    </div>
  );
}
