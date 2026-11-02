import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { Card } from "../../components/ui/Card";

export function AdminNotificationsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Platform-wide alerts and announcements</p>
      </div>

      <Card className="py-20 text-center">
        <Bell className="mx-auto mb-3 h-12 w-12 text-gray-200 dark:text-slate-600" />
        <p className="font-medium text-gray-600 dark:text-slate-300">No notifications yet</p>
        <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
          System notifications will appear here. This feature requires the notifications table — run the next seed update to enable it.
        </p>
      </Card>
    </motion.div>
  );
}
