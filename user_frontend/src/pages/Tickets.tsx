import { useNavigate } from "react-router-dom";
import { KioskHeader, TicketCard } from "@/components/kiosk";
import { useAuth } from "@/hooks/useAuth";
import type { TicketStatus } from "@/components/kiosk/StatusPill";
import type { Priority } from "@/components/kiosk/PriorityPill";
import { useState, useEffect } from "react";
import { getTickets } from "@/lib/api";

const Tickets = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await getTickets();
        // Assuming backend returns { tickets: [...] }
        setTickets(res.data.tickets || res.data);
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <KioskHeader
        title="My Requests"
        showBack
        language={user?.preferredLanguage || "en"}
        onLanguageChange={(lang) => updateUser({ preferredLanguage: lang })}
        onLogout={logout}
      />

      <main className="flex-1 px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {loading ? (
            <div className="text-center py-16">
              <p className="text-kiosk-xl text-muted-foreground">Loading your requests...</p>
            </div>
          ) : (
            <>
              {tickets.map((t) => (
                <TicketCard
                  key={t.id}
                  id={t.id.toString()}
                  title={t.title}
                  departmentCode={t.dept || t.departmentCode}
                  status={t.status.toLowerCase() as TicketStatus}
                  priority={t.priority.toUpperCase() as Priority}
                  createdAt={t.created_at || t.createdAt}
                  slaDue={t.sla_due_at || t.slaDue}
                  onClick={() => navigate(`/tickets/${t.id}`)}
                />
              ))}
              {tickets.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-kiosk-xl text-muted-foreground">No requests found</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Tickets;
