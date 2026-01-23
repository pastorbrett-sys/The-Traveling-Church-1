import cron from 'node-cron';
import { db } from './db';
import { pushTokens, notificationTypes, userNotificationPreferences, notificationLog } from '@shared/schema';
import { eq, and, sql, isNull, or } from 'drizzle-orm';
import { sendBatchNotifications, buildVerseNotificationPayload } from './firebaseAdmin';
import { selectVerseOfTheWeek } from './verseSelection';

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

    // Get all active notification types
    const activeTypes = await db
      .select()
      .from(notificationTypes)
      .where(eq(notificationTypes.isActive, true));

    for (const type of activeTypes) {
      await processNotificationType(type, currentUtcHour, currentUtcDay);
    }
  } catch (error) {
    console.error('[Cron] Error processing scheduled notifications:', error);
  }
}

async function processNotificationType(
  type: typeof notificationTypes.$inferSelect,
  currentUtcHour: number,
  currentUtcDay: number
) {
  const targetHour = type.sendHour;
  const targetDay = type.sendDay; // null means daily

  // Calculate which UTC offset would make it targetHour local time right now
  // If current UTC is 14:00 and target local is 8:00, we need offset -6
  // Formula: utcOffset = targetHour - currentUtcHour
  let requiredOffset = targetHour - currentUtcHour;
  
  // Handle wrap-around (e.g., if required offset is -20, it should be +4)
  if (requiredOffset < -12) requiredOffset += 24;
  if (requiredOffset > 14) requiredOffset -= 24;

  // For day-specific notifications, we need to check if it's the target day in the user's local timezone
  // If targetDay is null (daily), we always send
  // If targetDay is set, we need to verify the local day matches

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
        // Either no preference (uses default) or explicitly enabled
        or(
          isNull(userNotificationPreferences.enabled),
          eq(userNotificationPreferences.enabled, true)
        )
      )
    );

  // Filter by day if needed
  let tokensToSend = eligibleTokens;
  
  if (targetDay !== null) {
    // Calculate what day it is locally for each user
    tokensToSend = eligibleTokens.filter(token => {
      const userOffset = token.utcOffset || 0;
      // Calculate local hour and potentially day adjustment
      let localHour = currentUtcHour + userOffset;
      let dayAdjustment = 0;
      
      if (localHour >= 24) {
        localHour -= 24;
        dayAdjustment = 1;
      } else if (localHour < 0) {
        localHour += 24;
        dayAdjustment = -1;
      }
      
      const localDay = (currentUtcDay + dayAdjustment + 7) % 7;
      return localDay === targetDay;
    });
  }

  if (tokensToSend.length === 0) {
    // No users to notify at this hour for this type
    return;
  }

  console.log(`[Cron] Found ${tokensToSend.length} users for ${type.id} at UTC offset ${requiredOffset}`);

  // Get the notification content
  let payload;
  let verseRef = '';
  let verseText = '';

  if (type.id === 'verse_of_week') {
    // Use AI to select a verse
    const verse = await selectVerseOfTheWeek();
    verseRef = `${verse.book} ${verse.chapter}:${verse.verse}${verse.endVerse ? `-${verse.endVerse}` : ''}`;
    verseText = verse.text;
    payload = buildVerseNotificationPayload(
      verseRef,
      verse.text,
      verse.bookId,
      verse.chapter,
      verse.verse
    );
  } else {
    // Default notification for other types
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

// Manual trigger for testing
export async function triggerNotificationManually(typeId: string) {
  const types = await db
    .select()
    .from(notificationTypes)
    .where(eq(notificationTypes.id, typeId));

  if (types.length === 0) {
    throw new Error(`Notification type ${typeId} not found`);
  }

  const now = new Date();
  await processNotificationType(types[0], now.getUTCHours(), now.getUTCDay());
}
