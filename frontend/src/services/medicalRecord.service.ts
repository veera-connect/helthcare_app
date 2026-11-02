import api from "./api";

export const listPatientRecords = async (patientId: string, page = 1, pageSize = 20) => {
  const res = await api.get(`/medical-records/patient/${patientId}`, { params: { page, page_size: pageSize } });
  return res.data;
};

export const getMedicalRecord = async (id: string) => {
  const res = await api.get(`/medical-records/${id}`);
  return res.data;
};
