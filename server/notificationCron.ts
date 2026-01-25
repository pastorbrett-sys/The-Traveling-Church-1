import cron from 'node-cron';
import { db } from './db';
import { pushTokens, notificationTypes, userNotificationPreferences, notificationLog } from '@shared/schema';
import { eq, and, sql, isNull, or, desc } from 'drizzle-orm';
import { sendBatchNotifications, buildVerseNotificationPayload } from './firebaseAdmin';
import { selectVerseOfTheWeek } from './verseSelection';
import { getVerseForToday } from './dailyVerseData';

export function initNotificationCron() {
  console.log('Initializing notification cron job...');

  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log(`[Cron] Running notification check at ${new Date().toISOString()}`);
    await processScheduledNotifications();
  });

  console.log('Notification cron job initialized - runs every hour at :00');
}

async function processScheduledNotifications() {
  try {
    const now = new Date();
    const currentUtcHour = now.getUTCHours();
    const currentUtcDay = now.getUTCDay(); // 0 = Sunday, 2 = Tuesday, etc.

    // Get all active notification types, sorted by priority (highest first)
    const activeTypes = await db
      .select()
      .from(notificationTypes)
      .where(eq(notificationTypes.isActive, true))
      .orderBy(desc(notificationTypes.priority));

    for (const type of activeTypes) {
      await processNotificationType(type, currentUtcHour, currentUtcDay, activeTypes);
    }
  } catch (error) {
    console.error('[Cron] Error processing scheduled notifications:', error);
  }
}

async function processNotificationType(
  type: typeof notificationTypes.$inferSelect,
  currentUtcHour: number,
  currentUtcDay: number,
  allTypes: (typeof notificationTypes.$inferSelect)[]
) {
  const targetHour = type.sendHour;
  const targetDay = type.sendDay; // null means daily

  // Calculate which UTC offset would make it targetHour local time right now
  let requiredOffset = targetHour - currentUtcHour;
  
  // Handle wrap-around
  if (requiredOffset < -12) requiredOffset += 24;
  if (requiredOffset > 14) requiredOffset -= 24;

  // Find users with this UTC offset who have this notification enabled
  const eligibleTokens = await db
    .select({
      deviceToken: pushTokens.deviceToken,
      userId: pushTokens.userId,
      utcOffset: pushTokens.utcOffset,
    })
    .from(pushTokens)
    .leftJoin(
      userNotificationPreferences,
      and(
        eq(userNotificationPreferences.userId, pushTokens.userId),
        eq(userNotificationPreferences.notificationTypeId, type.id)
      )
    )
    .where(
      and(
        eq(pushTokens.utcOffset, requiredOffset),
        or(
          isNull(userNotificationPreferences.enabled),
          eq(userNotificationPreferences.enabled, true)
        )
      )
    );

  // Filter by day if needed (for weekly notifications)
  let tokensToSend = eligibleTokens;
  
  if (targetDay !== null) {
    tokensToSend = eligibleTokens.filter(token => {
      const localDay = getLocalDay(currentUtcDay, currentUtcHour, token.utcOffset || 0);
      return localDay === targetDay;
    });
  }

  // For verse_of_day, filter out users who would receive verse_of_week today
  // This is per-user collision detection based on their local timezone AND weekly preference
  if (type.id === 'verse_of_day') {
    const weeklyType = allTypes.find(t => t.id === 'verse_of_week' && t.isActive);
    if (weeklyType && weeklyType.sendDay !== null) {
      // Get users who have weekly notifications enabled
      const weeklyPrefs = await db
        .select({ userId: userNotificationPreferences.userId, enabled: userNotificationPreferences.enabled })
        .from(userNotificationPreferences)
        .where(eq(userNotificationPreferences.notificationTypeId, 'verse_of_week'));
      
      const weeklyDisabledUsers = new Set(
        weeklyPrefs.filter(p => p.enabled === false).map(p => p.userId)
      );

      tokensToSend = tokensToSend.filter(token => {
        const localDay = getLocalDay(currentUtcDay, currentUtcHour, token.utcOffset || 0);
        const isWeeklyVerseDay = localDay === weeklyType.sendDay;
        
        // Only skip if it's the weekly day AND user has weekly enabled (or no preference = default enabled)
        const hasWeeklyDisabled = weeklyDisabledUsers.has(token.userId);
        
        if (isWeeklyVerseDay && !hasWeeklyDisabled) {
          console.log(`[Cron] Skipping verse_of_day for user ${token.userId} - it's their weekly verse day (${localDay})`);
          return false;
        }
        return true;
      });
    }
  }

  if (tokensToSend.length === 0) {
    return;
  }

  console.log(`[Cron] Found ${tokensToSend.length} users for ${type.id} at UTC offset ${requiredOffset}`);

  // Get the notification content
  let payload;
  let verseRef = '';
  let verseText = '';

  if (type.id === 'verse_of_week') {
    const verse = await selectVerseOfTheWeek();
    verseRef = `${verse.book} ${verse.chapter}:${verse.verse}${verse.endVerse ? `-${verse.endVerse}` : ''}`;
    verseText = verse.text;
    payload = buildVerseNotificationPayload(
      verseRef,
      verse.text,
      verse.bookId,
      verse.chapter,
      verse.verse,
      verse.book
    );
  } else if (type.id === 'verse_of_day') {
    const verse = getVerseForToday();
    verseRef = `${verse.book} ${verse.chapter}:${verse.verse}${verse.endVerse ? `-${verse.endVerse}` : ''}`;
    verseText = verse.text;
    payload = buildVerseNotificationPayload(
      verseRef,
      verse.notificationText,
      verse.bookId,
      verse.chapter,
      verse.verse,
      verse.book
    );
  } else {
    payload = {
      title: type.name,
      body: type.description || 'Check out Vagabond Bible',
      data: { type: type.id },
    };
  }

  // Send notifications
  const tokens = tokensToSend.map(t => t.deviceToken);
  const result = await sendBatchNotifications(tokens, payload);

  // Log the result
  await db.insert(notificationLog).values({
    notificationTypeId: type.id,
    verseReference: verseRef || null,
    verseText: verseText || null,
    recipientCount: tokens.length,
    status: result.failureCount === 0 ? 'sent' : (result.successCount > 0 ? 'partial' : 'failed'),
    errorMessage: result.errors.length > 0 ? result.errors.slice(0, 5).join('; ') : null,
  });

  console.log(`[Cron] ${type.id}: Sent to ${result.successCount}/${tokens.length} users`);
}

