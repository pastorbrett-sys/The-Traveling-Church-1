import type { BibleBook, BibleChapter, BibleVerse, BibleTranslation } from "@shared/models/bible";

const HELLOAO_API = "https://bible.helloao.org/api";

interface HelloaoTranslation {
  id: string;
  name: string;
  shortName: string;
  englishName: string;
}

interface HelloaoBook {
  id: string;
  translationId: string;
  name: string;
  commonName: string;
  order: number;
  numberOfChapters: number;
}

interface HelloaoChapterContent {
  type: "heading" | "verse" | "line_break" | "hebrew_subtitle";
  number?: number;
  content?: Array<string | { text?: string; poem?: number; noteId?: number; lineBreak?: boolean }>;
}

interface HelloaoChapter {
  number: number;
  content: HelloaoChapterContent[];
}

const TRANSLATION_MAPPING: Record<string, { apiId: string; shortName: string; fullName: string }> = {
  "KJV": { apiId: "eng_kjv", shortName: "KJV", fullName: "King James Version" },
  "BSB": { apiId: "BSB", shortName: "BSB", fullName: "Berean Standard Bible" },
  "WEB": { apiId: "ENGWEBP", shortName: "WEB", fullName: "World English Bible" },
  "ASV": { apiId: "eng_asv", shortName: "ASV", fullName: "American Standard Version" },
};

export const SUPPORTED_TRANSLATIONS: BibleTranslation[] = Object.values(TRANSLATION_MAPPING).map(t => ({
  short_name: t.shortName,
  full_name: t.fullName,
}));

let booksCache: Map<string, BibleBook[]> = new Map();

export async function getTranslations(): Promise<BibleTranslation[]> {
  return SUPPORTED_TRANSLATIONS;
}

function getApiId(translation: string): string {
  return TRANSLATION_MAPPING[translation]?.apiId || TRANSLATION_MAPPING["KJV"].apiId;
}

export async function getBooks(translation: string = "KJV"): Promise<BibleBook[]> {
  if (booksCache.has(translation)) {
    return booksCache.get(translation)!;
  }

  const apiId = getApiId(translation);
  
  try {
    const response = await fetch(`${HELLOAO_API}/${apiId}/books.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch books: ${response.statusText}`);
    }
    const data = await response.json();
    const books: BibleBook[] = data.books.map((book: HelloaoBook) => ({
      bookid: book.order,
      name: book.commonName || book.name,
      chapters: book.numberOfChapters,
    }));
    booksCache.set(translation, books);
    return books;
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error;
  }
}

const BOOK_CODES = [
  "", "GEN", "EXO", "LEV", "NUM", "DEU", "JOS", "JDG", "RUT", "1SA", "2SA",
  "1KI", "2KI", "1CH", "2CH", "EZR", "NEH", "EST", "JOB", "PSA", "PRO",
  "ECC", "SNG", "ISA", "JER", "LAM", "EZK", "DAN", "HOS", "JOL", "AMO",
  "OBA", "JON", "MIC", "NAM", "HAB", "ZEP", "HAG", "ZEC", "MAL",
  "MAT", "MRK", "LUK", "JHN", "ACT", "ROM", "1CO", "2CO", "GAL", "EPH",
  "PHP", "COL", "1TH", "2TH", "1TI", "2TI", "TIT", "PHM", "HEB", "JAS",
  "1PE", "2PE", "1JN", "2JN", "3JN", "JUD", "REV"
];

function getBookCode(bookId: number): string {
  return BOOK_CODES[bookId] || "GEN";
}

export interface RichVerseContent {
  pk: number;
  verse: number;
  text: string;
  heading?: string;
  isPoetry?: boolean;
  poetryLines?: Array<{ text: string; indent: number }>;
}

