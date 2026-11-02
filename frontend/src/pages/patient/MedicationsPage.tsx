import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Pill, Clock, Calendar, Info } from "lucide-react";
import { getMyProfile } from "../../services/patient.service";
import { getPatientPrescriptions } from "../../services/prescription.service";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { format } from "date-fns";

export function MedicationsPage() {
  const { data: profile } = useQuery({ queryKey: ["patient-profile"], queryFn: getMyProfile });
  const { data, isLoading } = useQuery({
    queryKey: ["prescriptions", profile?.id],
    queryFn: () => getPatientPrescriptions(profile!.id),
    enabled: !!profile?.id,
  });

  const prescriptions = data?.items ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Medications</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Your active and past prescriptions</p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-900/20">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Always take medications as prescribed by your doctor. Do not change dosage without consulting a healthcare professional.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : prescriptions.length === 0 ? (
        <Card className="py-16 text-center">
          <Pill className="mx-auto mb-3 h-12 w-12 text-gray-200 dark:text-slate-600" />
          <p className="font-medium text-gray-600 dark:text-slate-300">No medications prescribed</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-slate-500">
            Prescriptions from your doctor will appear here
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((rx: any) => (
            <Card key={rx.id} hover>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-healing-50 dark:bg-healing-900/30">
                  <Pill className="h-5 w-5 text-healing-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white">{rx.medication_name}</p>
                    <Badge variant={rx.end_date && new Date(rx.end_date) < new Date() ? "default" : "success"} dot>
                      {rx.end_date && new Date(rx.end_date) < new Date() ? "Completed" : "Active"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">
                    {rx.dosage} — {rx.frequency}
                  </p>
                  {rx.duration && (
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                      Duration: {rx.duration}
                    </p>
                  )}
                  {rx.instructions && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-slate-400 italic">{rx.instructions}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    {rx.start_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        From: {format(new Date(rx.start_date), "MMM d, yyyy")}
                      </span>
                    )}
                    {rx.end_date && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Until: {format(new Date(rx.end_date), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
