import { cn } from "@/lib/utils";
interface LargeTileButtonProps {
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  variant?: "default" | "emergency";
  className?: string;
}

const LargeTileButton: React.FC<LargeTileButtonProps> = ({
  title,
  description,
  icon: Icon,
  onClick,
  variant = "default",
  className,
}) => {
  const isEmergency = variant === "emergency";

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex flex-col items-center justify-center gap-3",
        "min-h-[160px] p-6 rounded-xl border-2",
        "transition-all duration-150",
        "focus:outline-none focus:ring-4",
        "active:scale-[0.98]",
        isEmergency
          ? "bg-destructive/5 border-destructive hover:bg-destructive/10 focus:ring-destructive/20"
          : "bg-card border-border hover:border-accent hover:shadow-md focus:ring-accent/20",
        className
      )}
    >
      <div
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
          isEmergency
            ? "bg-destructive text-destructive-foreground"
            : "bg-primary text-primary-foreground group-hover:bg-accent group-hover:text-accent-foreground"
        )}
      >
        <Icon className="w-8 h-8" />
      </div>
      <div className="text-center">
        <h3 className={cn("text-kiosk-lg font-semibold", isEmergency ? "text-destructive" : "text-foreground")}>
          {title}
        </h3>
        {description && <p className="text-kiosk-sm text-muted-foreground mt-1">{description}</p>}
      </div>
    </button>
  );
};

export { LargeTileButton };
