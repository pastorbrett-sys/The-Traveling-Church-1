import { users, type User, type UpsertUser } from "@shared/models/auth";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { eq } from "drizzle-orm";
import { sendWelcomeEmail } from "../../email";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

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
      console.log(`[Auth] New user detected: ${user.email} - sending welcome email`);
      sendWelcomeEmail(user.email, user.firstName).catch(error => {
        console.error('[Auth] Failed to send welcome email:', error);
      });
    }
    
    return user;
  }
}

export const authStorage = new AuthStorage();
