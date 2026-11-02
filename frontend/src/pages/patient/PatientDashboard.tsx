import { useQuery } from "@tanstack/react-query";
import {
  Calendar, FileText, Activity, Heart, Stethoscope,
  Clock, ArrowRight, Plus, MessageSquare, FlaskConical, Pill,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getMyProfile } from "../../services/patient.service";
import { listPatientAppointments } from "../../services/appointment.service";
import { StatCard } from "../../components/ui/StatCard";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import { AppointmentStatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton, SkeletonCard } from "../../components/ui/Skeleton";
import { format } from "date-fns";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function PatientDashboard() {
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["patient-profile"],
    queryFn: getMyProfile,
  });

  const { data: appointments, isLoading: apptLoading } = useQuery({
    queryKey: ["patient-appointments", profile?.id],
    queryFn: () => listPatientAppointments(profile!.id, 1, 10),
    enabled: !!profile?.id,
  });

  const upcomingAppts = appointments?.items.filter(
    (a) => a.status === "scheduled" || a.status === "confirmed"
  ) ?? [];

  const completedCount = appointments?.items.filter((a) => a.status === "completed").length ?? 0;

  const quickActions = [
    { label: "Book Appointment", icon: Calendar, to: "/patient/appointments/book", color: "bg-primary-600 hover:bg-primary-700 text-white" },
    { label: "Message Doctor", icon: MessageSquare, to: "/patient/messages", color: "bg-healing-600 hover:bg-healing-700 text-white" },
    { label: "View Records", icon: FileText, to: "/patient/records", color: "bg-purple-600 hover:bg-purple-700 text-white" },
    { label: "AI Assistant", icon: Activity, to: "/patient/ai-assistant", color: "bg-amber-600 hover:bg-amber-700 text-white" },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants}>
        {profileLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back{profile?.first_name ? `, ${profile.first_name}` : ""}! 👋
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                Here's your health overview for today
              </p>
            </div>
            <Link to="/patient/appointments/book">
              <Button leftIcon={<Plus className="h-4 w-4" />}>Book Appointment</Button>
            </Link>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {profileLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              title="Upcoming Appointments"
              value={upcomingAppts.length}
              subtitle="Next 30 days"
              icon={<Calendar className="h-5 w-5 text-primary-600" />}
              iconBg="bg-primary-50 dark:bg-primary-900/30"
            />
            <StatCard
              title="Completed Visits"
              value={completedCount}
              subtitle="Total consultations"
              icon={<Stethoscope className="h-5 w-5 text-healing-600" />}
              iconBg="bg-healing-50 dark:bg-healing-900/30"
            />
            <StatCard
              title="Blood Group"
              value={profile?.blood_group?.toUpperCase() ?? "—"}
              subtitle="Keep it updated"
              icon={<Heart className="h-5 w-5 text-red-500" />}
              iconBg="bg-red-50 dark:bg-red-900/30"
            />
            <StatCard
              title="Medical Records"
              value="—"
              subtitle="View all records"
              icon={<FileText className="h-5 w-5 text-purple-600" />}
              iconBg="bg-purple-50 dark:bg-purple-900/30"
            />
          </>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider dark:text-slate-400">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map(({ label, icon: Icon, to, color }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 rounded-2xl p-4 font-medium text-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${color}`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upcoming Appointments */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <Link to="/patient/appointments">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                  View all
                </Button>
              </Link>
            </CardHeader>
            {apptLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-40" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : upcomingAppts.length === 0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-slate-700">
                  <Clock className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-slate-300">No upcoming appointments</p>
                <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">Book your next consultation</p>
                <Link to="/patient/appointments/book">
                  <Button className="mt-4" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
                    Book Now
                  </Button>
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-slate-700">
                {upcomingAppts.slice(0, 5).map((appt) => (
                  <li key={appt.id} className="flex items-center gap-3 py-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30">
                      <Calendar className="h-4 w-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {format(new Date(appt.scheduled_at), "MMM d, yyyy")}
                      </p>
                      <p className="truncate text-xs text-gray-500 dark:text-slate-400">
                        {format(new Date(appt.scheduled_at), "h:mm a")}
                        {appt.reason ? ` • ${appt.reason}` : ""}
                      </p>
                    </div>
                    <AppointmentStatusBadge status={appt.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </motion.div>

        {/* Health Tips */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Health Tips</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {[
                { icon: "💧", tip: "Drink 8 glasses of water daily to stay hydrated.", color: "bg-blue-50 dark:bg-blue-900/20" },
                { icon: "🏃", tip: "30 minutes of moderate exercise 5 days a week.", color: "bg-healing-50 dark:bg-healing-900/20" },
                { icon: "😴", tip: "Aim for 7–9 hours of quality sleep each night.", color: "bg-purple-50 dark:bg-purple-900/20" },
                { icon: "🥗", tip: "Include more fruits and vegetables in your diet.", color: "bg-amber-50 dark:bg-amber-900/20" },
              ].map((item, i) => (
                <div key={i} className={`flex items-start gap-3 rounded-xl p-3 ${item.color}`}>
                  <span className="text-lg leading-none flex-shrink-0">{item.icon}</span>
                  <p className="text-xs text-gray-700 dark:text-slate-300">{item.tip}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick links */}
          <Card className="mt-4">
            <CardTitle className="mb-3">Quick Access</CardTitle>
            <div className="space-y-1">
              {[
                { to: "/patient/lab-results", icon: FlaskConical, label: "Lab Results" },
                { to: "/patient/medications", icon: Pill, label: "My Medications" },
                { to: "/patient/records", icon: FileText, label: "Medical Records" },
              ].map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 rounded-xl p-2.5 text-sm text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {label}
                  <ArrowRight className="ml-auto h-3.5 w-3.5 text-gray-300" />
                </Link>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
