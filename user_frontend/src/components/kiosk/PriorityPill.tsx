import { cn } from "@/lib/utils";

type Priority = "LOW" | "MED" | "HIGH" | "EMERGENCY";

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  LOW: { label: "Low", className: "bg-muted text-muted-foreground" },
  MED: { label: "Medium", className: "bg-warning/15 text-warning" },
  HIGH: { label: "High", className: "bg-destructive/15 text-destructive" },
  EMERGENCY: { label: "Emergency", className: "bg-destructive text-destructive-foreground" },
};

interface PriorityPillProps {
  priority: Priority;
  className?: string;
}

const PriorityPill: React.FC<PriorityPillProps> = ({ priority, className }) => {
  const config = priorityConfig[priority] || priorityConfig.LOW;
  return (
    <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-kiosk-sm font-semibold", config.className, className)}>
      {config.label}
    </span>
  );
};

export { PriorityPill };
export type { Priority };
