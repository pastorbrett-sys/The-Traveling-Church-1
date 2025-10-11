import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import type {
  User,
  InsertUser,
  Location,
  InsertLocation,
  BlogPost,
  InsertBlogPost,
  Event,
  InsertEvent,
  Testimonial,
  InsertTestimonial,
  ContactSubmission,
  InsertContactSubmission,
} from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Locations
  getAllLocations(): Promise<Location[]>;
  getLocation(id: string): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;

  // Blog Posts
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;

  // Events
  getAllEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;

  // Testimonials
  getAllTestimonials(): Promise<Testimonial[]>;
  getTestimonial(id: string): Promise<Testimonial | undefined>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;

  // Contact Submissions
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getAllContactSubmissions(): Promise<ContactSubmission[]>;
}

export class DbStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(insertUser).returning();
    return result[0];
  }

  // Locations
  async getAllLocations(): Promise<Location[]> {
    return await db.select().from(schema.locations);
  }

  async getLocation(id: string): Promise<Location | undefined> {
    const result = await db.select().from(schema.locations).where(eq(schema.locations.id, id)).limit(1);
    return result[0];
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const result = await db.insert(schema.locations).values(insertLocation).returning();
    return result[0];
  }

  // Blog Posts
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(schema.blogPosts).orderBy(schema.blogPosts.createdAt);
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const result = await db.select().from(schema.blogPosts).where(eq(schema.blogPosts.id, id)).limit(1);
    return result[0];
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const result = await db.insert(schema.blogPosts).values(insertPost).returning();
    return result[0];
  }

  // Events
  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(schema.events).orderBy(schema.events.date);
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const result = await db.select().from(schema.events).where(eq(schema.events.id, id)).limit(1);
    return result[0];
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const result = await db.insert(schema.events).values(insertEvent).returning();
    return result[0];
  }

  // Testimonials
  async getAllTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(schema.testimonials).orderBy(schema.testimonials.createdAt);
  }

  async getTestimonial(id: string): Promise<Testimonial | undefined> {
    const result = await db.select().from(schema.testimonials).where(eq(schema.testimonials.id, id)).limit(1);
    return result[0];
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const result = await db.insert(schema.testimonials).values(insertTestimonial).returning();
    return result[0];
  }

  // Contact Submissions
  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    const result = await db.insert(schema.contactSubmissions).values(insertSubmission).returning();
    return result[0];
  }

  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(schema.contactSubmissions).orderBy(schema.contactSubmissions.createdAt);
  }
}

