import { apiClient } from "./api";
import type { Patient, PaginatedResponse } from "../types";

export async function getMyProfile(): Promise<Patient> {
  const res = await apiClient.get<Patient>("/patients/me");
  return res.data;
}

export async function updateMyProfile(data: Partial<Patient>): Promise<Patient> {
  const res = await apiClient.put<Patient>("/patients/me", data);
  return res.data;
}

export async function getPatient(id: string): Promise<Patient> {
  const res = await apiClient.get<Patient>(`/patients/${id}`);
  return res.data;
}

export async function listPatients(page = 1, pageSize = 20): Promise<PaginatedResponse<Patient>> {
  const res = await apiClient.get<PaginatedResponse<Patient>>("/patients/", {
    params: { page, page_size: pageSize },
  });
  return res.data;
}
