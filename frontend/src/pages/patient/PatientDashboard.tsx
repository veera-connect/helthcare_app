import { useQuery } from "@tanstack/react-query";
import { Calendar, FileText, Clock, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { getMyProfile } from "../../services/patient.service";
import { listPatientAppointments } from "../../services/appointment.service";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { format } from "date-fns";

export function PatientDashboard() {
  const { data: profile } = useQuery({ queryKey: ["patient-profile"], queryFn: getMyProfile });
  const { data: appointments } = useQuery({
    queryKey: ["patient-appointments", profile?.id],
    queryFn: () => listPatientAppointments(profile!.id, 1, 5),
    enabled: !!profile?.id,
  });

  const upcomingAppts = appointments?.items.filter(
    (a) => a.status === "scheduled" || a.status === "confirmed"
  ) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back{profile ? `, ${profile.first_name}` : ""}!
        </h1>
        <p className="text-sm text-gray-500 mt-1">Here's an overview of your health dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Upcoming Appointments</p>
            <p className="text-2xl font-bold text-gray-900">{upcomingAppts.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <FileText className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Medical Records</p>
            <p className="text-2xl font-bold text-gray-900">—</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <Activity className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Blood Group</p>
            <p className="text-2xl font-bold text-gray-900">{profile?.blood_group ?? "—"}</p>
          </div>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <Button variant="secondary" size="sm" asChild>
            <Link to="/appointments">View All</Link>
          </Button>
        </CardHeader>
        {upcomingAppts.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No upcoming appointments</p>
            <Button className="mt-4" size="sm" asChild>
              <Link to="/doctors">Book Appointment</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {upcomingAppts.map((appt) => (
              <li key={appt.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(appt.scheduled_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                  <p className="text-xs text-gray-500">{appt.reason ?? "General consultation"}</p>
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
