import { cn } from "@/lib/utils";

interface StepWizardProps {
  steps: string[];
  currentStep: number;
}

const StepWizard: React.FC<StepWizardProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center gap-2 w-full">
      {steps.map((label, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <div className="flex items-center w-full">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-kiosk-sm font-bold flex-shrink-0 border-2 transition-colors",
                i < currentStep
                  ? "bg-success text-success-foreground border-success"
                  : i === currentStep
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-muted text-muted-foreground border-border"
              )}
            >
              {i < currentStep ? "✓" : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={cn("flex-1 h-1 mx-1 rounded", i < currentStep ? "bg-success" : "bg-border")} />
            )}
          </div>
          <span className={cn("text-kiosk-xs font-medium text-center", i <= currentStep ? "text-foreground" : "text-muted-foreground")}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
};

export { StepWizard };
