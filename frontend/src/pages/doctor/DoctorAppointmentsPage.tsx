import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { getMyDoctorProfile } from "../../services/doctor.service";
import { listDoctorAppointmentsRich } from "../../services/doctor.service";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";

const STATUS_COLORS: Record<string, "success" | "warning" | "danger" | "default"> = {
  scheduled: "default",
  confirmed: "success",
  cancelled: "danger",
  completed: "success",
  no_show: "warning",
};

const ALL_STATUSES = ["scheduled", "confirmed", "completed", "cancelled", "no_show"];

export function DoctorAppointmentsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: profile } = useQuery({
    queryKey: ["doctor-profile"],
    queryFn: getMyDoctorProfile,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["doctor-appointments-rich", profile?.id, statusFilter],
    queryFn: () => listDoctorAppointmentsRich(profile!.id, 1, 100, statusFilter || undefined),
    enabled: !!profile?.id,
  });

  const appointments = data?.items ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Appointments</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {data?.total ?? 0} total appointments
          </p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter("")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            statusFilter === ""
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300"
          }`}
        >
          All
        </button>
        {ALL_STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s === statusFilter ? "" : s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-all ${
              statusFilter === s
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Card padding="none">
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </Card>
      ) : appointments.length === 0 ? (
        <Card className="py-16 text-center">
          <Calendar className="mx-auto mb-3 h-12 w-12 text-gray-200 dark:text-slate-600" />
          <p className="font-medium text-gray-600 dark:text-slate-300">No appointments found</p>
          <p className="text-sm text-gray-400 mt-1">Appointments will appear here once patients book with you</p>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60">
                  {["Patient", "Date & Time", "Duration", "Reason", "Status"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-slate-300">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.map(appt => (
                  <tr
                    key={appt.id}
                    className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50/50 dark:hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-400">
                          {appt.patient_first_name?.[0]}{appt.patient_last_name?.[0]}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {appt.patient_first_name} {appt.patient_last_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-gray-700 dark:text-slate-300">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        {format(new Date(appt.scheduled_at), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400">
                      {appt.duration_minutes} min
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400 max-w-[200px] truncate">
                      {appt.reason ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_COLORS[appt.status] ?? "default"}>
                        {appt.status.replace("_", " ")}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </motion.div>
  );
}
