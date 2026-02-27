import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton, SecondaryButton, InputField, VirtualKeyboard } from "@/components/kiosk";
import { ArrowLeft, Phone, CreditCard, User, Mic } from "lucide-react";
import { useAuth, type KioskUser } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSpeechInput } from "@/hooks/useSpeechInput";

import { requestOtp, verifyOtp } from "@/lib/api";

type LoginMethod = "mobile" | "consumer";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { language, t } = useLanguage();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("mobile");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [keyboardTarget, setKeyboardTarget] = useState<"phone" | "otp" | null>(null);

  const { listening, startListening, stopListening, error: speechError } = useSpeechInput();

  const currentLocale =
    language === "hi" ? "hi-IN" : language === "gu" ? "gu-IN" : "en-IN";

  const handleSendOtp = async () => {
    if (!phone) {
      setError(loginMethod === "mobile" ? t("pleaseEnterMobile") : t("pleaseEnterConsumer"));
      return;
    }
    if (loginMethod === "mobile" && phone.length !== 10) {
      setError(t("invalidMobile"));
      return;
    }
    setError("");
    setLoading(true);
    try {
      await requestOtp(phone);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError(t("pleaseEnterOtp"));
      return;
    }
    setVerifying(true);
    setError("");

    try {
      const res = await verifyOtp(phone, otp);
      const { token, user } = res.data;
      
      const success = login(token, {
        id: user.id,
        phone: user.phone,
        role: user.role,
        preferredLanguage: user.preferred_language || language,
        consentAccepted: user.consent_accepted || false,
        name: user.name || t("citizen"),
      });

      if (success) {
        if (!user.consent_accepted) {
          navigate("/consent");
        } else {
          navigate("/departments");
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t("invalidOtp"));
    } finally {
      setVerifying(false);
    }
  };

  const handleGuestAccess = () => {
    const guestUser: KioskUser = {
      id: "guest-" + Date.now(),
      phone: "",
      role: "citizen",
      preferredLanguage: language,
      consentAccepted: true,
      name: "Guest",
    };
    login("guest-token-" + Date.now(), guestUser);
    navigate("/departments");
  };

  const handleMicForField = (field: "phone" | "otp") => {
    startListening(
      (text) => {
        const cleaned = field === "phone" || field === "otp" ? text.replace(/\D/g, "") : text;
        if (field === "phone") {
          setPhone(cleaned);
        } else {
          setOtp(cleaned);
        }
        setError("");
      },
      { language: currentLocale }
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-1.5 bg-accent" />

      <header className="bg-primary text-primary-foreground py-6 px-8">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/language")}
              className="w-14 h-14 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary-foreground/30"
            >
              <ArrowLeft className="w-7 h-7" />
            </button>
            <div>
              <h1 className="text-kiosk-3xl font-bold tracking-tight">{t("citizenLogin")}</h1>
              <p className="text-kiosk-base text-primary-foreground/80">{t("accessServices")}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-foreground/10 flex items-center justify-center">
              <span className="text-2xl">🏛️</span>
            </div>
            <div className="text-right">
              <p className="text-kiosk-lg font-semibold">SUVIDHA</p>
              <p className="text-kiosk-sm text-primary-foreground/70">Smart City Services</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-xl space-y-8">
          {/* Login Method Toggle */}
          <div className="flex gap-4 p-2 bg-muted rounded-xl">
            {[
              { method: "mobile" as const, icon: Phone, label: t("mobileNumber") },
              { method: "consumer" as const, icon: CreditCard, label: t("consumerId") },
            ].map((m) => (
              <button
                key={m.method}
                onClick={() => { setLoginMethod(m.method); setPhone(""); setOtp(""); setError(""); setOtpSent(false); }}
                className={`flex-1 flex items-center justify-center gap-3 h-16 rounded-lg font-semibold text-kiosk-lg transition-all ${
                  loginMethod === m.method
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <m.icon className="w-6 h-6" />
                {m.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="bg-card border-2 border-border rounded-xl p-8 space-y-6">
            {!otpSent ? (
              <>
                <div className="space-y-3">
                  <InputField
                    label={loginMethod === "mobile" ? t("mobileNumber") : t("consumerId")}
                    icon={loginMethod === "mobile" ? Phone : CreditCard}
                    placeholder={loginMethod === "mobile" ? t("enterMobile") : t("enterConsumerId")}
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setError(""); }}
                    onFocus={() => setKeyboardTarget("phone")}
                    error={error}
                    type={loginMethod === "mobile" ? "tel" : "text"}
                    maxLength={loginMethod === "mobile" ? 10 : undefined}
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setKeyboardTarget("phone")}
                      className="px-4 py-2 rounded-lg bg-muted text-kiosk-sm font-medium"
                    >
                      On-screen keyboard
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMicForField("phone")}
                      className="px-4 py-2 rounded-lg bg-accent text-accent-foreground flex items-center gap-2 text-kiosk-sm font-medium"
                    >
                      <Mic className="w-4 h-4" />
                      {listening ? "Listening..." : "Speak"}
                    </button>
                  </div>
                  {speechError && (
                    <p className="text-kiosk-xs text-destructive">{speechError}</p>
                  )}
                </div>
                <PrimaryButton fullWidth size="large" onClick={handleSendOtp}>
                  {t("sendOtp")}
                </PrimaryButton>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <InputField
                    label={t("enterOtp")}
                    placeholder={t("enterOtpPlaceholder")}
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value); setError(""); }}
                    onFocus={() => setKeyboardTarget("otp")}
                    error={error}
                    type="tel"
                    maxLength={6}
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setKeyboardTarget("otp")}
                      className="px-4 py-2 rounded-lg bg-muted text-kiosk-sm font-medium"
                    >
                      On-screen keyboard
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMicForField("otp")}
                      className="px-4 py-2 rounded-lg bg-accent text-accent-foreground flex items-center gap-2 text-kiosk-sm font-medium"
                    >
                      <Mic className="w-4 h-4" />
                      {listening ? "Listening..." : "Speak"}
                    </button>
                  </div>
                  {speechError && (
                    <p className="text-kiosk-xs text-destructive">{speechError}</p>
                  )}
                </div>
                <p className="text-kiosk-xs text-muted-foreground text-center">
                  {t("demoOtp")} <span className="font-mono font-bold text-accent">123456</span>
                </p>
                <PrimaryButton fullWidth size="large" onClick={handleVerifyOtp} disabled={verifying}>
                  {verifying ? t("verifying") : t("verifyOtp")}
                </PrimaryButton>
                <button
                  onClick={() => { setOtpSent(false); setOtp(""); setError(""); }}
                  className="w-full text-center text-kiosk-sm text-primary font-medium"
                >
                  {t("changeNumber")}
                </button>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-kiosk-base text-muted-foreground">{t("or")}</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <SecondaryButton fullWidth size="large" onClick={handleGuestAccess}>
            <User className="w-5 h-5 mr-2" />
            {t("continueAsGuest")}
          </SecondaryButton>
        </div>
      </main>
      <VirtualKeyboard
        visible={keyboardTarget !== null}
        value={keyboardTarget === "phone" ? phone : otp}
        mode="numeric"
        label={keyboardTarget === "phone" ? t("mobileNumber") : t("enterOtp")}
        onChange={(next) => {
          if (keyboardTarget === "phone") {
            setPhone(next);
          } else if (keyboardTarget === "otp") {
            setOtp(next);
          }
          setError("");
        }}
        onClose={() => setKeyboardTarget(null)}
      />
    </div>
  );
};

export default Login;
