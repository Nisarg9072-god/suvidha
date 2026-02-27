import { cn } from "@/lib/utils";
import { StatusPill, type TicketStatus } from "./StatusPill";
import { PriorityPill, type Priority } from "./PriorityPill";
import { Clock, ChevronRight } from "lucide-react";

interface TicketCardProps {
  id: string;
  title: string;
  departmentCode: string;
  status: TicketStatus;
  priority: Priority;
  createdAt: string;
  slaDue?: string;
  onClick?: () => void;
}

function getSlaLabel(slaDue?: string): { text: string; overdue: boolean } | null {
  if (!slaDue) return null;
  const diff = new Date(slaDue).getTime() - Date.now();
  if (diff < 0) {
    const hours = Math.abs(Math.round(diff / 3600000));
    return { text: `Overdue by ${hours}h`, overdue: true };
  }
  const hours = Math.floor(diff / 3600000);
  const mins = Math.round((diff % 3600000) / 60000);
  return { text: `Due in ${hours}h ${mins}m`, overdue: false };
}

const TicketCard: React.FC<TicketCardProps> = ({
  id, title, departmentCode, status, priority, createdAt, slaDue, onClick,
}) => {
  const sla = getSlaLabel(slaDue);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card border-2 border-border rounded-xl p-5 hover:border-accent transition-colors focus:outline-none focus:ring-4 focus:ring-accent/20 active:scale-[0.99]"
    >
      {priority === "EMERGENCY" && (
        <div className="mb-3 px-3 py-1.5 bg-destructive text-destructive-foreground rounded-lg text-kiosk-sm font-bold text-center">
          ⚠ EMERGENCY TICKET
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-kiosk-xs text-muted-foreground font-mono">{id}</p>
          <h3 className="text-kiosk-lg font-semibold text-foreground mt-1 truncate">{title}</h3>
          <p className="text-kiosk-sm text-muted-foreground mt-1">{departmentCode}</p>
        </div>
        <ChevronRight className="w-6 h-6 text-muted-foreground flex-shrink-0 mt-2" />
      </div>
      <div className="flex items-center gap-3 mt-4 flex-wrap">
        <StatusPill status={status} />
        <PriorityPill priority={priority} />
        {sla && (
          <span className={cn("flex items-center gap-1 text-kiosk-xs font-semibold", sla.overdue ? "text-destructive" : "text-muted-foreground")}>
            <Clock className="w-3.5 h-3.5" />
            {sla.text}
          </span>
        )}
      </div>
    </button>
  );
};

export { TicketCard };
