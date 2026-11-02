import { type ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "../../utils/cn";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  iconBg?: string;
  trend?: { value: number; label: string };
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, iconBg, trend, className }: StatCardProps) {
  return (
    <div className={cn("rounded-2xl border border-gray-100 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-800", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{title}</p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-500">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              trend.value > 0
                ? "bg-healing-100 text-healing-700 dark:bg-healing-900/30 dark:text-healing-400"
                : trend.value < 0
                ? "bg-danger-100 text-danger-600 dark:bg-red-900/30 dark:text-red-400"
                : "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400"
            )}>
              {trend.value > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : trend.value < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {trend.label}
            </div>
          )}
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl flex-shrink-0", iconBg ?? "bg-primary-50 dark:bg-primary-900/30")}>
          {icon}
        </div>
      </div>
    </div>
  );
}
