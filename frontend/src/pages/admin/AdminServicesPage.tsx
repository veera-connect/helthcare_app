import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Heart, Brain, Bone, Baby, Eye, Microscope, Syringe, HeartPulse,
  Plus, Edit2, Trash2, Search, Users, CheckCircle, XCircle,
  FlaskConical, Stethoscope, Zap, RefreshCw,
} from "lucide-react";
import {
  listServices, createService, updateService, toggleService, deleteService,
  type HospitalServiceData, type ServiceCreatePayload,
} from "../../services/admin.service";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { SkeletonCard } from "../../components/ui/Skeleton";

const ICONS: Record<string, React.ElementType> = {
  Heart, Brain, Bone, Baby, Eye, Microscope, Syringe, HeartPulse,
  FlaskConical, Stethoscope, Zap,
};

const GRADIENTS = [
  { label: "Blue", value: "from-primary-400 to-primary-600", bg: "bg-primary-50 dark:bg-primary-950/30" },
  { label: "Red/Rose", value: "from-red-400 to-rose-600", bg: "bg-red-50 dark:bg-red-950/30" },
  { label: "Violet", value: "from-violet-400 to-purple-600", bg: "bg-violet-50 dark:bg-violet-950/30" },
  { label: "Orange", value: "from-orange-400 to-amber-600", bg: "bg-orange-50 dark:bg-orange-950/30" },
  { label: "Pink", value: "from-pink-400 to-fuchsia-600", bg: "bg-pink-50 dark:bg-pink-950/30" },
  { label: "Cyan", value: "from-cyan-400 to-teal-600", bg: "bg-cyan-50 dark:bg-cyan-950/30" },
  { label: "Green", value: "from-emerald-400 to-green-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  { label: "Yellow", value: "from-yellow-400 to-orange-500", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
  { label: "Indigo", value: "from-indigo-400 to-blue-600", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
];

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const emptyForm: ServiceCreatePayload = {
  name: "",
  description: "",
  icon_name: "Heart",
  color_gradient: "from-primary-400 to-primary-600",
  bg_class: "bg-primary-50 dark:bg-primary-950/30",
  availability: "Mon–Fri",
  patient_count: 0,
  doctor_count: 0,
};

export function AdminServicesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<HospitalServiceData | null>(null);
  const [form, setForm] = useState<ServiceCreatePayload>(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: listServices,
  });

  const createMut = useMutation({
    mutationFn: createService,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-services"] }); toast.success("Service created"); setShowModal(false); },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Failed to create service"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ServiceCreatePayload> }) => updateService(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-services"] }); toast.success("Service updated"); setShowModal(false); },
    onError: () => toast.error("Failed to update service"),
  });

  const toggleMut = useMutation({
    mutationFn: toggleService,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["admin-services"] });
      toast.success(`Service ${data.is_active ? "enabled" : "disabled"}`);
    },
    onError: () => toast.error("Failed to toggle service"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteService,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-services"] }); toast.success("Service deleted"); },
    onError: () => toast.error("Failed to delete service"),
  });

  const services = data?.items ?? [];
  const filtered = services.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) ||
           (s.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPatients = services.reduce((a, s) => a + s.patient_count, 0);
  const totalDoctors = services.reduce((a, s) => a + s.doctor_count, 0);
  const activeCount = services.filter((s) => s.is_active).length;

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (s: HospitalServiceData) => {
    setEditTarget(s);
    setForm({
      name: s.name,
      description: s.description ?? "",
      icon_name: s.icon_name,
      color_gradient: s.color_gradient,
      bg_class: s.bg_class,
      availability: s.availability,
      patient_count: s.patient_count,
      doctor_count: s.doctor_count,
    });
    setShowModal(true);
  };

  const save = () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (editTarget) {
      updateMut.mutate({ id: editTarget.id, payload: form });
    } else {
      createMut.mutate(form);
    }
  };

  const isSaving = createMut.isPending || updateMut.isPending;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hospital Services</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Manage departments and medical services — saved to the database</p>
        </div>
        <Button onClick={openAdd} leftIcon={<Plus className="h-4 w-4" />}>Add Service</Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Patients", value: totalPatients.toLocaleString(), icon: Users, color: "from-primary-500 to-primary-700" },
          { label: "Total Doctors", value: totalDoctors, icon: Stethoscope, color: "from-healing-500 to-healing-700" },
          { label: "Active Services", value: `${activeCount} / ${services.length}`, icon: CheckCircle, color: "from-violet-500 to-violet-700" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`rounded-2xl bg-gradient-to-br ${color} p-5 text-white shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold opacity-80 uppercase tracking-wide">{label}</p>
                <p className="text-3xl font-extrabold mt-1">{value}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <Input
        placeholder="Search services or departments..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
      />

      {/* Service Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 py-16 text-center">
          <Stethoscope className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-slate-600" />
          <p className="font-medium text-gray-500 dark:text-slate-400">No services found</p>
          <Button className="mt-4" size="sm" onClick={openAdd} leftIcon={<Plus className="h-4 w-4" />}>Add First Service</Button>
        </div>
      ) : (
        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          initial="hidden" animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filtered.map((svc) => {
            const Icon = ICONS[svc.icon_name] ?? Heart;
            return (
              <motion.div key={svc.id} variants={fade}
                className={`group relative overflow-hidden rounded-2xl ${svc.bg_class} border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-all hover:shadow-md`}
              >
                <div className={`absolute top-4 right-4 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${svc.is_active ? "bg-healing-100 text-healing-700 dark:bg-healing-900/30 dark:text-healing-400" : "bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400"}`}>
                  {svc.is_active ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {svc.is_active ? "Active" : "Inactive"}
                </div>

                <div className="p-6">
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${svc.color_gradient} shadow-md`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">{svc.name}</h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400 leading-relaxed line-clamp-2">{svc.description}</p>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "Patients", value: svc.patient_count.toLocaleString() },
                      { label: "Doctors", value: svc.doctor_count },
                      { label: "Hours", value: svc.availability },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-xl bg-white/60 dark:bg-slate-800/60 px-2 py-2">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{value}</p>
                        <p className="text-[10px] text-gray-400 dark:text-slate-500">{label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => openEdit(svc)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => toggleMut.mutate(svc.id)}
                      disabled={toggleMut.isPending}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-colors disabled:opacity-60 ${
                        svc.is_active
                          ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100"
                          : "bg-healing-50 dark:bg-healing-950/30 text-healing-700 dark:text-healing-400 hover:bg-healing-100"
                      }`}
                    >
                      {toggleMut.isPending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : svc.is_active ? <><XCircle className="h-3.5 w-3.5" /> Disable</> : <><CheckCircle className="h-3.5 w-3.5" /> Enable</>}
                    </button>
                    <button
                      onClick={() => deleteMut.mutate(svc.id)}
                      disabled={deleteMut.isPending}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0 disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">
                {editTarget ? "Edit Service" : "Add New Service"}
              </h2>
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Service Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Dermatology"
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                  />
                </div>
                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    value={form.description ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={2}
                    placeholder="Brief description of the service..."
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white resize-none"
                  />
                </div>
                {/* Availability + Counts */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Availability</label>
                    <input
                      value={form.availability}
                      onChange={(e) => setForm((f) => ({ ...f, availability: e.target.value }))}
                      placeholder="Mon–Fri"
                      className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Patients</label>
                    <input
                      type="number" min={0}
                      value={form.patient_count ?? 0}
                      onChange={(e) => setForm((f) => ({ ...f, patient_count: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Doctors</label>
                    <input
                      type="number" min={0}
                      value={form.doctor_count ?? 0}
                      onChange={(e) => setForm((f) => ({ ...f, doctor_count: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                    />
                  </div>
                </div>
                {/* Icon picker */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(ICONS).map((iconName) => {
                      const Icon = ICONS[iconName];
                      return (
                        <button key={iconName} type="button"
                          onClick={() => setForm((f) => ({ ...f, icon_name: iconName }))}
                          className={`h-9 w-9 rounded-xl flex items-center justify-center transition-colors ${
                            form.icon_name === iconName
                              ? "bg-primary-600 text-white shadow-md"
                              : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-primary-50 hover:text-primary-600"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Color picker */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2">Color Theme</label>
                  <div className="flex flex-wrap gap-2">
                    {GRADIENTS.map(({ label, value, bg }) => (
                      <button key={value} type="button"
                        onClick={() => setForm((f) => ({ ...f, color_gradient: value, bg_class: bg }))}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium border transition-all ${
                          form.color_gradient === value
                            ? "border-gray-400 dark:border-slate-400 shadow-sm ring-2 ring-primary-300"
                            : "border-gray-200 dark:border-slate-600 hover:border-gray-300"
                        }`}
                      >
                        <span className={`h-3 w-3 rounded-full bg-gradient-to-br ${value} flex-shrink-0`} />
                        <span className="text-gray-700 dark:text-slate-300">{label}</span>
                      </button>
                    ))}
                  </div>
                  {/* Preview */}
                  <div className={`mt-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${form.color_gradient} shadow-md`}>
                    {(() => { const Icon = ICONS[form.icon_name] ?? Heart; return <Icon className="h-5 w-5 text-white" />; })()}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button className="flex-1" onClick={save} isLoading={isSaving}>
                  {editTarget ? "Update Service" : "Add Service"}
                </Button>
                <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
