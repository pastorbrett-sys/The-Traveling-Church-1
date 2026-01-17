import { SupportedLanguage } from "./translations";

const ARABIC_COUNTRIES = [
  "SA", // Saudi Arabia
  "AE", // UAE
  "EG", // Egypt
  "IQ", // Iraq
  "JO", // Jordan
  "KW", // Kuwait
  "LB", // Lebanon
  "LY", // Libya
  "MA", // Morocco
  "OM", // Oman
  "PS", // Palestine
  "QA", // Qatar
  "SD", // Sudan
  "SY", // Syria
  "TN", // Tunisia
  "YE", // Yemen
  "BH", // Bahrain
  "DZ", // Algeria
];

const AMHARIC_COUNTRIES = [
  "ET", // Ethiopia
];

export function getLanguageFromCountryCode(countryCode: string): SupportedLanguage | null {
  const code = countryCode.toUpperCase();
  
  if (AMHARIC_COUNTRIES.includes(code)) {
    return "am";
  }
  
  if (ARABIC_COUNTRIES.includes(code)) {
    return "ar";
  }
  
  return null;
}

export async function detectLocationLanguage(): Promise<SupportedLanguage | null> {
  try {
    const response = await fetch("https://ipapi.co/json/", { 
      signal: AbortSignal.timeout(5000) 
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    const countryCode = data.country_code;
    
    if (countryCode) {
      return getLanguageFromCountryCode(countryCode);
    }
    
    return null;
  } catch {
    return null;
  }
}

export async function getInitialLanguage(): Promise<SupportedLanguage> {
  const stored = localStorage.getItem("appLanguage");
  if (stored === "en" || stored === "am" || stored === "ar") {
    return stored;
  }
  
  const detected = await detectLocationLanguage();
  if (detected) {
    localStorage.setItem("appLanguage", detected);
    return detected;
  }
  
  return "en";
}
