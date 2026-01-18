import * as fs from "fs";
import * as path from "path";
import type { BibleBook, BibleChapter, BibleVerse, BibleTranslation } from "@shared/models/bible";

const ETHIOPIAN_ORTHODOX_DIR = path.join(process.cwd(), "server/data/ethiopian-orthodox");
const ETHIOPIAN_ORTHODOX_ENGLISH_DIR = path.join(process.cwd(), "server/data/ethiopian-orthodox-english");
const AMHARIC_PROTESTANT_FILE = path.join(process.cwd(), "server/data/amharic-protestant/amharic_bible.json");

export const AMHARIC_ORTHODOX_TRANSLATION: BibleTranslation = {
  short_name: "ETH",
  full_name: "አማርኛ ኦርቶዶክስ (81 መጻሕፍት)",
  display_name: "ኦርቶ"
};

export const ENGLISH_ORTHODOX_TRANSLATION: BibleTranslation = {
  short_name: "ETHE",
  full_name: "Ethiopian Orthodox (81 Books)"
};

export const AMHARIC_PROTESTANT_TRANSLATION: BibleTranslation = {
  short_name: "AMPROT",
  full_name: "አማርኛ ፕሮቴስታንት (66 መጻሕፍት)",
  display_name: "ፕሮት"
};

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

interface ProtestantAmharicBible {
  title: string;
  books: Array<{
    title: string;
    abbv: string;
    chapters: Array<{
      chapter: string;
      title: string;
      verses: string[];
    }>;
  }>;
}

let orthodoxBooksCache: BibleBook[] | null = null;
let orthodoxDataCache: Map<number, EthiopianOrthodoxBook> = new Map();
let orthodoxEnglishBooksCache: BibleBook[] | null = null;
let orthodoxEnglishDataCache: Map<number, EthiopianOrthodoxBook> = new Map();
let protestantBooksCache: BibleBook[] | null = null;
let protestantDataCache: ProtestantAmharicBible | null = null;

const ORTHODOX_FILE_MAPPING: Record<number, string> = {
  1: "01-genesis.json",
  2: "02-exodus.json",
  3: "03-leviticus.json",
  4: "04-numbers.json",
  5: "05-deuteronomy.json",
  6: "06-joshua.json",
  7: "07-judges.json",
  8: "08-ruth.json",
  9: "09-1samuel.json",
  10: "10-2 samuel.json",
  11: "11-1 kings.json",
  12: "12-2 kings.json",
  13: "13-1 chronicles.json",
  14: "14-2 chronicles.json",
  15: "15-kufale.json",
  16: "16-enoch.json",
  17: "17-ezra.json",
  18: "18-nehemiah.json",
  19: "19-ezrasutuel.json",
  20: "20-ezrakale.json",
  21: "21-tobit.json",
  22: "22-yodit.json",
  23: "23-esther.json",
  24: "24-1 maccabees.json",
  25: "25-2 maccabees.json",
  26: "26-3 maccabees.json",
  27: "27-job.json",
  28: "28-psalms.json",
  29: "29-proverbs.json",
  30: "30-admonition.json",
  31: "31-wisdom of solomon.json",
  32: "32-ecclesiastes.json",
  33: "33-song of solomon.json",
  34: "34-sirach.json",
  35: "35-isaiah.json",
  36: "36-jeremiah.json",
  37: "37-Baruch.json",
  38: "38-lamentations.json",
  39: "39-terefermias.json",
  40: "40-Teref Baruch.json",
  41: "41-ezekiel.json",
  42: "42-daniel.json",
  43: "43-hosea.json",
  44: "44-amos.json",
  45: "45-micah.json",
  46: "46-joel.json",
  47: "47-obadiah.json",
  48: "48-jonah.json",
  49: "49-nahum.json",
  50: "50-habakkuk.json",
  51: "51-zephaniah.json",
  52: "52-haggai.json",
  53: "53-zechariah.json",
  54: "54-malachi.json",
  55: "55-matthew.json",
  56: "56-mark.json",
  57: "57-luke.json",
  58: "58-john.json",
  59: "59-act.json",
  60: "60-romans.json",
  61: "61-1_corinthians.json",
  62: "62-2_corinthians.json",
  63: "63-galatians.json",
  64: "64-ephesians.json",
  65: "65-philippians.json",
  66: "66-colossians.json",
  67: "67-1_thessalonians.json",
  68: "68-2_thessalonians.json",
  69: "69-1_timothy.json",
  70: "70-2_timothy.json",
  71: "71-titus.json",
  72: "72-philemon.json",
  73: "73-hebrews.json",
  74: "74-1_peter.json",
  75: "75-2_peter.json",
  76: "76-1_john.json",
  77: "77-2_john.json",
  78: "78-3-john.json",
  79: "79-james.json",
  80: "80-jude.json",
  81: "81-revelation.json",
};

