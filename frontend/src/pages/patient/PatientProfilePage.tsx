import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { User, Phone, MapPin, Heart, AlertCircle, Save } from "lucide-react";
import { getMyProfile, updateMyProfile } from "../../services/patient.service";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input, Select } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";

const schema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  gender: z.string().optional(),
  blood_group: z.string().optional(),
  allergies: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function PatientProfilePage() {
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({ queryKey: ["patient-profile"], queryFn: getMyProfile });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: profile as any,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => updateMyProfile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patient-profile"] });
      toast.success("Profile updated successfully!");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 space-y-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Keep your personal information up to date</p>
      </div>

      <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary-600" /> Personal Information
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="First Name" error={errors.first_name?.message} {...register("first_name")} />
                <Input label="Last Name" error={errors.last_name?.message} {...register("last_name")} />
              </div>
              <Input label="Phone" placeholder="+91 9876543210" leftIcon={<Phone className="h-3.5 w-3.5" />} {...register("phone")} />
              <Input label="Address" placeholder="Your address" leftIcon={<MapPin className="h-3.5 w-3.5" />} {...register("address")} />
              <Select
                label="Gender"
                options={[
                  { value: "", label: "Select gender" },
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                  { value: "prefer_not_to_say", label: "Prefer not to say" },
                ]}
                {...register("gender")}
              />
            </div>
          </Card>

          {/* Medical Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" /> Medical Information
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <Select
                label="Blood Group"
                options={[
                  { value: "unknown", label: "Unknown" },
                  { value: "a_positive", label: "A+" },
                  { value: "a_negative", label: "A−" },
                  { value: "b_positive", label: "B+" },
                  { value: "b_negative", label: "B−" },
                  { value: "ab_positive", label: "AB+" },
                  { value: "ab_negative", label: "AB−" },
                  { value: "o_positive", label: "O+" },
                  { value: "o_negative", label: "O−" },
                ]}
                {...register("blood_group")}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Known Allergies
                </label>
                <textarea
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  rows={3}
                  placeholder="e.g., Penicillin, Peanuts..."
                  {...register("allergies")}
                />
              </div>
            </div>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" /> Emergency Contact
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <Input label="Contact Name" placeholder="Emergency contact name" {...register("emergency_contact_name")} />
              <Input label="Contact Phone" placeholder="+91 9876543210" leftIcon={<Phone className="h-3.5 w-3.5" />} {...register("emergency_contact_phone")} />
            </div>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button type="submit" isLoading={isPending} leftIcon={<Save className="h-4 w-4" />}>
            Save Changes
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
