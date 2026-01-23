import { users, type User, type UpsertUser } from "@shared/models/auth";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { eq } from "drizzle-orm";
import { sendWelcomeEmail } from "../../email";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Function to update user's language preference
export async function updateUserLanguage(userId: string, language: string): Promise<void> {
  await db.update(users).set({ language, updatedAt: new Date() }).where(eq(users.id, userId));
}

// Function to get user's language preference
export async function getUserLanguage(userId: string): Promise<string> {
  const [user] = await db.select({ language: users.language }).from(users).where(eq(users.id, userId));
  return user?.language || 'en';
}

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Check if user already exists (to detect new vs returning user)
    const existingUser = userData.id ? await this.getUser(userData.id) : undefined;
    const isNewUser = !existingUser;
    
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    
    // Send welcome email to new users (fire and forget - don't block auth)
    if (isNewUser && user.email) {
      // Use the user's stored language (defaults to 'en' if not set)
      const userLanguage = user.language || 'en';
      console.log(`[Auth] New user detected: ${user.email} - sending welcome email (language: ${userLanguage})`);
      sendWelcomeEmail(user.email, user.firstName, userLanguage).catch(error => {
        console.error('[Auth] Failed to send welcome email:', error);
      });
    }
    
    return user;
  }
}

export const authStorage = new AuthStorage();
