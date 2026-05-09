import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage, db } from "./storage";
import { sql } from "drizzle-orm";
import {
  insertBlogPostSchema,
  insertEventSchema,
  insertTestimonialSchema,
  insertContactSubmissionSchema,
  insertChurchMemberSchema,
  insertNoteSchema,
  insertPrayerRequestSchema,
  insertPrayerSessionSchema,
  FEATURE_LIMITS,
  referralSignups,
  ambassadors,
  users,
  prayerRequests,
  prayerSessions,
  candleDonations,
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { getUsageSummary, checkNotesLimit } from "./usageService";
import { ObjectStorageService } from "./objectStorage";
import { sendContactEmail } from "./email";
import { registerChatRoutes } from "./replit_integrations/chat";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { stripeStorage } from "./stripeStorage";
import { stripeService } from "./stripeService";
import { getTierForCountry, getPricingForCountry, PRICING_TIERS, type PricingTier } from "@shared/regionalPricing";
import { getStripePublishableKey, getUncachableStripeClient } from "./stripeClient";
import bibleRoutes from "./bibleRoutes";
import ambassadorRoutes from "./ambassadorRoutes";
import notificationRoutes from "./notificationRoutes";
import { registerRevenueCatWebhook } from "./revenueCatWebhook";
import { isUserPro } from "./proStatusService";
import { registerNativeAuthRoutes } from "./nativeAuthRoutes";
import { sendConfirmationEmail } from "./serviceReminderCron";
import { serviceReminders, insertServiceReminderSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication first (before other routes)
  await setupAuth(app);
  registerAuthRoutes(app);
  
  // Native auth routes (for iOS browser-based OAuth)
  registerNativeAuthRoutes(app);
  
  // RevenueCat webhook (for native app subscriptions)
  registerRevenueCatWebhook(app);
  
  registerChatRoutes(app);
  
  // Social media crawler middleware - serves correct OG meta tags per domain
  app.use(async (req, res, next) => {
    const userAgent = req.get("user-agent") || "";
    const isCrawler = /facebookexternalhit|Facebot|Twitterbot|WhatsApp|LinkedInBot|Slackbot|TelegramBot|Pinterest|Discordbot/i.test(userAgent);
    
    if (!isCrawler || req.path.startsWith("/api/") || req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      return next();
    }
    
    const host = req.get("host") || "";
    const isVagabond = host.includes("vagabondbible") || host.includes("localhost") || host.includes("replit");
    
    if (isVagabond) {
      // Check for ambassador invite link: /ambassador?invite=XXX
      const inviteCode = req.query.invite as string | undefined;
      if (req.path === "/ambassador" && inviteCode) {
        return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>You're Invited to Become an Ambassador</title>
  <meta name="description" content="You've been invited to join the Vagabond Faith Ambassador Program. Share the AI-powered Bible and earn rewards.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://vagabondbible.com/ambassador?invite=${inviteCode}">
  <meta property="og:title" content="You're Invited to Become an Ambassador">
  <meta property="og:description" content="You've been invited to join the Vagabond Faith Ambassador Program. Share the AI-powered Bible and earn rewards.">
  <meta property="og:image" content="https://vagabondbible.com/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="https://vagabondbible.com/ambassador?invite=${inviteCode}">
  <meta name="twitter:title" content="You're Invited to Become an Ambassador">
  <meta name="twitter:description" content="You've been invited to join the Vagabond Faith Ambassador Program. Share the AI-powered Bible and earn rewards.">
  <meta name="twitter:image" content="https://vagabondbible.com/og-image.png">
</head>
<body></body>
</html>`);
      }
      
      // Check for referral link: /?ref=XXX
      const refCode = req.query.ref as string | undefined;
      if (refCode) {
        try {
          const [ambassador] = await db.select().from(ambassadors).where(eq(ambassadors.referralCode, refCode)).limit(1);
          if (ambassador) {
            const firstName = ambassador.name.split(' ')[0];
            return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${firstName} invited you to Vagabond Faith</title>
  <meta name="description" content="${firstName} has invited you to try Vagabond Faith - the AI-powered Bible that makes you feel like you were there.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://vagabondbible.com/?ref=${refCode}">
  <meta property="og:title" content="${firstName} invited you to Vagabond Faith">
  <meta property="og:description" content="${firstName} has invited you to try Vagabond Faith - the AI-powered Bible that makes you feel like you were there.">
  <meta property="og:image" content="https://vagabondbible.com/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="https://vagabondbible.com/?ref=${refCode}">
  <meta name="twitter:title" content="${firstName} invited you to Vagabond Faith">
  <meta name="twitter:description" content="${firstName} has invited you to try Vagabond Faith - the AI-powered Bible that makes you feel like you were there.">
  <meta name="twitter:image" content="https://vagabondbible.com/og-image.png">
</head>
<body></body>
</html>`);
          }
        } catch (e) {
          // Fall through to default if DB lookup fails
        }
      }
      
      // DEFAULT: Regular vagabondbible.com links (unchanged)
      res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Vagabond Faith - AI-Powered Study Bible</title>
  <meta name="description" content="The AI-powered Bible that makes you feel like you were there. Chat with a 24/7 Pastor, explore Scripture, and gain deeper insights into God's Word.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://vagabondbible.com/">
  <meta property="og:title" content="Vagabond Faith - AI-Powered Study Bible">
  <meta property="og:description" content="The AI-powered Bible that makes you feel like you were there. Chat with a 24/7 Pastor, explore Scripture, and gain deeper insights into God's Word.">
  <meta property="og:image" content="https://vagabondbible.com/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="https://vagabondbible.com/">
  <meta name="twitter:title" content="Vagabond Faith - AI-Powered Study Bible">
  <meta name="twitter:description" content="The AI-powered Bible that makes you feel like you were there. Chat with a 24/7 Pastor, explore Scripture, and gain deeper insights into God's Word.">
  <meta name="twitter:image" content="https://vagabondbible.com/og-image.png">
</head>
<body></body>
</html>`);
    } else {
      res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Global Travel Ministry</title>
  <meta name="description" content="We travel to where people are to spread the love of God.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://thetravelingchurch.com/">
  <meta property="og:title" content="The Global Travel Ministry">
  <meta property="og:description" content="We travel to where people are to spread the love of God.">
  <meta property="og:image" content="https://thetravelingchurch.com/church-og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="https://thetravelingchurch.com/">
  <meta name="twitter:title" content="The Global Travel Ministry">
  <meta name="twitter:description" content="We travel to where people are to spread the love of God.">
  <meta name="twitter:image" content="https://thetravelingchurch.com/church-og-image.png">
</head>
<body></body>
</html>`);
    }
  });
  
  // Bible routes
  app.use("/api/bible", bibleRoutes);

  // Ambassador program routes (completely separate from Bible app)
  app.use("/api/ambassador", ambassadorRoutes);
  app.use("/api/notifications", notificationRoutes);

  // Dynamic OG image serving based on domain
  app.get("/og-image.png", (req, res) => {
    const host = req.get("host") || "";
    const isVagabond = host.includes("vagabondbible") || host.includes("localhost") || host.includes("replit");
    const imagePath = isVagabond 
      ? path.resolve(process.cwd(), "client/public/og-image.png")
      : path.resolve(process.cwd(), "client/public/church-og-image.png");
    res.sendFile(imagePath);
  });

  // Public assets from Object Storage - from blueprint:javascript_object_storage
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/calendar/event.ics", (req, res) => {
    try {
      const { title, description, location, hourUTC, minuteUTC, dayOfWeekUTC, durationMinutes } = req.query;
      if (!title || !hourUTC || !minuteUTC || !dayOfWeekUTC || !durationMinutes) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      const h = parseInt(hourUTC as string, 10);
      const m = parseInt(minuteUTC as string, 10);
      const dow = parseInt(dayOfWeekUTC as string, 10);
      const dur = parseInt(durationMinutes as string, 10);

      const now = new Date();
      const currentDay = now.getUTCDay();
      let daysUntil = dow - currentDay;
      if (daysUntil < 0) {
        daysUntil += 7;
      } else if (daysUntil === 0) {
        const eventTimeToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), h, m, 0));
        if (now >= eventTimeToday) daysUntil = 7;
      }

      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntil, h, m, 0));
      const end = new Date(start.getTime() + dur * 60 * 1000);

      const fmt = (d: Date): string => {
        return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z/, "Z");
      };

      const eventTitle = decodeURIComponent(title as string);
      const eventDesc = decodeURIComponent((description as string) || "");
      const eventLoc = decodeURIComponent((location as string) || "");

      const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//The Traveling Church//Service Calendar//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `DTSTART:${fmt(start)}`,
        `DTEND:${fmt(end)}`,
        `DTSTAMP:${fmt(now)}`,
        `UID:${eventTitle.replace(/\s/g, "-").toLowerCase()}-${start.getTime()}@thetravelingchurch.com`,
        `SUMMARY:${eventTitle}`,
        `DESCRIPTION:${eventDesc.replace(/\n/g, "\\n")}`,
        `LOCATION:${eventLoc}`,
        "BEGIN:VALARM",
        "TRIGGER:-PT15M",
        "ACTION:DISPLAY",
        "DESCRIPTION:Reminder: Service starts in 15 minutes",
        "END:VALARM",
        "END:VEVENT",
        "END:VCALENDAR",
      ];

      const icsContent = lines.join("\r\n");
      const filename = `${eventTitle.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.ics`;

      res.setHeader("Content-Type", "text/calendar; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(icsContent);
    } catch (error) {
      console.error("Error generating calendar event:", error);
      res.status(500).json({ error: "Failed to generate calendar event" });
    }
  });

  // Locations
  app.get("/api/locations", async (_req, res) => {
    try {
      const locations = await storage.getAllLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  app.get("/api/locations/:id", async (req, res) => {
    try {
      const location = await storage.getLocation(req.params.id);
      if (!location) {
        res.status(404).json({ message: "Location not found" });
        return;
      }
      res.json(location);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch location" });
    }
  });

  // Blog Posts
  app.get("/api/blog", async (_req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:id", async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.id);
      if (!post) {
        res.status(404).json({ message: "Blog post not found" });
        return;
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  app.post("/api/blog", async (req, res) => {
    try {
      const validatedData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ message: "Invalid blog post data" });
    }
  });

  // Events
  app.get("/api/events", async (_req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        res.status(404).json({ message: "Event not found" });
        return;
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data" });
    }
  });

  // Testimonials
  app.get("/api/testimonials", async (_req, res) => {
    try {
      const testimonials = await storage.getAllTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  app.get("/api/testimonials/:id", async (req, res) => {
    try {
      const testimonial = await storage.getTestimonial(req.params.id);
      if (!testimonial) {
        res.status(404).json({ message: "Testimonial not found" });
        return;
      }
      res.json(testimonial);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch testimonial" });
    }
  });

  app.post("/api/testimonials", async (req, res) => {
    try {
      const validatedData = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(validatedData);
      res.status(201).json(testimonial);
    } catch (error) {
      res.status(400).json({ message: "Invalid testimonial data" });
    }
  });

  // Contact Submissions
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      
      // Send email notification
      try {
        await sendContactEmail(validatedData.name, validatedData.email, validatedData.message);
      } catch (emailError) {
        console.error("Failed to send contact email:", emailError);
      }
      
      res.status(201).json(submission);
    } catch (error) {
      res.status(400).json({ message: "Invalid contact submission data" });
    }
  });

  app.get("/api/contact", async (_req, res) => {
    try {
      const submissions = await storage.getAllContactSubmissions();
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact submissions" });
    }
  });

  // Church Members
  app.post("/api/church-members", async (req, res) => {
    try {
      const validatedData = insertChurchMemberSchema.parse(req.body);
      const member = await storage.createChurchMember(validatedData);
      res.status(201).json(member);
    } catch (error) {
      res.status(400).json({ message: "Invalid member data" });
    }
  });

  // Service Reminders (email signup for weekly Bible study reminders)
  const reminderRateLimit = new Map<string, number>();
  app.post("/api/service-reminders", async (req, res) => {
    try {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const now = Date.now();
      const lastAttempt = reminderRateLimit.get(ip);
      if (lastAttempt && now - lastAttempt < 10000) {
        return res.status(429).json({ message: "Too many requests. Please wait a moment." });
      }
      reminderRateLimit.set(ip, now);

      const emailSchema = insertServiceReminderSchema.extend({
        email: z.string().email("Please enter a valid email address").transform(e => e.trim().toLowerCase()),
      });
      const validated = emailSchema.parse(req.body);
      const existing = await db.select().from(serviceReminders).where(eq(serviceReminders.email, validated.email)).limit(1);
      if (existing.length > 0) {
        return res.status(200).json({ message: "already_subscribed" });
      }
      const [reminder] = await db.insert(serviceReminders).values(validated).returning();
      sendConfirmationEmail(validated.email, validated.timezone || 'UTC').catch(err => {
        console.error('[ServiceReminder] Confirmation email error:', err);
      });
      res.status(201).json({ message: "subscribed", id: reminder.id });
    } catch (error) {
      console.error('[ServiceReminder] Error:', error);
      res.status(400).json({ message: "Invalid email" });
    }
  });

  // Notes Routes (requires authentication)
  app.get("/api/notes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid || req.session?.userId;
      const notes = await storage.getNotesByUser(userId);
      const count = notes.length;
      
      res.json({ notes, count });
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.get("/api/notes/search", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid || req.session?.userId;
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json({ notes: [] });
      }
      const notes = await storage.searchNotes(userId, query);
      res.json({ notes });
    } catch (error) {
      console.error("Error searching notes:", error);
      res.status(500).json({ message: "Failed to search notes" });
    }
  });

  app.get("/api/notes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid || req.session?.userId;
      const note = await storage.getNoteById(req.params.id, userId);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      console.error("Error fetching note:", error);
      res.status(500).json({ message: "Failed to fetch note" });
    }
  });

  app.post("/api/notes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid || req.session?.userId;
      const user = await storage.getUser(userId);
      const isPro = await isUserPro(user);
      
      const limitResult = await checkNotesLimit(userId, isPro);
      if (!limitResult.allowed) {
        return res.status(429).json({
          code: "USAGE_LIMIT_REACHED",
          feature: "notes",
          remaining: 0,
          limit: FEATURE_LIMITS.notes,
          message: "You've reached your notes limit. Upgrade to Pro for unlimited notes.",
        });
      }
      
      const validatedData = insertNoteSchema.parse({ ...req.body, userId });
      const note = await storage.createNote(validatedData);
      const count = await storage.countNotesByUser(userId);
      res.status(201).json({ note, count });
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(400).json({ message: "Invalid note data" });
    }
  });

  app.post("/api/notes/general", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid || req.session?.userId;
      const { content, tags } = req.body;
      
      if (!content || !content.trim()) {
        return res.status(400).json({ message: "Note content is required" });
      }
      
      const user = await storage.getUser(userId);
      const isPro = await isUserPro(user);
      
      const limitResult = await checkNotesLimit(userId, isPro);
      if (!limitResult.allowed) {
        return res.status(429).json({
          code: "USAGE_LIMIT_REACHED",
          feature: "notes",
          remaining: 0,
          limit: FEATURE_LIMITS.notes,
          message: "You've reached your notes limit. Upgrade to Pro for unlimited notes.",
        });
      }
      
      const noteData = {
        userId,
        verseRef: "General Note",
        verseText: "",
        content: content.trim(),
        tags: tags || [],
        bookId: 0,
        chapter: 0,
        verse: 0,
      };
      
      const note = await storage.createNote(noteData);
      const count = await storage.countNotesByUser(userId);
      res.status(201).json({ note, count });
    } catch (error) {
      console.error("Error creating general note:", error);
      res.status(400).json({ message: "Failed to create note" });
    }
  });

  // Usage Summary endpoint for Profile page
  app.get("/api/usage/summary", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid || req.session?.userId;
      const user = await storage.getUser(userId);
      const isPro = await isUserPro(user);
      const pricingTier = user?.pricingTier as 'premium' | 'emerging' | undefined;
      
      const summary = await getUsageSummary(userId, isPro, pricingTier);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching usage summary:", error);
      res.status(500).json({ message: "Failed to fetch usage summary" });
    }
  });

  // Combined Profile Data endpoint - reduces API calls from 2 to 1
  app.get("/api/profile/data", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid || req.session?.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isPro = await isUserPro(user);
      const pricingTier = user?.pricingTier as 'premium' | 'emerging' | undefined;

      // Fetch subscription and usage in parallel
      const [subscription, usageSummary] = await Promise.all([
        user.stripeCustomerId 
          ? stripeStorage.getCustomerSubscription(user.stripeCustomerId)
          : Promise.resolve(null),
        getUsageSummary(userId, isPro, pricingTier),
      ]);

      const isStripeProUser = subscription 
        ? ((subscription as any).status === 'active' || (subscription as any).status === 'trialing')
        : false;

      res.json({
        subscription: {
          subscription,
          isProUser: isStripeProUser || isPro,
          stripeCustomerId: user.stripeCustomerId,
        },
        usage: usageSummary,
      });
    } catch (error) {
      console.error("Error fetching profile data:", error);
      res.status(500).json({ message: "Failed to fetch profile data" });
    }
  });

  // Delete Account
  app.delete("/api/account", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid || req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const deleted = await storage.deleteUser(userId);
      
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete account" });
      }

      // Destroy session after account deletion
      req.session.destroy((err: any) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
      });

      res.json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // ============================================
  // ONBOARDING TOOLTIPS ENDPOINTS
  // ============================================

  app.get("/api/onboarding/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid || req.session?.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        hasSeenTranslationTooltip: user.hasSeenTranslationTooltip ?? false,
        hasSeenVerseTooltip: user.hasSeenVerseTooltip ?? false,
        hasSeenActionBarTooltip: user.hasSeenActionBarTooltip ?? false,
      });
    } catch (error) {
      console.error("Error fetching onboarding status:", error);
      res.status(500).json({ message: "Failed to fetch onboarding status" });
    }
  });

  app.post("/api/onboarding/mark-seen", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid || req.session?.userId;
      const { tooltip } = req.body;

      if (!tooltip || !["translation", "verse", "actionBar"].includes(tooltip)) {
        return res.status(400).json({ message: "Invalid tooltip type" });
      }

      if (tooltip === "translation") {
        await db.update(users)
          .set({ hasSeenTranslationTooltip: true })
          .where(eq(users.id, userId));
      } else if (tooltip === "verse") {
        await db.update(users)
          .set({ hasSeenVerseTooltip: true })
          .where(eq(users.id, userId));
      } else if (tooltip === "actionBar") {
        await db.update(users)
          .set({ hasSeenActionBarTooltip: true })
          .where(eq(users.id, userId));
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error marking tooltip seen:", error);
      res.status(500).json({ message: "Failed to mark tooltip seen" });
    }
  });

  app.post("/api/onboarding/reset", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid || req.session?.userId;

      await db.update(users)
        .set({
          hasSeenTranslationTooltip: false,
          hasSeenVerseTooltip: false,
          hasSeenActionBarTooltip: false,
        })
        .where(eq(users.id, userId));

      res.json({ success: true });
    } catch (error) {
      console.error("Error resetting onboarding:", error);
      res.status(500).json({ message: "Failed to reset onboarding" });
    }
  });

  app.patch("/api/notes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid || req.session?.userId;
      const { content, tags } = req.body;
      
      const note = await storage.updateNote(req.params.id, userId, { content, tags });
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      console.error("Error updating note:", error);
      res.status(400).json({ message: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid || req.session?.userId;
      const deleted = await storage.deleteNote(req.params.id, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting note:", error);
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  // ============================================
  // PRAYER REQUEST ROUTES
  // ============================================
  
  // Submit a prayer request (works for both authenticated and guest users)
  app.post("/api/prayer-requests", async (req: any, res) => {
    try {
      const userId = req.user?.uid || req.session?.userId || null;
      const { name, email, content, isAnonymous } = req.body;
      
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Prayer content is required" });
      }
      
      // If anonymous, don't store user info or persist to database
      if (isAnonymous) {
        // Just acknowledge - no database storage for anonymous prayers
        console.log("[Prayer] Anonymous prayer submitted (not stored)");
        return res.json({ 
          success: true, 
          isAnonymous: true,
          message: "Your prayer has been lifted up" 
        });
      }
      
      // Store non-anonymous prayer requests
      const [prayerRequest] = await db.insert(prayerRequests).values({
        userId,
        name: name || null,
        email: email || null,
        content: content.trim(),
        isAnonymous: false,
      }).returning();
      
      console.log(`[Prayer] Prayer request submitted: ${prayerRequest.id}`);
      res.json({ success: true, prayerRequest });
    } catch (error) {
      console.error("Error submitting prayer request:", error);
      res.status(500).json({ message: "Failed to submit prayer request" });
    }
  });
  
  // Get user's prayer requests (authenticated users only)
  app.get("/api/prayer-requests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid || req.session?.userId;
      
      const userPrayers = await db.select()
        .from(prayerRequests)
        .where(eq(prayerRequests.userId, userId))
        .orderBy(sql`${prayerRequests.createdAt} DESC`);
      
      res.json(userPrayers);
    } catch (error) {
      console.error("Error fetching prayer requests:", error);
      res.status(500).json({ message: "Failed to fetch prayer requests" });
    }
  });
  
  // Record a prayer session (for stats tracking)
  app.post("/api/prayer-sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid || req.session?.userId;
      const { durationSeconds, withMusic } = req.body;
      
      if (!durationSeconds || durationSeconds < 1) {
        return res.status(400).json({ message: "Invalid duration" });
      }
      
      const [session] = await db.insert(prayerSessions).values({
        userId,
        durationSeconds,
        withMusic: withMusic || false,
      }).returning();
      
      res.json({ success: true, session });
    } catch (error) {
      console.error("Error recording prayer session:", error);
      res.status(500).json({ message: "Failed to record prayer session" });
    }
  });
  
  // Get prayer stats for user
  app.get("/api/prayer-stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid || req.session?.userId;
      
      // Get all sessions
      const sessions = await db.select()
        .from(prayerSessions)
        .where(eq(prayerSessions.userId, userId))
        .orderBy(sql`${prayerSessions.completedAt} DESC`);
      
      // Calculate stats
      const totalSessions = sessions.length;
      const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
      const totalMinutes = Math.floor(totalSeconds / 60);
      
      // Calculate streak (consecutive days)
      let streak = 0;
      if (sessions.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const sessionDates = sessions.map(s => {
          const d = new Date(s.completedAt);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        });
        
        const uniqueDates = Array.from(new Set(sessionDates)).sort((a, b) => b - a);
        
        // Check if most recent session is today or yesterday
        const mostRecent = uniqueDates[0];
        const diff = Math.floor((today.getTime() - mostRecent) / (1000 * 60 * 60 * 24));
        
        if (diff <= 1) {
          streak = 1;
          for (let i = 1; i < uniqueDates.length; i++) {
            const dayDiff = Math.floor((uniqueDates[i - 1] - uniqueDates[i]) / (1000 * 60 * 60 * 24));
            if (dayDiff === 1) {
              streak++;
            } else {
              break;
            }
          }
        }
      }
      
      // Get prayer request count
      const prayerRequestCount = await db.select({ count: sql`count(*)` })
        .from(prayerRequests)
        .where(eq(prayerRequests.userId, userId));
      
      res.json({
        totalSessions,
        totalMinutes,
        streak,
        prayerRequestCount: Number(prayerRequestCount[0]?.count || 0),
        recentSessions: sessions.slice(0, 7), // Last 7 sessions
      });
    } catch (error) {
      console.error("Error fetching prayer stats:", error);
      res.status(500).json({ message: "Failed to fetch prayer stats" });
    }
  });

  app.post("/api/donate/create-checkout", async (req: any, res) => {
    try {
      const { amountCents, frequency, note } = req.body;
      const userId = req.user?.uid || req.session?.userId || null;

      if (!amountCents || amountCents < 100) {
        return res.status(400).json({ message: "Minimum donation is $1.00" });
      }
      if (amountCents > 99999900) {
        return res.status(400).json({ message: "Please contact us for large donations" });
      }

      const stripe = await getUncachableStripeClient();
      const origin = req.headers.origin || 'https://thetravelingchurch.com';
      const isMonthly = frequency === "monthly";

      const productName = isMonthly
        ? "Monthly Donation to The Traveling Church"
        : "Donation to The Traveling Church";

      const priceData: any = {
        currency: 'usd',
        product_data: {
          name: productName,
          description: note || 'Supporting The Traveling Church ministry worldwide',
        },
        unit_amount: amountCents,
      };

      if (isMonthly) {
        priceData.recurring = { interval: 'month' as const };
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: priceData,
          quantity: 1,
        }],
        mode: isMonthly ? 'subscription' : 'payment',
        success_url: `${origin}/donate?success=true`,
        cancel_url: `${origin}/donate?cancelled=true`,
        metadata: {
          type: 'general_donation',
          frequency: frequency || 'one-time',
          userId: userId || 'guest',
          note: note || '',
        },
      });

      console.log(`[Donate] ${isMonthly ? 'Monthly' : 'One-time'} checkout created: $${(amountCents / 100).toFixed(2)}, session: ${session.id}`);
      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating donation checkout:", error);
      res.status(500).json({ message: "Failed to create donation checkout" });
    }
  });

  // Create Stripe checkout for candle donation
  app.post("/api/candle-donation/create-checkout", async (req: any, res) => {
    try {
      const { amountCents, prayerRequestId } = req.body;
      const userId = req.user?.uid || req.session?.userId || null;
      
      if (!amountCents || amountCents < 100) {
        return res.status(400).json({ message: "Invalid donation amount" });
      }
      
      // Get the Stripe client
      const stripe = await stripeService.getClient();
      
      // Determine success/cancel URLs based on request origin
      const origin = req.headers.origin || 'https://vagabondbible.com';
      
      // Create Stripe checkout session for one-time donation
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Light a Candle',
              description: 'Support The Traveling Church prayer ministry',
              images: ['https://vagabondbible.com/candle-icon.png'],
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${origin}/prayer-requests?donation=success`,
        cancel_url: `${origin}/prayer-requests?donation=cancelled`,
        metadata: {
          type: 'candle_donation',
          userId: userId || 'guest',
          prayerRequestId: prayerRequestId || '',
        },
      });
      
      // Record pending donation in database
      if (!prayerRequestId || prayerRequestId === 'null') {
        // If no prayer request ID, still log donation attempt
        console.log(`[Candle] Donation checkout created: ${amountCents} cents, session: ${session.id}`);
      } else {
        await db.insert(candleDonations).values({
          userId,
          prayerRequestId,
          amountCents,
          stripePaymentIntentId: session.payment_intent as string || null,
          status: 'pending',
        });
      }
      
      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating candle donation checkout:", error);
      res.status(500).json({ message: "Failed to create donation checkout" });
    }
  });

  // Stripe Routes
  app.get("/api/stripe/config", async (_req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      res.status(500).json({ message: "Failed to get Stripe config" });
    }
  });

  app.get("/api/stripe/products", async (_req, res) => {
    try {
      const products = await stripeStorage.listProducts();
      res.json({ data: products });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/stripe/products-with-prices", async (_req, res) => {
    try {
      const rows = await stripeStorage.listProductsWithPrices();
      
      const productsMap = new Map();
      for (const row of rows as any[]) {
        if (!productsMap.has(row.product_id)) {
          productsMap.set(row.product_id, {
            id: row.product_id,
            name: row.product_name,
            description: row.product_description,
            active: row.product_active,
            metadata: row.product_metadata,
            prices: []
          });
        }
        if (row.price_id) {
          productsMap.get(row.product_id).prices.push({
            id: row.price_id,
            unit_amount: row.unit_amount,
            currency: row.currency,
            recurring: row.recurring,
            active: row.price_active,
            metadata: row.price_metadata,
          });
        }
      }

      res.json({ data: Array.from(productsMap.values()) });
    } catch (error) {
      console.error("Error fetching products with prices:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/stripe/prices", async (_req, res) => {
    try {
      const prices = await stripeStorage.listPrices();
      res.json({ data: prices });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch prices" });
    }
  });

  app.get("/api/pricing/tier", async (req, res) => {
    try {
      const ipCountry = req.headers['cf-ipcountry'] as string || 
                        req.headers['x-vercel-ip-country'] as string ||
                        req.headers['x-real-ip-country'] as string ||
                        null;
      
      const countryToUse = ipCountry;
      const pricing = getPricingForCountry(countryToUse);
      
      res.json({
        tier: pricing.tier,
        price: pricing.price,
        priceDisplay: pricing.priceDisplay,
        detectedCountry: countryToUse || 'unknown',
        source: ipCountry ? 'ip' : 'default',
      });
    } catch (error) {
      console.error("Pricing tier error:", error);
      res.json({
        tier: 'premium' as PricingTier,
        price: PRICING_TIERS.premium.price,
        priceDisplay: PRICING_TIERS.premium.priceDisplay,
        detectedCountry: 'unknown',
        source: 'error',
      });
    }
  });

  app.post("/api/stripe/regional-checkout", async (req: any, res) => {
    try {
      const { referralCode, displayedTier } = req.body as { referralCode?: string; displayedTier?: string };
      
      let customerId: string;
      let userId: string | undefined;
      let pricingTier: PricingTier = 'premium';
      
      if ((req.session as any)?.userId) {
        userId = (req.session as any).userId;
        const user = await storage.getUser(userId!);
        const email = user?.email || '';
        
        const customer = await stripeService.getOrCreateCustomer(
          user?.stripeCustomerId || null,
          email,
          userId!,
          referralCode || undefined
        );
        customerId = customer.id;
        
        if (user && user.stripeCustomerId !== customer.id) {
          await storage.updateUserStripeInfo(userId!, { stripeCustomerId: customer.id });
        }
        
        const cardCountry = await stripeService.getCustomerCountry(customerId);
        
        if (cardCountry) {
          pricingTier = getTierForCountry(cardCountry);
        } else {
          const ipCountry = req.headers['cf-ipcountry'] as string || 
                            req.headers['x-vercel-ip-country'] as string ||
                            req.headers['x-real-ip-country'] as string ||
                            null;
          if (ipCountry) {
            pricingTier = getTierForCountry(ipCountry);
          } else if (displayedTier === 'premium' || displayedTier === 'emerging') {
            pricingTier = displayedTier;
          }
        }
        
        console.log(`[Regional Checkout] User ${userId}, cardCountry: ${cardCountry || 'unknown'}, ipCountry: ${req.headers['cf-ipcountry'] || 'unknown'}, displayedTier: ${displayedTier || 'none'}, finalTier: ${pricingTier}, referralCode: ${referralCode || 'none'}`);
      } else {
        console.log(`[Regional Checkout] Guest checkout (no card yet, defaulting to premium) - referralCode: ${referralCode || 'none'}`);
        const customer = await stripeService.createCustomer('', 'guest', referralCode || undefined);
        customerId = customer.id;
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      let userEmail: string | undefined;
      if (userId) {
        const user = await storage.getUser(userId);
        userEmail = user?.email || undefined;
      }
      
      const session = await stripeService.createRegionalCheckoutSession(
        customerId,
        pricingTier,
        `${baseUrl}/checkout/success`,
        `${baseUrl}/checkout/cancel`,
        {
          userId: userId || undefined,
          referralCode: referralCode || undefined,
          email: userEmail,
          pricingTier,
        }
      );

      res.json({ url: session.url, tier: pricingTier });
    } catch (error: any) {
      console.error("Regional checkout error:", error);
      const errorMessage = error?.message || error?.raw?.message || String(error);
      res.status(500).json({ message: "Failed to create checkout session", error: errorMessage });
    }
  });

  app.post("/api/stripe/checkout", async (req: any, res) => {
    try {
      const { priceId, referralCode } = req.body;
      
      if (!priceId) {
        return res.status(400).json({ message: "Price ID is required" });
      }

      let customerId: string;
      let userId: string | undefined;
      
      // Check if user is authenticated
      if ((req.session as any)?.userId) {
        userId = (req.session as any).userId;
        const user = await storage.getUser(userId!);
        const email = user?.email || '';
        
        // Use getOrCreateCustomer to handle test/live mode customer mismatch
        // Pass referral code so it can be tracked in customer metadata
        const customer = await stripeService.getOrCreateCustomer(
          user?.stripeCustomerId || null,
          email,
          userId!,
          referralCode || undefined
        );
        customerId = customer.id;
        
        // Update user's customer ID if it changed (new customer created for live mode)
        if (user && user.stripeCustomerId !== customer.id) {
          await storage.updateUserStripeInfo(userId!, { stripeCustomerId: customer.id });
        }
        
        console.log(`[Checkout] Creating session for user ${userId} with referralCode: ${referralCode || 'none'}`);
      } else {
        // Guest checkout (fallback) - still track referral code for potential manual matching
        console.log(`[Checkout] ⚠️ Guest checkout - no session.userId. Referral code: ${referralCode || 'none'}`);
        const customer = await stripeService.createCustomer('', 'guest', referralCode || undefined);
        customerId = customer.id;
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      // Get user email for metadata
      let userEmail: string | undefined;
      if (userId) {
        const user = await storage.getUser(userId);
        userEmail = user?.email || undefined;
      }
      
      const session = await stripeService.createCheckoutSession(
        customerId,
        priceId,
        `${baseUrl}/checkout/success`,
        `${baseUrl}/checkout/cancel`,
        {
          userId: userId || undefined,
          referralCode: referralCode || undefined,
          email: userEmail,
        }
      );

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Checkout error:", error);
      const errorMessage = error?.message || error?.raw?.message || String(error);
      res.status(500).json({ message: "Failed to create checkout session", error: errorMessage });
    }
  });

  app.post("/api/stripe/portal", async (req: any, res) => {
    try {
      const { customerId } = req.body;
      
      if (!customerId) {
        return res.status(400).json({ message: "Customer ID is required" });
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const session = await stripeService.createCustomerPortalSession(
        customerId,
        `${baseUrl}/account`
      );

      res.json({ url: session.url });
    } catch (error) {
      console.error("Portal error:", error);
      res.status(500).json({ message: "Failed to create portal session" });
    }
  });

  app.get("/api/stripe/subscription/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      const subscription = await stripeStorage.getCustomerSubscription(customerId);
      res.json({ subscription });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // Get current user's subscription status (requires authentication)
  app.get("/api/stripe/my-subscription", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid || (req.session as any)?.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let subscription = null;
      let isProUser = false;

      if (user.stripeCustomerId) {
        subscription = await stripeStorage.getCustomerSubscription(user.stripeCustomerId) as any;
        isProUser = (subscription?.status === 'active' || subscription?.status === 'trialing');
      }

      res.json({ 
        subscription,
        isProUser,
        stripeCustomerId: user.stripeCustomerId
      });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // Create customer portal session for authenticated user
  app.post("/api/stripe/my-portal", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid || (req.session as any)?.userId;
      const user = await storage.getUser(userId);
      
      if (!user?.stripeCustomerId) {
        return res.status(400).json({ message: "No subscription found" });
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const session = await stripeService.createCustomerPortalSession(
        user.stripeCustomerId,
        `${baseUrl}/pastor-chat`
      );

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Portal error:", error);
      
      // Handle case where Stripe customer no longer exists
      if (error?.code === 'resource_missing' && error?.param === 'customer') {
        // Clear the invalid customer ID from the user record
        const userId = req.user?.uid || (req.session as any)?.userId;
        if (userId) {
          await storage.updateUserStripeInfo(userId, { stripeCustomerId: null, stripeSubscriptionId: null });
        }
        return res.status(400).json({ 
          message: "Your subscription data was reset. Please subscribe again to access premium features.",
          customerReset: true
        });
      }
      
      res.status(500).json({ message: "Failed to create portal session" });
    }
  });

  // Admin endpoint to backfill Stripe customer links for existing users
  app.post("/api/admin/sync-stripe-customers", async (req, res) => {
    try {
      const results = await syncStripeCustomersToUsers();
      res.json(results);
    } catch (error) {
      console.error("Error syncing Stripe customers:", error);
      res.status(500).json({ message: "Failed to sync Stripe customers" });
    }
  });

  // Admin endpoint to check webhook configuration (requires super admin)
  app.get("/api/admin/webhook-status", isAuthenticated, async (req: any, res) => {
    try {
      // Check if user is super admin
      const userId = req.user?.uid || (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const ambassador = await db.select().from(ambassadors).where(eq(ambassadors.userId, userId));
      if (!ambassador.length || !ambassador[0].isSuperAdmin) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      
      const { getStripeSync, getUncachableStripeClient } = await import("./stripeClient");
      const sync = await getStripeSync();
      const stripe = await getUncachableStripeClient();
      
      // Get managed webhook info
      const webhookInfo = await sync.getManagedWebhook();
      
      // List all webhooks in Stripe
      const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
      
      // Get recent events count from database
      const eventsResult = await db.execute(sql`SELECT COUNT(*) as count FROM stripe.events`);
      const eventsCount = eventsResult.rows[0]?.count || 0;
      
      res.json({
        managedWebhook: webhookInfo ? {
          id: webhookInfo.id,
          url: webhookInfo.url,
          status: webhookInfo.status,
          enabledEvents: webhookInfo.enabled_events,
        } : null,
        allWebhooks: webhooks.data.map(w => ({
          id: w.id,
          url: w.url,
          status: w.status,
          enabledEvents: w.enabled_events,
        })),
        eventsInDatabase: eventsCount,
        expectedWebhookUrl: `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}/api/stripe/webhook`,
      });
    } catch (error: any) {
      console.error("Error checking webhook status:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Background job: sync Stripe customers every hour instead of on startup
  // This ensures subscription status stays in sync without blocking server startup
  const STRIPE_SYNC_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds
  setInterval(() => {
    syncStripeCustomersToUsers().catch(err => {
      console.error("Error during scheduled Stripe customer sync:", err);
    });
  }, STRIPE_SYNC_INTERVAL);
  console.log("Stripe customer sync scheduled to run every hour");

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to track ambassador conversion (backup for when webhooks fail)
async function trackAmbassadorConversionBackup(userId: string, source: string): Promise<boolean> {
  try {
    // Check if this user has a referral signup entry that hasn't been converted yet
    const existing = await db.select().from(referralSignups).where(eq(referralSignups.userId, userId));
    
    if (existing.length === 0) {
      // No referral signup - they didn't use a referral link
      return false;
    }
    
    if (existing[0].convertedToPro) {
      // Already marked as converted
      return false;
    }
    
    // Mark as converted
    const result = await db.update(referralSignups)
      .set({ convertedToPro: true, conversionDate: new Date() })
      .where(eq(referralSignups.userId, userId))
      .returning();
    
    if (result.length > 0) {
      console.log(`[Ambassador Sync] 🎉 Tracked Pro conversion for user ${userId} via ${source} (referral code: ${result[0].referralCode})`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('[Ambassador Sync] ❌ Error tracking conversion:', error);
    return false;
  }
}

// Helper function to sync Stripe customers to user accounts
async function syncStripeCustomersToUsers() {
  const results = { synced: 0, skipped: 0, cleared: 0, conversions: 0, errors: [] as string[] };
  
  try {
    // Query stripe.customers table to find customers with userId metadata
    const customersResult = await db.execute(sql`
      SELECT id, email, metadata 
      FROM stripe.customers 
      WHERE metadata->>'userId' IS NOT NULL 
        AND metadata->>'userId' != 'guest'
    `);
    
    console.log(`[Stripe Sync] 📊 Found ${customersResult.rows.length} customers to check`);
    
    for (const customer of customersResult.rows) {
      const customerId = customer.id as string;
      const userId = (customer.metadata as any)?.userId;
      
      if (!userId) continue;
      
      try {
        // Check if user exists
        const user = await storage.getUser(userId);
        
        if (!user) {
          results.skipped++;
          continue;
        }
        
        const subResult = await db.execute(sql`
          SELECT id FROM stripe.subscriptions 
          WHERE customer = ${customerId} 
            AND status IN ('active', 'trialing')
          ORDER BY cancel_at_period_end ASC, created DESC 
          LIMIT 1
        `);
        
        const subscriptionId = subResult.rows[0]?.id as string | null;
        
        // Check if update is needed
        const needsUpdate = user.stripeCustomerId !== customerId || 
                           user.stripeSubscriptionId !== subscriptionId;
        
        if (!needsUpdate) {
          results.skipped++;
          continue;
        }
        
        // Update the user's Stripe info (use null to clear subscription if none active)
        await storage.updateUserStripeInfo(userId, {
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
        });
        
        if (subscriptionId) {
          console.log(`[Stripe Sync] ✅ Synced customer ${customerId} to user ${userId} with subscription ${subscriptionId}`);
          results.synced++;
          
          // BACKUP: Track ambassador conversion if webhook missed it
          const tracked = await trackAmbassadorConversionBackup(userId, 'hourly sync backup');
          if (tracked) {
            results.conversions++;
          }
        } else {
          console.log(`[Stripe Sync] 🔄 Cleared inactive subscription for user ${userId} (customer ${customerId})`);
          results.cleared++;
        }
      } catch (err) {
        const errorMsg = `Failed to sync customer ${customerId}: ${err}`;
        console.error(`[Stripe Sync] ❌ ${errorMsg}`);
        results.errors.push(errorMsg);
      }
    }
  } catch (error) {
    console.error("[Stripe Sync] ❌ Error querying Stripe customers:", error);
    throw error;
  }
  
  console.log(`[Stripe Sync] 📈 Complete: ${results.synced} synced, ${results.cleared} cleared, ${results.skipped} skipped, ${results.conversions} ambassador conversions tracked`);
  return results;
}
