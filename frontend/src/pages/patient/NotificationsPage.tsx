import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bell, Calendar, FileText, Stethoscope, Check, CheckCheck } from "lucide-react";
import { getNotifications, markAllRead, markRead } from "../../services/notification.service";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { cn } from "../../utils/cn";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

const iconMap: Record<string, React.ElementType> = {
  appointment: Calendar,
  record: FileText,
  doctor: Stethoscope,
  default: Bell,
};

export function NotificationsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(1, 50),
  });

  const { mutate: markAllMutation } = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  const { mutate: markOneMutation } = useMutation({
    mutationFn: markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications = data?.items ?? [];
  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => markAllMutation()}
            leftIcon={<CheckCheck className="h-3.5 w-3.5" />}
          >
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card className="py-16 text-center">
          <Bell className="mx-auto mb-3 h-12 w-12 text-gray-200 dark:text-slate-600" />
          <p className="font-medium text-gray-600 dark:text-slate-300">No notifications</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-slate-500">You'll be notified about appointments and updates</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => {
            const Icon = iconMap[n.type] ?? iconMap.default;
            return (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-4 transition-colors",
                  n.is_read
                    ? "border-gray-100 bg-white dark:border-slate-700 dark:bg-slate-800"
                    : "border-primary-100 bg-primary-50 dark:border-primary-800/40 dark:bg-primary-900/20"
                )}
              >
                <div className={cn(
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
                  n.is_read ? "bg-gray-100 dark:bg-slate-700" : "bg-primary-100 dark:bg-primary-800/40"
                )}>
                  <Icon className={cn("h-4 w-4", n.is_read ? "text-gray-400" : "text-primary-600")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", n.is_read ? "text-gray-600 dark:text-slate-400" : "text-gray-900 dark:text-white")}>
                    {n.title ?? n.message}
                  </p>
                  {n.message && n.title && (
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-500">{n.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400 dark:text-slate-600">
                    {n.created_at ? formatDistanceToNow(new Date(n.created_at), { addSuffix: true }) : ""}
                  </p>
                </div>
                {!n.is_read && (
                  <button
                    onClick={() => markOneMutation(n.id)}
                    className="flex-shrink-0 rounded-lg p-1 text-primary-400 hover:bg-primary-100 transition-colors"
                    title="Mark as read"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
