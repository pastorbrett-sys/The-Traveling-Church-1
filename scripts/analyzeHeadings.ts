import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOLLS_API = "https://bolls.life";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface BibleBook {
  bookid: number;
  name: string;
  chapters: number;
}

interface BibleVerse {
  pk: number;
  verse: number;
  text: string;
}

interface HeadingOverrides {
  _description: string;
  _format: string;
  removeHeadings: Record<string, string>;
  addHeadings: Record<string, string>;
}

interface DetectedHeading {
  bookId: number;
  bookName: string;
  chapter: number;
  verse: number;
  heading: string;
  context: string;
}

function detectPotentialHeading(text: string): { heading?: string; afterText: string } {
  const brHeadingMatch = text.match(/^([A-Z][^<]{2,50})<br\s*\/?>/i);
  if (brHeadingMatch) {
    const potentialHeading = brHeadingMatch[1].trim();
    if (potentialHeading.length <= 50 && 
        !potentialHeading.match(/[.!?]$/) &&
        /^[A-Z]/.test(potentialHeading)) {
      const afterText = text.replace(/^[^<]+<br\s*\/?>/i, "")
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
      return { heading: potentialHeading, afterText };
    }
  }
  return { afterText: text.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() };
}

async function getBooks(translation: string = "NIV"): Promise<BibleBook[]> {
  const response = await fetch(`${BOLLS_API}/get-books/${translation}/`);
  if (!response.ok) throw new Error(`Failed to fetch books`);
  return response.json();
}

async function getChapter(translation: string, bookId: number, chapter: number): Promise<BibleVerse[]> {
  const response = await fetch(`${BOLLS_API}/get-text/${translation}/${bookId}/${chapter}/`);
  if (!response.ok) throw new Error(`Failed to fetch chapter`);
  return response.json();
}

async function analyzeHeadingsWithAI(headings: DetectedHeading[]): Promise<string[]> {
  if (headings.length === 0) return [];
  
  const headingsList = headings.map((h, i) => 
    `${i + 1}. "${h.heading}" (${h.bookName} ${h.chapter}:${h.verse}) - Context: "${h.context.substring(0, 100)}..."`
  ).join("\n");

  const prompt = `Analyze these detected "headings" from Bible text. Each was extracted because it appeared before a line break at the start of a verse.

BE VERY STRICT. Most of these are FALSE POSITIVES (regular verse text, not headings).

TRUE HEADINGS (very rare) are ONLY:
- Psalm superscriptions: "A Psalm of David", "For the director of music", "A maskil", "A prayer of Moses"
- Book section dividers: "Proverbs of Solomon", "The words of Agur", "Sayings of the Wise"  
- Major thematic section titles (very rare): "The Sermon on the Mount", "The Ten Commandments"

FALSE POSITIVES (most entries) are:
- ANY regular verse text that starts with a capital letter
- Partial sentences like "They will be a garland to grace your head"
- Poetic lines like "Blessed is the man", "The Lord is my shepherd"
- Commands, statements, or narrative text
- Anything that reads as CONTENT rather than a TITLE

When in doubt, mark it as FALSE POSITIVE. Only keep obvious, traditional section headings.

DETECTED HEADINGS:
${headingsList}

Return ONLY the numbers of the FALSE POSITIVES (ones that should NOT be headings), comma-separated.
Example response: 1, 2, 3, 5, 6, 7, 8, 10
If all are true headings, respond with: NONE`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert in Biblical text structure and formatting. Analyze heading detection accuracy." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content?.trim() || "";
    if (response === "NONE" || response.toLowerCase().includes("none")) {
      return [];
    }
    
    const falsePositiveIndices = response.match(/\d+/g)?.map(n => parseInt(n) - 1) || [];
    return falsePositiveIndices
      .filter(i => i >= 0 && i < headings.length)
      .map(i => `${headings[i].bookId}:${headings[i].chapter}:${headings[i].verse}`);
  } catch (error) {
    console.error("AI analysis error:", error);
    return [];
  }
}

async function main() {
  console.log("Starting Bible heading analysis...");
  
  const overridesPath = path.join(__dirname, "../server/data/headingOverrides.json");
  let overrides: HeadingOverrides = JSON.parse(fs.readFileSync(overridesPath, "utf-8"));
  
  const books = await getBooks("NIV");
  console.log(`Found ${books.length} books`);
  
  // Process ALL books in order
  const sortedBooks = books;

  let totalHeadings = 0;
  let totalFalsePositives = 0;
  const batchSize = 30;

  for (const book of sortedBooks) {
    console.log(`\nAnalyzing ${book.name} (${book.chapters} chapters)...`);
    let bookHeadings: DetectedHeading[] = [];
    
    for (let chapter = 1; chapter <= book.chapters; chapter++) {
      try {
        const verses = await getChapter("NIV", book.bookid, chapter);
        
        for (const verse of verses) {
          const key = `${book.bookid}:${chapter}:${verse.verse}`;
          if (overrides.removeHeadings[key]) continue;
          
          const detected = detectPotentialHeading(verse.text);
          if (detected.heading) {
            bookHeadings.push({
              bookId: book.bookid,
              bookName: book.name,
              chapter,
              verse: verse.verse,
              heading: detected.heading,
              context: detected.afterText
            });
          }
        }
        
        await new Promise(r => setTimeout(r, 50));
      } catch (error) {
        console.error(`Error fetching ${book.name} ${chapter}:`, error);
      }
    }
    
    totalHeadings += bookHeadings.length;
    console.log(`  Found ${bookHeadings.length} potential headings`);
    
    for (let i = 0; i < bookHeadings.length; i += batchSize) {
      const batch = bookHeadings.slice(i, i + batchSize);
      console.log(`  Analyzing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(bookHeadings.length / batchSize)}...`);
      
      const falsePositives = await analyzeHeadingsWithAI(batch);
      totalFalsePositives += falsePositives.length;
      
      for (const key of falsePositives) {
        const heading = batch.find(h => `${h.bookId}:${h.chapter}:${h.verse}` === key);
        if (heading) {
          overrides.removeHeadings[key] = heading.heading;
          console.log(`    ❌ FALSE: "${heading.heading}" (${heading.bookName} ${heading.chapter}:${heading.verse})`);
        }
      }
      
      await new Promise(r => setTimeout(r, 500));
    }
    
    fs.writeFileSync(overridesPath, JSON.stringify(overrides, null, 2));
  }
  
  console.log(`\n========================================`);
  console.log(`Analysis complete!`);
  console.log(`Total headings analyzed: ${totalHeadings}`);
  console.log(`False positives identified: ${totalFalsePositives}`);
  console.log(`Overrides saved to: ${overridesPath}`);
}

main().catch(console.error);
