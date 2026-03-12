"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Monitor,
  Clock,
  AppWindow,
  Settings,
  Wifi,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Devices", href: "/dashboard/devices", icon: Monitor },
  { label: "Timeline", href: "/dashboard/timeline", icon: Clock },
  { label: "Applications", href: "/dashboard/applications", icon: AppWindow },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col glass-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-600/20">
          <Wifi className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
        </div>
        <div>
          <span className="text-[15px] font-bold tracking-tight text-gray-900 dark:text-white">
            NetMonitor
          </span>
          <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Network Intelligence
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-gray-200/60 dark:bg-white/[0.06]" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "nav-item",
                isActive ? "nav-item-active" : "nav-item-inactive"
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.2 : 1.8} />
              {item.label}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="mx-3 mb-4 rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-600/5 p-4 dark:from-primary-500/[0.07] dark:to-primary-600/[0.03]">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">System Status</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </div>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">All services running</span>
        </div>
      </div>
    </aside>
  );
}
