import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FileText, Search, Calendar, User, ChevronRight } from "lucide-react";
import { useState } from "react";
import { getMyProfile } from "../../services/patient.service";
import { listPatientRecords } from "../../services/medicalRecord.service";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";
import { format } from "date-fns";

const recordTypeMap: Record<string, { label: string; variant: "primary" | "success" | "info" | "warning" | "default" }> = {
  consultation: { label: "Consultation", variant: "primary" },
  lab_report: { label: "Lab Report", variant: "success" },
  prescription: { label: "Prescription", variant: "info" },
  imaging: { label: "Imaging", variant: "warning" },
  surgery: { label: "Surgery", variant: "default" },
  discharge_summary: { label: "Discharge Summary", variant: "default" },
  other: { label: "Other", variant: "default" },
};

export function MedicalRecordsPage() {
  const [search, setSearch] = useState("");
  const { data: profile } = useQuery({ queryKey: ["patient-profile"], queryFn: getMyProfile });
  const { data, isLoading } = useQuery({
    queryKey: ["patient-records", profile?.id],
    queryFn: () => listPatientRecords(profile!.id, 1, 50),
    enabled: !!profile?.id,
  });

  const records = data?.items ?? [];
  const filtered = records.filter(
    (r: any) =>
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.diagnosis?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Medical Records</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Your complete health history</p>
        </div>
      </div>

      {/* Search */}
      <Input
        placeholder="Search records by title or diagnosis..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex gap-4">
                <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-64" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-16 text-center">
          <FileText className="mx-auto mb-3 h-12 w-12 text-gray-200 dark:text-slate-600" />
          <p className="font-medium text-gray-600 dark:text-slate-300">No records found</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-slate-500">
            {search ? "Try a different search term" : "Your medical records will appear here after consultations"}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((record: any) => {
            const typeConfig = recordTypeMap[record.record_type] ?? recordTypeMap.other;
            return (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30">
                    <FileText className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-gray-900 dark:text-white">{record.title}</p>
                      <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(record.record_date), "MMM d, yyyy")}
                      </span>
                      {record.doctor && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Dr. {record.doctor.first_name} {record.doctor.last_name}
                        </span>
                      )}
                    </div>
                    {record.diagnosis && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-slate-300 line-clamp-2">
                        <span className="font-medium">Diagnosis: </span>{record.diagnosis}
                      </p>
                    )}
                    {record.prescriptions?.length > 0 && (
                      <p className="mt-1 text-xs text-healing-700 dark:text-healing-400">
                        {record.prescriptions.length} prescription{record.prescriptions.length !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors mt-1" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
