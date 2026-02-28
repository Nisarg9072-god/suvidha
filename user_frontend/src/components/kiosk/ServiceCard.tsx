 import * as React from "react";
 import { cn } from "@/lib/utils";
 import { LucideIcon } from "lucide-react";
 
 interface ServiceCardProps {
   title: string;
   description?: string;
   icon: LucideIcon;
   onClick?: () => void;
   disabled?: boolean;
   variant?: "default" | "compact";
   className?: string;
 }
 
 const ServiceCard: React.FC<ServiceCardProps> = ({
   title,
   description,
   icon: Icon,
   onClick,
   disabled = false,
   variant = "default",
   className,
 }) => {
   const isCompact = variant === "compact";
 
   return (
     <button
       onClick={onClick}
       disabled={disabled}
       className={cn(
         "group relative flex flex-col items-center justify-center",
         "bg-card text-card-foreground",
         "border-2 border-border rounded-xl",
         "shadow-md hover:shadow-lg",
         "transition-all duration-200 ease-in-out",
         "hover:border-accent hover:scale-[1.02]",
         "focus:outline-none focus:ring-4 focus:ring-accent/20",
         "active:scale-[0.98]",
         "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:border-border",
         isCompact ? "p-6 gap-3 min-h-[140px]" : "p-8 gap-4 min-h-[200px]",
         className
       )}
     >
       <div
         className={cn(
           "flex items-center justify-center rounded-full",
           "bg-primary text-primary-foreground",
           "group-hover:bg-accent group-hover:text-accent-foreground",
           "transition-colors duration-200",
           isCompact ? "w-14 h-14" : "w-20 h-20"
         )}
       >
         <Icon className={cn(isCompact ? "w-7 h-7" : "w-10 h-10")} />
       </div>
       <div className="text-center">
         <h3
           className={cn(
             "font-semibold text-foreground",
             isCompact ? "text-kiosk-base" : "text-kiosk-xl"
           )}
         >
           {title}
         </h3>
         {description && (
           <p className="mt-1 text-kiosk-sm text-muted-foreground">{description}</p>
         )}
       </div>
       {disabled && (
         <span className="absolute top-3 right-3 px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded">
           Coming Soon
         </span>
       )}
     </button>
   );
 };
 
 export { ServiceCard };