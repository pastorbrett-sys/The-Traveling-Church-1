import * as fs from "fs";
import * as path from "path";
import OpenAI from "openai";

const AMHARIC_DIR = path.join(process.cwd(), "server/data/ethiopian-orthodox");
const ENGLISH_DIR = path.join(process.cwd(), "server/data/ethiopian-orthodox-english");

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface EthiopianOrthodoxBook {
  book_number: number;
  book_name_am: string;
  book_short_name_am: string;
  book_name_en: string;
  book_short_name_en: string;
  testament: "old" | "new";
  chapters: Array<{
    chapter: number;
    sections: Array<{
      title: string;
      verses: Array<{
        verse: number;
        text: string;
      }>;
    }>;
  }>;
}

async function translateText(amharicText: string): Promise<string> {
  if (!amharicText || amharicText.trim() === "") return "";
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a biblical translator. Translate the following Amharic biblical text to English. Preserve the reverent, formal tone appropriate for scripture. Only return the translated text, nothing else."
        },
        {
          role: "user",
          content: amharicText
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });
    
    return response.choices[0]?.message?.content?.trim() || amharicText;
  } catch (error) {
    console.error("Translation error:", error);
    return amharicText;
  }
}

async function translateBatch(texts: string[]): Promise<string[]> {
  const batchText = texts.map((t, i) => `[${i}] ${t}`).join("\n---\n");
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a biblical translator. Translate the following Amharic biblical verses to English. Each verse is marked with [number]. Preserve the reverent, formal tone appropriate for scripture. Return translations in the same format: [number] translated text. Keep each translation on its own line separated by ---`
        },
        {
          role: "user",
          content: batchText
        }
      ],
      temperature: 0.3,
      max_tokens: 4000
    });
    
    const result = response.choices[0]?.message?.content?.trim() || "";
    const translations = result.split("---").map(t => {
      const match = t.match(/\[\d+\]\s*(.*)/s);
      return match ? match[1].trim() : t.trim();
    });
    
    return translations.length === texts.length ? translations : texts;
  } catch (error) {
    console.error("Batch translation error:", error);
    return texts;
  }
}

async function translateBook(filename: string): Promise<void> {
  const inputPath = path.join(AMHARIC_DIR, filename);
  const outputPath = path.join(ENGLISH_DIR, filename);
  
  if (fs.existsSync(outputPath)) {
    console.log(`Skipping ${filename} - already translated`);
    return;
  }
  
  console.log(`Translating ${filename}...`);
  
  const book: EthiopianOrthodoxBook = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
  
  let totalVerses = 0;
  let translatedVerses = 0;
  
  for (const chapter of book.chapters) {
    for (const section of chapter.sections) {
      if (section.title) {
        section.title = await translateText(section.title);
      }
      
      const verseTexts = section.verses.map(v => v.text);
      totalVerses += verseTexts.length;
      
      const BATCH_SIZE = 10;
      for (let i = 0; i < verseTexts.length; i += BATCH_SIZE) {
        const batch = verseTexts.slice(i, i + BATCH_SIZE);
        const translated = await translateBatch(batch);
        
        for (let j = 0; j < translated.length; j++) {
          section.verses[i + j].text = translated[j];
          translatedVerses++;
        }
        
        console.log(`  ${book.book_name_en} Chapter ${chapter.chapter}: ${translatedVerses}/${totalVerses} verses`);
      }
    }
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(book, null, 2));
  console.log(`Completed ${filename} - ${translatedVerses} verses translated`);
}

async function main() {
  if (!fs.existsSync(ENGLISH_DIR)) {
    fs.mkdirSync(ENGLISH_DIR, { recursive: true });
  }
  
  const files = fs.readdirSync(AMHARIC_DIR).filter(f => f.endsWith(".json")).sort();
  
  console.log(`Found ${files.length} books to translate`);
  
  for (const file of files) {
    try {
      await translateBook(file);
    } catch (error) {
      console.error(`Failed to translate ${file}:`, error);
    }
  }
  
  console.log("Translation complete!");
}

main().catch(console.error);
