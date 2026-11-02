import { NavLink } from "react-router-dom";
import { cn } from "../../utils/cn";
import {
  Home, Calendar, FileText, User, Users, Settings,
  MessageSquare, LogOut, Stethoscope, FlaskConical,
  Pill, CreditCard, Bell, BarChart3,
  Shield, Activity, UserCheck, BookOpen, HeartPulse,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const patientLinks = [
  { to: "/patient/dashboard", icon: Home, label: "Dashboard" },
  { to: "/patient/appointments", icon: Calendar, label: "Appointments" },
  { to: "/patient/records", icon: FileText, label: "Medical Records" },
  { to: "/patient/lab-results", icon: FlaskConical, label: "Lab Results" },
  { to: "/patient/medications", icon: Pill, label: "Medications" },
  { to: "/patient/doctors", icon: Stethoscope, label: "Find Doctors" },
  { to: "/patient/messages", icon: MessageSquare, label: "Messages" },
  { to: "/patient/billing", icon: CreditCard, label: "Billing" },
  { to: "/patient/ai-assistant", icon: Activity, label: "AI Assistant" },
  { to: "/patient/notifications", icon: Bell, label: "Notifications" },
  { to: "/patient/profile", icon: User, label: "My Profile" },
];

const doctorLinks = [
  { to: "/doctor/dashboard", icon: Home, label: "Dashboard" },
  { to: "/doctor/appointments", icon: Calendar, label: "Appointments" },
  { to: "/doctor/patients", icon: Users, label: "My Patients" },
  { to: "/doctor/prescriptions", icon: Pill, label: "Prescriptions" },
  { to: "/doctor/lab-orders", icon: FlaskConical, label: "Lab Orders" },
  { to: "/doctor/messages", icon: MessageSquare, label: "Messages" },
  { to: "/doctor/earnings", icon: BarChart3, label: "Earnings" },
  { to: "/doctor/profile", icon: User, label: "My Profile" },
  { to: "/doctor/settings", icon: Settings, label: "Settings" },
];

const adminLinks = [
  { to: "/admin/dashboard", icon: Home, label: "Dashboard" },
  { to: "/admin/patients", icon: Users, label: "Patients" },
  { to: "/admin/doctors", icon: Stethoscope, label: "Doctors" },
  { to: "/admin/appointments", icon: Calendar, label: "Appointments" },
  { to: "/admin/services", icon: HeartPulse, label: "Services" },
  { to: "/admin/specializations", icon: BookOpen, label: "Specializations" },
  { to: "/admin/users", icon: UserCheck, label: "Users" },
  { to: "/admin/audit-logs", icon: Shield, label: "Audit Logs" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/admin/notifications", icon: Bell, label: "Notifications" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const { role, logoutUser, user } = useAuth();

  const links =
    role === "doctor" ? doctorLinks :
    role === "admin" ? adminLinks :
    patientLinks;

  const roleLabel = role === "admin" ? "Administrator" : role === "doctor" ? "Doctor" : "Patient";
  const roleBg =
    role === "admin" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
    : role === "doctor" ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
    : "bg-healing-100 text-healing-700 dark:bg-healing-900/30 dark:text-healing-400";

  const activeClass =
    role === "admin" ? "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
    : role === "doctor" ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
    : "bg-healing-50 text-healing-700 dark:bg-healing-900/30 dark:text-healing-400";

  const logoGradient =
    role === "admin" ? "from-purple-500 to-violet-600"
    : role === "doctor" ? "from-primary-500 to-blue-600"
    : "from-healing-500 to-teal-600";

  return (
    <aside className="flex h-full w-64 flex-col bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-gray-100 dark:border-slate-800 px-5">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${logoGradient} shadow-sm`}>
          <Stethoscope className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">HealthCare<span className="text-primary-600">+</span></p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{roleLabel} Portal</p>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800">
        <div className={`flex items-center gap-3 rounded-xl p-2.5 bg-gradient-to-r ${
          role === "admin" ? "from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30"
          : role === "doctor" ? "from-primary-50 to-blue-50 dark:from-primary-950/30 dark:to-blue-950/30"
          : "from-healing-50 to-teal-50 dark:from-healing-950/30 dark:to-teal-950/30"
        }`}>
          <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${logoGradient} text-xs font-bold text-white`}>
            {(user as { email?: string })?.email?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-gray-900 dark:text-white">
              {(user as { email?: string })?.email ?? "User"}
            </p>
            <span className={cn("inline-block rounded-full px-1.5 py-0.5 text-[10px] font-semibold mt-0.5", roleBg)}>
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        <ul className="space-y-0.5 px-3">
          {links.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150",
                    isActive
                      ? activeClass
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  )
                }
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-100 dark:border-slate-800 p-3">
        <button
          onClick={logoutUser}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
