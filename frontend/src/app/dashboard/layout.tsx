"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-surface-950">
      <Sidebar />
      <div className="ml-[260px]">
        <Topbar />
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
