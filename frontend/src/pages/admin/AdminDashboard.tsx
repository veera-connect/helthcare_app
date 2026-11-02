import { useQuery } from "@tanstack/react-query";
import { Users, Stethoscope, Calendar, Activity } from "lucide-react";
import { listPatients } from "../../services/patient.service";
import { listDoctors } from "../../services/doctor.service";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";

export function AdminDashboard() {
  const { data: patients } = useQuery({ queryKey: ["admin-patients"], queryFn: () => listPatients(1, 1) });
  const { data: doctors } = useQuery({ queryKey: ["admin-doctors"], queryFn: () => listDoctors(undefined, 1, 1) });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">System overview and management</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Patients</p>
            <p className="text-2xl font-bold text-gray-900">{patients?.total ?? "—"}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Stethoscope className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Doctors</p>
            <p className="text-2xl font-bold text-gray-900">{doctors?.total ?? "—"}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Calendar className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Appointments Today</p>
            <p className="text-2xl font-bold text-gray-900">—</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <Activity className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">System Health</p>
            <p className="text-2xl font-bold text-green-600">OK</p>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Manage Patients", href: "/admin/users" },
            { label: "Manage Doctors", href: "/admin/doctors" },
            { label: "View Audit Logs", href: "/admin/audit" },
          ].map(({ label }) => (
            <button
              key={label}
              className="rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
