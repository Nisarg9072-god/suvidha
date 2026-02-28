import axios from 'axios';
import { toast } from 'sonner';

const env: any = (import.meta as any)?.env || {};
const IS_PROD = !!env.PROD;
export const API_URL = env.VITE_API_URL || (IS_PROD ? '' : 'http://localhost:5000');
export const ADMIN_API_URL = env.VITE_ADMIN_API_URL || (IS_PROD ? '' : 'http://localhost:5001');
if (IS_PROD && !env.VITE_API_URL) {
  throw new Error('VITE_API_URL is required in production');
}
if (IS_PROD && !env.VITE_ADMIN_API_URL) {
  throw new Error('VITE_ADMIN_API_URL is required in production');
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const adminApi = axios.create({
  baseURL: ADMIN_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function attachAuth(config: any) {
  const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

api.interceptors.request.use(attachAuth, (error) => Promise.reject(error));
adminApi.interceptors.request.use(attachAuth, (error) => Promise.reject(error));

function handleResponseError(error: any) {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/login';
    return Promise.reject(error);
  }
  if (error.response?.status === 403) {
    try {
      toast.error('You do not have permission');
    } catch (_) {}
    const p = typeof window !== 'undefined' ? window.location.pathname : '';
    if (p && p !== '/dashboard' && p !== '/unauthorized') {
      window.location.href = '/dashboard';
    }
    return Promise.reject(error);
  }
  return Promise.reject(error);
}

api.interceptors.response.use((response) => response, handleResponseError);
adminApi.interceptors.response.use((response) => response, handleResponseError);
