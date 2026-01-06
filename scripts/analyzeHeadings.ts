import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";

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

  const prompt = `Analyze these detected "headings" from the Bible text. Each was extracted because it appeared before a line break (<br/>) at the start of a verse.

Determine which are TRUE section headings vs FALSE POSITIVES (just paragraph text that happened to be before a break).

TRUE section headings in the Bible typically:
- Are thematic titles like "The Beatitudes", "David's Prayer", "Warnings Against Folly"
- Are Psalm superscriptions like "A Psalm of David", "For the director of music"
- Are book section titles like "Proverbs of Solomon", "Words of the Wise"
- Name a section theme or speaker

FALSE POSITIVES are typically:
- The beginning of regular verse text that just starts with a capital letter
- Partial sentences or verse beginnings
- Numbered references like "Psalm 1" when it's not a superscription
- Text that reads as part of the narrative/poetry rather than a title

DETECTED HEADINGS:
${headingsList}

Return ONLY the numbers of the FALSE POSITIVES (ones that should NOT be headings), comma-separated.
Example response: 2, 5, 8, 12
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
  
  const priorityBooks = [
    "Psalms", "Proverbs", "Ecclesiastes", 
    "Genesis", "Exodus", "Isaiah", "Jeremiah", "Ezekiel",
    "Matthew", "Mark", "Luke", "John", "Acts", "Romans",
    "1 Corinthians", "2 Corinthians", "Hebrews", "Revelation"
  ];
  
  const sortedBooks = books.sort((a, b) => {
    const aIndex = priorityBooks.indexOf(a.name);
    const bIndex = priorityBooks.indexOf(b.name);
    if (aIndex >= 0 && bIndex >= 0) return aIndex - bIndex;
    if (aIndex >= 0) return -1;
    if (bIndex >= 0) return 1;
    return 0;
  });

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
