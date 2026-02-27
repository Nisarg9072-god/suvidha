import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KioskHeader, PrimaryButton, SecondaryButton, StepWizard, InputField } from "@/components/kiosk";
import { useAuth } from "@/hooks/useAuth";

type CertType = "CERT_BIRTH" | "CERT_DEATH";

const steps = ["Type", "Details", "Confirm"];

const Certificates = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [step, setStep] = useState(0);
  const [certType, setCertType] = useState<CertType | "">("");
  const [form, setForm] = useState({ fullName: "", dateOfEvent: "", place: "", fatherName: "", motherName: "" });
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = () => {
    const id = "TKT-CERT-" + Date.now().toString().slice(-6);
    setTicketId(id);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background/90">
        <KioskHeader title="Certificate Requested" showBack onLogout={logout} />
        <main className="flex-1 flex items-center justify-center px-8">
          <div className="max-w-lg text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-success/20 flex items-center justify-center"><span className="text-4xl">✓</span></div>
            <h2 className="text-kiosk-3xl font-bold text-foreground">Request Submitted</h2>
            <p className="text-kiosk-xl text-muted-foreground">Ticket: <span className="font-mono font-bold text-foreground">{ticketId}</span></p>
            <div className="bg-info/10 border border-info/20 rounded-lg p-4 text-left">
              <p className="text-kiosk-base font-semibold text-foreground">Required Documents:</p>
              <ul className="list-disc pl-6 mt-2 text-kiosk-sm text-muted-foreground space-y-1">
                <li>Proof of identity (Aadhaar / Voter ID)</li>
                <li>Address proof</li>
                {certType === "CERT_BIRTH" && <li>Hospital discharge summary</li>}
                {certType === "CERT_DEATH" && <li>Medical certificate of cause of death</li>}
              </ul>
            </div>
            <div className="flex gap-4 justify-center">
              <PrimaryButton size="large" onClick={() => navigate(`/tickets/${ticketId}/upload`)}>Upload Documents</PrimaryButton>
              <SecondaryButton size="large" onClick={() => navigate("/departments")}>Home</SecondaryButton>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background/90">
      <KioskHeader title="Certificate Request" showBack onLogout={logout} />
      <main className="flex-1 px-8 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <StepWizard steps={steps} currentStep={step} />

          {step === 0 && (
            <div className="space-y-6">
              <h2 className="text-kiosk-2xl font-bold text-foreground">Select Certificate Type</h2>
              <div className="grid grid-cols-2 gap-6">
                {([
                  { type: "CERT_BIRTH" as CertType, label: "Birth Certificate", emoji: "👶" },
                  { type: "CERT_DEATH" as CertType, label: "Death Certificate", emoji: "🕊️" },
                ]).map((c) => (
                  <button
                    key={c.type}
                    onClick={() => { setCertType(c.type); setStep(1); }}
                    className={`flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 min-h-[160px] transition-colors focus:outline-none focus:ring-4 focus:ring-accent/20 ${
                      certType === c.type ? "border-accent bg-accent/10" : "border-border bg-card hover:border-accent"
                    }`}
                  >
                    <span className="text-4xl">{c.emoji}</span>
                    <span className="text-kiosk-lg font-semibold">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <InputField label="Full Name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="As per records" />
              <InputField label={certType === "CERT_BIRTH" ? "Date of Birth" : "Date of Death"} value={form.dateOfEvent} onChange={(e) => set("dateOfEvent", e.target.value)} placeholder="DD/MM/YYYY" type="text" />
              <InputField label="Place" value={form.place} onChange={(e) => set("place", e.target.value)} placeholder="Hospital / Location" />
              <InputField label="Father's Name" value={form.fatherName} onChange={(e) => set("fatherName", e.target.value)} placeholder="Full name" />
              <InputField label="Mother's Name" value={form.motherName} onChange={(e) => set("motherName", e.target.value)} placeholder="Full name" />
              <div className="flex gap-4">
                <SecondaryButton size="large" onClick={() => setStep(0)}>Back</SecondaryButton>
                <PrimaryButton fullWidth size="large" onClick={() => setStep(2)} disabled={!form.fullName || !form.dateOfEvent}>Next</PrimaryButton>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-card border-2 border-border rounded-xl p-6 space-y-3">
                <h3 className="text-kiosk-xl font-bold">Review</h3>
                {Object.entries(form).filter(([,v]) => v).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-border pb-2 last:border-0">
                    <span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
                    <span className="font-semibold">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-semibold">{certType === "CERT_BIRTH" ? "Birth" : "Death"} Certificate</span></div>
              </div>
              <div className="flex gap-4">
                <SecondaryButton size="large" onClick={() => setStep(1)}>Back</SecondaryButton>
                <PrimaryButton fullWidth size="large" onClick={handleSubmit}>Submit Request</PrimaryButton>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Certificates;
