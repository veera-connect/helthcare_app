import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { UserCheck, Search, Calendar } from "lucide-react";
import { format } from "date-fns";
import { adminListUsers } from "../../services/admin.service";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";

const ROLE_COLORS: Record<string, "success" | "warning" | "default"> = {
  admin: "warning",
  doctor: "success",
  patient: "default",
};

export function AdminUsersPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search],
    queryFn: () => adminListUsers(1, 100, search || undefined),
  });

  const users = data?.items ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{data?.total ?? 0} total users</p>
      </div>

      <Input
        placeholder="Search by email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
      />

      {isLoading ? (
        <Card padding="none">
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-center">
                <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </Card>
      ) : users.length === 0 ? (
        <Card className="py-16 text-center">
          <UserCheck className="mx-auto mb-3 h-12 w-12 text-gray-200 dark:text-slate-600" />
          <p className="font-medium text-gray-600 dark:text-slate-300">No users found</p>
        </Card>
      ) : (
        <Card padding="none">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 text-xs font-bold text-purple-700 dark:text-purple-400">
                          {u.email.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{u.email}</p>
                      </div>
                    </td>
                    <td>
                      <Badge variant={ROLE_COLORS[u.role] ?? "default"} className="capitalize">
                        {u.role}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={u.is_active ? "success" : "danger"} dot>
                        {u.is_active ? "Active" : "Suspended"}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={u.is_verified ? "success" : "warning"}>
                        {u.is_verified ? "Verified" : "Pending"}
                      </Badge>
                    </td>
                    <td className="text-gray-500 dark:text-slate-400 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {u.created_at ? format(new Date(u.created_at), "MMM d, yyyy") : "—"}
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
