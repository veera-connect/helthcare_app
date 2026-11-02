import { apiClient } from "./api";
import type { Doctor, Specialization, PaginatedResponse } from "../types";

export async function listDoctors(
  page = 1,
  pageSize = 20,
  search?: string,
  specializationId?: string
): Promise<PaginatedResponse<Doctor>> {
  const res = await apiClient.get<PaginatedResponse<Doctor>>("/doctors/", {
    params: {
      page,
      page_size: pageSize,
      ...(search ? { search } : {}),
      ...(specializationId ? { specialization_id: specializationId } : {}),
    },
  });
  return res.data;
}

export async function getDoctor(id: string): Promise<Doctor> {
  const res = await apiClient.get<Doctor>(`/doctors/${id}`);
  return res.data;
}

export async function getMyDoctorProfile(): Promise<Doctor> {
  const res = await apiClient.get<Doctor>("/doctors/me");
  return res.data;
}

export async function listSpecializations(): Promise<Specialization[]> {
  const res = await apiClient.get<Specialization[]>("/doctors/specializations");
  return res.data;
}

export async function getDoctorAvailability(doctorId: string, date: string): Promise<string[]> {
  const res = await apiClient.get<string[]>(`/doctors/${doctorId}/availability`, {
    params: { date },
  });
  return res.data;
}

export async function getDoctorPatients(doctorId: string, page = 1, pageSize = 50) {
  const res = await apiClient.get(`/doctors/${doctorId}/patients`, {
    params: { page, page_size: pageSize },
  });
  return res.data;
}

export interface DoctorAppointment {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  reason: string | null;
  notes: string | null;
  patient_id: string;
  patient_first_name: string | null;
  patient_last_name: string | null;
}

export async function listDoctorAppointmentsRich(
  doctorId: string,
  page = 1,
  pageSize = 50,
  status?: string
): Promise<{ items: DoctorAppointment[]; total: number; page: number; page_size: number }> {
  const res = await apiClient.get(`/doctors/${doctorId}/appointments`, {
    params: { page, page_size: pageSize, ...(status ? { status } : {}) },
  });
  return res.data;
}
