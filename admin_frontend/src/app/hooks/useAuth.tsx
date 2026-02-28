import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, adminApi } from '../lib/axios';

type Role = 'admin' | 'dept_admin' | 'staff';

interface BackendUser {
  id: number;
  role: Role;
  department_id: number | null;
  permissions?: string[] | null;
}

interface AuthContextType {
  user: BackendUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  requestOtp: (phone: string) => Promise<void>;
  login: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token') || localStorage.getItem('admin_token');
  });
  const [user, setUser] = useState<BackendUser | null>(() => {
    const u = localStorage.getItem('user') || localStorage.getItem('admin_user');
    return u ? (JSON.parse(u) as BackendUser) : null;
  });
  const [loading, setLoading] = useState<boolean>(() => {
    const t = localStorage.getItem('token') || localStorage.getItem('admin_token');
    return !!t;
  });

  useEffect(() => {
    const t = localStorage.getItem('token') || localStorage.getItem('admin_token');
    setToken(t);
    if (!t) {
      setUser(null);
      setLoading(false);
      return;
    }
    const loadMe = async () => {
      setLoading(true);
      try {
        const res = await adminApi.get('/auth/me');
        const u = res.data?.user as BackendUser;
        if (u && u.role) {
          localStorage.setItem('user', JSON.stringify(u));
          localStorage.setItem('admin_user', JSON.stringify(u));
          setUser(u);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          setToken(null);
          setUser(null);
        }
      } catch (_) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadMe();
  }, []);

  const requestOtp = async (phone: string) => {
    await api.post('/auth/request-otp', { phone });
  };

  const login = async (phone: string, otp: string) => {
    const res = await api.post('/auth/verify-otp', { phone, otp });
    const token: string | undefined = res?.data?.token;
    if (!token) {
      const msg = res?.data?.error?.message || 'Authentication failed';
      throw new Error(String(msg));
    }
    localStorage.setItem('token', token);
    localStorage.setItem('admin_token', token);
    setToken(token);
    const me = await adminApi.get('/auth/me');
    const u = me.data?.user as BackendUser;
    if (!u || !u.role) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      setToken(null);
      throw new Error('Invalid user payload');
    }
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('admin_user', JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!token,
        loading,
        requestOtp,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
