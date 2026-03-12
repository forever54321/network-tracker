import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-100 bg-white p-6 shadow-card transition-all duration-300",
        "dark:border-white/[0.06] dark:bg-surface-900/80 dark:shadow-card-dark",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn("mb-5 flex items-center justify-between", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: CardProps) {
  return (
    <h3
      className={cn(
        "text-sm font-semibold text-gray-500 dark:text-gray-400",
        className
      )}
    >
      {children}
    </h3>
  );
}
