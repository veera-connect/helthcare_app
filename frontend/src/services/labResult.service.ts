import api from "./api";

export const getPatientLabResults = async (patientId: string, page = 1, pageSize = 50) => {
  const res = await api.get(`/lab-results/patient/${patientId}`, { params: { page, page_size: pageSize } });
  return res.data;
};
