import { storage } from "./storage";
import { FEATURE_LIMITS, type FeatureUsageType } from "@shared/schema";

export interface UsageLimitResult {
  allowed: boolean;
  currentUsage: number;
  limit: number;
  remaining: number;
  resetAt: Date | null;
}

export interface UsageSummary {
  smart_search: { used: number; limit: number; remaining: number };
  book_synopsis: { used: number; limit: number; remaining: number };
  verse_insight: { used: number; limit: number; remaining: number };
  notes: { used: number; limit: number; remaining: number };
  resetAt: string;
  isPro: boolean;
}

function getNextMonthStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}

export async function checkUsageLimit(
  userId: string,
  feature: FeatureUsageType,
  isPro: boolean
): Promise<UsageLimitResult> {
  if (isPro) {
    return {
      allowed: true,
      currentUsage: 0,
      limit: Infinity,
      remaining: Infinity,
      resetAt: null,
    };
  }

  const currentUsage = await storage.getFeatureUsage(userId, feature);
  const limit = FEATURE_LIMITS[feature];
  const remaining = Math.max(0, limit - currentUsage);

  return {
    allowed: currentUsage < limit,
    currentUsage,
    limit,
    remaining,
    resetAt: getNextMonthStart(),
  };
}

export async function incrementUsage(
  userId: string,
  feature: FeatureUsageType,
  isPro: boolean
): Promise<number> {
  if (isPro) {
    return 0;
  }
  return await storage.incrementFeatureUsage(userId, feature);
}

export async function checkNotesLimit(
  userId: string,
  isPro: boolean
): Promise<UsageLimitResult> {
  if (isPro) {
    return {
      allowed: true,
      currentUsage: 0,
      limit: Infinity,
      remaining: Infinity,
      resetAt: null,
    };
  }

  const currentCount = await storage.countNotesByUser(userId);
  const limit = FEATURE_LIMITS.notes;
  const remaining = Math.max(0, limit - currentCount);

  return {
    allowed: currentCount < limit,
    currentUsage: currentCount,
    limit,
    remaining,
    resetAt: null,
  };
}

export async function getUsageSummary(userId: string, isPro: boolean): Promise<UsageSummary> {
  if (isPro) {
    return {
      smart_search: { used: 0, limit: Infinity, remaining: Infinity },
      book_synopsis: { used: 0, limit: Infinity, remaining: Infinity },
      verse_insight: { used: 0, limit: Infinity, remaining: Infinity },
      notes: { used: 0, limit: Infinity, remaining: Infinity },
      resetAt: getNextMonthStart().toISOString(),
      isPro: true,
    };
  }

  const [featureUsage, noteCount] = await Promise.all([
    storage.getAllFeatureUsage(userId),
    storage.countNotesByUser(userId),
  ]);

  return {
    smart_search: {
      used: featureUsage.smart_search,
      limit: FEATURE_LIMITS.smart_search,
      remaining: Math.max(0, FEATURE_LIMITS.smart_search - featureUsage.smart_search),
    },
    book_synopsis: {
      used: featureUsage.book_synopsis,
      limit: FEATURE_LIMITS.book_synopsis,
      remaining: Math.max(0, FEATURE_LIMITS.book_synopsis - featureUsage.book_synopsis),
    },
    verse_insight: {
      used: featureUsage.verse_insight,
      limit: FEATURE_LIMITS.verse_insight,
      remaining: Math.max(0, FEATURE_LIMITS.verse_insight - featureUsage.verse_insight),
    },
    notes: {
      used: noteCount,
      limit: FEATURE_LIMITS.notes,
      remaining: Math.max(0, FEATURE_LIMITS.notes - noteCount),
    },
    resetAt: getNextMonthStart().toISOString(),
    isPro: false,
  };
}
