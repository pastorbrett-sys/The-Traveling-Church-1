import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
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
export const featureUsageTypeEnum = ['smart_search', 'book_synopsis', 'verse_insight', 'chat_message'] as const;
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
} as const;

// ============================================
// AMBASSADOR PROGRAM TABLES
// ============================================

export const ambassadorStatusEnum = ['pending', 'active', 'paused'] as const;
export type AmbassadorStatus = typeof ambassadorStatusEnum[number];

export const ambassadors = pgTable("ambassadors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(), // Links to auth user
  email: text("email").notNull(),
  name: text("name").notNull(),
  whatsapp: text("whatsapp"), // WhatsApp number for outreach
  country: text("country"), // Where they're based
  reason: text("reason"), // Why they want to be an ambassador
  referralSource: text("referral_source"), // How they heard about the program
  referralCode: text("referral_code").notNull().unique(), // Their code for user signups
  inviteCode: text("invite_code").notNull().unique(), // Their code for recruiting ambassadors
  referredBy: varchar("referred_by").references((): any => ambassadors.id), // Who recruited them
  status: text("status").notNull().default('pending'), // pending, active, paused
  tier: integer("tier").notNull().default(1), // For future commission tiers
  isSuperAdmin: boolean("is_super_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const referralClicks = pgTable("referral_clicks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referralCode: text("referral_code").notNull(),
  clickedAt: timestamp("clicked_at").notNull().defaultNow(),
  userAgent: text("user_agent"),
  ipHash: text("ip_hash"), // Hashed for privacy
});

export const referralSignups = pgTable("referral_signups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referralCode: text("referral_code").notNull(),
  userId: text("user_id").notNull(), // The user who signed up
  userName: text("user_name"), // User's display name
  userEmail: text("user_email"), // User's email address
  convertedToPro: boolean("converted_to_pro").notNull().default(false),
  conversionDate: timestamp("conversion_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Scaffold for future: Bible study sessions
export const bibleStudies = pgTable("bible_studies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ambassadorId: varchar("ambassador_id").references(() => ambassadors.id),
  title: text("title"),
  scheduledAt: timestamp("scheduled_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Scaffold for future: Email queue
export const emailQueue = pgTable("email_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: text("subject"),
  body: text("body"),
  recipientType: text("recipient_type"), // 'all', 'ambassadors', 'users', 'specific'
  status: text("status").default('draft'), // draft, queued, sent
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Scaffold for future: Notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title"),
  message: text("message"),
  targetType: text("target_type"), // 'all', 'ambassadors', 'users'
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Ambassador schemas
export const insertAmbassadorSchema = createInsertSchema(ambassadors).omit({
  id: true,
  createdAt: true,
});

export const insertReferralClickSchema = createInsertSchema(referralClicks).omit({
  id: true,
  clickedAt: true,
});

export const insertReferralSignupSchema = createInsertSchema(referralSignups).omit({
  id: true,
  createdAt: true,
});

export type InsertAmbassador = z.infer<typeof insertAmbassadorSchema>;
export type Ambassador = typeof ambassadors.$inferSelect;

export type InsertReferralClick = z.infer<typeof insertReferralClickSchema>;
export type ReferralClick = typeof referralClicks.$inferSelect;

export type InsertReferralSignup = z.infer<typeof insertReferralSignupSchema>;
export type ReferralSignup = typeof referralSignups.$inferSelect;

export type BibleStudy = typeof bibleStudies.$inferSelect;
export type EmailQueueItem = typeof emailQueue.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

export * from "./models/chat";
export * from "./models/bible";
