import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export interface KioskUser {
  id: string;
  phone: string;
  role: string;
  preferredLanguage: string;
  consentAccepted: boolean;
  consentAcceptedAt?: string;
  name?: string;
}

const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 minutes
const BLOCKED_ROLES = ["admin", "staff", "dept_admin"];

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token") || localStorage.getItem("kiosk_token");
  });
  const [user, setUser] = useState<KioskUser | null>(() => {
    const u = localStorage.getItem("user") || localStorage.getItem("kiosk_user");
    return u ? JSON.parse(u) : null;
  });

  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("kiosk_token");
    localStorage.removeItem("kiosk_user");
    setToken(null);
    setUser(null);
    navigate("/");
  }, [navigate]);

  const login = useCallback(
    (newToken: string, newUser: KioskUser) => {
      if (BLOCKED_ROLES.includes(newUser.role)) {
        alert("Access denied. This kiosk is for citizens only.");
        return false;
      }
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.setItem("kiosk_token", newToken);
      localStorage.setItem("kiosk_user", JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      return true;
    },
    []
  );

  const updateUser = useCallback((partial: Partial<KioskUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      localStorage.setItem("user", JSON.stringify(updated));
      localStorage.setItem("kiosk_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Auto-logout on inactivity
  useEffect(() => {
    if (!token) return;
    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(logout, INACTIVITY_TIMEOUT);
    };

    const events = ["mousedown", "touchstart", "keydown", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [token, logout]);

  return { token, user, login, logout, updateUser, isAuthenticated: !!token };
}
