import { type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "outline";

type BadgeSize = "sm" | "md";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300",
  primary: "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300",
  success: "bg-healing-100 text-healing-700 dark:bg-healing-900/40 dark:text-healing-300",
  warning: "bg-warning-100 text-warning-600 dark:bg-yellow-900/40 dark:text-yellow-300",
  danger: "bg-danger-100 text-danger-600 dark:bg-red-900/40 dark:text-red-300",
  info: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  outline: "border border-current text-gray-600 dark:text-slate-400",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-gray-500",
  primary: "bg-primary-500",
  success: "bg-healing-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
  info: "bg-sky-500",
  outline: "bg-gray-500",
};

export function Badge({
  variant = "default",
  size = "md",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        variantClasses[variant],
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-0.5 text-xs",
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", dotColors[variant])} />
      )}
      {children}
    </span>
  );
}

/** @deprecated Use AppointmentStatusBadge */
export function StatusBadge({ status }: { status: string }) {
  return <AppointmentStatusBadge status={status} />;
}

export function AppointmentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    scheduled: { variant: "primary", label: "Scheduled" },
    confirmed: { variant: "info", label: "Confirmed" },
    in_progress: { variant: "warning", label: "In Progress" },
    completed: { variant: "success", label: "Completed" },
    cancelled: { variant: "danger", label: "Cancelled" },
    no_show: { variant: "default", label: "No Show" },
  };
  const config = map[status] ?? { variant: "default", label: status };
  return <Badge variant={config.variant} dot>{config.label}</Badge>;
}
