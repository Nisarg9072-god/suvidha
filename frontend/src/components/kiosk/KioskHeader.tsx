import { Globe, Bell, LogOut, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface KioskHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  notificationCount?: number;
  language?: string;
  isOnline?: boolean;
  onLanguageChange?: (lang: string) => void;
  onLogout?: () => void;
}

const languages = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिं" },
  { code: "gu", label: "ગુ" },
];

const KioskHeader: React.FC<KioskHeaderProps> = ({
  title = "SUVIDHA",
  subtitle,
  showBack = false,
  notificationCount = 0,
  language = "en",
  isOnline = true,
  onLanguageChange,
  onLogout,
}) => {
  const navigate = useNavigate();

  return (
    <header className="w-full">
      <div className="h-1.5 bg-accent" />
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left */}
            <div className="flex items-center gap-4">
              {showBack && (
                <button
                  onClick={() => navigate(-1)}
                  className="w-12 h-12 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary-foreground/30"
                  aria-label="Go back"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center border border-primary-foreground/20">
                  <span className="text-2xl">🏛️</span>
                </div>
                <div>
                  <h1 className="text-kiosk-xl font-bold tracking-tight leading-none">{title}</h1>
                  {subtitle && <p className="text-kiosk-sm text-primary-foreground/70">{subtitle}</p>}
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              {/* Online indicator */}
              {!isOnline && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/20 text-destructive-foreground text-kiosk-xs font-semibold">
                  <WifiOff className="w-4 h-4" />
                  Offline
                </div>
              )}

              {/* Language toggle */}
              <div className="flex items-center bg-primary-foreground/10 rounded-lg overflow-hidden">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => onLanguageChange?.(lang.code)}
                    className={cn(
                      "px-3 py-2 text-kiosk-sm font-semibold transition-colors",
                      language === lang.code
                        ? "bg-accent text-accent-foreground"
                        : "text-primary-foreground/70 hover:text-primary-foreground"
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* Notifications */}
              <button
                onClick={() => navigate("/notifications")}
                className="relative w-12 h-12 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </button>

              {/* Logout */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 h-12 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 text-kiosk-sm font-medium transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export { KioskHeader };
