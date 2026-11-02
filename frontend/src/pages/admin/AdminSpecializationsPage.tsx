import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { BookOpen, Plus, Trash2, X } from "lucide-react";
import { getSpecializations, createSpecialization, deleteSpecialization } from "../../services/admin.service";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";

export function AdminSpecializationsPage() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-specializations"],
    queryFn: getSpecializations,
  });

  const createMutation = useMutation({
    mutationFn: createSpecialization,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-specializations"] });
      toast.success("Specialization added");
      setName("");
      setDescription("");
      setShowAdd(false);
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Failed to add specialization"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSpecialization,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-specializations"] });
      toast.success("Specialization deleted");
      setDeletingId(null);
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Failed to delete"),
  });

  const specs = data?.items ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Specializations</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{specs.length} specializations configured</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowAdd(true)}>
          Add Specialization
        </Button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">New Specialization</h3>
                <button onClick={() => setShowAdd(false)} className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-slate-700">
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              <div className="space-y-3">
                <Input
                  label="Name"
                  placeholder="e.g. Neurology"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  label="Description (optional)"
                  placeholder="Brief description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
                  <Button
                    onClick={() => createMutation.mutate({ name, description: description || undefined })}
                    isLoading={createMutation.isPending}
                    disabled={!name.trim()}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <Card>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </Card>
      ) : specs.length === 0 ? (
        <Card className="py-16 text-center">
          <BookOpen className="mx-auto mb-3 h-12 w-12 text-gray-200 dark:text-slate-600" />
          <p className="font-medium text-gray-600 dark:text-slate-300">No specializations yet</p>
          <p className="text-sm text-gray-400 mt-1">Add a specialization to get started</p>
        </Card>
      ) : (
        <Card padding="none">
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {specs.map((spec) => (
              <div key={spec.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                    <BookOpen className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{spec.name}</p>
                    {spec.description && (
                      <p className="text-xs text-gray-500 dark:text-slate-400">{spec.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {deletingId === spec.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Delete?</span>
                      <Button
                        size="sm"
                        variant="danger"
                        isLoading={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate(spec.id)}
                      >
                        Yes
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setDeletingId(null)}>No</Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(spec.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
}
