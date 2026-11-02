import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Plus, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { getMyProfile } from "../../services/patient.service";
import { listPatientAppointments, cancelAppointment } from "../../services/appointment.service";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import { AppointmentStatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { SkeletonTableRow } from "../../components/ui/Skeleton";
import { format } from "date-fns";

export function AppointmentsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: profile } = useQuery({ queryKey: ["patient-profile"], queryFn: getMyProfile });
  const { data, isLoading } = useQuery({
    queryKey: ["patient-appointments", profile?.id, page],
    queryFn: () => listPatientAppointments(profile!.id, page, pageSize),
    enabled: !!profile?.id,
  });

  const { mutate: cancel, isPending: cancelling } = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => cancelAppointment(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-appointments"] });
      toast.success("Appointment cancelled");
    },
    onError: () => toast.error("Could not cancel appointment"),
  });

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Appointments</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {data?.total ?? 0} appointment{data?.total !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button onClick={() => navigate("/patient/appointments/book")} leftIcon={<Plus className="h-4 w-4" />}>
          Book Appointment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
        </CardHeader>

        {isLoading ? (
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} />)}
          </div>
        ) : (data?.items.length ?? 0) === 0 ? (
          <div className="py-12 text-center">
            <Calendar className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-slate-600" />
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">No appointments yet</p>
            <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">Book your first appointment to get started</p>
            <Button
              size="sm"
              className="mt-4"
              onClick={() => navigate("/patient/appointments/book")}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Book Now
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {data?.items.map((appt) => (
              <div key={appt.id} className="flex items-start justify-between py-4 gap-4">
                <div className="space-y-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {format(new Date(appt.scheduled_at), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                  {appt.reason && (
                    <p className="text-sm text-gray-500 dark:text-slate-400 truncate">{appt.reason}</p>
                  )}
                  {appt.cancellation_reason && (
                    <p className="text-xs text-red-500 dark:text-red-400">
                      Reason: {appt.cancellation_reason}
                    </p>
                  )}
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  <AppointmentStatusBadge status={appt.status} />
                  {(appt.status === "scheduled" || appt.status === "confirmed") && (
                    <Button
                      variant="danger"
                      size="sm"
                      isLoading={cancelling}
                      onClick={() => cancel({ id: appt.id })}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-slate-700 pt-4">
            <p className="text-xs text-gray-400 dark:text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Prev
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