// Initialize storage and seed initial data
async function initializeStorage(): Promise<DbStorage> {
  const storage = new DbStorage();

  // Check if locations already exist
  const existingLocations = await storage.getAllLocations();

  if (existingLocations.length === 0) {
    // Seed initial locations
    const initialLocations: InsertLocation[] = [
      {
        name: "Jerusalem",
        country: "Israel",
        imageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        description: "Walking the holy streets where Jesus walked, sharing His message of love and redemption in the city that holds the heart of our faith."
      },
      {
        name: "Egypt",
        country: "Egypt",
        imageUrl: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        description: "Following the path of the Holy Family, bringing hope and healing to ancient lands where biblical history comes alive."
      },
      {
        name: "Thailand",
        country: "Thailand",
        imageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        description: "Among golden temples and gentle people, sharing Christ's love with open hearts in a land rich with spiritual seeking."
      },
      {
        name: "Cambodia",
        country: "Cambodia",
        imageUrl: "https://images.unsplash.com/photo-1604467794349-0b74285de7e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        description: "Ministering to communities rising from hardship, bringing the light of hope to those who have walked through darkness."
      },
      {
        name: "Ethiopia",
        country: "Ethiopia",
        imageUrl: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        description: "In the cradle of ancient Christianity, connecting with believers who have kept the faith through centuries, strengthening our global family."
      },
      {
        name: "Bethlehem",
        country: "Palestine",
        imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        description: "Standing where our Savior was born, sharing the timeless message of peace and goodwill to all who seek the light."
      }
    ];

    for (const location of initialLocations) {
      await storage.createLocation(location);
    }

    console.log("Database seeded with initial locations");
  }

  // Check if blog posts already exist
  const existingPosts = await storage.getAllBlogPosts();

  if (existingPosts.length === 0) {
    // Seed initial blog posts
    const initialPosts: InsertBlogPost[] = [
      {
        title: "Finding Faith in Athens",
        content: "Today I walked the same paths where the Apostle Paul once preached to the Athenians. Standing on Mars Hill, looking out over this ancient city, I was reminded that the message of God's love is timeless. The seekers I met in the streets and cafes were hungry for spiritual truth, just as they were 2000 years ago.\n\nWe don't need grand temples or ornate robes to share the gospel. All we need is an open heart and a willingness to meet people where they are. That's what the early apostles did, and that's what we're called to do today.",
        imageUrl: "https://images.unsplash.com/photo-1555993539-1732b0258235?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        locationId: null
      },
      {
        title: "Lessons from the Mountains",
        content: "In the highlands of Nepal, I've learned that faith transcends language and culture. Yesterday, I sat with a group of Buddhist monks, and we discovered that our different paths all lead toward the same divine truth: love, compassion, and service to others.\n\nThis is what being a traveling church means—not converting people, but connecting with them. Sharing the light of Christ doesn't mean dimming other lights. It means adding to the collective brightness of human spirituality.",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        locationId: null
      },
      {
        title: "The Modern Mission Field",
        content: "Tokyo's neon-lit streets might seem worlds away from ancient Jerusalem, but the hunger for meaning is the same. I've met young professionals who work 80-hour weeks, searching for something more than material success.\n\nOur mission isn't to judge their lifestyle or demand they change everything overnight. It's to show them that God's love meets them right where they are—in the subway, in the coffee shop, in the late-night ramen bar. The church isn't a building they need to enter. It's a community they're already invited to join.",
        imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        locationId: null
      }
    ];

    for (const post of initialPosts) {
      await storage.createBlogPost(post);
    }

    console.log("Database seeded with initial blog posts");
  }

  // Check if events already exist
  const existingEvents = await storage.getAllEvents();

  if (existingEvents.length === 0) {
    // Seed initial events
    const initialEvents: InsertEvent[] = [
      {
        title: "Online Global Gathering",
        description: "Join us for a virtual worship service connecting our global community. Share testimonies, prayer requests, and celebrate our worldwide fellowship.",
        date: new Date("2025-10-15T18:00:00Z"),
        location: "Online (Zoom)",
        type: "online"
      },
      {
        title: "Community Gathering in Lisbon",
        description: "In-person gathering for fellowship, worship, and sharing a meal together. All are welcome to join us by the waterfront.",
        date: new Date("2025-10-22T17:00:00Z"),
        location: "Lisbon, Portugal",
        type: "in-person"
      },
      {
        title: "Prayer Circle - Americas",
        description: "Virtual prayer circle for members across North and South America. Bring your prayer requests and join in collective intercession.",
        date: new Date("2025-10-29T20:00:00Z"),
        location: "Online (Zoom)",
        type: "online"
      },
      {
        title: "Street Ministry in Bangkok",
        description: "Join Pastor Brett for street outreach, sharing food and faith with those in need. Volunteer opportunities available.",
        date: new Date("2025-11-05T14:00:00Z"),
        location: "Bangkok, Thailand",
        type: "in-person"
      }
    ];

    for (const event of initialEvents) {
      await storage.createEvent(event);
    }

    console.log("Database seeded with initial events");
  }

  // Check if testimonials already exist
  const existingTestimonials = await storage.getAllTestimonials();

  if (existingTestimonials.length === 0) {
    // Seed initial testimonials
    const initialTestimonials: InsertTestimonial[] = [
      {
        name: "Maria Santos",
        location: "São Paulo, Brazil",
        content: "I found this community when I was at my lowest point. Pastor Brett's message that God loves me exactly as I am changed everything. I don't have to pretend to be perfect. I just have to be open."
      },
      {
        name: "Yuki Tanaka",
        location: "Tokyo, Japan",
        content: "Growing up, I thought Christianity was just a Western religion. But through this traveling church, I discovered that God's love knows no borders. It's universal, and it speaks to my Japanese heart just as powerfully."
      },
      {
        name: "Ahmed Hassan",
        location: "Cairo, Egypt",
        content: "I was skeptical at first—another religious group claiming to have all the answers. But this community is different. They listen more than they preach. They respect my journey while sharing theirs. That's real faith."
      },
      {
        name: "Sophie Martin",
        location: "Paris, France",
        content: "After years of feeling disconnected from my childhood faith, I found a home in this global community. We're not bound by buildings or traditions. We're bound by love, and that makes all the difference."
      },
      {
        name: "David Okonkwo",
        location: "Lagos, Nigeria",
        content: "This church embodies what Christianity should be—grassroots, inclusive, and focused on service. We don't wait for people to come to us. We go to them, wherever they are."
      },
      {
        name: "Elena Petrova",
        location: "Moscow, Russia",
        content: "In a world full of division, this community showed me that faith can unite us. Every online gathering reminds me that God's family extends across every border and boundary."
      }
    ];

    for (const testimonial of initialTestimonials) {
      await storage.createTestimonial(testimonial);
    }

    console.log("Database seeded with initial testimonials");
  }

  return storage;
}

export const storagePromise = initializeStorage();
export let storage: DbStorage;
storagePromise.then(s => storage = s);
