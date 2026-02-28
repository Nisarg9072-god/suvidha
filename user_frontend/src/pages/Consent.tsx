import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "@/components/kiosk";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, CheckCircle } from "lucide-react";
import { patchMe } from "@/lib/api";
import { useState } from "react";

const Consent = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleAgree = async () => {
    setLoading(true);
    try {
      await patchMe({ consentAccepted: true });
      updateUser({ consentAccepted: true, consentAcceptedAt: new Date().toISOString() });
      navigate("/departments");
    } catch (err) {
      console.error("Failed to update consent:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background/90">
      <div className="h-1.5 bg-accent" />
      <header className="bg-primary text-primary-foreground py-6 px-8">
        <div className="max-w-[1920px] mx-auto flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-foreground/10 flex items-center justify-center">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-kiosk-3xl font-bold">{t("privacyConsent")}</h1>
            <p className="text-kiosk-base text-primary-foreground/80">{t("reviewBeforeContinuing")}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-2xl space-y-8">
          <div className="bg-card border-2 border-border rounded-xl p-8 space-y-6">
            <h2 className="text-kiosk-2xl font-bold text-foreground">{t("termsOfUse")}</h2>

            <div className="max-h-[300px] overflow-y-auto pr-4 space-y-4 text-kiosk-base text-muted-foreground">
              <p>{t("consentTermsIntro")}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t("consentItem1")}</li>
                <li>{t("consentItem2")}</li>
                <li>{t("consentItem3")}</li>
                <li>{t("consentItem4")}</li>
                <li>{t("consentItem5")}</li>
                <li>{t("consentItem6")}</li>
              </ul>
              <p className="font-semibold text-foreground">
                {t("consentLogoutNote")}
              </p>
            </div>

            <div className="flex items-start gap-3 p-4 bg-info/10 border border-info/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-info flex-shrink-0 mt-0.5" />
              <p className="text-kiosk-sm text-foreground">
                {t("consentByTapping")}
              </p>
            </div>
          </div>

          <PrimaryButton fullWidth size="large" onClick={handleAgree}>
            {t("iAgreeContinue")}
          </PrimaryButton>
        </div>
      </main>
    </div>
  );
};

export default Consent;
