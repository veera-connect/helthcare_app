import api from "./api";

export const getPatientInvoices = async (patientId: string, page = 1, pageSize = 50) => {
  const res = await api.get(`/invoices/patient/${patientId}`, { params: { page, page_size: pageSize } });
  return res.data;
};
