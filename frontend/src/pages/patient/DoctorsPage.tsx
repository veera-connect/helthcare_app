import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Stethoscope, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { listDoctors, listSpecializations } from "../../services/doctor.service";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";

export function DoctorsPage() {
  const [specializationId, setSpecializationId] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  const { data: specializations } = useQuery({
    queryKey: ["specializations"],
    queryFn: listSpecializations,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["doctors", specializationId, page],
    queryFn: () => listDoctors(page, 12, undefined, specializationId),
  });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Find a Doctor</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Browse available healthcare professionals</p>
      </div>

      {/* Specialization Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setSpecializationId(undefined); setPage(1); }}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !specializationId
              ? "bg-primary-600 text-white shadow-sm"
              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
          }`}
        >
          All Specializations
        </button>
        {specializations?.map((s) => (
          <button
            key={s.id}
            onClick={() => { setSpecializationId(s.id); setPage(1); }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              specializationId === s.id
                ? "bg-primary-600 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-slate-700 dark:bg-slate-800 space-y-3">
              <div className="flex gap-3">
                <Skeleton className="h-14 w-14 rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : (data?.items ?? []).length === 0 ? (
        <div className="py-20 text-center">
          <Stethoscope className="mx-auto mb-3 h-12 w-12 text-gray-200 dark:text-slate-600" />
          <p className="font-medium text-gray-600 dark:text-slate-300">No doctors found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.items.map((doctor) => (
            <Card key={doctor.id} hover className="flex flex-col">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/30">
                  <Stethoscope className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Dr. {doctor.first_name} {doctor.last_name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">
                    {doctor.specializations?.map((s) => s.name).join(", ") || "General Practice"}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {doctor.years_of_experience && (
                      <span className="flex items-center gap-0.5 text-xs text-gray-400">
                        <Clock className="h-3 w-3" /> {doctor.years_of_experience}y exp
                      </span>
                    )}
                    <Badge variant="success" size="sm">Available</Badge>
                  </div>
                </div>
              </div>
              {doctor.bio && (
                <p className="mt-3 text-xs text-gray-500 dark:text-slate-400 line-clamp-2">{doctor.bio}</p>
              )}
              <div className="mt-3 flex items-center justify-between">
                {doctor.consultation_fee ? (
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    ₹{doctor.consultation_fee}
                    <span className="ml-1 text-xs font-normal text-gray-400">/visit</span>
                  </p>
                ) : <span />}
              </div>
              <Link to={`/patient/appointments/book`} state={{ doctorId: doctor.id }} className="mt-4">
                <Button className="w-full" size="sm">Book Appointment</Button>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {data && data.total > 12 && (
        <div className="flex justify-center gap-2">
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="flex items-center text-sm text-gray-500 dark:text-slate-400">
            Page {page} of {Math.ceil(data.total / 12)}
          </span>
          <Button variant="secondary" size="sm" disabled={page * 12 >= data.total} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </motion.div>
  );
}