function loadOrthodoxBook(bookId: number): EthiopianOrthodoxBook | null {
  if (orthodoxDataCache.has(bookId)) {
    return orthodoxDataCache.get(bookId)!;
  }
  
  const filename = ORTHODOX_FILE_MAPPING[bookId];
  if (!filename) return null;
  
  const filePath = path.join(ETHIOPIAN_ORTHODOX_DIR, filename);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    orthodoxDataCache.set(bookId, data);
    return data;
  } catch (error) {
    console.error(`Error loading Orthodox book ${bookId}:`, error);
    return null;
  }
}

function loadProtestantData(): ProtestantAmharicBible | null {
  if (protestantDataCache) return protestantDataCache;
  
  try {
    protestantDataCache = JSON.parse(fs.readFileSync(AMHARIC_PROTESTANT_FILE, "utf-8"));
    return protestantDataCache;
  } catch (error) {
    console.error("Error loading Protestant Amharic Bible:", error);
    return null;
  }
}

function loadOrthodoxEnglishBook(bookId: number): EthiopianOrthodoxBook | null {
  if (orthodoxEnglishDataCache.has(bookId)) {
    return orthodoxEnglishDataCache.get(bookId)!;
  }
  
  const filename = ORTHODOX_FILE_MAPPING[bookId];
  if (!filename) return null;
  
  const filePath = path.join(ETHIOPIAN_ORTHODOX_ENGLISH_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    orthodoxEnglishDataCache.set(bookId, data);
    return data;
  } catch (error) {
    console.error(`Error loading English Orthodox book ${bookId}:`, error);
    return null;
  }
}

export async function getOrthodoxEnglishBooks(): Promise<BibleBook[]> {
  if (orthodoxEnglishBooksCache) return orthodoxEnglishBooksCache;
  
  const books: BibleBook[] = [];
  
  for (let i = 1; i <= 81; i++) {
    const book = loadOrthodoxEnglishBook(i);
    if (book) {
      books.push({
        bookid: book.book_number,
        name: book.book_name_en,
        chapters: book.chapters.length,
      });
    }
  }
  
  orthodoxEnglishBooksCache = books;
  return books;
}

export async function getOrthodoxEnglishChapter(
  bookId: number,
  chapter: number
): Promise<BibleChapter> {
  const book = loadOrthodoxEnglishBook(bookId);
  
  if (!book) {
    throw new Error(`Book ${bookId} not found`);
  }
  
  const chapterData = book.chapters.find(c => c.chapter === chapter);
  if (!chapterData) {
    throw new Error(`Chapter ${chapter} not found in book ${bookId}`);
  }
  
  const verses: BibleVerse[] = [];
  
  for (const section of chapterData.sections) {
    let isFirstVerseInSection = true;
    for (const verse of section.verses) {
      const verseText = (section.title && isFirstVerseInSection)
        ? `§${section.title}§ ${verse.text}`
        : verse.text;
      isFirstVerseInSection = false;
      
      verses.push({
        pk: verse.verse,
        verse: verse.verse,
        text: verseText,
      });
    }
  }
  
  verses.sort((a, b) => a.verse - b.verse);
  
  return {
    book: book.book_name_en,
    bookId: book.book_number,
    chapter,
    verses,
    translation: "ETHE",
  };
}

export async function getOrthodoxBooks(): Promise<BibleBook[]> {
  if (orthodoxBooksCache) return orthodoxBooksCache;
  
  const books: BibleBook[] = [];
  
  for (let i = 1; i <= 81; i++) {
    const book = loadOrthodoxBook(i);
    if (book) {
      books.push({
        bookid: book.book_number,
        name: book.book_name_am,
        chapters: book.chapters.length,
      });
    }
  }
  
  orthodoxBooksCache = books;
  return books;
}

export async function getProtestantBooks(): Promise<BibleBook[]> {
  if (protestantBooksCache) return protestantBooksCache;
  
  const data = loadProtestantData();
  if (!data) return [];
  
  const books: BibleBook[] = data.books.map((book, index) => ({
    bookid: index + 1,
    name: book.title,
    chapters: book.chapters.length,
  }));
  
  protestantBooksCache = books;
  return books;
}

export async function getOrthodoxChapter(
  bookId: number,
  chapter: number
): Promise<BibleChapter> {
  const book = loadOrthodoxBook(bookId);
  
  if (!book) {
    throw new Error(`Book ${bookId} not found`);
  }
  
  const chapterData = book.chapters.find(c => c.chapter === chapter);
  if (!chapterData) {
    throw new Error(`Chapter ${chapter} not found in book ${bookId}`);
  }
  
  const verses: BibleVerse[] = [];
  
  for (const section of chapterData.sections) {
    let isFirstVerseInSection = true;
    for (const verse of section.verses) {
      const verseText = (section.title && isFirstVerseInSection)
        ? `§${section.title}§ ${verse.text}`
        : verse.text;
      isFirstVerseInSection = false;
      
      verses.push({
        pk: verse.verse,
        verse: verse.verse,
        text: verseText,
      });
    }
  }
  
  verses.sort((a, b) => a.verse - b.verse);
  
  return {
    book: book.book_name_am,
    bookId: book.book_number,
    chapter,
    verses,
    translation: "ETH",
  };
}

