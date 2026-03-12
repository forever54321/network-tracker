"use client";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { logout } from "@/lib/auth";
import { LogOut, Bell } from "lucide-react";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200/60 bg-white/80 px-6 backdrop-blur-xl dark:border-white/[0.06] dark:bg-surface-950/80">
      <div />
      <div className="flex items-center gap-1">
        <button className="rounded-xl p-2.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/[0.06] dark:hover:text-gray-300">
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </button>
        <ThemeToggle />
        <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-white/[0.08]" />
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium text-gray-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.8} />
          Logout
        </button>
      </div>
    </header>
  );
}
