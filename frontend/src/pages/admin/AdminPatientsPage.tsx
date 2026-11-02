import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, Search, Calendar } from "lucide-react";
import { useState } from "react";
import { adminListPatients } from "../../services/admin.service";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { format } from "date-fns";

export function AdminPatientsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-patients", search],
    queryFn: () => adminListPatients(1, 50, search || undefined),
  });

  const patients = data?.items ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {data?.total ?? 0} total patients
          </p>
        </div>
      </div>

      <Input
        placeholder="Search patients by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
      />

      {isLoading ? (
        <Card padding="none">
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : patients.length === 0 ? (
        <Card className="py-16 text-center">
          <Users className="mx-auto mb-3 h-12 w-12 text-gray-200 dark:text-slate-600" />
          <p className="font-medium text-gray-600 dark:text-slate-300">No patients found</p>
        </Card>
      ) : (
        <Card padding="none">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Blood Group</th>
                  <th>Date of Birth</th>
                  <th>Status</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {patients.map((p: any) => (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-400">
                          {p.first_name?.[0]}{p.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {p.first_name} {p.last_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      {p.blood_group && p.blood_group !== "unknown" ? (
                        <Badge variant="danger">{p.blood_group.toUpperCase()}</Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="text-gray-600 dark:text-slate-400">
                      {p.date_of_birth
                        ? format(new Date(p.date_of_birth), "MMM d, yyyy")
                        : "—"}
                    </td>
                    <td>
                      <Badge variant={p.is_active ? "success" : "danger"} dot>
                        {p.is_active ? "Active" : "Suspended"}
                      </Badge>
                    </td>
                    <td className="text-gray-500 dark:text-slate-400 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {p.created_at ? format(new Date(p.created_at), "MMM d, yyyy") : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </motion.div>
  );
}
