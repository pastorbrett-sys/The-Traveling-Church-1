import type { Express, Request, Response } from "express";
import { db } from "./storage";
import { users, referralSignups } from "@shared/schema";
import { eq } from "drizzle-orm";
import { sendSubscriptionConfirmationEmail } from "./email";
import { getUserLanguage } from "./replit_integrations/auth/storage";

// Enhanced ambassador tracking with multi-priority matching (matches Stripe handler)
async function trackAmbassadorConversion(userId: string, source: string, email?: string, referralCode?: string): Promise<void> {
  try {
    console.log(`[Ambassador] 🔄 Attempting to track conversion for user ${userId} (source: ${source}, email: ${email || 'none'}, referralCode: ${referralCode || 'none'})`);
    
    let existing: typeof referralSignups.$inferSelect[] = [];
    
    // PRIORITY 1: Match by userId (most reliable when available)
    if (userId && userId !== 'guest') {
      existing = await db.select().from(referralSignups).where(eq(referralSignups.userId, userId));
      if (existing.length > 0) {
        console.log(`[Ambassador] ✅ Found signup by userId: ${userId}`);
      }
    }
    
    // PRIORITY 2: If no userId match, try to find by email
    if (existing.length === 0 && email) {
      console.log(`[Ambassador] 🔍 No signup by userId, trying by email: ${email}`);
      
      // Find user by email
      const usersByEmail = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
      if (usersByEmail.length > 0) {
        const emailUserId = usersByEmail[0].id;
        existing = await db.select().from(referralSignups).where(eq(referralSignups.userId, emailUserId));
        if (existing.length > 0) {
          console.log(`[Ambassador] ✅ Found signup by email-matched userId: ${emailUserId}`);
        }
      }
    }
    
    // PRIORITY 3: Last resort - find by referralCode alone (most recent unconverted)
    if (existing.length === 0 && referralCode) {
      console.log(`[Ambassador] 🔍 No signup by userId or email, trying fallback by referralCode: ${referralCode}`);
      const byCode = await db.select().from(referralSignups)
        .where(eq(referralSignups.referralCode, referralCode));
      if (byCode.length > 0) {
        // Find most recent unconverted entry
        const unconverted = byCode
          .filter(s => !s.convertedToPro)
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          })[0];
        if (unconverted) {
          existing = [unconverted];
          console.log(`[Ambassador] ⚠️ Using referralCode-only fallback: ${referralCode} (signup ID: ${unconverted.id})`);
        }
      }
    }
    
    if (existing.length === 0) {
      console.log(`[Ambassador] ⚠️ No referral signup found for user ${userId} - they may not have used a referral link`);
      return;
    }
    
    if (existing[0].convertedToPro) {
      console.log(`[Ambassador] ✅ User ${userId} already marked as Pro conversion (date: ${existing[0].conversionDate})`);
      return;
    }
    
    // Only update if not already converted (idempotency)
    const result = await db.update(referralSignups)
      .set({ convertedToPro: true, conversionDate: new Date() })
      .where(eq(referralSignups.id, existing[0].id))
      .returning();
    
    if (result.length > 0) {
      console.log(`[Ambassador] 🎉 SUCCESS! Tracked Pro conversion for user ${userId} via RevenueCat (referral code: ${result[0].referralCode})`);
    }
  } catch (error) {
    console.error('[Ambassador] ❌ Error tracking conversion:', error);
  }
}

const REVENUECAT_WEBHOOK_SECRET = process.env.REVENUECAT_WEBHOOK_SECRET;

interface RevenueCatEvent {
  api_version: string;
  event: {
    type: string;
    id: string;
    app_user_id: string;
    aliases: string[];
    original_app_user_id: string;
    product_id: string;
    entitlement_ids: string[];
    period_type: string;
    purchased_at_ms: number;
    expiration_at_ms: number | null;
    environment: string;
    store: string;
    is_trial_conversion?: boolean;
    cancel_reason?: string;
  };
}

