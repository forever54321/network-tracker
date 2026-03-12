import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "success" | "warning" | "danger" | "info" | "default";
  children: React.ReactNode;
  className?: string;
}

const variants = {
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  danger: "bg-red-50 text-red-700 ring-1 ring-red-600/10 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
  info: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/10 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20",
  default: "bg-gray-50 text-gray-600 ring-1 ring-gray-500/10 dark:bg-white/[0.04] dark:text-gray-400 dark:ring-white/[0.08]",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
