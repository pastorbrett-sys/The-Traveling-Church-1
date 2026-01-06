import type { BibleBook, BibleChapter, BibleVerse, BibleTranslation } from "@shared/models/bible";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOLLS_API = "https://bolls.life";

interface HeadingOverrides {
  removeHeadings: Record<string, string>;
  addHeadings: Record<string, string>;
}

let headingOverrides: HeadingOverrides | null = null;

function loadHeadingOverrides(): HeadingOverrides {
  if (headingOverrides) return headingOverrides;
  
  try {
    const overridesPath = path.join(__dirname, "data/headingOverrides.json");
    const data = JSON.parse(fs.readFileSync(overridesPath, "utf-8"));
    headingOverrides = {
      removeHeadings: data.removeHeadings || {},
      addHeadings: data.addHeadings || {}
    };
    console.log(`Loaded ${Object.keys(headingOverrides.removeHeadings).length} heading overrides`);
  } catch (error) {
    console.error("Failed to load heading overrides:", error);
    headingOverrides = { removeHeadings: {}, addHeadings: {} };
  }
  return headingOverrides;
}

const SUPPORTED_TRANSLATIONS: BibleTranslation[] = [
  { short_name: "KJV", full_name: "King James Version" },
  { short_name: "NIV", full_name: "New International Version (1984)" },
  { short_name: "NIV2011", full_name: "New International Version (2011)" },
  { short_name: "ESV", full_name: "English Standard Version" },
  { short_name: "NLT", full_name: "New Living Translation" },
  { short_name: "NKJV", full_name: "New King James Version" },
  { short_name: "NASB", full_name: "New American Standard Bible" },
  { short_name: "AMP", full_name: "Amplified Bible" },
  { short_name: "MSG", full_name: "The Message" },
];

let booksCache: Map<string, BibleBook[]> = new Map();

export async function getTranslations(): Promise<BibleTranslation[]> {
  return SUPPORTED_TRANSLATIONS;
}

export async function getBooks(translation: string = "KJV"): Promise<BibleBook[]> {
  if (booksCache.has(translation)) {
    return booksCache.get(translation)!;
  }

  try {
    const response = await fetch(`${BOLLS_API}/get-books/${translation}/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch books: ${response.statusText}`);
    }
    const books: BibleBook[] = await response.json();
    booksCache.set(translation, books);
    return books;
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error;
  }
}

