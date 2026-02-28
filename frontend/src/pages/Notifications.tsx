import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { KioskHeader } from "@/components/kiosk";
import { useAuth } from "@/hooks/useAuth";
import { Bell, CheckCircle, CreditCard, AlertCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import api, { getNotifications, markNotificationRead } from "@/lib/api";

const mockNotifications = [
  { id: "mock-1", title: "Ticket Updated (Demo)", body: "Your outage report TKT-00012345 has been assigned to a technician.", is_read: false, created_at: "2026-02-25T11:45:00Z", entity_type: "ticket", entity_id: "TKT-00012345" },
  { id: "mock-2", title: "Bill Due Reminder (Demo)", body: "Your electricity bill of ₹1,250 is due on March 15.", is_read: false, created_at: "2026-02-25T09:00:00Z", entity_type: "bill", entity_id: "BILL-001" },
  { id: "mock-3", title: "Payment Received (Demo)", body: "Payment of ₹320 for water bill has been confirmed.", is_read: true, created_at: "2026-02-20T14:00:00Z", entity_type: "payment", entity_id: "PAY-001" },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ticket: FileText,
  bill: CreditCard,
  payment: CheckCircle,
};

const Notifications = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await getNotifications();
        // Show ONLY real notifications as requested by user
        setNotifications(res.data.notifications || []);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
    const token = localStorage.getItem("kiosk_token");
    if (token) {
      const base = (api.defaults?.baseURL as string) || (import.meta as any)?.env?.VITE_API_URL || "http://localhost:5000";
      const es = new EventSource(`${base}/notifications/stream?token=${encodeURIComponent(token)}`);
      es.addEventListener("notification", (ev: any) => {
        try {
          const n = JSON.parse(ev.data);
          setNotifications((prev) => [{ ...n, body: n.message }, ...prev]);
        } catch (_) {}
      });
      es.addEventListener("snapshot", (ev: any) => {
        // can be used to prime badge count elsewhere if needed
      });
      es.addEventListener("ping", () => {});
      es.onerror = () => { /* keep alive */ };
      return () => { es.close(); };
    }
  }, []);

  const handleTap = async (n: any) => {
    // Mark as read in UI
    setNotifications((prev) => 
      prev.map((x) => x.id === n.id ? { ...x, is_read: true } : x)
    );

    // Mark as read in backend if it's a real notification
    if (typeof n.id === 'number' || !n.id.toString().startsWith('mock-')) {
      try {
        await markNotificationRead(n.id);
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }

    // Navigate to entity
    if (n.entity_type === "ticket") {
      const idStr = String(n.entity_id || "");
      const numeric = idStr.match(/\d+/)?.[0];
      if (numeric) navigate(`/tickets/${numeric}`);
      else navigate("/tickets");
    }
    else if (n.entity_type === "bill") navigate("/bills");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <KioskHeader
        title="Notifications"
        showBack
        language={user?.preferredLanguage || "en"}
        onLanguageChange={(lang) => updateUser({ preferredLanguage: lang })}
        onLogout={logout}
      />

      <main className="flex-1 px-8 py-8">
        <div className="max-w-3xl mx-auto space-y-3">
          {loading ? (
            <div className="text-center py-16">
              <p className="text-kiosk-xl text-muted-foreground">Loading notifications...</p>
            </div>
          ) : (
            <>
              {notifications.map((n) => {
                const Icon = iconMap[n.entity_type] || Bell;
                const isRead = n.is_read;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleTap(n)}
                    className={cn(
                      "w-full flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-colors",
                      "focus:outline-none focus:ring-4 focus:ring-accent/20",
                      isRead ? "border-border bg-card" : "border-accent/30 bg-accent/5"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      isRead ? "bg-muted text-muted-foreground" : "bg-accent/20 text-accent"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-kiosk-base font-semibold text-foreground">{n.title}</h3>
                        {!isRead && <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />}
                      </div>
                      <p className="text-kiosk-sm text-muted-foreground mt-1">{n.body}</p>
                      <p className="text-kiosk-xs text-muted-foreground/60 mt-2 font-mono">
                        {new Date(n.created_at || n.createdAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </button>
                );
              })}
              {notifications.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-kiosk-xl text-muted-foreground">No notifications found</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifications;
