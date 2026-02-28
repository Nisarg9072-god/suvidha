import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "@/components/kiosk";
import { Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { language, t } = useLanguage();

  const localeMap = { en: "en-IN", hi: "hi-IN", gu: "gu-IN" };
  const currentTime = new Date().toLocaleTimeString(localeMap[language] ?? "en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground py-4 px-8">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-foreground/10 overflow-hidden flex items-center justify-center">
              <img
                src="/smart-city-logo.png"
                alt="Smart City"
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }}
              />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-kiosk-2xl font-bold">SUVIDHA</span>
              <span className="text-kiosk-2xl font-bold text-accent">PLUS</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-kiosk-lg font-semibold">{t("smartCity")}</span>
            <div className="flex items-center gap-2 justify-end mt-1">
              <Clock className="w-5 h-5" />
              <span className="text-kiosk-base">{currentTime}</span>
            </div>
          </div>
        </div>
        <div className="h-0.5 bg-primary-foreground/20 mt-2 max-w-[1920px] mx-auto" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-primary shadow-lg overflow-hidden">
            <img
              src="/smart-city-logo.png"
              alt="Smart City Logo"
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }}
            />
          </div>

          <h1 className="text-kiosk-5xl font-bold text-foreground tracking-tight">
            SUVIDHA
          </h1>

          <p className="text-kiosk-xl text-muted-foreground">
            {t("subtitle")}
          </p>

          <div className="pt-4">
            <PrimaryButton
              size="xl"
              onClick={() => navigate("/language")}
              className="px-16 py-6 shadow-md hover:shadow-lg transition-shadow bg-navy-light hover:bg-navy-medium text-white border-navy-light"
            >
              {t("touchToBegin")}
            </PrimaryButton>

            {isAuthenticated && (
              <p className="mt-4">
                <button
                  onClick={logout}
                  className="text-kiosk-base text-muted-foreground hover:text-foreground underline"
                >
                  {t("clearSession")}
                </button>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="py-4 px-8 text-center">
        <p className="text-kiosk-lg text-muted-foreground mb-4">
          {t("welcomeMessage")}
        </p>
      </div>
      <footer className="bg-primary text-primary-foreground py-4 px-8">
        <div className="max-w-[1920px] mx-auto" />
      </footer>
    </div>
  );
};

export default Index;
