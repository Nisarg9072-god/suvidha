 import * as React from "react";
 import { cn } from "@/lib/utils";
 import { ArrowLeft, LogOut } from "lucide-react";
 import { useNavigate } from "react-router-dom";
 
 interface PageHeaderProps {
   title: string;
   subtitle?: string;
   showBack?: boolean;
   showLogout?: boolean;
   onLogout?: () => void;
   className?: string;
 }
 
 const PageHeader: React.FC<PageHeaderProps> = ({
   title,
   subtitle,
   showBack = false,
   showLogout = false,
   onLogout,
   className,
 }) => {
   const navigate = useNavigate();
 
   return (
     <header className={cn("w-full", className)}>
       {/* Top accent bar */}
       <div className="h-2 bg-accent" />
       
       {/* Main header */}
       <div className="bg-primary text-primary-foreground">
         <div className="max-w-[1920px] mx-auto px-8 py-6">
           <div className="flex items-center justify-between">
             {/* Left section */}
             <div className="flex items-center gap-6">
               {showBack && (
                 <button
                   onClick={() => navigate(-1)}
                   className={cn(
                     "flex items-center justify-center",
                     "w-14 h-14 rounded-full",
                     "bg-primary-foreground/10 hover:bg-primary-foreground/20",
                     "transition-colors duration-200",
                     "focus:outline-none focus:ring-4 focus:ring-primary-foreground/30"
                   )}
                   aria-label="Go back"
                 >
                   <ArrowLeft className="w-7 h-7" />
                 </button>
               )}
               <div>
                 <h1 className="text-kiosk-3xl font-bold tracking-tight">{title}</h1>
                 {subtitle && (
                   <p className="text-kiosk-lg text-primary-foreground/80 mt-1">
                     {subtitle}
                   </p>
                 )}
               </div>
             </div>
 
             {/* Right section */}
             <div className="flex items-center gap-4">
               {/* Government logo placeholder */}
               <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                   <span className="text-2xl font-bold">🏛️</span>
                 </div>
                 <div className="text-right">
                   <p className="text-kiosk-lg font-semibold">SUVIDHA+</p>
                   <p className="text-kiosk-sm text-primary-foreground/70">Smart City Services</p>
                 </div>
               </div>
 
               {showLogout && (
                 <button
                   onClick={onLogout}
                   className={cn(
                     "flex items-center gap-2 ml-6",
                     "px-6 h-12 rounded-lg",
                     "bg-primary-foreground/10 hover:bg-primary-foreground/20",
                     "text-kiosk-base font-medium",
                     "transition-colors duration-200",
                     "focus:outline-none focus:ring-4 focus:ring-primary-foreground/30"
                   )}
                 >
                   <LogOut className="w-5 h-5" />
                   <span>Logout</span>
                 </button>
               )}
             </div>
           </div>
         </div>
       </div>
     </header>
   );
 };
 
 export { PageHeader };