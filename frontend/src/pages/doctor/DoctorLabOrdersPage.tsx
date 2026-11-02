import { motion } from "framer-motion";
import { FlaskConical } from "lucide-react";
import { Card } from "../../components/ui/Card";

export function DoctorLabOrdersPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lab Orders</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Manage and track lab test orders</p>
      </div>
      <Card className="py-20 text-center">
        <FlaskConical className="mx-auto mb-3 h-12 w-12 text-gray-200 dark:text-slate-600" />
        <p className="font-medium text-gray-600 dark:text-slate-300">Lab orders coming soon</p>
        <p className="text-sm text-gray-400 mt-1">Order and track lab tests for your patients from here.</p>
      </Card>
    </motion.div>
  );
}
