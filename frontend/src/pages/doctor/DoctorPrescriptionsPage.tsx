import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Pill, Calendar, User, Search } from "lucide-react";
import { useState } from "react";
import { getDoctorPrescriptions } from "../../services/prescription.service";
import { useAuth } from "../../hooks/useAuth";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";
import { format } from "date-fns";

export function DoctorPrescriptionsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["doctor-prescriptions", (user as any)?.doctor_id],
    queryFn: () => getDoctorPrescriptions((user as any)?.doctor_id ?? ""),
    enabled: !!(user as any)?.doctor_id,
  });

  const prescriptions = data?.items ?? [];
  const filtered = prescriptions.filter((p: any) =>
    p.medication_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.patient_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prescriptions</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Medications you have prescribed</p>
      </div>

      <Input
        placeholder="Search prescriptions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-slate-700 dark:bg-slate-800 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-16 text-center">
          <Pill className="mx-auto mb-3 h-12 w-12 text-gray-200 dark:text-slate-600" />
          <p className="font-medium text-gray-600 dark:text-slate-300">No prescriptions found</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((rx: any) => (
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
                  <p className="mt-0.5 text-sm text-gray-600 dark:text-slate-300">{rx.dosage} — {rx.frequency}</p>
                  {rx.patient_name && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                      <User className="h-3 w-3" /> {rx.patient_name}
                    </p>
                  )}
                  {rx.start_date && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(rx.start_date), "MMM d, yyyy")}
                      {rx.end_date ? ` → ${format(new Date(rx.end_date), "MMM d, yyyy")}` : ""}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
