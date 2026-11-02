import { clsx } from "clsx";
import type { AppointmentStatus } from "../../types";

const statusStyles: Record<AppointmentStatus, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-gray-100 text-gray-700",
  no_show: "bg-yellow-100 text-yellow-700",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={clsx("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", statusStyles[status])}>
      {status.replace("_", " ")}
    </span>
  );
}
