import OpenAI from "openai";

const openaiClient = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const LANGUAGE_NAMES: Record<string, string> = {
  am: "Amharic (አማርኛ)",
  es: "Spanish",
  fr: "French",
  sw: "Swahili",
  pt: "Portuguese",
  ar: "Arabic",
  ko: "Korean",
  zh: "Chinese (Simplified)",
};

const NOTIFICATION_TITLES: Record<string, { daily: string; weekly: string }> = {
  am: { daily: "🌅 የዕለት ጥቅስ", weekly: "✨ የሳምንት ጥቅስ" },
  en: { daily: "🌅 Verse of the Day", weekly: "✨ Verse of the Week" },
};

export function getNotificationTitle(
  language: string,
  type: "verse_of_day" | "verse_of_week"
): string {
  const key = type === "verse_of_day" ? "daily" : "weekly";
  if (NOTIFICATION_TITLES[language]) {
    return NOTIFICATION_TITLES[language][key];
  }
  return NOTIFICATION_TITLES["en"][key];
}

export function addNotificationTitles(
  language: string,
  daily: string,
  weekly: string
): void {
  NOTIFICATION_TITLES[language] = { daily, weekly };
}

interface TranslatedNotification {
  verseText: string;
  notificationText: string;
  verseRef: string;
}

const translationCache = new Map<string, TranslatedNotification>();

export async function translateNotificationToLanguage(
  verseText: string,
  notificationText: string,
  verseRef: string,
  language: string
): Promise<TranslatedNotification> {
  if (language === "en") {
    return { verseText, notificationText, verseRef };
  }

  const cacheKey = `${language}:${verseRef}:${verseText.substring(0, 50)}`;
  const cached = translationCache.get(cacheKey);
  if (cached) {
    console.log(`[Translation] Cache hit for ${language}: ${verseRef}`);
    return cached;
  }

  const languageName = LANGUAGE_NAMES[language] || language;

  try {
    const response = await openaiClient.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `You are a Bible verse translator. Translate the given Bible verse and notification text into ${languageName}. 
Keep the translation faithful to the original meaning while using natural, fluent ${languageName}.
Also translate the verse reference (book name) into ${languageName}.
Also translate "Verse of the Day" and "Verse of the Week" into ${languageName}.

Respond ONLY with valid JSON:
{
  "verseText": "translated full verse text",
  "notificationText": "translated short notification text (under 100 chars)",
  "verseRef": "translated verse reference (e.g. book name in target language + chapter:verse)",
  "dailyTitle": "Verse of the Day in ${languageName}",
  "weeklyTitle": "Verse of the Week in ${languageName}"
}`,
        },
        {
          role: "user",
          content: `Translate to ${languageName}:
Verse: ${verseText}
Short text: ${notificationText}
Reference: ${verseRef}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(content);
    const result: TranslatedNotification = {
      verseText: parsed.verseText || verseText,
      notificationText:
        (parsed.notificationText || notificationText).substring(0, 100),
      verseRef: parsed.verseRef || verseRef,
    };

    if (parsed.dailyTitle && parsed.weeklyTitle && !NOTIFICATION_TITLES[language]) {
      addNotificationTitles(
        language,
        `🌅 ${parsed.dailyTitle}`,
        `✨ ${parsed.weeklyTitle}`
      );
      console.log(`[Translation] Cached notification titles for ${languageName}: daily="${parsed.dailyTitle}", weekly="${parsed.weeklyTitle}"`);
    }

    translationCache.set(cacheKey, result);

    if (translationCache.size > 500) {
      const firstKey = translationCache.keys().next().value;
      if (firstKey) translationCache.delete(firstKey);
    }

    console.log(
      `[Translation] Translated to ${languageName}: "${result.notificationText}" (${result.verseRef})`
    );
    return result;
  } catch (error) {
    console.error(
      `[Translation] Error translating to ${languageName}:`,
      error
    );
    return { verseText, notificationText, verseRef };
  }
}

export async function translateNotificationToAmharic(
  verseText: string,
  notificationText: string,
  verseRef: string
): Promise<TranslatedNotification> {
  return translateNotificationToLanguage(
    verseText,
    notificationText,
    verseRef,
    "am"
  );
}
