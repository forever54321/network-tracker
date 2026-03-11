"use client";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { logout } from "@/lib/auth";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
        Network Monitor
      </h1>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          onClick={logout}
          className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
