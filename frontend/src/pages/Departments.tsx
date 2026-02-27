import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { KioskHeader, LargeTileButton } from "@/components/kiosk";
import { Zap, Flame, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";
import { useLanguage } from "@/contexts/LanguageContext";
import { getNotifications } from "@/lib/api";

const Departments = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { isOnline } = useOfflineQueue();
  const { language, setLanguage, t } = useLanguage();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await getNotifications();
        const notifications = res.data.notifications || [];
        const count = notifications.filter((n: any) => !n.is_read).length;
        setUnreadCount(count);
      } catch (err) {
        console.error("Failed to fetch unread count:", err);
      }
    };
    fetchUnreadCount();
  }, []);

  const departments = [
    { code: "ELEC", titleKey: "electricity", descKey: "electricityDesc", icon: Zap },
    { code: "GAS", titleKey: "gas", descKey: "gasDesc", icon: Flame },
    { code: "MUNI", titleKey: "municipal", descKey: "municipalDesc", icon: Building2 },
  ];

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as "en" | "hi" | "gu");
    updateUser({ preferredLanguage: lang });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <KioskHeader
        title="SUVIDHA"
        subtitle={`${t("welcome")}, ${user?.name || t("citizen")}`}
        notificationCount={unreadCount}
        language={language}
        isOnline={isOnline}
        onLanguageChange={handleLanguageChange}
        onLogout={logout}
      />

      <main className="flex-1 px-8 py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h2 className="text-kiosk-3xl font-bold text-foreground">{t("selectDepartment")}</h2>
            <p className="text-kiosk-lg text-muted-foreground mt-1">{t("chooseDepartment")}</p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {departments.map((dept) => (
              <LargeTileButton
                key={dept.code}
                title={t(dept.titleKey)}
                description={t(dept.descKey)}
                icon={dept.icon}
                onClick={() => navigate(`/dept/${dept.code}`)}
              />
            ))}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <button
              onClick={() => navigate("/tickets")}
              className="flex items-center gap-3 p-5 bg-card border-2 border-border rounded-xl hover:border-accent transition-colors text-left focus:outline-none focus:ring-4 focus:ring-accent/20"
            >
              <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center">
                <span className="text-kiosk-lg">📋</span>
              </div>
              <div>
                <p className="text-kiosk-base font-semibold text-foreground">{t("myRequests")}</p>
                <p className="text-kiosk-sm text-muted-foreground">{t("viewAllTickets")}</p>
              </div>
            </button>
            <button
              onClick={() => navigate("/bills")}
              className="flex items-center gap-3 p-5 bg-card border-2 border-border rounded-xl hover:border-accent transition-colors text-left focus:outline-none focus:ring-4 focus:ring-accent/20"
            >
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="text-kiosk-lg">💳</span>
              </div>
              <div>
                <p className="text-kiosk-base font-semibold text-foreground">{t("billsPayments")}</p>
                <p className="text-kiosk-sm text-muted-foreground">{t("payBillsReceipts")}</p>
              </div>
            </button>
            <button
              onClick={() => navigate("/help")}
              className="flex items-center gap-3 p-5 bg-card border-2 border-border rounded-xl hover:border-accent transition-colors text-left focus:outline-none focus:ring-4 focus:ring-accent/20"
            >
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <span className="text-kiosk-lg">❓</span>
              </div>
              <div>
                <p className="text-kiosk-base font-semibold text-foreground">{t("help")}</p>
                <p className="text-kiosk-sm text-muted-foreground">{t("kioskInstructions")}</p>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Departments;
