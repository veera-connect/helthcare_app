import { apiClient } from "./api";
import type { Doctor, Specialization, PaginatedResponse } from "../types";

export async function listDoctors(
  specializationId?: string,
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<Doctor>> {
  const res = await apiClient.get<PaginatedResponse<Doctor>>("/doctors/", {
    params: {
      page,
      page_size: pageSize,
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
