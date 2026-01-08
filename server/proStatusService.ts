import { storage } from "./storage";
import { stripeStorage } from "./stripeStorage";
import type { User } from "@shared/schema";

export interface ProStatus {
  isPro: boolean;
  source: "stripe" | "revenuecat" | "none";
  expiresAt: Date | null;
}

export async function checkUserProStatus(user: User | null | undefined): Promise<ProStatus> {
  if (!user) {
    return { isPro: false, source: "none", expiresAt: null };
  }

  if (user.stripeSubscriptionId) {
    try {
      const subscription = await stripeStorage.getSubscription(user.stripeSubscriptionId) as any;
      if (subscription && (subscription.status === "active" || subscription.status === "trialing")) {
        const cancelAtPeriodEnd = subscription.cancel_at_period_end;
        if (!cancelAtPeriodEnd) {
          const periodEnd = subscription.current_period_end;
          return {
            isPro: true,
            source: "stripe",
            expiresAt: periodEnd ? new Date(Number(periodEnd) * 1000) : null,
          };
        }
      }
    } catch (error) {
      console.error("Error checking Stripe subscription:", error);
    }
  }

  if (user.revenueCatEntitlement) {
    const now = new Date();
    const expiresAt = user.revenueCatExpiresAt;
    
    if (!expiresAt || expiresAt > now) {
      return {
        isPro: true,
        source: "revenuecat",
        expiresAt: expiresAt || null,
      };
    }
  }

  return { isPro: false, source: "none", expiresAt: null };
}

export async function checkUserProStatusById(userId: string): Promise<ProStatus> {
  const user = await storage.getUser(userId);
  return checkUserProStatus(user);
}

export function isUserPro(user: User | null | undefined): boolean {
  if (!user) return false;
  
  if (user.stripeSubscriptionId) {
    return true;
  }
  
  if (user.revenueCatEntitlement) {
    const now = new Date();
    const expiresAt = user.revenueCatExpiresAt;
    if (!expiresAt || expiresAt > now) {
      return true;
    }
  }
  
  return false;
}