export async function getChapter(
  translation: string,
  bookId: number,
  chapter: number
): Promise<BibleChapter> {
  const apiId = getApiId(translation);
  const bookCode = getBookCode(bookId);
  
  try {
    const response = await fetch(`${HELLOAO_API}/${apiId}/${bookCode}/${chapter}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch chapter: ${response.statusText}`);
    }
    const data = await response.json();
    const chapterData: HelloaoChapter = data.chapter;
    
    const books = await getBooks(translation);
    const book = books.find(b => b.bookid === bookId);
    
    const verses: RichVerseContent[] = [];
    let currentHeading: string | undefined;
    
    for (const item of chapterData.content) {
      if (item.type === "heading") {
        currentHeading = extractTextContent(item.content);
      } else if (item.type === "hebrew_subtitle") {
        currentHeading = extractTextContent(item.content);
      } else if (item.type === "verse" && item.number !== undefined) {
        const { text, isPoetry, poetryLines } = processVerseContent(item.content || []);
        
        const verse: RichVerseContent = {
          pk: item.number,
          verse: item.number,
          text: currentHeading ? `§${currentHeading}§ ${text}` : text,
          heading: currentHeading,
          isPoetry,
          poetryLines,
        };
        
        verses.push(verse);
        currentHeading = undefined;
      }
    }
    
    return {
      book: book?.name || `Book ${bookId}`,
      bookId,
      chapter,
      verses: verses.map(v => ({
        pk: v.pk,
        verse: v.verse,
        text: v.text,
      })),
      translation,
    };
  } catch (error) {
    console.error("Error fetching chapter:", error);
    throw error;
  }
}

function extractTextContent(content: HelloaoChapterContent["content"]): string {
  if (!content) return "";
  return content
    .map(item => {
      if (typeof item === "string") return item;
      if (item.text) return item.text;
      return "";
    })
    .filter(Boolean)
    .join(" ")
    .trim();
}

function processVerseContent(content: HelloaoChapterContent["content"]): {
  text: string;
  isPoetry: boolean;
  poetryLines: Array<{ text: string; indent: number }>;
} {
  if (!content) return { text: "", isPoetry: false, poetryLines: [] };
  
  const poetryLines: Array<{ text: string; indent: number }> = [];
  let hasPoetry = false;
  
  for (const item of content) {
    if (typeof item === "string") {
      const cleanText = item.replace(/^¶\s*/, "").trim();
      if (cleanText) {
        poetryLines.push({ text: cleanText, indent: 0 });
      }
    } else if (item.text) {
      if (item.poem !== undefined) {
        hasPoetry = true;
        poetryLines.push({ text: item.text.trim(), indent: item.poem });
      } else {
        poetryLines.push({ text: item.text.trim(), indent: 0 });
      }
    } else if (item.lineBreak) {
      poetryLines.push({ text: "", indent: 0 });
    }
  }
  
  const text = poetryLines.filter(l => l.text).map(l => l.text).join(" ");
  
  return { text, isPoetry: hasPoetry, poetryLines };
}

export async function getVerse(
  translation: string,
  bookId: number,
  chapter: number,
  verse: number
): Promise<BibleVerse | null> {
  try {
    const chapterData = await getChapter(translation, bookId, chapter);
    const verseData = chapterData.verses.find(v => v.verse === verse);
    
    if (!verseData) {
      return null;
    }
    
    return {
      pk: verseData.pk,
      verse: verseData.verse,
      text: verseData.text,
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
  const lowerQuery = query.toLowerCase();
  const results: BibleVerse[] = [];
  const books = await getBooks(translation);
  
  for (const book of books) {
    if (results.length >= limit) break;
    
    for (let chapter = 1; chapter <= Math.min(book.chapters, 10); chapter++) {
      if (results.length >= limit) break;
      
      try {
        const chapterData = await getChapter(translation, book.bookid, chapter);
        for (const verse of chapterData.verses) {
          if (verse.text.toLowerCase().includes(lowerQuery)) {
            results.push({
              pk: verse.pk,
              verse: verse.verse,
              text: verse.text,
              book: book.bookid,
              chapter,
            });
            if (results.length >= limit) break;
          }
        }
      } catch {
        continue;
      }
    }
  }
  
  return { total: results.length, results };
}

export async function compareTranslations(
  translations: string[],
  bookId: number,
  chapter: number,
  verses: number[]
): Promise<{ translation: string; verses: BibleVerse[] }[]> {
  const results = await Promise.all(
    translations.map(async (translation) => {
      try {
        const chapterData = await getChapter(translation, bookId, chapter);
        const matchingVerses = chapterData.verses.filter(v => verses.includes(v.verse));
        return {
          translation,
          verses: matchingVerses.map(v => ({
            pk: v.pk,
            verse: v.verse,
            text: v.text,
          })),
        };
      } catch (error) {
        console.error(`Error comparing ${translation}:`, error);
        return { translation, verses: [] };
      }
    })
  );
  
  return results;
}
