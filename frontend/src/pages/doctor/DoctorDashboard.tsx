import { useQuery } from "@tanstack/react-query";
import { Calendar, Users, Clock } from "lucide-react";
import { getMyDoctorProfile } from "../../services/doctor.service";
import { listDoctorAppointments } from "../../services/appointment.service";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/Badge";
import { format } from "date-fns";

export function DoctorDashboard() {
  const { data: profile } = useQuery({ queryKey: ["doctor-profile"], queryFn: getMyDoctorProfile });
  const { data: appointments } = useQuery({
    queryKey: ["doctor-appointments", profile?.id],
    queryFn: () => listDoctorAppointments(profile!.id, 1, 10),
    enabled: !!profile?.id,
  });

  const todayAppts = appointments?.items.filter(
    (a) => new Date(a.scheduled_at).toDateString() === new Date().toDateString()
  ) ?? [];

  const upcomingAppts = appointments?.items.filter(
    (a) => (a.status === "scheduled" || a.status === "confirmed") && new Date(a.scheduled_at) > new Date()
  ) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good day, Dr. {profile?.last_name}!
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {profile?.specializations.map((s) => s.name).join(", ")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Today's Appointments</p>
            <p className="text-2xl font-bold text-gray-900">{todayAppts.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Upcoming</p>
            <p className="text-2xl font-bold text-gray-900">{upcomingAppts.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Appointments</p>
            <p className="text-2xl font-bold text-gray-900">{appointments?.total ?? 0}</p>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        {upcomingAppts.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">No upcoming appointments</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {upcomingAppts.slice(0, 8).map((appt) => (
              <li key={appt.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(appt.scheduled_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                  {appt.reason && <p className="text-xs text-gray-500">{appt.reason}</p>}
                </div>
                <StatusBadge status={appt.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
