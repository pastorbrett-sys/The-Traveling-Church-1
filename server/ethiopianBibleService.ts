import { db } from "./db";
import { ethiopianBibleBooks, ethiopianBibleVerses } from "@shared/models/bible";
import { eq, and, asc } from "drizzle-orm";
import type { BibleBook, BibleChapter, BibleVerse, BibleTranslation } from "@shared/models/bible";

export const ETHIOPIAN_TRANSLATION: BibleTranslation = {
  short_name: "ETH",
  full_name: "Ethiopian Orthodox Bible (81 Books)"
};

export async function getEthiopianBooks(): Promise<BibleBook[]> {
  const books = await db
    .select()
    .from(ethiopianBibleBooks)
    .orderBy(asc(ethiopianBibleBooks.displayOrder));
  
  return books.map(book => ({
    bookid: book.id,
    name: book.name,
    chapters: book.chapters,
  }));
}

export async function getEthiopianChapter(
  bookId: number,
  chapter: number
): Promise<BibleChapter> {
  const [book] = await db
    .select()
    .from(ethiopianBibleBooks)
    .where(eq(ethiopianBibleBooks.id, bookId));
  
  if (!book) {
    throw new Error(`Book ${bookId} not found`);
  }
  
  const verses = await db
    .select()
    .from(ethiopianBibleVerses)
    .where(
      and(
        eq(ethiopianBibleVerses.bookId, bookId),
        eq(ethiopianBibleVerses.chapter, chapter)
      )
    )
    .orderBy(asc(ethiopianBibleVerses.verse));
  
  return {
    book: book.name,
    bookId: book.id,
    chapter,
    verses: verses.map((v, index) => ({
      pk: index + 1,
      verse: v.verse,
      text: v.heading ? `§${v.heading}§ ${v.textEnglish}` : v.textEnglish,
    })),
    translation: "ETH",
  };
}

export async function getEthiopianVerse(
  bookId: number,
  chapter: number,
  verse: number
): Promise<BibleVerse | null> {
  const [result] = await db
    .select()
    .from(ethiopianBibleVerses)
    .where(
      and(
        eq(ethiopianBibleVerses.bookId, bookId),
        eq(ethiopianBibleVerses.chapter, chapter),
        eq(ethiopianBibleVerses.verse, verse)
      )
    );
  
  if (!result) {
    return null;
  }
  
  return {
    pk: 1,
    verse: result.verse,
    text: result.heading ? `§${result.heading}§ ${result.textEnglish}` : result.textEnglish,
    book: bookId,
    chapter,
  };
}

export async function searchEthiopianBible(
  query: string,
  limit: number = 50
): Promise<{ total: number; results: BibleVerse[] }> {
  // Simple text search - can be enhanced later
  const allVerses = await db
    .select({
      id: ethiopianBibleVerses.id,
      bookId: ethiopianBibleVerses.bookId,
      chapter: ethiopianBibleVerses.chapter,
      verse: ethiopianBibleVerses.verse,
      textEnglish: ethiopianBibleVerses.textEnglish,
      heading: ethiopianBibleVerses.heading,
    })
    .from(ethiopianBibleVerses);
  
  const lowerQuery = query.toLowerCase();
  const matches = allVerses
    .filter(v => v.textEnglish.toLowerCase().includes(lowerQuery))
    .slice(0, limit);
  
  return {
    total: matches.length,
    results: matches.map((v, index) => ({
      pk: index + 1,
      verse: v.verse,
      text: v.heading ? `§${v.heading}§ ${v.textEnglish}` : v.textEnglish,
      book: v.bookId,
      chapter: v.chapter,
    })),
  };
}

// Admin functions for data management
export async function getEthiopianBookDetails(bookId: number) {
  const [book] = await db
    .select()
    .from(ethiopianBibleBooks)
    .where(eq(ethiopianBibleBooks.id, bookId));
  
  if (!book) return null;
  
  const verseCount = await db
    .select()
    .from(ethiopianBibleVerses)
    .where(eq(ethiopianBibleVerses.bookId, bookId));
  
  return {
    ...book,
    verseCount: verseCount.length,
  };
}

export async function getAllEthiopianBooksWithStats() {
  const books = await db
    .select()
    .from(ethiopianBibleBooks)
    .orderBy(asc(ethiopianBibleBooks.displayOrder));
  
  const stats = await Promise.all(
    books.map(async (book) => {
      const verses = await db
        .select()
        .from(ethiopianBibleVerses)
        .where(eq(ethiopianBibleVerses.bookId, book.id));
      
      return {
        ...book,
        verseCount: verses.length,
        hasContent: verses.length > 0,
      };
    })
  );
  
  return stats;
}

export async function addEthiopianVerse(data: {
  bookId: number;
  chapter: number;
  verse: number;
  textEnglish: string;
  textAmharic?: string;
  heading?: string;
}) {
  const [result] = await db
    .insert(ethiopianBibleVerses)
    .values(data)
    .returning();
  
  return result;
}

export async function addEthiopianVersesBulk(verses: Array<{
  bookId: number;
  chapter: number;
  verse: number;
  textEnglish: string;
  textAmharic?: string;
  heading?: string;
}>) {
  if (verses.length === 0) return [];
  
  const results = await db
    .insert(ethiopianBibleVerses)
    .values(verses)
    .returning();
  
  return results;
}

export async function updateEthiopianVerse(
  id: string,
  data: {
    textEnglish?: string;
    textAmharic?: string;
    heading?: string;
  }
) {
  const [result] = await db
    .update(ethiopianBibleVerses)
    .set(data)
    .where(eq(ethiopianBibleVerses.id, id))
    .returning();
  
  return result;
}

export async function deleteEthiopianChapterVerses(bookId: number, chapter: number) {
  await db
    .delete(ethiopianBibleVerses)
    .where(
      and(
        eq(ethiopianBibleVerses.bookId, bookId),
        eq(ethiopianBibleVerses.chapter, chapter)
      )
    );
}
