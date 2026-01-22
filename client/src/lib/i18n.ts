import en from "@shared/translations/en.json";
import am from "@shared/translations/am.json";

export type SupportedLanguage = "en" | "am";

const translations: Record<SupportedLanguage, typeof en> = { en, am };

export function detectLanguage(): SupportedLanguage {
  if (typeof navigator === "undefined") return "en";
  
  const browserLang = navigator.language || (navigator as any).languages?.[0] || "en";
  
  if (browserLang.startsWith("am")) {
    return "am";
  }
  
  return "en";
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
  const lang = detectLanguage();
  
  return {
    t,
    lang,
    isAmharic: lang === "am",
  };
}
