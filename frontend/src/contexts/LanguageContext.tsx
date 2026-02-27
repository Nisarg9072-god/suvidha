import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { translations, type Lang } from "@/lib/translations";

const STORAGE_KEY = "kiosk_language";
const DEFAULT_LANG: Lang = "en";

type LanguageContextType = {
  language: Lang;
  setLanguage: (lang: Lang) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Lang>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "hi" || stored === "gu" || stored === "en") return stored;
    return DEFAULT_LANG;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const setLanguage = useCallback((lang: Lang) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const langTranslations = translations[language];
      return langTranslations[key] ?? translations.en[key] ?? key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
