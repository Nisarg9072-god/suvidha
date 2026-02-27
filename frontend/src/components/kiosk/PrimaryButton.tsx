 import * as React from "react";
 import { cn } from "@/lib/utils";
 
 interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: "default" | "large" | "xl";
  fullWidth?: boolean;
  loading?: boolean;
}

const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ className, children, size = "default", fullWidth = false, loading = false, disabled, ...props }, ref) => {
    const sizeClasses = {
      default: "h-14 px-8 text-kiosk-lg",
      large: "h-16 px-10 text-kiosk-xl",
      xl: "h-20 px-12 text-kiosk-2xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-3 font-semibold",
          "bg-accent text-accent-foreground",
          "rounded-lg border-2 border-accent",
          "shadow-lg hover:shadow-xl",
          "transition-all duration-200 ease-in-out",
          "hover:bg-gold-dark hover:border-gold-dark",
          "focus:outline-none focus:ring-4 focus:ring-accent/30",
          "active:scale-[0.98]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
          "touch-target",
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading && (
          <div className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);
 
 PrimaryButton.displayName = "PrimaryButton";
 
 export { PrimaryButton };