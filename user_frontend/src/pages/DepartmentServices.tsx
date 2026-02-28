import { useNavigate, useParams } from "react-router-dom";
import { KioskHeader, LargeTileButton } from "@/components/kiosk";
import {
  Zap, ZapOff, Lightbulb, Gauge, CreditCard,
  Flame, AlertTriangle, Truck, Receipt,
  Trash2, Droplets, Construction, Leaf, Home, FileText, Award
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

interface ServiceOption {
  titleKey: string;
  icon: React.ComponentType<{ className?: string }>;
  serviceType: string;
  priority?: string;
  variant?: "default" | "emergency";
  route?: string;
}

const deptServices: Record<string, { labelKey: string; options: ServiceOption[] }> = {
  ELEC: {
    labelKey: "electricityServices",
    options: [
      { titleKey: "reportOutage", icon: ZapOff, serviceType: "OUTAGE", priority: "HIGH", variant: "emergency" },
      { titleKey: "streetlightIssue", icon: Lightbulb, serviceType: "STREETLIGHT" },
      { titleKey: "uploadMeterReading", icon: Gauge, serviceType: "METER_READING" },
      { titleKey: "viewPayBill", icon: CreditCard, serviceType: "", route: "/bills" },
    ],
  },
  GAS: {
    labelKey: "gasServicesLabel",
    options: [
      { titleKey: "bookNewConnection", icon: Flame, serviceType: "NEW_CONNECTION" },
      { titleKey: "reportGasLeakage", icon: AlertTriangle, serviceType: "LEAKAGE", priority: "EMERGENCY", variant: "emergency" },
      { titleKey: "billingPayments", icon: Receipt, serviceType: "", route: "/bills" },
      { titleKey: "deliveryDelay", icon: Truck, serviceType: "DELIVERY_DELAY" },
    ],
  },
  MUNI: {
    labelKey: "municipalServices",
    options: [
      { titleKey: "garbageNotCollected", icon: Trash2, serviceType: "GARBAGE" },
      { titleKey: "waterLeakage", icon: Droplets, serviceType: "WATER_LEAK" },
      { titleKey: "pothole", icon: Construction, serviceType: "POTHOLE" },
      { titleKey: "sanitation", icon: Leaf, serviceType: "SANITATION" },
      { titleKey: "propertyTaxBill", icon: Home, serviceType: "", route: "/bills" },
      { titleKey: "certificates", icon: Award, serviceType: "", route: "/services/certificates" },
    ],
  },
};

const DepartmentServices = () => {
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();
  const { user, logout, updateUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const dept = deptServices[code?.toUpperCase() || ""] || deptServices.ELEC;

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as "en" | "hi" | "gu");
    updateUser({ preferredLanguage: lang });
  };

  const handleServiceClick = (opt: ServiceOption) => {
    if (opt.route) {
      navigate(opt.route);
    } else {
      // Go to create ticket wizard with pre-filled data
      navigate("/create-ticket", {
        state: {
          departmentCode: code?.toUpperCase(),
          serviceType: opt.serviceType,
          priority: opt.priority || "MED",
          title: opt.title,
        },
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background/90">
      <KioskHeader
        title={t(dept.labelKey)}
        showBack
        language={language}
        onLanguageChange={handleLanguageChange}
        onLogout={logout}
      />

      <main className="flex-1 px-8 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-3 gap-6">
            {dept.options.map((opt) => (
              <LargeTileButton
                key={opt.serviceType || opt.titleKey}
                title={t(opt.titleKey)}
                icon={opt.icon}
                variant={opt.variant}
                onClick={() => handleServiceClick(opt)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DepartmentServices;