// Calculate local day of week for a user given their UTC offset
function getLocalDay(currentUtcDay: number, currentUtcHour: number, utcOffset: number): number {
  let localHour = currentUtcHour + utcOffset;
  let dayAdjustment = 0;
  
  if (localHour >= 24) {
    dayAdjustment = 1;
  } else if (localHour < 0) {
    dayAdjustment = -1;
  }
  
  return (currentUtcDay + dayAdjustment + 7) % 7;
}

// Manual trigger for testing
export async function triggerNotificationManually(typeId: string) {
  const types = await db
    .select()
    .from(notificationTypes)
    .where(eq(notificationTypes.id, typeId));

  if (types.length === 0) {
    throw new Error(`Notification type ${typeId} not found`);
  }

  const allTypes = await db
    .select()
    .from(notificationTypes)
    .where(eq(notificationTypes.isActive, true));

  const now = new Date();
  await processNotificationType(types[0], now.getUTCHours(), now.getUTCDay(), allTypes);
}

// Send a single daily verse notification (for testing)
export async function sendDailyVerseTest(token: string) {
  const verse = getVerseForToday();
  const verseRef = `${verse.book} ${verse.chapter}:${verse.verse}${verse.endVerse ? `-${verse.endVerse}` : ''}`;
  
  const payload = buildVerseNotificationPayload(
    verseRef,
    verse.notificationText,
    verse.bookId,
    verse.chapter,
    verse.verse,
    verse.book
  );

  const { sendPushNotification } = await import('./firebaseAdmin');
  return sendPushNotification(token, payload);
}
