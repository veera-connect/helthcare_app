import { NavLink } from "react-router-dom";
import { clsx } from "clsx";
import {
  Home, Calendar, FileText, User, Users, Settings,
  MessageSquare, LogOut, Stethoscope,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const patientLinks = [
  { to: "/dashboard", icon: Home, label: "Dashboard" },
  { to: "/appointments", icon: Calendar, label: "Appointments" },
  { to: "/medical-records", icon: FileText, label: "Medical Records" },
  { to: "/doctors", icon: Stethoscope, label: "Find Doctors" },
  { to: "/ai-assistant", icon: MessageSquare, label: "AI Assistant" },
  { to: "/profile", icon: User, label: "My Profile" },
];

const doctorLinks = [
  { to: "/doctor/dashboard", icon: Home, label: "Dashboard" },
  { to: "/doctor/appointments", icon: Calendar, label: "Appointments" },
  { to: "/doctor/patients", icon: Users, label: "My Patients" },
  { to: "/doctor/profile", icon: User, label: "My Profile" },
];

const adminLinks = [
  { to: "/admin/dashboard", icon: Home, label: "Dashboard" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/doctors", icon: Stethoscope, label: "Doctors" },
  { to: "/admin/appointments", icon: Calendar, label: "Appointments" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const { role, logoutUser } = useAuth();

  const links =
    role === "doctor" ? doctorLinks :
    role === "admin" ? adminLinks :
    patientLinks;

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <Stethoscope className="h-6 w-6 text-primary-600" />
        <span className="text-lg font-bold text-gray-900">HealthCare</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {links.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-gray-200 p-3">
        <button
          onClick={logoutUser}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
