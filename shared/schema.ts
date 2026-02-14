import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { users } from "./models/auth";
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

export const churchMembers = pgTable("church_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  whatsapp: text("whatsapp").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertChurchMemberSchema = createInsertSchema(churchMembers).omit({
  id: true,
  createdAt: true,
});

export type InsertChurchMember = z.infer<typeof insertChurchMemberSchema>;
export type ChurchMember = typeof churchMembers.$inferSelect;

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

// Feature limits constants (Free tier - MONTHLY)
export const FEATURE_LIMITS = {
  smart_search: 5,
  book_synopsis: 2,
  verse_insight: 6,
  notes: 3,
  chat_message: 10,
} as const;

// Pro tier daily limits by pricing tier
export const PRO_LIMITS_PREMIUM = {
  chat_message: 50,
  smart_search: 15,
  book_synopsis: 8,
  verse_insight: 25,
} as const;

export const PRO_LIMITS_EMERGING = {
  chat_message: 25,
  smart_search: 8,
  book_synopsis: 4,
  verse_insight: 12,
} as const;

export type ProFeatureType = keyof typeof PRO_LIMITS_PREMIUM;

// Daily usage tracking for Pro users
export const dailyUsage = pgTable("daily_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  date: date("date").notNull(),
  chatCount: integer("chat_count").notNull().default(0),
  searchCount: integer("search_count").notNull().default(0),
  synopsisCount: integer("synopsis_count").notNull().default(0),
  insightCount: integer("insight_count").notNull().default(0),
});

export const insertDailyUsageSchema = createInsertSchema(dailyUsage).omit({ id: true });
export type InsertDailyUsage = z.infer<typeof insertDailyUsageSchema>;
export type DailyUsage = typeof dailyUsage.$inferSelect;

// User credits for power users who exceed daily limits
export const userCredits = pgTable("user_credits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  credits: integer("credits").notNull().default(0),
  purchasedAt: timestamp("purchased_at").defaultNow(),
});

export const insertUserCreditsSchema = createInsertSchema(userCredits).omit({ id: true });
export type InsertUserCredits = z.infer<typeof insertUserCreditsSchema>;
export type UserCredits = typeof userCredits.$inferSelect;

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

// ============================================
// PUSH NOTIFICATION TABLES
// ============================================

// push_tokens - stores device tokens with timezone for global delivery
export const pushTokens = pgTable("push_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  deviceToken: text("device_token").notNull().unique(),
  platform: text("platform").notNull(), // 'ios' | 'android'
  timezone: text("timezone"), // e.g., "America/New_York"
  utcOffset: integer("utc_offset"), // e.g., -5 (hours from UTC)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// notification_types - company-configurable notification types
export const notificationTypes = pgTable("notification_types", {
  id: text("id").primaryKey(), // 'verse_of_week', 'verse_of_day', 'announcement'
  name: text("name").notNull(), // "Verse of the Week"
  description: text("description"), // "Receive a weekly inspiring verse"
  defaultEnabled: boolean("default_enabled").notNull().default(true),
  sendDay: integer("send_day"), // 0-6 (0=Sunday, 2=Tuesday) - null means daily
  sendHour: integer("send_hour").notNull(), // 0-23 (8 = 8am local time)
  priority: integer("priority").notNull().default(5), // Higher priority wins on collision (10=weekly, 5=daily)
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// user_notification_preferences - per-user opt-in/out for each type
export const userNotificationPreferences = pgTable("user_notification_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  notificationTypeId: text("notification_type_id").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// notification_log - for debugging and analytics
export const notificationLog = pgTable("notification_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  notificationTypeId: text("notification_type_id"),
  verseReference: text("verse_reference"),
  verseText: text("verse_text"),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  recipientCount: integer("recipient_count"),
  status: text("status"), // 'sent' | 'failed'
  errorMessage: text("error_message"),
});

// Push notification schemas and types
export const insertPushTokenSchema = createInsertSchema(pushTokens).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationTypeSchema = createInsertSchema(notificationTypes).omit({
  createdAt: true,
});

export const insertUserNotificationPreferenceSchema = createInsertSchema(userNotificationPreferences).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationLogSchema = createInsertSchema(notificationLog).omit({
  id: true,
  sentAt: true,
});

export type InsertPushToken = z.infer<typeof insertPushTokenSchema>;
export type PushToken = typeof pushTokens.$inferSelect;

export type InsertNotificationType = z.infer<typeof insertNotificationTypeSchema>;
export type NotificationType = typeof notificationTypes.$inferSelect;

export type InsertUserNotificationPreference = z.infer<typeof insertUserNotificationPreferenceSchema>;
export type UserNotificationPreference = typeof userNotificationPreferences.$inferSelect;

export type InsertNotificationLog = z.infer<typeof insertNotificationLogSchema>;
export type NotificationLog = typeof notificationLog.$inferSelect;

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

// Prayer Requests - stores user prayer submissions
export const prayerRequests = pgTable("prayer_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: varchar("name"), // Optional name for display (null if anonymous)
  email: varchar("email"), // For response delivery
  content: text("content").notNull(),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  status: varchar("status").default("pending").notNull(), // pending, responded, archived
  respondedAt: timestamp("responded_at"),
  responseContent: text("response_content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Prayer Sessions - tracks prayer timer usage for stats
export const prayerSessions = pgTable("prayer_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  withMusic: boolean("with_music").default(false),
});

// Candle Donations - tracks "Light a Candle" donations
export const candleDonations = pgTable("candle_donations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  prayerRequestId: varchar("prayer_request_id").references(() => prayerRequests.id),
  amountCents: integer("amount_cents").notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  status: varchar("status").default("pending").notNull(), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPrayerRequestSchema = createInsertSchema(prayerRequests).omit({
  id: true,
  createdAt: true,
  respondedAt: true,
  responseContent: true,
  status: true,
});

export const insertPrayerSessionSchema = createInsertSchema(prayerSessions).omit({
  id: true,
  completedAt: true,
});

export const insertCandleDonationSchema = createInsertSchema(candleDonations).omit({
  id: true,
  createdAt: true,
  status: true,
});

export type InsertPrayerRequest = z.infer<typeof insertPrayerRequestSchema>;
export type PrayerRequest = typeof prayerRequests.$inferSelect;

export type InsertPrayerSession = z.infer<typeof insertPrayerSessionSchema>;
export type PrayerSession = typeof prayerSessions.$inferSelect;

export type InsertCandleDonation = z.infer<typeof insertCandleDonationSchema>;
export type CandleDonation = typeof candleDonations.$inferSelect;

export * from "./models/chat";
export * from "./models/bible";
