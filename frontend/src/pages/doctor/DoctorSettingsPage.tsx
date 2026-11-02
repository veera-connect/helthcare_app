import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { Card } from "../../components/ui/Card";

export function DoctorSettingsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Manage your account preferences</p>
      </div>
      <Card className="py-20 text-center">
        <Settings className="mx-auto mb-3 h-12 w-12 text-gray-200 dark:text-slate-600" />
        <p className="font-medium text-gray-600 dark:text-slate-300">Settings coming soon</p>
        <p className="text-sm text-gray-400 mt-1">Notification preferences, availability hours, and account settings will appear here.</p>
      </Card>
    </motion.div>
  );
}