export async function getProtestantChapter(
  bookId: number,
  chapter: number
): Promise<BibleChapter> {
  const data = loadProtestantData();
  if (!data) {
    throw new Error("Protestant Bible data not available");
  }
  
  const book = data.books[bookId - 1];
  if (!book) {
    throw new Error(`Book ${bookId} not found`);
  }
  
  const chapterData = book.chapters.find(c => parseInt(c.chapter) === chapter);
  if (!chapterData) {
    throw new Error(`Chapter ${chapter} not found in book ${bookId}`);
  }
  
  const verses: BibleVerse[] = chapterData.verses.map((text, index) => ({
    pk: index + 1,
    verse: index + 1,
    text,
  }));
  
  return {
    book: book.title,
    bookId,
    chapter,
    verses,
    translation: "AMPROT",
  };
}

export async function getOrthodoxVerse(
  bookId: number,
  chapter: number,
  verse: number
): Promise<BibleVerse | null> {
  try {
    const chapterData = await getOrthodoxChapter(bookId, chapter);
    const verseData = chapterData.verses.find(v => v.verse === verse);
    
    if (!verseData) return null;
    
    return {
      pk: verseData.pk,
      verse: verseData.verse,
      text: verseData.text,
      book: bookId,
      chapter,
    };
  } catch {
    return null;
  }
}

export async function getProtestantVerse(
  bookId: number,
  chapter: number,
  verse: number
): Promise<BibleVerse | null> {
  try {
    const chapterData = await getProtestantChapter(bookId, chapter);
    const verseData = chapterData.verses.find(v => v.verse === verse);
    
    if (!verseData) return null;
    
    return {
      pk: verseData.pk,
      verse: verseData.verse,
      text: verseData.text,
      book: bookId,
      chapter,
    };
  } catch {
    return null;
  }
}

export async function searchOrthodoxBible(
  query: string,
  limit: number = 50
): Promise<{ total: number; results: BibleVerse[] }> {
  const lowerQuery = query.toLowerCase();
  const results: BibleVerse[] = [];
  
  for (let bookId = 1; bookId <= 81 && results.length < limit; bookId++) {
    const book = loadOrthodoxBook(bookId);
    if (!book) continue;
    
    for (const chapter of book.chapters) {
      if (results.length >= limit) break;
      
      for (const section of chapter.sections) {
        for (const verse of section.verses) {
          if (verse.text.toLowerCase().includes(lowerQuery)) {
            results.push({
              pk: verse.verse,
              verse: verse.verse,
              text: verse.text,
              book: bookId,
              chapter: chapter.chapter,
            });
            if (results.length >= limit) break;
          }
        }
        if (results.length >= limit) break;
      }
    }
  }
  
  return { total: results.length, results };
}

export async function searchProtestantBible(
  query: string,
  limit: number = 50
): Promise<{ total: number; results: BibleVerse[] }> {
  const lowerQuery = query.toLowerCase();
  const results: BibleVerse[] = [];
  const data = loadProtestantData();
  
  if (!data) return { total: 0, results: [] };
  
  for (let bookIdx = 0; bookIdx < data.books.length && results.length < limit; bookIdx++) {
    const book = data.books[bookIdx];
    
    for (const chapter of book.chapters) {
      if (results.length >= limit) break;
      
      for (let verseIdx = 0; verseIdx < chapter.verses.length; verseIdx++) {
        const verseText = chapter.verses[verseIdx];
        if (verseText.toLowerCase().includes(lowerQuery)) {
          results.push({
            pk: verseIdx + 1,
            verse: verseIdx + 1,
            text: verseText,
            book: bookIdx + 1,
            chapter: parseInt(chapter.chapter),
          });
          if (results.length >= limit) break;
        }
      }
    }
  }
  
  return { total: results.length, results };
}

export async function getOrthodoxEnglishVerse(
  bookId: number,
  chapter: number,
  verse: number
): Promise<BibleVerse | null> {
  try {
    const chapterData = await getOrthodoxEnglishChapter(bookId, chapter);
    const verseData = chapterData.verses.find(v => v.verse === verse);
    
    if (!verseData) return null;
    
    return {
      pk: verseData.pk,
      verse: verseData.verse,
      text: verseData.text,
      book: bookId,
      chapter,
    };
  } catch {
    return null;
  }
}

export async function searchOrthodoxEnglishBible(
  query: string,
  limit: number = 50
): Promise<{ total: number; results: BibleVerse[] }> {
  const lowerQuery = query.toLowerCase();
  const results: BibleVerse[] = [];
  
  for (let bookId = 1; bookId <= 81 && results.length < limit; bookId++) {
    const book = loadOrthodoxEnglishBook(bookId);
    if (!book) continue;
    
    for (const chapter of book.chapters) {
      if (results.length >= limit) break;
      
      for (const section of chapter.sections) {
        for (const verse of section.verses) {
          if (verse.text.toLowerCase().includes(lowerQuery)) {
            results.push({
              pk: verse.verse,
              verse: verse.verse,
              text: verse.text,
              book: bookId,
              chapter: chapter.chapter,
            });
            if (results.length >= limit) break;
          }
        }
        if (results.length >= limit) break;
      }
    }
  }
  
  return { total: results.length, results };
}
