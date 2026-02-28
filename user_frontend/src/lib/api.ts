import axios, { type AxiosResponse, type AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token") || localStorage.getItem("kiosk_token");
  if (token) {
    const headers = (config.headers as any) || {};
    headers.Authorization = `Bearer ${token}`;
    config.headers = headers;
  }
  return config;
});

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("kiosk_token");
      localStorage.removeItem("kiosk_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const requestOtp = (mobile: string) => api.post("/auth/otp/request", { mobile });
export const verifyOtp = (mobile: string, otp: string) => api.post("/auth/otp/verify", { mobile, otp });

// Profile
export const getMe = () => api.get("/me");
export const patchMe = (data: { preferredLanguage?: string; consentAccepted?: boolean }) => api.patch("/me", data);

// Departments
export const getDepartments = () => api.get("/departments");

// Tickets
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

// Attachments
export const uploadAttachment = (ticketId: string, file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.post(`/tickets/${ticketId}/attachments`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const getAttachments = (ticketId: string) => api.get(`/tickets/${ticketId}/attachments`);
export const downloadAttachment = (attachmentId: string) =>
  api.get(`/attachments/${attachmentId}/download`, { responseType: "blob" });

// Notifications
export const getNotifications = () => api.get("/notifications");
export const markNotificationRead = (id: string) => api.patch(`/notifications/${id}/read`);

// Bills & Payments
export const getBillTypes = () => api.get("/bill-types");
export const getBills = () => api.get("/bills");
export const mockPayment = (data: { billId?: string; ticketId?: string; amount: number; purpose: string }) =>
  api.post("/payments/mock", data);
export const downloadReceipt = (paymentId: string) =>
  api.get(`/payments/${paymentId}/receipt.pdf`, { responseType: "blob" });

// Certificates
export const requestCertificate = (data: { type: string; formData: Record<string, string> }) =>
  api.post("/services/certificates", data);

// Offline queue
export const submitOfflineQueue = (kioskId: string, payload: unknown) =>
  api.post("/offline/queue", { kioskId, payload });