async function handleRevenueCatEvent(event: RevenueCatEvent["event"]): Promise<void> {
  const { type, app_user_id, entitlement_ids, expiration_at_ms } = event;
  
  console.log(`RevenueCat webhook: ${type} for user ${app_user_id}`);
  
  const entitlements = entitlement_ids || [];
  const hasProEntitlement = entitlements.includes("Vagabond Bible Pro");
  const expiresAt = expiration_at_ms ? new Date(expiration_at_ms) : null;
  
  switch (type) {
    case "INITIAL_PURCHASE":
    case "RENEWAL":
    case "PRODUCT_CHANGE":
    case "UNCANCELLATION":
      if (hasProEntitlement) {
        await updateUserRevenueCatStatus(app_user_id, "Vagabond Bible Pro", expiresAt);
        console.log(`Granted Pro entitlement to user ${app_user_id} (expires: ${expiresAt})`);
        
        // Look up user to get their email and referral info
        const existingUser = await db.select().from(users).where(eq(users.revenueCatUserId, app_user_id)).limit(1);
        
        if (existingUser.length > 0 && existingUser[0].id) {
          const user = existingUser[0];
          const store = (event as any).store || 'unknown';
          const productId = (event as any).product_id || '';
          
          // Get user's referral signup info if exists
          const referralInfo = await db.select().from(referralSignups)
            .where(eq(referralSignups.userId, user.id)).limit(1);
          const referralCode = referralInfo.length > 0 ? referralInfo[0].referralCode : undefined;
          
          // Track ambassador conversion with full matching capabilities
          await trackAmbassadorConversion(
            user.id, 
            `RevenueCat ${type} (${store})`,
            user.email || undefined,
            referralCode
          );
          
          // Send subscription confirmation email for INITIAL_PURCHASE only
          // (Don't spam on renewals)
          if (type === "INITIAL_PURCHASE" && user.email) {
            // Determine pricing tier from product ID
            // iOS: vagabond_bible_pro_monthly = premium, pro_monthly_emerging = emerging
            // Android: Uses regional pricing from Google Play
            let planType: 'premium' | 'emerging' = 'premium';
            if (productId.includes('emerging')) {
              planType = 'emerging';
            }
            
            // Get user's language preference for localized email
            const userLanguage = await getUserLanguage(user.id);
            
            console.log(`[RevenueCat] 📧 Sending subscription confirmation email to ${user.email} (plan: ${planType}, store: ${store}, language: ${userLanguage})`);
            const timestamp = new Date().toISOString();
            console.log(`[RevenueCat] Email send initiated at: ${timestamp}`);
            
            sendSubscriptionConfirmationEmail(user.email, user.firstName || undefined, planType, userLanguage).catch(error => {
              console.error('[RevenueCat] ❌ Failed to send subscription confirmation email:', error);
            });
          }
        } else {
          console.log(`[Ambassador] ⚠️ Cannot track conversion - no user found with RevenueCat ID: ${app_user_id}`);
        }
      }
      break;
      
    case "CANCELLATION":
      console.log(`User ${app_user_id} cancelled subscription (will expire: ${expiresAt})`);
      break;
      
    case "EXPIRATION":
    case "BILLING_ISSUE":
      await updateUserRevenueCatStatus(app_user_id, null, null);
      console.log(`Removed Pro entitlement from user ${app_user_id}`);
      break;
      
    case "SUBSCRIBER_ALIAS":
      console.log(`User alias event for ${app_user_id}`);
      break;
      
    default:
      console.log(`Unhandled RevenueCat event type: ${type}`);
  }
}

async function updateUserRevenueCatStatus(
  revenueCatUserId: string,
  entitlement: string | null,
  expiresAt: Date | null
): Promise<void> {
  const existingUsers = await db.select().from(users).where(eq(users.revenueCatUserId, revenueCatUserId));
  
  if (existingUsers.length > 0) {
    await db.update(users)
      .set({
        revenueCatEntitlement: entitlement,
        revenueCatExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.revenueCatUserId, revenueCatUserId));
  } else {
    console.log(`No user found with RevenueCat ID: ${revenueCatUserId}. User may need to link account.`);
  }
}

function verifyWebhookSignature(req: Request): boolean {
  const isProduction = process.env.REPLIT_DEPLOYMENT === '1';
  
  if (!REVENUECAT_WEBHOOK_SECRET) {
    if (isProduction) {
      console.error("REVENUECAT_WEBHOOK_SECRET not set in production - rejecting webhook");
      return false;
    }
    console.warn("REVENUECAT_WEBHOOK_SECRET not set - accepting all webhooks in development");
    return true;
  }
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.error("Missing Authorization header in RevenueCat webhook");
    return false;
  }
  
  // Handle both cases: secret with or without "Bearer " prefix
  const secret = REVENUECAT_WEBHOOK_SECRET!;
  const expectedAuth = secret.startsWith("Bearer ") ? secret : `Bearer ${secret}`;
  return authHeader === expectedAuth;
}

export function registerRevenueCatWebhook(app: Express): void {
  app.post("/api/revenuecat/webhook", async (req: Request, res: Response) => {
    try {
      if (!verifyWebhookSignature(req)) {
        console.error("RevenueCat webhook signature verification failed");
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const payload = req.body as RevenueCatEvent;
      
      if (!payload.event) {
        console.error("Invalid RevenueCat webhook payload - missing event");
        return res.status(400).json({ error: "Invalid payload" });
      }
      
      await handleRevenueCatEvent(payload.event);
      
      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Error processing RevenueCat webhook:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.post("/api/revenuecat/link", async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const { revenueCatUserId } = req.body;
      
      if (!revenueCatUserId || typeof revenueCatUserId !== "string") {
        return res.status(400).json({ error: "revenueCatUserId is required" });
      }
      
      await db.update(users)
        .set({
          revenueCatUserId,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
      
      console.log(`Linked RevenueCat user ${revenueCatUserId} to user ${user.id}`);
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error linking RevenueCat user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  console.log("RevenueCat webhook endpoint registered at /api/revenuecat/webhook");
}
