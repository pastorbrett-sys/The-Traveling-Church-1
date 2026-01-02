import type { BibleBook, BibleChapter, BibleVerse, BibleTranslation } from "@shared/models/bible";

const BOLLS_API = "https://bolls.life";

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
        text: cleanVerseText(v.text),
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
      text: cleanVerseText(data.text),
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
        text: cleanVerseText(v.text),
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
      verses: translationVerses.map((v: any) => ({
        pk: v.pk,
        verse: v.verse,
        text: cleanVerseText(v.text),
      })),
    }));
  } catch (error) {
    console.error("Error comparing translations:", error);
    throw error;
  }
}

function cleanVerseText(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
