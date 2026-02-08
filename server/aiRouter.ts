import OpenAI from "openai";

const openaiClient = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const geminiClient = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
});

const NON_ENGLISH_TRANSLATIONS = new Set(["ETH", "AMPROT"]);

const LANGUAGE_NAMES: Record<string, string> = {
  "ETH": "Amharic (አማርኛ)",
  "AMPROT": "Amharic (አማርኛ)",
};

export function isNonEnglish(translation: string): boolean {
  return NON_ENGLISH_TRANSLATIONS.has(translation);
}

export function getAIClient(translation: string): OpenAI {
  return isNonEnglish(translation) ? geminiClient : openaiClient;
}

export function getChatModel(translation: string): string {
  return isNonEnglish(translation) ? "gemini-2.5-flash" : "gpt-4o-mini";
}

export function getSearchModel(translation: string): string {
  return isNonEnglish(translation) ? "gemini-2.5-flash" : "gpt-4o";
}

export function getMultilingualInstruction(translation: string): string {
  if (!isNonEnglish(translation)) return "";

  const languageName = LANGUAGE_NAMES[translation] || "the user's language";

  return `\n\nCRITICAL LANGUAGE INSTRUCTION: The user speaks ${languageName}. You MUST respond ENTIRELY in ${languageName} using proper Ge'ez script (ፊደል). Your response must be natural, fluent, and idiomatic ${languageName} — as a native speaker would write it. Do NOT translate word-by-word from English. Use proper ${languageName} grammar, sentence structure, and vocabulary. Keep only proper nouns, Bible book names, verse references, and numbers in their standard English/international format.`;
}

export function getSearchMultilingualInstruction(translation: string): string {
  if (!isNonEnglish(translation)) return "";

  const languageName = LANGUAGE_NAMES[translation] || "the user's language";

  return `\n\nCRITICAL LANGUAGE INSTRUCTION: The user speaks ${languageName}. Translate ONLY the human-readable text values in the JSON (such as "interpretation", "description", "preview", "briefAnswer", "meaning", "context", "suggestedPrompt") into natural, fluent ${languageName} using Ge'ez script (ፊደል). Do NOT translate word-by-word from English — use proper ${languageName} grammar and vocabulary. Keep the JSON structure, keys, "type" values, "reference" values, book names, verse numbers, and all other structural fields in English. You MUST still respond with valid JSON only — no markdown, no extra text.`;
}

export { openaiClient, geminiClient };
