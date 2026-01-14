import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const locations = pgTable("locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  country: text("country").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description").notNull(),
  displayOrder: text("display_order").notNull().default('999'),
});

export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  locationId: varchar("location_id").references(() => locations.id),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(),
  scheduleLabel: text("schedule_label"),
  timeLabel: text("time_label"),
});

export const testimonials = pgTable("testimonials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: text("location").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
}).extend({
  date: z.string().or(z.date()).transform((val) => new Date(val)),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true,
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true,
});

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

// User Notes for Bible study
export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  verseRef: text("verse_ref").notNull(), // e.g., "Genesis 1:1"
  verseText: text("verse_text").notNull(), // The actual verse content
  content: text("content").notNull(), // User's note
  tags: text("tags").array(), // Array of tag names
  bookId: integer("book_id").notNull(), // Bible book ID for filtering
  chapter: integer("chapter").notNull(),
  verse: integer("verse").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

// Feature usage tracking for subscription gates
export const featureUsageTypeEnum = ['smart_search', 'book_synopsis', 'verse_insight', 'chat_message', 'sermon_transcription'] as const;
export type FeatureUsageType = typeof featureUsageTypeEnum[number];

export const featureUsage = pgTable("feature_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  feature: text("feature").notNull(), // 'smart_search' | 'book_synopsis' | 'verse_insight'
  periodStart: timestamp("period_start").notNull(), // First day of the month (UTC)
  count: integer("count").notNull().default(0),
});

export const insertFeatureUsageSchema = createInsertSchema(featureUsage).omit({
  id: true,
});

export type InsertFeatureUsage = z.infer<typeof insertFeatureUsageSchema>;
export type FeatureUsage = typeof featureUsage.$inferSelect;

// Feature limits constants
export const FEATURE_LIMITS = {
  smart_search: 5,
  book_synopsis: 2,
  verse_insight: 6,
  notes: 3,
  chat_message: 10,
  sermon_transcription: 4, // 4 sermons/month for Pro users
} as const;

// Pro-only features with their limits (even Pro users have limits on these)
export const PRO_FEATURE_LIMITS = {
  sermon_transcription: 4, // 4 sermons/month
} as const;

export * from "./models/chat";
export * from "./models/bible";
