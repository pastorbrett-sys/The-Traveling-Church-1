import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, db } from "./storage";
import { sql } from "drizzle-orm";
import {
  insertBlogPostSchema,
  insertEventSchema,
  insertTestimonialSchema,
  insertContactSubmissionSchema,
  insertNoteSchema,
  FEATURE_LIMITS,
} from "@shared/schema";
import { getUsageSummary, checkNotesLimit } from "./usageService";
import { ObjectStorageService } from "./objectStorage";
import { sendContactEmail } from "./email";
import { registerChatRoutes } from "./replit_integrations/chat";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { stripeStorage } from "./stripeStorage";
import { stripeService } from "./stripeService";
import { getStripePublishableKey } from "./stripeClient";
import bibleRoutes from "./bibleRoutes";
import { registerRevenueCatWebhook } from "./revenueCatWebhook";
import { isUserPro } from "./proStatusService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication first (before other routes)
  await setupAuth(app);
  registerAuthRoutes(app);
  
  // RevenueCat webhook (for native app subscriptions)
  registerRevenueCatWebhook(app);
  
  registerChatRoutes(app);
  
  // Bible routes
  app.use("/api/bible", bibleRoutes);

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

  // Notes Routes (requires authentication)
  app.get("/api/notes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
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
      const userId = req.session.userId;
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
      const userId = req.session.userId;
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
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      const isPro = isUserPro(user);
      
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
      const userId = req.session.userId;
      const { content, tags } = req.body;
      
      if (!content || !content.trim()) {
        return res.status(400).json({ message: "Note content is required" });
      }
      
      const user = await storage.getUser(userId);
      const isPro = isUserPro(user);
      
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
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      const isPro = isUserPro(user);
      
      const summary = await getUsageSummary(userId, isPro);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching usage summary:", error);
      res.status(500).json({ message: "Failed to fetch usage summary" });
    }
  });

  app.patch("/api/notes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
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
      const userId = req.session.userId;
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

  app.post("/api/stripe/checkout", async (req: any, res) => {
    try {
      const { priceId } = req.body;
      
      if (!priceId) {
        return res.status(400).json({ message: "Price ID is required" });
      }

      let customerId: string;
      let userId: string | undefined;
      
      // Check if user is authenticated
      if ((req.session as any)?.userId) {
        userId = (req.session as any).userId;
        const user = await storage.getUser(userId);
        const email = user?.email || '';
        
        // Use getOrCreateCustomer to handle test/live mode customer mismatch
        const customer = await stripeService.getOrCreateCustomer(
          user?.stripeCustomerId || null,
          email,
          userId
        );
        customerId = customer.id;
        
        // Update user's customer ID if it changed (new customer created for live mode)
        if (user && user.stripeCustomerId !== customer.id) {
          await storage.updateUserStripeInfo(userId, { stripeCustomerId: customer.id });
        }
      } else {
        // Guest checkout (fallback)
        const customer = await stripeService.createCustomer('', 'guest');
        customerId = customer.id;
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const session = await stripeService.createCheckoutSession(
        customerId,
        priceId,
        `${baseUrl}/checkout/success`,
        `${baseUrl}/checkout/cancel`
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
        // User is Pro only if subscription is active AND not set to cancel
        // This ensures immediate revocation when user cancels
        isProUser = (subscription?.status === 'active' || subscription?.status === 'trialing') 
                    && !subscription?.cancel_at_period_end;
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

// Helper function to sync Stripe customers to user accounts
async function syncStripeCustomersToUsers() {
  const results = { synced: 0, skipped: 0, cleared: 0, errors: [] as string[] };
  
  try {
    // Query stripe.customers table to find customers with userId metadata
    const customersResult = await db.execute(sql`
      SELECT id, email, metadata 
      FROM stripe.customers 
      WHERE metadata->>'userId' IS NOT NULL 
        AND metadata->>'userId' != 'guest'
    `);
    
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
        
        // Find any active subscription for this customer (not pending cancellation)
        const subResult = await db.execute(sql`
          SELECT id FROM stripe.subscriptions 
          WHERE customer = ${customerId} 
            AND status IN ('active', 'trialing')
            AND (cancel_at_period_end = false OR cancel_at_period_end IS NULL)
          ORDER BY created DESC 
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
          console.log(`Synced Stripe customer ${customerId} to user ${userId} with subscription ${subscriptionId}`);
          results.synced++;
        } else {
          console.log(`Cleared inactive subscription for user ${userId} (customer ${customerId})`);
          results.cleared++;
        }
      } catch (err) {
        const errorMsg = `Failed to sync customer ${customerId}: ${err}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }
  } catch (error) {
    console.error("Error querying Stripe customers:", error);
    throw error;
  }
  
  console.log(`Stripe customer sync complete: ${results.synced} synced, ${results.cleared} cleared, ${results.skipped} skipped`);
  return results;
}
