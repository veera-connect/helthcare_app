import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Search, ChevronRight, ChevronLeft, Calendar, Clock, CheckCircle, Stethoscope } from "lucide-react";
import { listDoctors, getDoctorAvailability } from "../../services/doctor.service";
import { bookAppointment } from "../../services/appointment.service";
import { getMyProfile } from "../../services/patient.service";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { Skeleton } from "../../components/ui/Skeleton";
import { format, addDays, startOfDay } from "date-fns";

const steps = ["Select Doctor", "Choose Date", "Choose Time", "Confirm"];

export function BookAppointmentPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const { data: profile } = useQuery({ queryKey: ["patient-profile"], queryFn: getMyProfile });

  const { data: doctorsData, isLoading: doctorsLoading } = useQuery({
    queryKey: ["doctors", search],
    queryFn: () => listDoctors(1, 20, search || undefined),
  });

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ["availability", selectedDoctor?.id, selectedDate],
    queryFn: () => getDoctorAvailability(selectedDoctor!.id, format(selectedDate!, "yyyy-MM-dd")),
    enabled: !!selectedDoctor?.id && !!selectedDate,
  });

  const { mutate: book, isPending } = useMutation({
    mutationFn: bookAppointment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patient-appointments"] });
      toast.success("Appointment booked successfully!");
      navigate("/patient/appointments");
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Failed to book appointment"),
  });

  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(new Date()), i + 1));

  const handleConfirm = () => {
    if (!profile?.id || !selectedDoctor?.id || !selectedDate || !selectedTime) return;
    const [hour, minute] = selectedTime.split(":").map(Number);
    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(hour, minute, 0, 0);
    book({
      patient_id: profile.id,
      doctor_id: selectedDoctor.id,
      scheduled_at: scheduledAt.toISOString(),
      reason: reason || undefined,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Book Appointment</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Schedule a consultation with a healthcare professional
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center">
            <div className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                i < step ? "bg-healing-500 text-white" :
                i === step ? "bg-primary-600 text-white" :
                "bg-gray-200 text-gray-500 dark:bg-slate-700 dark:text-slate-400"
              }`}>
                {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`hidden sm:block text-xs font-medium ${i === step ? "text-primary-700 dark:text-primary-400" : "text-gray-400"}`}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 mx-2 h-0.5 rounded ${i < step ? "bg-healing-400" : "bg-gray-200 dark:bg-slate-700"}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: Select Doctor */}
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card>
              <Input
                placeholder="Search doctors by name or specialization..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="mb-4"
              />
              {doctorsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-14 w-14 rounded-2xl flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (doctorsData?.items ?? []).length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-400">No doctors found</div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-slate-700">
                  {(doctorsData?.items ?? []).map((doc: any) => (
                    <li
                      key={doc.id}
                      onClick={() => { setSelectedDoctor(doc); setStep(1); }}
                      className="flex cursor-pointer items-center gap-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl px-2 transition-colors"
                    >
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/30">
                        <Stethoscope className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          Dr. {doc.first_name} {doc.last_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                          {doc.specializations?.map((s: any) => s.name).join(", ") || "General Practice"}
                        </p>
                        {doc.consultation_fee && (
                          <p className="text-xs font-medium text-healing-700 dark:text-healing-400 mt-0.5">
                            ₹{doc.consultation_fee} • {doc.years_of_experience ?? 0}y exp
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </motion.div>
        )}

        {/* Step 1: Choose Date */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card>
              <div className="mb-4 flex items-center gap-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 p-3">
                <Stethoscope className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Dr. {selectedDoctor?.first_name} {selectedDoctor?.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{selectedDoctor?.specializations?.map((s: any) => s.name).join(", ")}</p>
                </div>
              </div>
              <p className="mb-3 text-sm font-medium text-gray-700 dark:text-slate-300">Select a date:</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
                {next7Days.map((day) => {
                  const isSelected = selectedDate && format(selectedDate, "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`flex flex-col items-center rounded-xl border-2 p-2.5 text-xs font-medium transition-all ${
                        isSelected
                          ? "border-primary-600 bg-primary-600 text-white"
                          : "border-gray-200 hover:border-primary-300 dark:border-slate-700 dark:hover:border-primary-600 text-gray-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="text-[10px] uppercase">{format(day, "EEE")}</span>
                      <span className="mt-0.5 text-base font-bold">{format(day, "d")}</span>
                      <span className="text-[10px]">{format(day, "MMM")}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
            <div className="flex gap-3 mt-4">
              <Button variant="secondary" onClick={() => setStep(0)} leftIcon={<ChevronLeft className="h-4 w-4" />}>Back</Button>
              <Button disabled={!selectedDate} onClick={() => setStep(2)} rightIcon={<ChevronRight className="h-4 w-4" />}>Continue</Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Choose Time */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card>
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-300">
                <Calendar className="h-4 w-4 text-primary-600" />
                {selectedDate && format(selectedDate, "EEEE, MMMM d")}
              </div>
              {slotsLoading ? (
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-9 rounded-xl" />)}
                </div>
              ) : !slots || (slots as string[]).length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  <Clock className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  No available slots for this date
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {(slots as string[]).map((slot: string) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`rounded-xl border-2 py-2 text-xs font-medium transition-all ${
                        selectedTime === slot
                          ? "border-primary-600 bg-primary-600 text-white"
                          : "border-gray-200 hover:border-primary-300 dark:border-slate-700 text-gray-700 dark:text-slate-300"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Input
                  label="Reason for visit (optional)"
                  placeholder="Describe your symptoms or reason..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </Card>
            <div className="flex gap-3 mt-4">
              <Button variant="secondary" onClick={() => setStep(1)} leftIcon={<ChevronLeft className="h-4 w-4" />}>Back</Button>
              <Button disabled={!selectedTime} onClick={() => setStep(3)} rightIcon={<ChevronRight className="h-4 w-4" />}>Continue</Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card>
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-healing-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Confirm Your Appointment</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Doctor", value: `Dr. ${selectedDoctor?.first_name} ${selectedDoctor?.last_name}` },
                  { label: "Specialization", value: selectedDoctor?.specializations?.map((s: any) => s.name).join(", ") || "—" },
                  { label: "Date", value: selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "—" },
                  { label: "Time", value: selectedTime ?? "—" },
                  { label: "Reason", value: reason || "General consultation" },
                  { label: "Fee", value: selectedDoctor?.consultation_fee ? `₹${selectedDoctor.consultation_fee}` : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between border-b border-gray-100 dark:border-slate-700 pb-2 last:border-0">
                    <span className="text-sm text-gray-500 dark:text-slate-400">{label}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
                  </div>
                ))}
              </div>
            </Card>
            <div className="flex gap-3 mt-4">
              <Button variant="secondary" onClick={() => setStep(2)} leftIcon={<ChevronLeft className="h-4 w-4" />}>Back</Button>
              <Button onClick={handleConfirm} isLoading={isPending} leftIcon={<CheckCircle className="h-4 w-4" />}>
                Confirm Booking
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
