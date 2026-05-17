import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "@/app/shared/i18n";

const LANG_SHORT: Record<string, string> = {
  en: "EN",
  uk: "UA",
  es: "ES",
};

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language?.split("-")[0] ?? "en";

  return (
    <div className="flex items-center rounded-lg overflow-hidden border border-border">
      {SUPPORTED_LANGUAGES.map((lang, idx) => {
        const isActive = current === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => void i18n.changeLanguage(lang.code)}
            title={lang.label}
            aria-label={lang.label}
            aria-pressed={isActive}
            className={[
              "px-2 py-1 transition-colors cursor-pointer select-none",
              idx !== 0 ? "border-l border-border" : "",
              isActive
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground bg-transparent",
            ].join(" ")}
          >
            {LANG_SHORT[lang.code] ?? lang.code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
