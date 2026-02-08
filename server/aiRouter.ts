import OpenAI from "openai";

const openaiClient = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const GEMINI_BASE_URL = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || "";

const NON_ENGLISH_TRANSLATIONS = new Set(["ETH", "AMPROT"]);

const LANGUAGE_NAMES: Record<string, string> = {
  "ETH": "Amharic (አማርኛ)",
  "AMPROT": "Amharic (አማርኛ)",
};

export function isNonEnglish(translation: string): boolean {
  return NON_ENGLISH_TRANSLATIONS.has(translation);
}

export function getAIClient(translation: string): OpenAI {
  return openaiClient;
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

interface GeminiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function geminiGenerateContent(
  model: string,
  messages: GeminiMessage[],
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const systemMessage = messages.find(m => m.role === "system");
  const chatMessages = messages.filter(m => m.role !== "system");

  const contents = chatMessages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const body: any = {
    contents,
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 4096,
      thinkingConfig: { thinkingBudget: 0 },
    },
  };

  if (systemMessage) {
    body.systemInstruction = { parts: [{ text: systemMessage.content }] };
  }

  const url = `${GEMINI_BASE_URL}/models/${model}:generateContent`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export async function* geminiStreamContent(
  model: string,
  messages: GeminiMessage[],
  options: { temperature?: number; maxTokens?: number } = {}
): AsyncGenerator<string> {
  const systemMessage = messages.find(m => m.role === "system");
  const chatMessages = messages.filter(m => m.role !== "system");

  const contents = chatMessages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const body: any = {
    contents,
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 4096,
      thinkingConfig: { thinkingBudget: 0 },
    },
  };

  if (systemMessage) {
    body.systemInstruction = { parts: [{ text: systemMessage.content }] };
  }

  const url = `${GEMINI_BASE_URL}/models/${model}:streamGenerateContent?alt=sse`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6));
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (text) yield text;
        } catch {}
      }
    }
  }
}

export { openaiClient };
