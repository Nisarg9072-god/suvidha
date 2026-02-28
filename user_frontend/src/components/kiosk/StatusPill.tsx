import { cn } from "@/lib/utils";

type TicketStatus = "open" | "in_progress" | "resolved" | "rejected";

const statusConfig: Record<TicketStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-info/15 text-info border-info/30" },
  in_progress: { label: "In Progress", className: "bg-warning/15 text-warning border-warning/30" },
  resolved: { label: "Resolved", className: "bg-success/15 text-success border-success/30" },
  rejected: { label: "Rejected", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

interface StatusPillProps {
  status: TicketStatus;
  className?: string;
}

const StatusPill: React.FC<StatusPillProps> = ({ status, className }) => {
  const config = statusConfig[status] || statusConfig.open;
  return (
    <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-kiosk-sm font-semibold border", config.className, className)}>
      {config.label}
    </span>
  );
};

export { StatusPill };
export type { TicketStatus };
