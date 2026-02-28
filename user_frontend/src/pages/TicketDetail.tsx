import { useParams, useNavigate } from "react-router-dom";
import { KioskHeader, StatusPill, PriorityPill, AttachmentList, PrimaryButton, SecondaryButton } from "@/components/kiosk";
import { useAuth } from "@/hooks/useAuth";
import { useTicketStream } from "@/hooks/useTicketStream";
import { Clock, User, FileText, CheckCircle, AlertCircle, Radio } from "lucide-react";
import type { TicketStatus } from "@/components/kiosk/StatusPill";
import type { Priority } from "@/components/kiosk/PriorityPill";
import { useState, useEffect } from "react";
import { getTicketDetail } from "@/lib/api";

const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { connected, events } = useTicketStream(id);
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        const numeric = id.match(/\d+/)?.[0] || id;
        const res = await getTicketDetail(numeric);
        setTicket(res.data.ticket);
      } catch (err) {
        console.error("Failed to fetch ticket detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <KioskHeader title="Ticket Details" showBack onLogout={logout} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-kiosk-xl text-muted-foreground">Loading ticket details...</p>
        </main>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col">
        <KioskHeader title="Ticket Details" showBack onLogout={logout} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-kiosk-xl text-destructive">Ticket not found</p>
        </main>
      </div>
    );
  }

  const timeline = [
    { status: "Submitted", time: new Date(ticket.created_at).toLocaleString(), desc: "Complaint registered", icon: FileText, done: true },
    { status: ticket.status === "open" ? "Pending" : "Completed", time: ticket.status !== "open" ? "Processed" : "Pending", desc: "Awaiting review", icon: Clock, done: ticket.status !== "open" },
    { status: "Resolved", time: ticket.status === "resolved" ? "Fixed" : "Pending", desc: "Final resolution", icon: CheckCircle, done: ticket.status === "resolved" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <KioskHeader title="Ticket Details" showBack onLogout={logout} />

      <main className="flex-1 px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Emergency banner */}
          {ticket.priority === "EMERGENCY" && (
            <div className="bg-destructive text-destructive-foreground p-4 rounded-xl text-center text-kiosk-lg font-bold flex items-center justify-center gap-2">
              <AlertCircle className="w-6 h-6" /> EMERGENCY TICKET
            </div>
          )}

          {/* Header card */}
          <div className="bg-card border-2 border-border rounded-xl overflow-hidden">
            <div className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-kiosk-sm text-primary-foreground/70">Ticket ID</p>
                <p className="text-kiosk-xl font-bold font-mono">{id}</p>
              </div>
              <div className="flex items-center gap-3">
                {connected && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/20 text-success text-kiosk-xs font-bold">
                    <Radio className="w-3 h-3" /> Live
                  </span>
                )}
                <StatusPill status={ticket.status} />
              </div>
            </div>
            <div className="p-6 space-y-4">
              <h2 className="text-kiosk-2xl font-bold text-foreground">{ticket.title}</h2>
              <p className="text-kiosk-base text-muted-foreground">{ticket.description}</p>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div>
                  <p className="text-kiosk-xs text-muted-foreground">Department</p>
                  <p className="text-kiosk-base font-semibold">{ticket.department_id || ticket.departmentCode}</p>
                </div>
                <div>
                  <p className="text-kiosk-xs text-muted-foreground">Priority</p>
                  <PriorityPill priority={ticket.priority.toUpperCase() as Priority} />
                </div>
                <div>
                  <p className="text-kiosk-xs text-muted-foreground">Area</p>
                  <p className="text-kiosk-base font-semibold">{ticket.area || "—"}</p>
                </div>
              </div>
              {ticket.assigned_staff_id && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg mt-2">
                  <User className="w-5 h-5 text-primary" />
                  <span className="text-kiosk-sm">Assigned: <strong>{ticket.assigned_staff_name || "Technician"}</strong> ({ticket.assigned_staff_id})</span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-card border-2 border-border rounded-xl p-6">
            <h3 className="text-kiosk-xl font-bold text-foreground mb-4">Status Timeline</h3>
            <div className="space-y-0">
              {timeline.map((step, i) => (
                <div key={i} className="flex gap-4 pb-6 last:pb-0">
                  <div className="relative flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${step.done ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    {i < timeline.length - 1 && <div className={`absolute top-10 w-0.5 h-full ${step.done ? "bg-success" : "bg-border"}`} />}
                  </div>
                  <div className="pt-1">
                    <p className="text-kiosk-base font-semibold">{step.status}</p>
                    <p className="text-kiosk-sm text-muted-foreground">{step.desc}</p>
                    <p className="text-kiosk-xs text-muted-foreground/70 font-mono mt-0.5">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* SSE events */}
            {events.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <p className="text-kiosk-sm font-semibold text-info">Live Updates</p>
                {events.map((ev, i) => (
                  <div key={i} className="text-kiosk-xs p-2 bg-info/5 rounded">
                    <span className="font-mono">{ev.type}</span>: {JSON.stringify(ev.data)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attachments */}
          <div className="bg-card border-2 border-border rounded-xl p-6">
            <AttachmentList attachments={ticket.attachments || []} />
            <div className="mt-4">
              <SecondaryButton size="large" onClick={() => navigate(`/tickets/${id}/upload`)}>
                Upload More Files
              </SecondaryButton>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TicketDetail;
