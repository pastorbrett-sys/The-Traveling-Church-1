import { storage } from "./storage";
import { FEATURE_LIMITS, PRO_FEATURE_LIMITS, type FeatureUsageType } from "@shared/schema";

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
  chat_message: { used: number; limit: number; remaining: number };
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

// Check transcription limit - Pro-only feature with monthly limits
export async function checkTranscriptionLimit(
  userId: string,
  isPro: boolean
): Promise<UsageLimitResult> {
  // Non-Pro users cannot use transcription at all
  if (!isPro) {
    return {
      allowed: false,
      currentUsage: 0,
      limit: 0,
      remaining: 0,
      resetAt: null,
    };
  }

  // Pro users have a monthly limit
  const currentUsage = await storage.getFeatureUsage(userId, 'sermon_transcription');
  const limit = PRO_FEATURE_LIMITS.sermon_transcription;
  const remaining = Math.max(0, limit - currentUsage);

  return {
    allowed: currentUsage < limit,
    currentUsage,
    limit,
    remaining,
    resetAt: getNextMonthStart(),
  };
}

// Increment transcription usage for Pro users
export async function incrementTranscriptionUsage(userId: string): Promise<number> {
  return await storage.incrementFeatureUsage(userId, 'sermon_transcription');
}

export async function getUsageSummary(userId: string, isPro: boolean): Promise<UsageSummary> {
  if (isPro) {
    return {
      smart_search: { used: 0, limit: Infinity, remaining: Infinity },
      book_synopsis: { used: 0, limit: Infinity, remaining: Infinity },
      verse_insight: { used: 0, limit: Infinity, remaining: Infinity },
      notes: { used: 0, limit: Infinity, remaining: Infinity },
      chat_message: { used: 0, limit: Infinity, remaining: Infinity },
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
    chat_message: {
      used: featureUsage.chat_message,
      limit: FEATURE_LIMITS.chat_message,
      remaining: Math.max(0, FEATURE_LIMITS.chat_message - featureUsage.chat_message),
    },
    resetAt: getNextMonthStart().toISOString(),
    isPro: false,
  };
}
