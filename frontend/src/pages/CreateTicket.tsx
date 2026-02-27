import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { KioskHeader, PrimaryButton, SecondaryButton, StepWizard, InputField, VirtualKeyboard } from "@/components/kiosk";
import { useAuth } from "@/hooks/useAuth";
import { Mic, Keyboard } from "lucide-react";
import { useSpeechInput } from "@/hooks/useSpeechInput";
import { useLanguage } from "@/contexts/LanguageContext";
import { createTicket } from "@/lib/api";

const CreateTicket = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, updateUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const prefill = (location.state as Record<string, string>) || {};
  const { listening, startListening, stopListening } = useSpeechInput();
  const [descKeyboardOpen, setDescKeyboardOpen] = useState(false);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: prefill.title || "",
    description: "",
    departmentCode: prefill.departmentCode || "",
    serviceType: prefill.serviceType || "",
    area: "",
    latitude: "",
    longitude: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const locale =
    language === "hi" ? "hi-IN" : language === "gu" ? "gu-IN" : "en-IN";

  const steps = [t("stepDetails"), t("stepLocation"), t("stepReview")];

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await createTicket({
        title: form.title,
        description: form.description,
        departmentCode: form.departmentCode || undefined,
        serviceType: form.serviceType || undefined,
        area: form.area || undefined,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      });
      setTicketId(res.data.ticket.id.toString());
      setSubmitted(true);
    } catch (err: any) {
      console.error("Ticket creation error full:", err);
      console.error("Ticket creation error response:", err.response?.data);
      const errorMsg = err.response?.data?.details 
        ? err.response.data.details.map((d: any) => `${d.path.join('.')}: ${d.message}`).join(', ')
        : err.response?.data?.error || err.message || "Failed to create request";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as "en" | "hi" | "gu");
    updateUser({ preferredLanguage: lang });
  };

  const handleMicDescription = () => {
    if (listening) {
      stopListening();
      return;
    }
    startListening(
      (text) => {
        set("description", (form.description + " " + text).trim());
      },
      { language: locale }
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background/90">
        <KioskHeader title={t("ticketCreated")} showBack onLogout={logout} />
        <main className="flex-1 flex items-center justify-center px-8">
          <div className="max-w-lg text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-success/20 flex items-center justify-center">
              <span className="text-4xl">✓</span>
            </div>
            <h2 className="text-kiosk-3xl font-bold text-foreground">{t("requestSubmitted")}</h2>
            <p className="text-kiosk-xl text-muted-foreground">
              {t("ticketIdLabel")}: <span className="font-mono font-bold text-foreground">{ticketId}</span>
            </p>
            {form.serviceType === "METER_READING" && (
              <PrimaryButton size="large" onClick={() => navigate(`/tickets/${ticketId}/upload`)}>
                {t("uploadMeterPhoto")}
              </PrimaryButton>
            )}
            <div className="flex gap-4 justify-center">
              <SecondaryButton size="large" onClick={() => navigate(`/tickets/${ticketId}`)}>
                {t("viewTicket")}
              </SecondaryButton>
              <PrimaryButton size="large" onClick={() => navigate("/departments")}>
                {t("backToDepartments")}
              </PrimaryButton>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background/90">
      <KioskHeader
        title={t("newServiceRequest")}
        showBack
        language={language}
        onLanguageChange={handleLanguageChange}
        onLogout={logout}
      />

      <main className="flex-1 px-8 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <StepWizard steps={steps} currentStep={step} />

          {step === 0 && (
            <div className="space-y-6">
              <InputField
                label={t("titleLabel")}
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder={t("titlePlaceholder")}
              />
              <div className="space-y-2">
                <label className="text-kiosk-base font-medium text-foreground block">
                  {t("descriptionLabel")}
                </label>
                <div className="relative">
                  <textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder={t("descriptionPlaceholder")}
                    rows={4}
                    className="w-full px-5 py-4 rounded-lg border-2 border-input bg-background text-kiosk-base resize-none focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary pr-24"
                    onFocus={() => setDescKeyboardOpen(true)}
                  />
                  <div className="absolute right-3 top-3 flex items-center gap-2">
                    <button
                      type="button"
                      className="h-10 w-10 rounded-md bg-muted text-foreground flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={handleMicDescription}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      className="h-10 w-10 rounded-md bg-muted text-foreground flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => setDescKeyboardOpen((v) => !v)}
                    >
                      <Keyboard className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <VirtualKeyboard
                  visible={descKeyboardOpen}
                  value={form.description}
                  mode="alphanumeric"
                  onChange={(next) => set("description", next)}
                  onClose={() => setDescKeyboardOpen(false)}
                label={t("descriptionLabel")}
                />
              </div>
              <PrimaryButton fullWidth size="large" onClick={() => setStep(1)} disabled={!form.title}>
                {t("next")}
              </PrimaryButton>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <InputField
                label={t("areaLabel")}
                value={form.area}
                onChange={(e) => set("area", e.target.value)}
                placeholder={t("areaPlaceholder")}
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label={t("latitudeLabel")}
                  value={form.latitude}
                  onChange={(e) => set("latitude", e.target.value)}
                  placeholder={t("latitudePlaceholder")}
                />
                <InputField
                  label={t("longitudeLabel")}
                  value={form.longitude}
                  onChange={(e) => set("longitude", e.target.value)}
                  placeholder={t("longitudePlaceholder")}
                />
              </div>
              <div className="flex gap-4">
                <SecondaryButton size="large" onClick={() => setStep(0)}>
                  {t("back")}
                </SecondaryButton>
                <PrimaryButton fullWidth size="large" onClick={() => setStep(2)}>
                  {t("next")}
                </PrimaryButton>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {error && (
                <div className="bg-destructive/15 text-destructive p-4 rounded-lg text-kiosk-base border border-destructive/20">
                  {error}
                </div>
              )}
              <div className="bg-card border-2 border-border rounded-xl p-6 space-y-4">
                <h3 className="text-kiosk-xl font-bold text-foreground">
                  {t("reviewYourRequest")}
                </h3>
                {[
                  [t("reviewDepartment"), form.departmentCode],
                  [t("reviewServiceType"), form.serviceType],
                  [t("reviewTitle"), form.title],
                  [t("reviewDescription"), form.description],
                  [t("reviewArea"), form.area || t("notSpecified")],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                    <span className="text-kiosk-base text-muted-foreground">{label}</span>
                    <span className="text-kiosk-base font-semibold text-foreground max-w-[60%] text-right">{value || "—"}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <SecondaryButton size="large" onClick={() => setStep(1)} disabled={loading}>
                  {t("back")}
                </SecondaryButton>
                <PrimaryButton fullWidth size="large" onClick={handleSubmit} loading={loading}>
                  {t("submitRequest")}
                </PrimaryButton>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreateTicket;
