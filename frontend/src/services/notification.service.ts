import api from "./api";

export const getNotifications = async (page = 1, pageSize = 50) => {
  const res = await api.get("/notifications", { params: { page, page_size: pageSize } });
  return res.data;
};

export const markRead = async (id: string) => {
  const res = await api.put(`/notifications/${id}/read`);
  return res.data;
};

export const markAllRead = async () => {
  const res = await api.put("/notifications/read-all");
  return res.data;
};
