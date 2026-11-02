import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CreditCard, Calendar, Receipt, CheckCircle, Clock } from "lucide-react";
import { getMyProfile } from "../../services/patient.service";
import { getPatientInvoices } from "../../services/billing.service";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { StatCard } from "../../components/ui/StatCard";
import { Skeleton } from "../../components/ui/Skeleton";
import { format } from "date-fns";

export function BillingPage() {
  const { data: profile } = useQuery({ queryKey: ["patient-profile"], queryFn: getMyProfile });
  const { data, isLoading } = useQuery({
    queryKey: ["invoices", profile?.id],
    queryFn: () => getPatientInvoices(profile!.id),
    enabled: !!profile?.id,
  });

  const invoices = data?.items ?? [];
  const totalPaid = invoices.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + (i.amount ?? 0), 0);
  const pendingCount = invoices.filter((i: any) => i.status === "pending").length;

  const statusConfig: Record<string, { variant: "success" | "warning" | "danger" | "default"; label: string }> = {
    paid: { variant: "success", label: "Paid" },
    pending: { variant: "warning", label: "Pending" },
    overdue: { variant: "danger", label: "Overdue" },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Your invoices and payment history</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Paid"
          value={`₹${totalPaid.toLocaleString()}`}
          icon={<CheckCircle className="h-5 w-5 text-healing-600" />}
          iconBg="bg-healing-50 dark:bg-healing-900/30"
        />
        <StatCard
          title="Pending Payments"
          value={pendingCount}
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          iconBg="bg-amber-50 dark:bg-amber-900/30"
        />
        <StatCard
          title="Total Invoices"
          value={invoices.length}
          icon={<Receipt className="h-5 w-5 text-primary-600" />}
          iconBg="bg-primary-50 dark:bg-primary-900/30"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="mt-2 flex gap-4">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <Card className="py-16 text-center">
          <CreditCard className="mx-auto mb-3 h-12 w-12 text-gray-200 dark:text-slate-600" />
          <p className="font-medium text-gray-600 dark:text-slate-300">No invoices yet</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-slate-500">Invoices from appointments will appear here</p>
        </Card>
      ) : (
        <Card padding="none">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {invoices.map((inv: any) => {
                  const config = statusConfig[inv.status] ?? { variant: "default", label: inv.status };
                  return (
                    <tr key={inv.id}>
                      <td className="font-medium text-gray-900 dark:text-white">
                        #{inv.id?.slice(0, 8)}
                      </td>
                      <td>
                        <span className="flex items-center gap-1 text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(inv.created_at ?? Date.now()), "MMM d, yyyy")}
                        </span>
                      </td>
                      <td className="max-w-[200px] truncate text-gray-600 dark:text-slate-400">
                        {inv.description ?? "Consultation fee"}
                      </td>
                      <td className="font-semibold text-gray-900 dark:text-white">
                        ₹{(inv.amount ?? 0).toLocaleString()}
                      </td>
                      <td>
                        <Badge variant={config.variant} dot>{config.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </motion.div>
  );
}
