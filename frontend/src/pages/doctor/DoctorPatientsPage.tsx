import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, Search, Phone, Calendar, ChevronRight } from "lucide-react";
import { useState } from "react";
import { getDoctorPatients } from "../../services/doctor.service";
import { useAuth } from "../../hooks/useAuth";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { format } from "date-fns";

export function DoctorPatientsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["doctor-patients", (user as any)?.doctor_id],
    queryFn: () => getDoctorPatients((user as any)?.doctor_id ?? ""),
    enabled: !!(user as any)?.doctor_id,
  });

  const patients = data?.items ?? [];
  const filtered = patients.filter((p: any) =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Patients</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          {patients.length} patient{patients.length !== 1 ? "s" : ""} under your care
        </p>
      </div>

      <Input
        placeholder="Search patients..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-16 text-center">
          <Users className="mx-auto mb-3 h-12 w-12 text-gray-200 dark:text-slate-600" />
          <p className="font-medium text-gray-600 dark:text-slate-300">
            {search ? "No patients match your search" : "No patients yet"}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((patient: any) => (
            <div
              key={patient.id}
              className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition-shadow hover:shadow-card-hover dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-base font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-400">
                {patient.first_name?.[0]}{patient.last_name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white">
                  {patient.first_name} {patient.last_name}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 dark:text-slate-400">
                  {patient.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {patient.phone}
                    </span>
                  )}
                  {patient.blood_group && (
                    <Badge variant="danger" size="sm">{patient.blood_group.toUpperCase()}</Badge>
                  )}
                  {patient.date_of_birth && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(patient.date_of_birth), "MMM d, yyyy")}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
