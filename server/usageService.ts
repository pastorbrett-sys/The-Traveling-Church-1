import { storage } from "./storage";
import { FEATURE_LIMITS, PRO_LIMITS_PREMIUM, PRO_LIMITS_EMERGING, type FeatureUsageType, type ProFeatureType } from "@shared/schema";
import type { PricingTier } from "@shared/regionalPricing";

export interface UsageLimitResult {
  allowed: boolean;
  currentUsage: number;
  limit: number;
  remaining: number;
  resetAt: Date | null;
  usedCredit?: boolean;
  creditsRemaining?: number;
  warningLevel?: 'none' | 'warning' | 'urgent';
}

export interface UsageSummary {
  smart_search: { used: number; limit: number; remaining: number };
  book_synopsis: { used: number; limit: number; remaining: number };
  verse_insight: { used: number; limit: number; remaining: number };
  notes: { used: number; limit: number; remaining: number };
  chat_message: { used: number; limit: number; remaining: number };
  resetAt: string;
  isPro: boolean;
  pricingTier?: PricingTier;
  credits?: number;
  resetType?: 'monthly' | 'daily';
}

function getNextMonthStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}

function getNextMidnightUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
}

function getTodayUTC(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

function getProLimits(tier: PricingTier) {
  return tier === 'emerging' ? PRO_LIMITS_EMERGING : PRO_LIMITS_PREMIUM;
}

function getWarningLevel(used: number, limit: number): 'none' | 'warning' | 'urgent' {
  const pct = used / limit;
  if (pct >= 0.9) return 'urgent';
  if (pct >= 0.8) return 'warning';
  return 'none';
}

export async function checkUsageLimit(
  userId: string,
  feature: FeatureUsageType,
  isPro: boolean,
  pricingTier?: PricingTier
): Promise<UsageLimitResult> {
  if (isPro) {
    const tier = pricingTier || 'premium';
    const proFeature = feature as ProFeatureType;
    const limits = getProLimits(tier);
    const limit = limits[proFeature];
    if (!limit) {
      return { allowed: true, currentUsage: 0, limit: Infinity, remaining: Infinity, resetAt: null, warningLevel: 'none' };
    }

    const today = getTodayUTC();
    const dailyUsage = await storage.getAllDailyUsage(userId, today);
    const currentUsage = dailyUsage[proFeature] ?? 0;
    const remaining = Math.max(0, limit - currentUsage);

    if (currentUsage < limit) {
      return {
        allowed: true,
        currentUsage,
        limit,
        remaining,
        resetAt: getNextMidnightUTC(),
        warningLevel: getWarningLevel(currentUsage, limit),
      };
    }

    const credits = await storage.getUserCredits(userId);
    if (credits > 0) {
      return {
        allowed: true,
        currentUsage,
        limit,
        remaining: 0,
        resetAt: getNextMidnightUTC(),
        usedCredit: true,
        creditsRemaining: credits - 1,
        warningLevel: 'urgent',
      };
    }

    return {
      allowed: false,
      currentUsage,
      limit,
      remaining: 0,
      resetAt: getNextMidnightUTC(),
      creditsRemaining: 0,
      warningLevel: 'urgent',
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
    warningLevel: 'none',
  };
}

export async function incrementUsage(
  userId: string,
  feature: FeatureUsageType,
  isPro: boolean,
  pricingTier?: PricingTier
): Promise<number> {
  if (isPro) {
    const proFeature = feature as ProFeatureType;
    const tier = pricingTier || 'premium';
    const limits = getProLimits(tier);
    const limit = limits[proFeature];

    if (!limit) return 0;

    const today = getTodayUTC();
    const dailyUsage = await storage.getAllDailyUsage(userId, today);
    const currentUsage = dailyUsage[proFeature] ?? 0;

    if (currentUsage >= limit) {
      const credits = await storage.getUserCredits(userId);
      if (credits > 0) {
        await storage.deductCredit(userId);
      }
    }

    const result = await storage.incrementDailyUsage(userId, today, proFeature);
    const columnMap: Record<ProFeatureType, 'chatCount' | 'searchCount' | 'synopsisCount' | 'insightCount'> = {
      chat_message: 'chatCount',
      smart_search: 'searchCount',
      book_synopsis: 'synopsisCount',
      verse_insight: 'insightCount',
    };
    return result[columnMap[proFeature]] as number;
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
      warningLevel: 'none',
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
    warningLevel: 'none',
  };
}

export async function getUsageSummary(userId: string, isPro: boolean, pricingTier?: PricingTier): Promise<UsageSummary> {
  if (isPro) {
    const tier = pricingTier || 'premium';
    const limits = getProLimits(tier);
    const today = getTodayUTC();

    const [dailyUsage, noteCount, credits] = await Promise.all([
      storage.getAllDailyUsage(userId, today),
      storage.countNotesByUser(userId),
      storage.getUserCredits(userId),
    ]);

    return {
      smart_search: {
        used: dailyUsage.smart_search,
        limit: limits.smart_search,
        remaining: Math.max(0, limits.smart_search - dailyUsage.smart_search),
      },
      book_synopsis: {
        used: dailyUsage.book_synopsis,
        limit: limits.book_synopsis,
        remaining: Math.max(0, limits.book_synopsis - dailyUsage.book_synopsis),
      },
      verse_insight: {
        used: dailyUsage.verse_insight,
        limit: limits.verse_insight,
        remaining: Math.max(0, limits.verse_insight - dailyUsage.verse_insight),
      },
      notes: {
        used: noteCount,
        limit: Infinity,
        remaining: Infinity,
      },
      chat_message: {
        used: dailyUsage.chat_message,
        limit: limits.chat_message,
        remaining: Math.max(0, limits.chat_message - dailyUsage.chat_message),
      },
      resetAt: getNextMidnightUTC().toISOString(),
      isPro: true,
      pricingTier: tier,
      credits,
      resetType: 'daily',
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
    chat_message: {
      used: featureUsage.chat_message,
      limit: FEATURE_LIMITS.chat_message,
      remaining: Math.max(0, FEATURE_LIMITS.chat_message - featureUsage.chat_message),
    },
    resetAt: getNextMonthStart().toISOString(),
    isPro: false,
    resetType: 'monthly',
  };
}
