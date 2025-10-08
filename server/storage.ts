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
        name: "Athens, Greece",
        country: "Greece",
        imageUrl: "https://images.unsplash.com/photo-1555993539-1732b0258235?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        description: "Walking the ancient paths where early apostles preached, sharing the timeless message of hope with modern seekers among historic ruins."
      },
      {
        name: "Nepal Highlands",
        country: "Nepal",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        description: "High in the mountains, finding common ground between faiths and sharing Christ's message of universal love with humble mountain communities."
      },
      {
        name: "Tokyo, Japan",
        country: "Japan",
        imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        description: "In the heart of the bustling metropolis, connecting with seekers in coffee shops and parks, bridging ancient faith with modern life."
      },
      {
        name: "Marrakech, Morocco",
        country: "Morocco",
        imageUrl: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        description: "Among the vibrant souks and diverse cultures, sharing stories of faith and finding beauty in our shared humanity and God's love."
      },
      {
        name: "Algarve, Portugal",
        country: "Portugal",
        imageUrl: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        description: "Like the first disciples who were fishermen, meeting with coastal communities and sharing the gospel by the sea where Jesus once walked."
      },
      {
        name: "Sedona, Arizona",
        country: "United States",
        imageUrl: "https://images.unsplash.com/photo-1434725039720-aaad6dd32dfe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        description: "In the vast desert, finding quiet moments of prayer and reflection, and encountering souls seeking spiritual awakening in the wilderness."
      }
    ];

    for (const location of initialLocations) {
      await storage.createLocation(location);
    }

    console.log("Database seeded with initial locations");
  }

  return storage;
}

export const storagePromise = initializeStorage();
export let storage: DbStorage;
storagePromise.then(s => storage = s);
