import api from "./api";

export const getPatientPrescriptions = async (patientId: string, page = 1, pageSize = 50) => {
  const res = await api.get(`/prescriptions/patient/${patientId}`, { params: { page, page_size: pageSize } });
  return res.data;
};

export const getDoctorPrescriptions = async (doctorId: string, page = 1, pageSize = 50) => {
  const res = await api.get(`/prescriptions/doctor/${doctorId}`, { params: { page, page_size: pageSize } });
  return res.data;
};
