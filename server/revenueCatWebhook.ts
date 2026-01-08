import type { Express, Request, Response } from "express";
import { db } from "./storage";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

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
  
  const expectedAuth = `Bearer ${REVENUECAT_WEBHOOK_SECRET}`;
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
