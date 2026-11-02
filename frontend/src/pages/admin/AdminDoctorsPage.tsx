import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope, Search, CheckCircle, Plus, X,
  Eye, EyeOff, Phone, DollarSign, Award, FileText, User, Pencil,
} from "lucide-react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  adminListDoctors, approveDoctor, createDoctor, getSpecializations, updateDoctor,
} from "../../services/admin.service";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";

const addDoctorSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  license_number: z.string().min(1, "Required"),
  phone: z.string().optional(),
  bio: z.string().optional(),
  years_of_experience: z.coerce.number().min(0).optional(),
  consultation_fee: z.coerce.number().min(0).optional(),
});
type AddDoctorForm = z.infer<typeof addDoctorSchema>;

const editDoctorSchema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  phone: z.string().optional(),
  bio: z.string().optional(),
  years_of_experience: z.coerce.number().min(0).optional(),
  consultation_fee: z.coerce.number().min(0).optional(),
  is_available: z.boolean().optional(),
});
type EditDoctorForm = z.infer<typeof editDoctorSchema>;

export function AdminDoctorsPage() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const [editSpecs, setEditSpecs] = useState<string[]>([]);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-doctors", search],
    queryFn: () => adminListDoctors(1, 50, search || undefined),
  });

  const { data: specsData } = useQuery({
    queryKey: ["specializations"],
    queryFn: getSpecializations,
  });

  const approveMutation = useMutation({
    mutationFn: approveDoctor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-doctors"] });
      toast.success("Doctor approved");
    },
    onError: () => toast.error("Failed to approve doctor"),
  });

  const createMutation = useMutation({
    mutationFn: (formData: AddDoctorForm) =>
      createDoctor({ ...formData, specialization_ids: selectedSpecs }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-doctors"] });
      toast.success("Doctor created successfully");
      setShowModal(false);
      reset();
      setSelectedSpecs([]);
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? "Failed to create doctor"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditDoctorForm }) =>
      updateDoctor(id, { ...data, specialization_ids: editSpecs }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-doctors"] });
      toast.success("Doctor updated");
      setEditingDoctor(null);
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? "Failed to update doctor"),
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AddDoctorForm>({
    resolver: zodResolver(addDoctorSchema),
  });

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    formState: { errors: editErrors },
    reset: resetEdit,
  } = useForm<EditDoctorForm>({ resolver: zodResolver(editDoctorSchema) });

  const toggleSpec = (id: string) =>
    setSelectedSpecs(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );

  const toggleEditSpec = (id: string) =>
    setEditSpecs(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );

  const closeModal = () => {
    setShowModal(false);
    reset();
    setSelectedSpecs([]);
  };

  const openEdit = (doc: any) => {
    setEditingDoctor(doc);
    setEditSpecs(doc.specializations?.map((s: any) => s.id) ?? []);
    resetEdit({
      first_name: doc.first_name,
      last_name: doc.last_name,
      phone: doc.phone ?? "",
      bio: doc.bio ?? "",
      years_of_experience: doc.years_of_experience ?? undefined,
      consultation_fee: doc.consultation_fee ?? undefined,
      is_available: doc.is_available,
    });
  };

  const doctors = data?.items ?? [];
  const specs = specsData?.items ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Doctor Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {data?.total ?? 0} doctors registered ·{" "}
            <span className="font-medium text-healing-600 dark:text-healing-400">healthcare_doctors</span> database
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="gap-2 bg-healing-600 hover:bg-healing-700 text-white"
        >
          <Plus className="h-4 w-4" /> Add Doctor
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Search doctors by name..."
        leftIcon={<Search className="h-4 w-4" />}
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60">
                {["Doctor", "License", "Specializations", "Fee", "Experience", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-slate-300">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-slate-700/50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-healing-50 dark:bg-healing-900/20">
                        <Stethoscope className="h-7 w-7 text-healing-400" />
                      </div>
                      <p className="font-medium text-gray-500 dark:text-slate-400">No doctors found</p>
                      <p className="text-sm text-gray-400">Click "Add Doctor" to register the first doctor</p>
                    </div>
                  </td>
                </tr>
              ) : (
                doctors.map((doc: any) => (
                  <tr
                    key={doc.id}
                    className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50/50 dark:hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-healing-400 to-teal-600 text-sm font-semibold text-white">
                          {doc.first_name[0]}{doc.last_name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white">
                            Dr. {doc.first_name} {doc.last_name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-slate-400">
                      {doc.license_number}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {doc.specializations?.map((s: any) => (
                          <span
                            key={s.id}
                            className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          >
                            {s.name}
                          </span>
                        ))}
                        {(!doc.specializations || doc.specializations.length === 0) && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-300">
                      {doc.consultation_fee != null ? `$${doc.consultation_fee}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-300">
                      {doc.years_of_experience != null ? `${doc.years_of_experience} yrs` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={doc.is_available ? "success" : "warning"}>
                        {doc.is_available ? "Available" : "Unavailable"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1 text-blue-600 hover:text-blue-700"
                          onClick={() => openEdit(doc)}
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                        {!doc.is_available && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1 text-healing-600 hover:text-healing-700"
                            onClick={() => approveMutation.mutate(doc.id)}
                            isLoading={approveMutation.isPending}
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Approve
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Doctor Modal */}
      <AnimatePresence>
        {editingDoctor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && setEditingDoctor(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-800"
            >
              <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                    <Pencil className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Edit Dr. {editingDoctor.first_name} {editingDoctor.last_name}
                    </h2>
                    <p className="text-xs text-gray-400">License: {editingDoctor.license_number}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingDoctor(null)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={handleEditSubmit(d => updateMutation.mutate({ id: editingDoctor.id, data: d }))}
                className="space-y-6 p-6"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="First Name" {...registerEdit("first_name")} error={editErrors.first_name?.message} />
                  <Input label="Last Name" {...registerEdit("last_name")} error={editErrors.last_name?.message} />
                  <Input
                    label="Phone"
                    type="tel"
                    leftIcon={<Phone className="h-4 w-4" />}
                    {...registerEdit("phone")}
                  />
                  <Input
                    label="Years of Experience"
                    type="number"
                    min="0"
                    leftIcon={<Award className="h-4 w-4" />}
                    {...registerEdit("years_of_experience")}
                  />
                  <Input
                    label="Consultation Fee ($)"
                    type="number"
                    min="0"
                    step="0.01"
                    leftIcon={<DollarSign className="h-4 w-4" />}
                    {...registerEdit("consultation_fee")}
                  />
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="is_available"
                      {...registerEdit("is_available")}
                      className="h-4 w-4 rounded border-gray-300 text-healing-600"
                    />
                    <label htmlFor="is_available" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Available for appointments
                    </label>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">Bio</label>
                  <textarea
                    rows={3}
                    {...registerEdit("bio")}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-healing-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                {specs.length > 0 && (
                  <section>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                      Specializations
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {specs.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleEditSpec(s.id)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-all ${
                            editSpecs.includes(s.id)
                              ? "bg-healing-600 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {editSpecs.includes(s.id) && <CheckCircle className="h-3.5 w-3.5" />}
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                <div className="flex gap-3 border-t border-gray-100 pt-4 dark:border-slate-700">
                  <Button type="button" variant="ghost" onClick={() => setEditingDoctor(null)} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={updateMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Doctor Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-800"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-healing-100 dark:bg-healing-900/30">
                    <Stethoscope className="h-5 w-5 text-healing-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add New Doctor</h2>
                    <p className="text-xs text-gray-400">
                      Creates account in <span className="text-purple-500 font-medium">healthcare_admin</span> + profile in <span className="text-healing-600 font-medium">healthcare_doctors</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="space-y-6 p-6">
                {/* Account Details */}
                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    <User className="h-3.5 w-3.5 text-blue-500" /> Account Details
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      label="Email"
                      type="email"
                      placeholder="dr.name@hospital.com"
                      {...register("email")}
                      error={errors.email?.message}
                    />
                    <div className="relative">
                      <Input
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 8 characters"
                        {...register("password")}
                        error={errors.password?.message}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </section>

                {/* Personal Info */}
                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    <FileText className="h-3.5 w-3.5 text-purple-500" /> Personal Info
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input label="First Name" placeholder="James" {...register("first_name")} error={errors.first_name?.message} />
                    <Input label="Last Name" placeholder="Smith" {...register("last_name")} error={errors.last_name?.message} />
                    <Input label="License Number" placeholder="MD-001-2024" {...register("license_number")} error={errors.license_number?.message} />
                    <Input
                      label="Phone"
                      type="tel"
                      placeholder="+1 555 000 0000"
                      leftIcon={<Phone className="h-4 w-4" />}
                      {...register("phone")}
                    />
                  </div>
                </section>

                {/* Professional Details */}
                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    <Award className="h-3.5 w-3.5 text-amber-500" /> Professional Details
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      label="Years of Experience"
                      type="number"
                      min="0"
                      placeholder="10"
                      leftIcon={<Award className="h-4 w-4" />}
                      {...register("years_of_experience")}
                    />
                    <Input
                      label="Consultation Fee ($)"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="150.00"
                      leftIcon={<DollarSign className="h-4 w-4" />}
                      {...register("consultation_fee")}
                    />
                  </div>
                  <div className="mt-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Bio
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Doctor's biography and areas of expertise..."
                      {...register("bio")}
                      className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-healing-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500"
                    />
                  </div>
                </section>

                {/* Specializations */}
                {specs.length > 0 && (
                  <section>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                      Specializations
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {specs.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleSpec(s.id)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-all ${
                            selectedSpecs.includes(s.id)
                              ? "bg-healing-600 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                          }`}
                        >
                          {selectedSpecs.includes(s.id) && <CheckCircle className="h-3.5 w-3.5" />}
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Footer */}
                <div className="flex gap-3 border-t border-gray-100 pt-4 dark:border-slate-700">
                  <Button type="button" variant="ghost" onClick={closeModal} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={createMutation.isPending}
                    className="flex-1 bg-healing-600 hover:bg-healing-700 text-white"
                  >
                    Create Doctor Account
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
