import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FlaskConical, TrendingUp, AlertCircle, Calendar } from "lucide-react";
import { getMyProfile } from "../../services/patient.service";
import { getPatientLabResults } from "../../services/labResult.service";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { format } from "date-fns";

export function LabResultsPage() {
  const { data: profile } = useQuery({ queryKey: ["patient-profile"], queryFn: getMyProfile });
  const { data, isLoading } = useQuery({
    queryKey: ["lab-results", profile?.id],
    queryFn: () => getPatientLabResults(profile!.id),
    enabled: !!profile?.id,
  });

  const results = data?.items ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lab Results</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Your diagnostic test results and trends</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <Skeleton className="mb-3 h-4 w-32" />
              <Skeleton className="mb-2 h-7 w-20" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <Card className="py-16 text-center">
          <FlaskConical className="mx-auto mb-3 h-12 w-12 text-gray-200 dark:text-slate-600" />
          <p className="font-medium text-gray-600 dark:text-slate-300">No lab results yet</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-slate-500">
            Lab results will appear here once your doctor orders tests
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((result: any) => (
            <Card key={result.id} hover>
              <CardHeader>
                <CardTitle>{result.test_name}</CardTitle>
                <Badge
                  variant={result.is_abnormal ? "danger" : "success"}
                  dot
                >
                  {result.is_abnormal ? "Abnormal" : "Normal"}
                </Badge>
              </CardHeader>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {result.value}
                    <span className="ml-1 text-base font-normal text-gray-400">{result.unit}</span>
                  </p>
                  {result.reference_range && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                      Normal: {result.reference_range}
                    </p>
                  )}
                </div>
                {result.is_abnormal ? (
                  <AlertCircle className="h-8 w-8 text-danger-400" />
                ) : (
                  <TrendingUp className="h-8 w-8 text-healing-400" />
                )}
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                <Calendar className="h-3 w-3" />
                {result.result_date ? format(new Date(result.result_date), "MMM d, yyyy") : "—"}
              </div>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
