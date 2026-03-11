"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Device } from "@/types";
import { formatBytes } from "@/lib/utils";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DeviceActivityChartProps {
  devices: Device[];
  bytesData: { sent: number; received: number }[];
}

export function DeviceActivityChart({ devices, bytesData }: DeviceActivityChartProps) {
  const labels = devices.map(
    (d) => d.friendly_name || d.hostname || d.mac_address
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Download",
        data: bytesData.map((b) => b.received),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
      },
      {
        label: "Upload",
        data: bytesData.map((b) => b.sent),
        backgroundColor: "rgba(168, 85, 247, 0.8)",
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
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
      x: {
        ticks: { callback: (value: any) => formatBytes(value) },
      },
    },
  };

  return (
    <div className="h-72">
      <Bar data={data} options={options} />
    </div>
  );
}
