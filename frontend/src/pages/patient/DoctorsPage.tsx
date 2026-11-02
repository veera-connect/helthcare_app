import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Stethoscope } from "lucide-react";
import { listDoctors, listSpecializations } from "../../services/doctor.service";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export function DoctorsPage() {
  const [specializationId, setSpecializationId] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  const { data: specializations } = useQuery({
    queryKey: ["specializations"],
    queryFn: listSpecializations,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["doctors", specializationId, page],
    queryFn: () => listDoctors(specializationId, page, 12),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find a Doctor</h1>
        <p className="text-sm text-gray-500 mt-1">Browse available healthcare professionals</p>
      </div>

      {/* Specialization Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setSpecializationId(undefined); setPage(1); }}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !specializationId ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {specializations?.map((s) => (
          <button
            key={s.id}
            onClick={() => { setSpecializationId(s.id); setPage(1); }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              specializationId === s.id ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-500">Loading doctors...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.items.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100">
                  <Stethoscope className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">
                    Dr. {doctor.first_name} {doctor.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {doctor.specializations.map((s) => s.name).join(", ") || "General Practice"}
                  </p>
                  {doctor.years_of_experience && (
                    <p className="text-xs text-gray-400 mt-1">{doctor.years_of_experience} years experience</p>
                  )}
                  {doctor.consultation_fee && (
                    <p className="text-sm font-medium text-gray-700 mt-2">
                      ${doctor.consultation_fee} / session
                    </p>
                  )}
                </div>
              </div>
              {doctor.bio && <p className="mt-3 text-sm text-gray-600 line-clamp-2">{doctor.bio}</p>}
              <Button className="mt-4 w-full" size="sm">
                Book Appointment
              </Button>
            </Card>
          ))}
        </div>
      )}

      {data && data.total > 12 && (
        <div className="flex justify-center gap-2">
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="flex items-center text-sm text-gray-500">Page {page}</span>
          <Button variant="secondary" size="sm" disabled={page * 12 >= data.total} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
