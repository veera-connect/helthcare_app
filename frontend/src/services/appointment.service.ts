import { apiClient } from "./api";
import type { Appointment, PaginatedResponse } from "../types";

export interface BookAppointmentData {
  doctor_id: string;
  patient_id?: string;
  scheduled_at: string;
  reason?: string;
}

export async function bookAppointment(data: BookAppointmentData): Promise<Appointment> {
  const res = await apiClient.post<Appointment>("/appointments/", data);
  return res.data;
}

export async function cancelAppointment(id: string, reason?: string): Promise<Appointment> {
  const res = await apiClient.post<Appointment>(`/appointments/${id}/cancel`, {
    cancellation_reason: reason,
  });
  return res.data;
}

export async function getAppointment(id: string): Promise<Appointment> {
  const res = await apiClient.get<Appointment>(`/appointments/${id}`);
  return res.data;
}

export async function listPatientAppointments(
  patientId: string,
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<Appointment>> {
  const res = await apiClient.get<PaginatedResponse<Appointment>>(
    `/appointments/patient/${patientId}`,
    { params: { page, page_size: pageSize } }
  );
  return res.data;
}

export async function listDoctorAppointments(
  doctorId: string,
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<Appointment>> {
  const res = await apiClient.get<PaginatedResponse<Appointment>>(
    `/appointments/doctor/${doctorId}`,
    { params: { page, page_size: pageSize } }
  );
  return res.data;
}
