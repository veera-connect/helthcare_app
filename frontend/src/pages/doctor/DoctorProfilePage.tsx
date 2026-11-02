import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Stethoscope, Phone, DollarSign, Clock, BookOpen } from "lucide-react";
import { getMyDoctorProfile } from "../../services/doctor.service";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { SkeletonCard } from "../../components/ui/Skeleton";

export function DoctorProfilePage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["doctor-profile"],
    queryFn: getMyDoctorProfile,
  });

  if (isLoading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Your doctor profile details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/30">
            <Stethoscope className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              Dr. {profile?.first_name} {profile?.last_name}
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              License: {profile?.license_number}
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-slate-700/50 p-3">
            <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Phone</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{profile?.phone || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-slate-700/50 p-3">
            <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Consultation Fee</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {profile?.consultation_fee ? `₹${profile.consultation_fee}` : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-slate-700/50 p-3">
            <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Experience</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {profile?.years_of_experience ? `${profile.years_of_experience} years` : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-slate-700/50 p-3">
            <BookOpen className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Status</p>
              <Badge variant={profile?.is_available ? "success" : "danger"} dot>
                {profile?.is_available ? "Available" : "Unavailable"}
              </Badge>
            </div>
          </div>
        </div>
        {profile?.bio && (
          <div className="mt-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 p-3">
            <p className="text-xs text-gray-400 mb-1">Bio</p>
            <p className="text-sm text-gray-700 dark:text-slate-300">{profile.bio}</p>
          </div>
        )}
      </Card>

      {(profile?.specializations?.length ?? 0) > 0 && (
        <Card>
          <CardHeader><CardTitle>Specializations</CardTitle></CardHeader>
          <div className="flex flex-wrap gap-2">
            {profile!.specializations.map((s: any) => (
              <Badge key={s.id} variant="default">{s.name}</Badge>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
}
