import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, Users, Clock, Stethoscope } from "lucide-react";
import { getMyDoctorProfile } from "../../services/doctor.service";
import { listDoctorAppointments } from "../../services/appointment.service";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import { AppointmentStatusBadge } from "../../components/ui/Badge";
import { StatCard } from "../../components/ui/StatCard";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { format } from "date-fns";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export function DoctorDashboard() {
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["doctor-profile"],
    queryFn: getMyDoctorProfile,
  });
  const { data: appointments, isLoading: apptLoading } = useQuery({
    queryKey: ["doctor-appointments", profile?.id],
    queryFn: () => listDoctorAppointments(profile!.id, 1, 10),
    enabled: !!profile?.id,
  });

  const todayAppts =
    appointments?.items.filter(
      (a) => new Date(a.scheduled_at).toDateString() === new Date().toDateString()
    ) ?? [];

  const upcomingAppts =
    appointments?.items.filter(
      (a) =>
        (a.status === "scheduled" || a.status === "confirmed") &&
        new Date(a.scheduled_at) > new Date()
    ) ?? [];

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Good day, Dr.{" "}
          <span className="text-primary-600 dark:text-primary-400">{profile?.last_name}</span>!
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          {profile?.specializations?.map((s) => s.name).join(", ") || "General Practice"}
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Today's Appointments"
          value={todayAppts.length}
          icon={<Clock className="h-6 w-6" />}
          iconBg="bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
        />
        <StatCard
          title="Upcoming"
          value={upcomingAppts.length}
          icon={<Calendar className="h-6 w-6" />}
          iconBg="bg-healing-100 text-healing-700 dark:bg-healing-900/30 dark:text-healing-400"
        />
        <StatCard
          title="Total Appointments"
          value={appointments?.total ?? 0}
          icon={<Users className="h-6 w-6" />}
          iconBg="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
        />
      </motion.div>

      {/* Upcoming list */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          {apptLoading ? (
            <div className="py-6 text-center text-sm text-gray-400">Loading...</div>
          ) : upcomingAppts.length === 0 ? (
            <div className="py-10 text-center">
              <Stethoscope className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-slate-600" />
              <p className="text-sm text-gray-500 dark:text-slate-400">No upcoming appointments</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-slate-700">
              {upcomingAppts.slice(0, 8).map((appt) => (
                <li key={appt.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {format(new Date(appt.scheduled_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    {appt.reason && (
                      <p className="text-xs text-gray-500 dark:text-slate-400">{appt.reason}</p>
                    )}
                  </div>
                  <AppointmentStatusBadge status={appt.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
