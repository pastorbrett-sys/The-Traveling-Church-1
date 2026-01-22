# 🌍 Localization & Language Support

> Device-based language detection for a seamless multilingual experience

---

## 🎯 The Approach

We use **device language**, not GPS or IP location. This ensures:
- A US tourist in Ethiopia sees English (their phone is set to English)
- An Ethiopian user sees Amharic (their phone is set to Amharic)
- An Ethiopian who prefers English sees English (their phone is set to English)

No popups, no language pickers, no friction. It just works.

---

## 🌐 Supported Languages

| Language | Code | Where It's Used |
|----------|------|-----------------|
| English | `en` | Default for all users |
| Amharic | `am` | Ethiopian users |

Future languages can be added following the same pattern.

---

## 📱 What Changes by Language

### Landing Page

| English | Amharic |
|---------|---------|
| "Your AI Bible Companion" | "የእርስዎ AI መጽሐፍ ቅዱስ ጓደኛ" |
| "Explore the Word" | "ቃሉን ያስሱ" |
| All hero text, CTAs, descriptions | Full Amharic translations |

### Default Bible Version

| Language | Default Bible |
|----------|---------------|
| English | KJV (or current default) |
| Amharic | Ethiopian Orthodox Bible |

When an Amharic user enters the app for the first time, they land directly in the Ethiopian Orthodox Bible - no extra taps needed.

### Onboarding Tooltips

| English | Amharic |
|---------|---------|
| "Choose your Bible version" | "የመጽሐፍ ቅዱስ ትርጉም ይምረጡ" |
| "Tap any verse for insights" | "ለማስተዋል ማንኛውንም ጥቅስ ይንኩ" |
| "Your AI study companion" | "የእርስዎ AI የጥናት ጓደኛ" |

---

## 🔍 Detection Logic

```
1. Check navigator.language (browser/WebView)
2. If starts with "am" → Amharic
3. Otherwise → English (default)
```

That's it. Simple and reliable.

---

## ⚡ Performance

**Zero impact on load time:**
- No API calls to detect location
- No external language detection services
- No delay waiting for GPS
- Just a simple string check on page load

**How it works:**
- Landing page checks language on initial render
- Correct content renders immediately
- No flash of wrong language

---

## 🧪 Testing

**On Chrome (desktop):**
1. Open DevTools → Three dots menu → More tools → Sensors
2. Under "Location", find language settings
3. Or: chrome://settings/languages → Add Amharic, move to top

**On Firefox:**
1. Type `about:config` in address bar
2. Search `intl.accept_languages`
3. Change to `am, en` for Amharic first

**On Safari:**
1. System Preferences → Language & Region
2. Add Amharic, drag to top
3. Restart Safari

**On iOS Simulator:**
1. Settings → General → Language & Region
2. Add Amharic, set as primary

**On Android Emulator:**
1. Settings → System → Languages
2. Add Amharic, drag to top

---

## 🔮 Future Languages

To add a new language:

1. Add translations to the translations file
2. Update the detection logic to recognize the language code
3. (Optional) Set a default Bible version for that language
4. Test with device language set to that language

---

---

# 🔧 Technical Implementation

> Everything below is for building. Skip if you just wanted the overview!

---

## 📁 File Structure

```
client/src/
├── lib/
│   └── i18n.ts                 # Language detection + translations
├── pages/
│   └── landing.tsx             # Uses translations for content
├── components/
│   └── bible-reader.tsx        # Sets default Bible based on language

shared/
└── translations/
    ├── en.json                 # English strings
    └── am.json                 # Amharic strings
```

---

## 🔤 Language Detection Utility

```typescript
// client/src/lib/i18n.ts

export type SupportedLanguage = 'en' | 'am';

export function detectLanguage(): SupportedLanguage {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  
  // Check for Amharic
  if (browserLang.startsWith('am')) {
    return 'am';
  }
  
  // Default to English
  return 'en';
}

export function isAmharic(): boolean {
  return detectLanguage() === 'am';
}
```

---

## 📝 Translation Files

```json
// shared/translations/en.json
{
  "landing": {
    "hero_title": "Your AI Bible Companion",
    "hero_subtitle": "Explore the Word with intelligent insights",
    "cta_start": "Start Reading",
    "cta_learn": "Learn More"
  },
  "onboarding": {
    "translation_tooltip": "Choose your Bible version",
    "verse_tooltip": "Tap any verse for insights",
    "action_bar_tooltip": "Your AI study companion"
  }
}
```

```json
// shared/translations/am.json
{
  "landing": {
    "hero_title": "የእርስዎ AI መጽሐፍ ቅዱስ ጓደኛ",
    "hero_subtitle": "በብልህ ግንዛቤዎች ቃሉን ያስሱ",
    "cta_start": "ማንበብ ጀምር",
    "cta_learn": "ተጨማሪ እወቅ"
  },
  "onboarding": {
    "translation_tooltip": "የመጽሐፍ ቅዱስ ትርጉም ይምረጡ",
    "verse_tooltip": "ለማስተዋል ማንኛውንም ጥቅስ ይንኩ",
    "action_bar_tooltip": "የእርስዎ AI የጥናት ጓደኛ"
  }
}
```

---

## 🪝 Translation Hook

```typescript
// client/src/lib/i18n.ts

import en from '@shared/translations/en.json';
import am from '@shared/translations/am.json';

const translations = { en, am };

export function useTranslation() {
  const lang = detectLanguage();
  
  function t(key: string): string {
    const keys = key.split('.');
    let value: any = translations[lang];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    // Fallback to English if translation missing
    if (!value) {
      value = translations['en'];
      for (const k of keys) {
        value = value?.[k];
      }
    }
    
    return value || key;
  }
  
  return { t, lang, isAmharic: lang === 'am' };
}
```

---

## 📖 Default Bible Selection

```typescript
// In bible-reader.tsx or a dedicated hook

import { isAmharic } from '@/lib/i18n';

function getDefaultBibleVersion(): string {
  // Check if user has a saved preference first
  const savedVersion = localStorage.getItem('preferredBibleVersion');
  if (savedVersion) return savedVersion;
  
  // Otherwise, use language-based default
  if (isAmharic()) {
    return 'ethiopian-orthodox'; // or whatever the ID is
  }
  
  return 'kjv'; // English default
}
```

---

## 🖥️ Landing Page Integration

```typescript
// In landing.tsx

import { useTranslation } from '@/lib/i18n';

export default function Landing() {
  const { t, isAmharic } = useTranslation();
  
  return (
    <div className={isAmharic ? 'font-amharic' : ''}>
      <h1>{t('landing.hero_title')}</h1>
      <p>{t('landing.hero_subtitle')}</p>
      <Button>{t('landing.cta_start')}</Button>
    </div>
  );
}
```

---

## 🔤 Amharic Font Support

```css
/* In index.css or global styles */

@font-face {
  font-family: 'Nyala';
  src: url('/fonts/nyala.ttf') format('truetype');
  font-display: swap;
}

.font-amharic {
  font-family: 'Nyala', 'Noto Sans Ethiopic', sans-serif;
}
```

Or use Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

## ✅ Implementation Checklist

- [ ] Create language detection utility (`client/src/lib/i18n.ts`)
- [ ] Create translation files (en.json, am.json)
- [ ] Build useTranslation hook
- [ ] Add Amharic font (Noto Sans Ethiopic or Nyala)
- [ ] Update landing page to use translations
- [ ] Set default Bible based on language
- [ ] Integrate with onboarding tooltips (use translations)
- [ ] Test with English browser language
- [ ] Test with Amharic browser language
- [ ] Verify no performance impact on page load
