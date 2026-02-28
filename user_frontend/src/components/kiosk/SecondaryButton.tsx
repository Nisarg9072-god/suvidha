 import * as React from "react";
 import { cn } from "@/lib/utils";
 
 interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
   children: React.ReactNode;
   size?: "default" | "large";
   variant?: "outline" | "ghost";
   fullWidth?: boolean;
 }
 
 const SecondaryButton = React.forwardRef<HTMLButtonElement, SecondaryButtonProps>(
   ({ className, children, size = "default", variant = "outline", fullWidth = false, disabled, ...props }, ref) => {
     const sizeClasses = {
       default: "h-12 px-6 text-kiosk-base",
       large: "h-14 px-8 text-kiosk-lg",
     };
 
     const variantClasses = {
       outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground",
       ghost: "bg-transparent border-2 border-transparent text-primary hover:bg-muted",
     };
 
     return (
       <button
         ref={ref}
         disabled={disabled}
         className={cn(
           "inline-flex items-center justify-center gap-2 font-medium",
           "rounded-lg",
           "transition-all duration-200 ease-in-out",
           "focus:outline-none focus:ring-4 focus:ring-primary/20",
           "active:scale-[0.98]",
           "disabled:opacity-50 disabled:cursor-not-allowed",
           "touch-target",
           sizeClasses[size],
           variantClasses[variant],
           fullWidth && "w-full",
           className
         )}
         {...props}
       >
         {children}
       </button>
     );
   }
 );
 
 SecondaryButton.displayName = "SecondaryButton";
 
 export { SecondaryButton };