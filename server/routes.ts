import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertBlogPostSchema,
  insertEventSchema,
  insertTestimonialSchema,
  insertContactSubmissionSchema,
} from "@shared/schema";
import { ObjectStorageService } from "./objectStorage";
import { sendContactEmail } from "./email";
import { registerChatRoutes } from "./replit_integrations/chat";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { stripeStorage } from "./stripeStorage";
import { stripeService } from "./stripeService";
import { getStripePublishableKey } from "./stripeClient";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication first (before other routes)
  await setupAuth(app);
  registerAuthRoutes(app);
  
  registerChatRoutes(app);

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
      if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
        userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        const email = req.user.claims.email || '';
        
        if (user?.stripeCustomerId) {
          customerId = user.stripeCustomerId;
        } else {
          const customer = await stripeService.createCustomer(email, userId);
          if (user) {
            await storage.updateUserStripeInfo(userId, { stripeCustomerId: customer.id });
          }
          customerId = customer.id;
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
    } catch (error) {
      console.error("Checkout error:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
    } catch (error) {
      console.error("Portal error:", error);
      res.status(500).json({ message: "Failed to create portal session" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
