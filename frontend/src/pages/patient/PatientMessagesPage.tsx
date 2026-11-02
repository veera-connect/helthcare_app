import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { Card } from "../../components/ui/Card";

export function PatientMessagesPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Chat with your doctors and care team</p>
      </div>
      <Card className="py-20 text-center">
        <MessageSquare className="mx-auto mb-3 h-12 w-12 text-gray-200 dark:text-slate-600" />
        <p className="font-medium text-gray-600 dark:text-slate-300">Messaging coming soon</p>
        <p className="text-sm text-gray-400 mt-1">Real-time chat with your doctors will be available here once the messaging module is enabled.</p>
      </Card>
    </motion.div>
  );
}
