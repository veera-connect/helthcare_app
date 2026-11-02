import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Settings, Save } from "lucide-react";
import { getSettings, updateSetting } from "../../services/admin.service";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";

export function AdminSettingsPage() {
  const qc = useQueryClient();
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: getSettings,
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => updateSetting(key, value),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      const next = { ...edits };
      delete next[vars.key];
      setEdits(next);
      setSaving(null);
      toast.success("Setting saved");
    },
    onError: (e: any) => {
      setSaving(null);
      toast.error(e?.response?.data?.detail ?? "Failed to save");
    },
  });

  const settings = data?.items ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Configure platform-wide settings</p>
      </div>

      {isLoading ? (
        <Card>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </Card>
      ) : settings.length === 0 ? (
        <Card className="py-16 text-center">
          <Settings className="mx-auto mb-3 h-12 w-12 text-gray-200 dark:text-slate-600" />
          <p className="font-medium text-gray-600 dark:text-slate-300">No settings configured</p>
          <p className="text-sm text-gray-400 mt-1">Settings will appear here once added to the database</p>
        </Card>
      ) : (
        <Card>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {settings.map((s) => {
              const currentVal = edits[s.key_name] ?? s.value;
              const isDirty = edits[s.key_name] !== undefined && edits[s.key_name] !== s.value;
              return (
                <div key={s.id} className="py-4 first:pt-0 last:pb-0">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
                    {s.key_name}
                  </label>
                  {s.description && (
                    <p className="mb-2 text-xs text-gray-400 dark:text-slate-500">{s.description}</p>
                  )}
                  <div className="flex gap-2">
                    <Input
                      value={currentVal}
                      onChange={(e) => setEdits((prev) => ({ ...prev, [s.key_name]: e.target.value }))}
                      className="flex-1"
                    />
                    {isDirty && (
                      <Button
                        size="sm"
                        leftIcon={<Save className="h-3.5 w-3.5" />}
                        isLoading={saving === s.key_name && updateMutation.isPending}
                        onClick={() => {
                          setSaving(s.key_name);
                          updateMutation.mutate({ key: s.key_name, value: currentVal });
                        }}
                      >
                        Save
                      </Button>
                    )}
                  </div>
                  {s.updated_at && (
                    <p className="mt-1 text-xs text-gray-400">
                      Last updated: {new Date(s.updated_at).toLocaleString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </motion.div>
  );
}
