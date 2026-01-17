import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { 
  SupportedLanguage, 
  translations, 
  isRTL, 
  getLanguageDirection 
} from "@/lib/translations";
import { detectLocationLanguage } from "@/lib/gps-language";

type TranslationType = typeof translations.en;

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationType;
  isRTL: boolean;
  direction: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const LANGUAGE_STORAGE_KEY = "appLanguage";

function isValidLanguage(lang: string | null): lang is SupportedLanguage {
  return lang === "en" || lang === "am" || lang === "ar";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isValidLanguage(stored)) {
      return stored;
    }
    return "en";
  });
  
  const languageRef = useRef(language);
  languageRef.current = language;

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    window.dispatchEvent(new CustomEvent("languageChanged", { detail: lang }));
  };

  useEffect(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (!stored) {
      detectLocationLanguage().then((detected) => {
        if (detected && detected !== languageRef.current) {
          setLanguage(detected);
        }
      });
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (isValidLanguage(stored) && stored !== languageRef.current) {
        setLanguageState(stored);
      }
    };

    const handleLanguageChange = (e: CustomEvent) => {
      const newLang = e.detail;
      if (isValidLanguage(newLang)) {
        setLanguageState(newLang);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);
    window.addEventListener("languageChanged", handleLanguageChange as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
      window.removeEventListener("languageChanged", handleLanguageChange as EventListener);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dir = getLanguageDirection(language);
    document.documentElement.lang = language;
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language] as TranslationType,
    isRTL: isRTL(language),
    direction: getLanguageDirection(language),
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function useTranslation() {
  const { t, language, isRTL, direction } = useLanguage();
  return { t, language, isRTL, direction };
}
