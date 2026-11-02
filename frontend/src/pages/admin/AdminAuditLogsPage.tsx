import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Shield, Search, Calendar, User } from "lucide-react";
import { useState } from "react";
import { getAuditLogs } from "../../services/admin.service";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { format } from "date-fns";

const actionColors: Record<string, "primary" | "success" | "warning" | "danger" | "info" | "default"> = {
  create: "success",
  read: "info",
  update: "primary",
  delete: "danger",
  login: "default",
  logout: "default",
  login_failed: "warning",
  password_reset: "warning",
  file_upload: "info",
  ai_query: "primary",
};

export function AdminAuditLogsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => getAuditLogs(1, 100),
  });

  const logs = data?.items ?? [];
  const filtered = logs.filter((l: any) =>
    l.action?.includes(search.toLowerCase()) ||
    l.resource_type?.includes(search.toLowerCase()) ||
    l.ip_address?.includes(search)
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">All system actions and access events</p>
      </div>

      <Input
        placeholder="Filter by action, resource, or IP..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
      />

      {isLoading ? (
        <Card padding="none">
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24 ml-auto" />
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Actor</th>
                  <th>IP Address</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      <Shield className="mx-auto mb-2 h-8 w-8 text-gray-200 dark:text-slate-600" />
                      No audit logs found
                    </td>
                  </tr>
                ) : (
                  filtered.map((log: any) => (
                    <tr key={log.id}>
                      <td>
                        <Badge variant={actionColors[log.action] ?? "default"}>
                          {log.action?.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="text-gray-600 dark:text-slate-400">
                        {log.resource_type ? (
                          <span>
                            {log.resource_type}
                            {log.resource_id && (
                              <span className="ml-1 text-xs text-gray-400">#{log.resource_id.slice(0, 8)}</span>
                            )}
                          </span>
                        ) : "—"}
                      </td>
                      <td>
                        {log.actor_id ? (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <User className="h-3 w-3" />
                            #{log.actor_id.slice(0, 8)}
                          </span>
                        ) : <span className="text-gray-400">System</span>}
                      </td>
                      <td className="font-mono text-xs text-gray-500 dark:text-slate-400">
                        {log.ip_address ?? "—"}
                      </td>
                      <td className="text-xs text-gray-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {log.created_at ? format(new Date(log.created_at), "MMM d, HH:mm") : "—"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </motion.div>
  );
}
