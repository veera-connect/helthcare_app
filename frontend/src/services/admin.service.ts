import api from "./api";

export const getAdminStats = async () => {
  const res = await api.get("/admin/stats");
  return res.data;
};

export const adminListPatients = async (page = 1, pageSize = 50, search?: string) => {
  const res = await api.get("/admin/patients", { params: { page, page_size: pageSize, search } });
  return res.data;
};

export const adminListDoctors = async (page = 1, pageSize = 50, search?: string) => {
  const res = await api.get("/admin/doctors", { params: { page, page_size: pageSize, search } });
  return res.data;
};

export const approveDoctor = async (doctorId: string) => {
  const res = await api.post(`/admin/doctors/${doctorId}/approve`);
  return res.data;
};

export const getAuditLogs = async (page = 1, pageSize = 100) => {
  const res = await api.get("/admin/audit-logs", { params: { page, page_size: pageSize } });
  return res.data;
};

// ── Hospital Services ─────────────────────────────────────────────────────────

export interface HospitalServiceData {
  id: string;
  name: string;
  description: string | null;
  icon_name: string;
  color_gradient: string;
  bg_class: string;
  availability: string;
  is_active: boolean;
  patient_count: number;
  doctor_count: number;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface ServiceCreatePayload {
  name: string;
  description?: string;
  icon_name: string;
  color_gradient: string;
  bg_class: string;
  availability: string;
  patient_count?: number;
  doctor_count?: number;
  sort_order?: number;
}

export const listServices = async (): Promise<{ items: HospitalServiceData[]; total: number }> => {
  const res = await api.get("/admin/services");
  return res.data;
};

export const createService = async (payload: ServiceCreatePayload): Promise<HospitalServiceData> => {
  const res = await api.post("/admin/services", payload);
  return res.data;
};

export const updateService = async (id: string, payload: Partial<ServiceCreatePayload & { is_active: boolean }>): Promise<HospitalServiceData> => {
  const res = await api.put(`/admin/services/${id}`, payload);
  return res.data;
};

export const toggleService = async (id: string): Promise<{ id: string; is_active: boolean }> => {
  const res = await api.patch(`/admin/services/${id}/toggle`);
  return res.data;
};

export const deleteService = async (id: string): Promise<void> => {
  await api.delete(`/admin/services/${id}`);
};

// ── System Settings ───────────────────────────────────────────────────────────

export interface SystemSettingData {
  id: string;
  key_name: string;
  value: string;
  description: string | null;
  updated_at: string | null;
}

export const getSettings = async (): Promise<{ items: SystemSettingData[] }> => {
  const res = await api.get("/admin/settings");
  return res.data;
};

export const updateSetting = async (keyName: string, value: string): Promise<{ key_name: string; value: string }> => {
  const res = await api.put(`/admin/settings/${keyName}`, { value });
  return res.data;
};

// ── Doctor Update ─────────────────────────────────────────────────────────────

export interface DoctorUpdatePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  years_of_experience?: number;
  consultation_fee?: number;
  is_available?: boolean;
  specialization_ids?: string[];
}

export const updateDoctor = async (doctorId: string, payload: DoctorUpdatePayload) => {
  const res = await api.patch(`/admin/doctors/${doctorId}`, payload);
  return res.data;
};

// ── Admin Appointments ────────────────────────────────────────────────────────

export interface AdminAppointment {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  reason: string | null;
  notes: string | null;
  patient_id: string;
  patient_first_name: string | null;
  patient_last_name: string | null;
  doctor_id: string;
  doctor_first_name: string | null;
  doctor_last_name: string | null;
}

export const adminListAppointments = async (
  page = 1,
  pageSize = 50,
  status?: string
): Promise<{ items: AdminAppointment[]; total: number; page: number; page_size: number }> => {
  const res = await api.get("/admin/appointments", {
    params: { page, page_size: pageSize, ...(status ? { status } : {}) },
  });
  return res.data;
};

// ── Specializations ───────────────────────────────────────────────────────────

export const getSpecializations = async (): Promise<{ items: { id: string; name: string; description: string | null }[] }> => {
  const res = await api.get("/admin/specializations");
  return res.data;
};

export const createSpecialization = async (payload: { name: string; description?: string }) => {
  const res = await api.post("/admin/specializations", payload);
  return res.data;
};

export const deleteSpecialization = async (id: string): Promise<void> => {
  await api.delete(`/admin/specializations/${id}`);
};

// ── Users ─────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string | null;
}

export const adminListUsers = async (
  page = 1,
  pageSize = 50,
  search?: string
): Promise<{ items: AdminUser[]; total: number; page: number; page_size: number }> => {
  const res = await api.get("/admin/users", {
    params: { page, page_size: pageSize, ...(search ? { search } : {}) },
  });
  return res.data;
};

// ── Doctor Creation ───────────────────────────────────────────────────────────

export interface DoctorCreatePayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  license_number: string;
  phone?: string;
  bio?: string;
  years_of_experience?: number;
  consultation_fee?: number;
  specialization_ids?: string[];
}

export const createDoctor = async (payload: DoctorCreatePayload) => {
  const res = await api.post("/admin/doctors", payload);
  return res.data;
};
