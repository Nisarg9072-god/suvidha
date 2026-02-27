import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Language from "./pages/Language";
import Login from "./pages/Login";
import Consent from "./pages/Consent";
import Departments from "./pages/Departments";
import DepartmentServices from "./pages/DepartmentServices";
import CreateTicket from "./pages/CreateTicket";
import Tickets from "./pages/Tickets";
import TicketDetail from "./pages/TicketDetail";
import TicketUpload from "./pages/TicketUpload";
import Bills from "./pages/Bills";
import Certificates from "./pages/Certificates";
import Notifications from "./pages/Notifications";
import Help from "./pages/Help";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
      <Toaster />
      <Sonner />
      {/* Kiosk background - fixed layer behind all pages */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url(/kiosk-background.png)" }}
        aria-hidden
      />
      <div className="fixed inset-0 -z-10 bg-white/40" aria-hidden />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/language" element={<Language />} />
          <Route path="/login" element={<Login />} />
          <Route path="/consent" element={<Consent />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/dept/:code" element={<DepartmentServices />} />
          <Route path="/create-ticket" element={<CreateTicket />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
          <Route path="/tickets/:id/upload" element={<TicketUpload />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/services/certificates" element={<Certificates />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/help" element={<Help />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
