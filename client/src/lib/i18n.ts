import { useState, useEffect, useCallback } from "react";
import en from "@shared/translations/en.json";
import am from "@shared/translations/am.json";

export type SupportedLanguage = "en" | "am";

const translations: Record<SupportedLanguage, typeof en> = { en, am };

const AMHARIC_BIBLE_CODES = ["ETH"];

export function detectLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return "en";
  
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get("lang");
  if (langParam === "am") return "am";
  if (langParam === "en") return "en";
  
  const bibleTranslation = localStorage.getItem("bibleTranslation");
  if (bibleTranslation && AMHARIC_BIBLE_CODES.includes(bibleTranslation)) {
    return "am";
  }
  
  const browserLang = navigator.language || (navigator as any).languages?.[0] || "en";
  
  if (browserLang.startsWith("am")) {
    return "am";
  }
  
  return "en";
}

export function getDefaultBibleTranslation(): string {
  const lang = detectLanguage();
  return lang === "am" ? "ETH" : "KJV";
}

export function isAmharic(): boolean {
  return detectLanguage() === "am";
}

export function t(key: string): string {
  const lang = detectLanguage();
  const keys = key.split(".");
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  if (!value && lang !== "en") {
    value = translations["en"];
    for (const k of keys) {
      value = value?.[k];
    }
  }
  
  return value || key;
}

export function useTranslation() {
  const [lang, setLang] = useState<SupportedLanguage>(detectLanguage);

  useEffect(() => {
    const update = () => setLang(detectLanguage());

    window.addEventListener("translationChanged", update);
    window.addEventListener("storage", update);
    window.addEventListener("focus", update);
    return () => {
      window.removeEventListener("translationChanged", update);
      window.removeEventListener("storage", update);
      window.removeEventListener("focus", update);
    };
  }, []);

  const translate = useCallback((key: string): string => {
    const keys = key.split(".");
    let value: any = translations[lang];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (!value && lang !== "en") {
      value = translations["en"];
      for (const k of keys) {
        value = value?.[k];
      }
    }
    
    return value || key;
  }, [lang]);

  return {
    t: translate,
    lang,
    isAmharic: lang === "am",
  };
}
