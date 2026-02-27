 import * as React from "react";
 import { cn } from "@/lib/utils";
 
 type StatusType = "pending" | "in-progress" | "completed" | "error" | "info";
 
 interface StatusBadgeProps {
   status: StatusType;
   label?: string;
   size?: "sm" | "md" | "lg";
   className?: string;
 }
 
 const statusConfig: Record<StatusType, { bg: string; text: string; defaultLabel: string }> = {
   pending: {
     bg: "bg-warning/20",
     text: "text-warning",
     defaultLabel: "Pending",
   },
   "in-progress": {
     bg: "bg-info/20",
     text: "text-info",
     defaultLabel: "In Progress",
   },
   completed: {
     bg: "bg-success/20",
     text: "text-success",
     defaultLabel: "Completed",
   },
   error: {
     bg: "bg-destructive/20",
     text: "text-destructive",
     defaultLabel: "Error",
   },
   info: {
     bg: "bg-muted",
     text: "text-muted-foreground",
     defaultLabel: "Info",
   },
 };
 
 const StatusBadge: React.FC<StatusBadgeProps> = ({
   status,
   label,
   size = "md",
   className,
 }) => {
   const config = statusConfig[status];
   
   const sizeClasses = {
     sm: "px-2 py-1 text-xs",
     md: "px-3 py-1.5 text-sm",
     lg: "px-4 py-2 text-base",
   };
 
   return (
     <span
       className={cn(
         "inline-flex items-center font-semibold rounded-full",
         config.bg,
         config.text,
         sizeClasses[size],
         className
       )}
     >
       <span className={cn("w-2 h-2 rounded-full mr-2", config.text.replace("text-", "bg-"))} />
       {label || config.defaultLabel}
     </span>
   );
 };
 
 export { StatusBadge };
 export type { StatusType };