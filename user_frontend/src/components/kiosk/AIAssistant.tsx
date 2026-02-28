 import { useState, useEffect } from "react";
 import { X, MessageCircle, Sparkles, CreditCard, AlertCircle, Search } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { useNavigate } from "react-router-dom";
 
 interface Message {
   id: string;
   type: "bot" | "user";
   text: string;
 }
 
 const quickActions = [
   { id: "pay", label: "Pay my bill", icon: CreditCard, route: "/pay-bill" },
   { id: "complaint", label: "Register complaint", icon: AlertCircle, route: "/complaint/new" },
   { id: "status", label: "Check status", icon: Search, route: "/status" },
 ];
 
 const AIAssistant = () => {
   const navigate = useNavigate();
   const [isOpen, setIsOpen] = useState(false);
   const [messages, setMessages] = useState<Message[]>([
     {
       id: "1",
       type: "bot",
       text: "Hello! I'm your SUVIDHA+ AI Assistant. How can I help you today?",
     },
   ]);
 
   useEffect(() => {
     const handleOpen = () => setIsOpen(true);
     window.addEventListener("openAIAssistant", handleOpen);
     return () => window.removeEventListener("openAIAssistant", handleOpen);
   }, []);
 
   const handleQuickAction = (action: typeof quickActions[0]) => {
     setMessages((prev) => [
       ...prev,
       { id: Date.now().toString(), type: "user", text: action.label },
       {
         id: (Date.now() + 1).toString(),
         type: "bot",
         text: `Taking you to ${action.label.toLowerCase()}...`,
       },
     ]);
     setTimeout(() => {
       navigate(action.route);
       setIsOpen(false);
     }, 1000);
   };
 
   return (
     <>
       {/* Floating Button */}
       <button
         onClick={() => setIsOpen(true)}
         className={cn(
           "fixed bottom-8 right-8 z-50",
           "flex items-center gap-3 px-6 py-4",
           "bg-accent text-accent-foreground",
           "rounded-full shadow-lg",
           "hover:bg-gold-dark transition-all",
           "animate-pulse-glow",
           isOpen && "hidden"
         )}
       >
         <MessageCircle className="w-6 h-6" />
         <span className="text-kiosk-lg font-semibold">Need Help?</span>
       </button>
 
       {/* Side Panel */}
       {isOpen && (
         <div className="fixed inset-y-0 right-0 w-[420px] z-50 flex flex-col bg-card border-l-2 border-border shadow-2xl animate-slide-up">
           {/* Header */}
           <div className="bg-primary text-primary-foreground px-6 py-5 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                 <Sparkles className="w-5 h-5 text-accent-foreground" />
               </div>
               <div>
                 <h3 className="text-kiosk-lg font-bold">AI Assistant</h3>
                 <p className="text-kiosk-xs text-primary-foreground/70">Always here to help</p>
               </div>
             </div>
             <button
               onClick={() => setIsOpen(false)}
               className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
             >
               <X className="w-5 h-5" />
             </button>
           </div>
 
           {/* Messages */}
           <div className="flex-1 overflow-y-auto p-6 space-y-4">
             {messages.map((msg) => (
               <div
                 key={msg.id}
                 className={cn(
                   "max-w-[85%] p-4 rounded-xl",
                   msg.type === "bot"
                     ? "bg-muted text-foreground"
                     : "bg-primary text-primary-foreground ml-auto"
                 )}
               >
                 <p className="text-kiosk-base">{msg.text}</p>
               </div>
             ))}
           </div>
 
           {/* Quick Actions */}
           <div className="p-6 border-t border-border space-y-3">
             <p className="text-kiosk-sm text-muted-foreground font-medium">Quick Actions</p>
             <div className="space-y-2">
               {quickActions.map((action) => (
                 <button
                   key={action.id}
                   onClick={() => handleQuickAction(action)}
                   className="w-full flex items-center gap-3 p-4 rounded-lg bg-muted hover:bg-accent/10 hover:border-accent border-2 border-transparent transition-all text-left"
                 >
                   <action.icon className="w-5 h-5 text-accent" />
                   <span className="text-kiosk-base font-medium">{action.label}</span>
                 </button>
               ))}
             </div>
           </div>
         </div>
       )}
     </>
   );
 };
 
 export { AIAssistant };