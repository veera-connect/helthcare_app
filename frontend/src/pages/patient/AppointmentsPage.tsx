import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Calendar } from "lucide-react";
import { getMyProfile } from "../../services/patient.service";
import { listPatientAppointments, cancelAppointment } from "../../services/appointment.service";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { format } from "date-fns";

export function AppointmentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data: profile } = useQuery({ queryKey: ["patient-profile"], queryFn: getMyProfile });
  const { data, isLoading } = useQuery({
    queryKey: ["patient-appointments", profile?.id, page],
    queryFn: () => listPatientAppointments(profile!.id, page, 10),
    enabled: !!profile?.id,
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => cancelAppointment(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patient-appointments"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Book Appointment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
          <span className="text-sm text-gray-500">{data?.total ?? 0} total</span>
        </CardHeader>

        {isLoading ? (
          <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
        ) : data?.items.length === 0 ? (
          <div className="py-8 text-center">
            <Calendar className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No appointments found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data?.items.map((appt) => (
              <div key={appt.id} className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">
                    {format(new Date(appt.scheduled_at), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                  {appt.reason && <p className="text-sm text-gray-500">{appt.reason}</p>}
                  {appt.cancellation_reason && (
                    <p className="text-xs text-red-600">Reason: {appt.cancellation_reason}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={appt.status} />
                  {(appt.status === "scheduled" || appt.status === "confirmed") && (
                    <Button
                      variant="danger"
                      size="sm"
                      isLoading={cancelMutation.isPending}
                      onClick={() => cancelMutation.mutate({ id: appt.id })}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {data && data.total > 10 && (
          <div className="mt-4 flex justify-center gap-2">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" disabled={page * 10 >= data.total} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
