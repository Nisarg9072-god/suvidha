 import { useNavigate } from "react-router-dom";
 import { SecondaryButton } from "@/components/kiosk";
 import { ArrowLeft, Globe } from "lucide-react";
 import { useLanguage } from "@/contexts/LanguageContext";
 
interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}
 
const languages: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
];
 
 const Language = () => {
   const navigate = useNavigate();
   const { setLanguage, t } = useLanguage();

  const handleLanguageSelect = (code: string) => {
    setLanguage(code as "en" | "hi" | "gu");
    navigate("/login");
  };
 
   return (
     <div className="min-h-screen flex flex-col bg-background/40">
       {/* Top Accent Bar */}
       <div className="h-2 bg-accent" />
 
       {/* Header */}
       <header className="bg-primary text-primary-foreground py-6 px-8">
         <div className="max-w-[1920px] mx-auto flex items-center justify-between">
           <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-full bg-primary-foreground/10 flex items-center justify-center">
               <span className="text-3xl">🏛️</span>
             </div>
             <div>
               <h1 className="text-kiosk-3xl font-bold tracking-tight">{t("suvidhaPlus")}</h1>
               <p className="text-kiosk-base text-primary-foreground/80">{t("smartCityCivicServices")}</p>
             </div>
           </div>
         </div>
       </header>
 
       {/* Main Content */}
       <main className="flex-1 flex flex-col items-center justify-center px-8 py-12">
         <div className="max-w-4xl mx-auto text-center space-y-12">
           {/* Heading */}
           <div className="space-y-4">
             <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
               <Globe className="w-10 h-10 text-accent" />
             </div>
             <h2 className="text-kiosk-4xl font-bold text-foreground">
               {t("selectLanguage")}
             </h2>
             <p className="text-kiosk-xl text-muted-foreground">
               {t("languageSubtitle")}
             </p>
           </div>
 
           {/* Language Grid */}
           <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
             {languages.map((lang) => (
               <button
                 key={lang.code}
                 onClick={() => handleLanguageSelect(lang.code)}
                 className="group relative flex flex-col items-center justify-center min-h-[160px] p-8 rounded-xl border-2 transition-all duration-200 bg-card border-border hover:border-accent hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-accent/20"
               >
                 <span className="text-kiosk-2xl font-bold text-foreground group-hover:text-accent transition-colors">
                   {lang.nativeName}
                 </span>
                 <span className="text-kiosk-lg text-muted-foreground mt-2">
                   {lang.name}
                 </span>
               </button>
             ))}
           </div>
         </div>
       </main>
 
       {/* Footer with Back Button */}
       <footer className="bg-muted border-t border-border py-6 px-8">
         <div className="max-w-[1920px] mx-auto">
           <SecondaryButton onClick={() => navigate("/")} size="large">
             <ArrowLeft className="w-5 h-5 mr-2" />
             {t("backToHome")}
           </SecondaryButton>
         </div>
       </footer>
     </div>
   );
 };
 
 export default Language;