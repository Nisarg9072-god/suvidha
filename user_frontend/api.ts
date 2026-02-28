import axios, { type AxiosRequestConfig, type AxiosResponse, type AxiosError, type RawAxiosRequestHeaders } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = localStorage.getItem("kiosk_token");
  if (token) {
    const headers: RawAxiosRequestHeaders = (config.headers as RawAxiosRequestHeaders) || {};
    headers.Authorization = `Bearer ${token}`;
    config.headers = headers;
  }
  return config;
});

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("kiosk_token");
      localStorage.removeItem("kiosk_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

export const requestOtp = (mobile: string) => api.post("/auth/otp/request", { mobile });
export const verifyOtp = (mobile: string, otp: string) => api.post("/auth/otp/verify", { mobile, otp });

export const getMe = () => api.get("/me");
export const patchMe = (data: { preferredLanguage?: string; consentAccepted?: boolean }) => api.patch("/me", data);

export const getDepartments = () => api.get("/departments");

export const createTicket = (data: {
  title: string;
  description: string;
  departmentCode?: string;
  serviceType?: string;
  priority?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
}) => api.post("/tickets", data);
export const getTickets = () => api.get("/tickets");
export const getTicketDetail = (id: string) => api.get(`/tickets/${id}`);

export const uploadAttachment = (ticketId: string, file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.post(`/tickets/${ticketId}/attachments`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const getAttachments = (ticketId: string) => api.get(`/tickets/${ticketId}/attachments`);
export const downloadAttachment = (paymentId: string) =>
  api.get(`/payments/${paymentId}/receipt.pdf`, { responseType: "blob" });

export const getNotifications = () => api.get("/notifications");
export const markNotificationRead = (id: string) => api.patch(`/notifications/${id}/read`);

export const getBillTypes = () => api.get("/bill-types");
export const getBills = () => api.get("/bills");
export const mockPayment = (data: { billId?: string; ticketId?: string; amount: number; purpose: string }) =>
  api.post("/payments/mock", data);

export const requestCertificate = (data: { type: string; formData: Record<string, string> }) =>
  api.post("/services/certificates", data);

export const submitOfflineQueue = (kioskId: string, payload: unknown) =>
  api.post("/offline/queue", { kioskId, payload });
