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
