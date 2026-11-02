import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, Stethoscope, Calendar, TrendingUp, Activity, Clock } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, ResponsiveContainer, Legend,
} from "recharts";
import { getAdminStats } from "../../services/admin.service";
import { StatCard } from "../../components/ui/StatCard";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import { SkeletonCard } from "../../components/ui/Skeleton";

const COLORS = {
  primary: "#3b82f6",
  healing: "#22c55e",
  amber: "#f59e0b",
  danger: "#ef4444",
};

export function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
  });

  const appointmentTrend = stats?.appointment_trend ?? [
    { month: "Jul", appointments: 42 },
    { month: "Aug", appointments: 58 },
    { month: "Sep", appointments: 51 },
    { month: "Oct", appointments: 67 },
    { month: "Nov", appointments: 73 },
    { month: "Dec", appointments: 80 },
  ];

  const registrationData = stats?.registration_trend ?? [
    { month: "Jul", patients: 12, doctors: 2 },
    { month: "Aug", patients: 18, doctors: 1 },
    { month: "Sep", patients: 14, doctors: 3 },
    { month: "Oct", patients: 22, doctors: 2 },
    { month: "Nov", patients: 19, doctors: 1 },
    { month: "Dec", patients: 25, doctors: 4 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.07 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Platform overview and analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              title="Total Patients"
              value={stats?.total_patients ?? 0}
              icon={<Users className="h-5 w-5 text-primary-600" />}
              iconBg="bg-primary-50 dark:bg-primary-900/30"
              trend={{ value: 12, label: "+12% this month" }}
            />
            <StatCard
              title="Total Doctors"
              value={stats?.total_doctors ?? 0}
              icon={<Stethoscope className="h-5 w-5 text-healing-600" />}
              iconBg="bg-healing-50 dark:bg-healing-900/30"
              trend={{ value: 5, label: "+5% this month" }}
            />
            <StatCard
              title="Appointments Today"
              value={stats?.appointments_today ?? 0}
              icon={<Calendar className="h-5 w-5 text-amber-600" />}
              iconBg="bg-amber-50 dark:bg-amber-900/30"
            />
            <StatCard
              title="Completion Rate"
              value={`${stats?.completion_rate ?? 0}%`}
              icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
              iconBg="bg-purple-50 dark:bg-purple-900/30"
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary-600" />
              Appointment Trend
            </CardTitle>
            <span className="text-xs text-gray-400">Last 6 months</span>
          </CardHeader>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={appointmentTrend} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="apptGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", fontSize: 12 }}
              />
              <Area type="monotone" dataKey="appointments" stroke={COLORS.primary} strokeWidth={2} fill="url(#apptGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-healing-600" />
              New Registrations
            </CardTitle>
            <span className="text-xs text-gray-400">Last 6 months</span>
          </CardHeader>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={registrationData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="patients" name="Patients" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
              <Bar dataKey="doctors" name="Doctors" fill={COLORS.healing} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {(stats?.recent_activity ?? [
            { type: "patient", message: "New patient registered: Alice Johnson", time: "2 min ago" },
            { type: "appointment", message: "Appointment confirmed: Dr. Smith with patient #1042", time: "15 min ago" },
            { type: "doctor", message: "Doctor profile updated: Dr. Priya Patel", time: "1 hr ago" },
            { type: "appointment", message: "Appointment cancelled: Patient #1038", time: "2 hr ago" },
          ]).map((event: any, i: number) => (
            <div key={i} className="flex items-start gap-3 rounded-xl bg-gray-50 p-3 dark:bg-slate-700/50">
              <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                event.type === "patient" ? "bg-primary-100" :
                event.type === "doctor" ? "bg-healing-100" :
                "bg-amber-100"
              }`}>
                {event.type === "patient" ? <Users className="h-3.5 w-3.5 text-primary-600" /> :
                 event.type === "doctor" ? <Stethoscope className="h-3.5 w-3.5 text-healing-600" /> :
                 <Calendar className="h-3.5 w-3.5 text-amber-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-slate-300">{event.message}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
