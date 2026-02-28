import { KioskHeader, PrimaryButton } from "@/components/kiosk";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const steps = [
  { num: 1, title: "Login", desc: "Enter your mobile number and verify with OTP (demo: 123456)" },
  { num: 2, title: "Select Department", desc: "Choose Electricity, Gas, or Municipal services" },
  { num: 3, title: "Choose Service", desc: "Select from available services like bill payment, complaint, etc." },
  { num: 4, title: "Create Request", desc: "Fill in details and submit your service request" },
  { num: 5, title: "Upload Documents", desc: "Attach photos or documents if required" },
  { num: 6, title: "Track Status", desc: "View live updates on your request" },
  { num: 7, title: "Pay Bills", desc: "View and pay pending bills with receipt download" },
  { num: 8, title: "Logout", desc: "Always clear your session when done" },
];

const Help = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background/90">
      <KioskHeader title="Help & Instructions" showBack onLogout={logout} />

      <main className="flex-1 px-8 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h2 className="text-kiosk-3xl font-bold text-foreground">How to Use This Kiosk</h2>
            <p className="text-kiosk-lg text-muted-foreground mt-2">Follow these steps to access government services</p>
          </div>

          <div className="space-y-4">
            {steps.map((s) => (
              <div key={s.num} className="flex gap-4 items-start bg-card border-2 border-border rounded-xl p-5">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-kiosk-lg font-bold flex-shrink-0">
                  {s.num}
                </div>
                <div>
                  <h3 className="text-kiosk-lg font-semibold text-foreground">{s.title}</h3>
                  <p className="text-kiosk-base text-muted-foreground mt-1">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-info/10 border-2 border-info/20 rounded-xl p-6">
            <h3 className="text-kiosk-xl font-bold text-foreground">Important Notes</h3>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-kiosk-base text-muted-foreground">
              <li>This kiosk automatically logs out after 2 minutes of inactivity</li>
              <li>Always tap "Clear Session" when you are done</li>
              <li>For emergencies (gas leakage, etc.), priority is set automatically</li>
              <li>You can upload photos as proof for complaints</li>
            </ul>
          </div>

          <PrimaryButton fullWidth size="large" onClick={() => navigate("/departments")}>
            Back to Home
          </PrimaryButton>
        </div>
      </main>
    </div>
  );
};

export default Help;