export async function getChapter(
  translation: string,
  bookId: number,
  chapter: number
): Promise<BibleChapter> {
  try {
    const response = await fetch(
      `${BOLLS_API}/get-text/${translation}/${bookId}/${chapter}/`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch chapter: ${response.statusText}`);
    }
    const verses: BibleVerse[] = await response.json();
    
    const books = await getBooks(translation);
    const book = books.find(b => b.bookid === bookId);
    
    return {
      book: book?.name || `Book ${bookId}`,
      bookId,
      chapter,
      verses: verses.map(v => ({
        pk: v.pk,
        verse: v.verse,
        text: cleanVerseText(v.text, bookId, chapter, v.verse),
      })),
      translation,
    };
  } catch (error) {
    console.error("Error fetching chapter:", error);
    throw error;
  }
}

export async function getVerse(
  translation: string,
  bookId: number,
  chapter: number,
  verse: number
): Promise<BibleVerse | null> {
  try {
    const response = await fetch(
      `${BOLLS_API}/get-verse/${translation}/${bookId}/${chapter}/${verse}/`
    );
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return {
      pk: data.pk,
      verse: data.verse,
      text: cleanVerseText(data.text, bookId, chapter, data.verse),
      book: bookId,
      chapter,
    };
  } catch (error) {
    console.error("Error fetching verse:", error);
    return null;
  }
}

export async function searchBible(
  translation: string,
  query: string,
  limit: number = 50
): Promise<{ total: number; results: BibleVerse[] }> {
  try {
    const response = await fetch(
      `${BOLLS_API}/v2/find/${translation}?search=${encodeURIComponent(query)}&limit=${limit}&page=1`
    );
    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      total: data.total || 0,
      results: (data.results || []).map((v: any) => ({
        pk: v.pk,
        verse: v.verse,
        text: cleanVerseText(v.text, v.book, v.chapter, v.verse),
        book: v.book,
        chapter: v.chapter,
      })),
    };
  } catch (error) {
    console.error("Error searching Bible:", error);
    throw error;
  }
}

export async function compareTranslations(
  translations: string[],
  bookId: number,
  chapter: number,
  verses: number[]
): Promise<{ translation: string; verses: BibleVerse[] }[]> {
  try {
    const response = await fetch(`${BOLLS_API}/get-parallel-verses/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        translations,
        book: bookId,
        chapter,
        verses,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Compare failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return data.map((translationVerses: any[], index: number) => ({
      translation: translations[index],
      verses: translationVerses.map((v: any, vIndex: number) => ({
        pk: v.pk,
        verse: v.verse,
        text: cleanVerseText(v.text, bookId, chapter, verses[vIndex]),
      })),
    }));
  } catch (error) {
    console.error("Error comparing translations:", error);
    throw error;
  }
}

interface CleanedVerse {
  text: string;
  heading?: string;
}

function cleanVerseText(text: string, bookId?: number, chapter?: number, verse?: number): string {
  const cleaned = cleanVerseWithHeading(text, bookId, chapter, verse);
  if (cleaned.heading) {
    return `§${cleaned.heading}§ ${cleaned.text}`;
  }
  return cleaned.text;
}

function cleanVerseWithHeading(text: string, bookId?: number, chapter?: number, verse?: number): CleanedVerse {
  const overrides = loadHeadingOverrides();
  const verseKey = bookId && chapter && verse ? `${bookId}:${chapter}:${verse}` : null;
  
  let heading: string | undefined;
  let cleaned = text;
  
  // Check for manual heading addition first
  if (verseKey && overrides.addHeadings[verseKey]) {
    heading = overrides.addHeadings[verseKey];
  }
  
  // Pattern 1: Extract heading from <h> or <h1>-<h6> tags
  if (!heading) {
    const hTagMatch = cleaned.match(/<h[1-6]?[^>]*>([^<]+)<\/h[1-6]?>/i);
    if (hTagMatch) {
      heading = hTagMatch[1].trim();
      cleaned = cleaned.replace(/<h[1-6]?[^>]*>[^<]*<\/h[1-6]?>/gi, "");
    }
  }
  
  // Pattern 2: Check for heading as text before first <br/> at start of verse
  if (!heading) {
    const brHeadingMatch = cleaned.match(/^([A-Z][^<]{2,50})<br\s*\/?>/i);
    if (brHeadingMatch) {
      const potentialHeading = brHeadingMatch[1].trim();
      if (potentialHeading.length <= 50 && 
          !potentialHeading.match(/[.!?]$/) &&
          /^[A-Z]/.test(potentialHeading)) {
        // Check if this heading should be removed (false positive)
        if (verseKey && overrides.removeHeadings[verseKey]) {
          // Don't set heading and keep the text intact (don't strip pre-<br/> content)
          // The <br/> will be cleaned to a space later, preserving the full verse
        } else {
          heading = potentialHeading;
          cleaned = cleaned.replace(/^[^<]+<br\s*\/?>/i, "");
        }
      }
    }
  }
  
  // Pattern 3: Check for <pb> (paragraph break with title) tags
  if (!heading) {
    const pbMatch = cleaned.match(/<pb[^>]*>([^<]+)<\/pb>/i);
    if (pbMatch) {
      heading = pbMatch[1].trim();
      cleaned = cleaned.replace(/<pb[^>]*>[^<]*<\/pb>/gi, "");
    }
  }
  
  // Handle self-closing tags and ensure spacing
  cleaned = cleaned.replace(/<br\s*\/?>/gi, " ");
  cleaned = cleaned.replace(/<\/[^>]+>/g, " ");
  cleaned = cleaned.replace(/<[^>]*>/g, "");
  
  // Clean up numbers that look like Strong's references
  cleaned = cleaned.replace(/(\D)(\d{2,5})(?=[\s,.:;!?'")\]]|$)/g, "$1");
  
  // Collapse multiple spaces
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  
  return { text: cleaned, heading };
}
