import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { Card } from "../../components/ui/Card";

export function DoctorEarningsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Earnings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Your consultation revenue and payouts</p>
      </div>
      <Card className="py-20 text-center">
        <BarChart3 className="mx-auto mb-3 h-12 w-12 text-gray-200 dark:text-slate-600" />
        <p className="font-medium text-gray-600 dark:text-slate-300">Earnings dashboard coming soon</p>
        <p className="text-sm text-gray-400 mt-1">Consultation fees, monthly summaries, and payout history will appear here.</p>
      </Card>
    </motion.div>
  );
}
