import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const bibleNotes = pgTable("bible_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  book: text("book").notNull(),
  chapter: integer("chapter").notNull(),
  verse: integer("verse").notNull(),
  translation: text("translation").notNull().default("KJV"),
  note: text("note").notNull(),
  isPublic: boolean("is_public").notNull().default(false),
  shareId: text("share_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const readingProgress = pgTable("reading_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  book: text("book").notNull(),
  chapter: integer("chapter").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

export const insertBibleNoteSchema = createInsertSchema(bibleNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReadingProgressSchema = createInsertSchema(readingProgress).omit({
  id: true,
  completedAt: true,
});

export type InsertBibleNote = z.infer<typeof insertBibleNoteSchema>;
export type BibleNote = typeof bibleNotes.$inferSelect;

export type InsertReadingProgress = z.infer<typeof insertReadingProgressSchema>;
export type ReadingProgress = typeof readingProgress.$inferSelect;

export interface BibleTranslation {
  short_name: string;
  full_name: string;
}

export interface BibleBook {
  bookid: number;
  name: string;
  chapters: number;
}

export interface BibleVerse {
  pk: number;
  verse: number;
  text: string;
  book?: number;
  chapter?: number;
}

export interface BibleChapter {
  book: string;
  bookId: number;
  chapter: number;
  verses: BibleVerse[];
  translation: string;
}

export type SmartSearchResultType = 
  | "verse" 
  | "topic" 
  | "question" 
  | "book" 
  | "character" 
  | "word_study";

export interface SmartSearchResultVerse {
  type: "verse";
  reference: string;
  bookId: number;
  chapter: number;
  verse: number;
  preview: string;
}

export interface SmartSearchResultTopic {
  type: "topic";
  title: string;
  description: string;
  verses: Array<{
    reference: string;
    bookId: number;
    chapter: number;
    verse: number;
    preview: string;
  }>;
}

export interface SmartSearchResultQuestion {
  type: "question";
  question: string;
  briefAnswer: string;
  suggestedPrompt: string;
}

export interface SmartSearchResultBook {
  type: "book";
  bookId: number;
  bookName: string;
  description: string;
  chapters: number;
}

export interface SmartSearchResultCharacter {
  type: "character";
  name: string;
  description: string;
  keyVerses: Array<{
    reference: string;
    bookId: number;
    chapter: number;
    verse: number;
    context: string;
  }>;
}

export interface SmartSearchResultWordStudy {
  type: "word_study";
  word: string;
  originalLanguage: string;
  meaning: string;
  usageExamples: Array<{
    reference: string;
    bookId: number;
    chapter: number;
    verse: number;
    context: string;
  }>;
}

export type SmartSearchResult = 
  | SmartSearchResultVerse
  | SmartSearchResultTopic
  | SmartSearchResultQuestion
  | SmartSearchResultBook
  | SmartSearchResultCharacter
  | SmartSearchResultWordStudy;

export interface SmartSearchResponse {
  query: string;
  results: SmartSearchResult[];
  interpretation: string;
}

// Ethiopian Orthodox Bible (81 books)
export const ethiopianBibleBooks = pgTable("ethiopian_bible_books", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  nameAmharic: text("name_amharic"),
  chapters: integer("chapters").notNull(),
  testament: text("testament").notNull(), // 'OT' or 'NT'
  category: text("category").notNull(), // e.g., 'Pentateuch', 'Historical', 'Wisdom', 'Prophets', 'Gospels', 'Epistles', 'Deuterocanonical'
  displayOrder: integer("display_order").notNull(),
});

export const ethiopianBibleVerses = pgTable("ethiopian_bible_verses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: integer("book_id").notNull().references(() => ethiopianBibleBooks.id),
  chapter: integer("chapter").notNull(),
  verse: integer("verse").notNull(),
  textEnglish: text("text_english").notNull(),
  textAmharic: text("text_amharic"),
  heading: text("heading"), // Section heading if applicable
});

export const insertEthiopianBibleBookSchema = createInsertSchema(ethiopianBibleBooks);
export const insertEthiopianBibleVerseSchema = createInsertSchema(ethiopianBibleVerses).omit({
  id: true,
});

export type InsertEthiopianBibleBook = z.infer<typeof insertEthiopianBibleBookSchema>;
export type EthiopianBibleBook = typeof ethiopianBibleBooks.$inferSelect;

export type InsertEthiopianBibleVerse = z.infer<typeof insertEthiopianBibleVerseSchema>;
export type EthiopianBibleVerse = typeof ethiopianBibleVerses.$inferSelect;
