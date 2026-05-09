import { Router, Request, Response } from "express";
import { db } from "./db";
import { 
  pushTokens, 
  notificationTypes, 
  userNotificationPreferences, 
  notificationLog,
  insertPushTokenSchema
} from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { sendPushNotification, buildVerseNotificationPayload } from "./firebaseAdmin";

const router = Router();

// Register or update a push token
router.post("/register-token", async (req: Request, res: Response) => {
  try {
    const { deviceToken, platform, timezone, utcOffset, userId } = req.body;

    if (!deviceToken || !platform) {
      return res.status(400).json({ error: "deviceToken and platform are required" });
    }

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Atomic upsert using onConflictDoUpdate to avoid race conditions
    const result = await db.insert(pushTokens).values({
      userId,
      deviceToken,
      platform,
      timezone,
      utcOffset,
    }).onConflictDoUpdate({
      target: pushTokens.deviceToken,
      set: {
        userId,
        platform,
        timezone,
        utcOffset,
        updatedAt: new Date(),
      },
    }).returning();

    // Create default preferences for all active notification types (idempotent)
    const activeTypes = await db
      .select()
      .from(notificationTypes)
      .where(eq(notificationTypes.isActive, true));

    for (const type of activeTypes) {
      await db.insert(userNotificationPreferences).values({
        userId,
        notificationTypeId: type.id,
        enabled: type.defaultEnabled,
      }).onConflictDoNothing();
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error registering push token:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all notification types and user preferences
router.get("/preferences", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Get all active notification types
    const types = await db
      .select()
      .from(notificationTypes)
      .where(eq(notificationTypes.isActive, true));

    // Get user preferences
    const preferences = await db
      .select()
      .from(userNotificationPreferences)
      .where(eq(userNotificationPreferences.userId, userId));

    // Merge types with preferences
    const result = types.map(type => {
      const pref = preferences.find(p => p.notificationTypeId === type.id);
      return {
        id: type.id,
        name: type.name,
        description: type.description,
        enabled: pref ? pref.enabled : type.defaultEnabled,
      };
    });

    res.json(result);
  } catch (error: any) {
    console.error("Error getting preferences:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update a specific notification preference
router.put("/preferences/:typeId", async (req: Request, res: Response) => {
  try {
    const { typeId } = req.params;
    const { userId, enabled } = req.body;

    if (!userId || typeof enabled !== "boolean") {
      return res.status(400).json({ error: "userId and enabled (boolean) are required" });
    }

    // Check if preference exists
    const existing = await db
      .select()
      .from(userNotificationPreferences)
      .where(
        and(
          eq(userNotificationPreferences.userId, userId),
          eq(userNotificationPreferences.notificationTypeId, typeId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update
      await db
        .update(userNotificationPreferences)
        .set({ enabled })
        .where(
          and(
            eq(userNotificationPreferences.userId, userId),
            eq(userNotificationPreferences.notificationTypeId, typeId)
          )
        );
    } else {
      // Insert
      await db.insert(userNotificationPreferences).values({
        userId,
        notificationTypeId: typeId,
        enabled,
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error updating preference:", error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Send a test notification to a specific token
router.post("/admin/test", async (req: Request, res: Response) => {
  try {
    const { token, title, body, bookId, chapter, verse, verseRef } = req.body;

    if (!token) {
      return res.status(400).json({ error: "token is required" });
    }

    const payload = bookId && chapter && verse
      ? buildVerseNotificationPayload(
          verseRef || `Test Verse ${bookId}:${chapter}:${verse}`,
          body || "For I know the plans I have for you...",
          bookId,
          chapter,
          verse
        )
      : {
          title: title || "Test Notification",
          body: body || "This is a test notification from Vagabond Faith",
          data: { type: "test" },
        };

    const result = await sendPushNotification(token, payload);

    // Log the notification
    await db.insert(notificationLog).values({
      notificationTypeId: "test",
      verseReference: verseRef || null,
      verseText: body || null,
      recipientCount: 1,
      status: result.success ? "sent" : "failed",
      errorMessage: result.error || null,
    });

    res.json(result);
  } catch (error: any) {
    console.error("Error sending test notification:", error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get notification logs
router.get("/admin/logs", async (req: Request, res: Response) => {
  try {
    const logs = await db
      .select()
      .from(notificationLog)
      .orderBy(sql`${notificationLog.sentAt} DESC`)
      .limit(50);

    res.json(logs);
  } catch (error: any) {
    console.error("Error getting notification logs:", error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Send a verse of the week test to a specific user
router.post("/admin/test-verse", async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Get user's token
    const tokens = await db
      .select()
      .from(pushTokens)
      .where(eq(pushTokens.userId, userId));

    if (tokens.length === 0) {
      return res.status(404).json({ error: "No registered device for this user" });
    }

    // Import verse selection dynamically
    const { selectVerseOfTheWeek } = await import("./verseSelection");
    const verse = await selectVerseOfTheWeek();
    
    const verseRef = `${verse.book} ${verse.chapter}:${verse.verse}${verse.endVerse ? `-${verse.endVerse}` : ''}`;
    
    const payload = buildVerseNotificationPayload(
      verseRef,
      verse.text,
      verse.bookId,
      verse.chapter,
      verse.verse,
      verse.book // Pass book name for reliable lookup
    );

    // Send to all user's devices
    const results = [];
    for (const token of tokens) {
      const result = await sendPushNotification(token.deviceToken, payload);
      results.push({ platform: token.platform, ...result });
    }

    // Log the notification
    await db.insert(notificationLog).values({
      notificationTypeId: "verse_of_week",
      verseReference: verseRef,
      verseText: verse.text,
      recipientCount: tokens.length,
      status: results.every(r => r.success) ? "sent" : "partial",
      errorMessage: results.filter(r => !r.success).map(r => r.error).join("; ") || null,
    });

    res.json({
      success: true,
      verse: {
        reference: verseRef,
        text: verse.text,
        theme: verse.theme,
        notificationText: verse.notificationText,
      },
      results,
    });
  } catch (error: any) {
    console.error("Error sending verse test:", error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Send a daily verse test to a specific user or token
router.post("/admin/test-daily-verse", async (req: Request, res: Response) => {
  try {
    const { userId, token } = req.body;

    if (!userId && !token) {
      return res.status(400).json({ error: "userId or token is required" });
    }

    let tokensToSend: string[] = [];
    
    if (token) {
      tokensToSend = [token];
    } else {
      // Get user's token
      const userTokens = await db
        .select()
        .from(pushTokens)
        .where(eq(pushTokens.userId, userId));

      if (userTokens.length === 0) {
        return res.status(404).json({ error: "No registered device for this user" });
      }
      tokensToSend = userTokens.map(t => t.deviceToken);
    }

    // Get today's daily verse
    const { getVerseForToday } = await import("./dailyVerseData");
    const verse = getVerseForToday();
    
    const verseRef = `${verse.book} ${verse.chapter}:${verse.verse}${verse.endVerse ? `-${verse.endVerse}` : ''}`;
    
    const payload = buildVerseNotificationPayload(
      verseRef,
      verse.notificationText,
      verse.bookId,
      verse.chapter,
      verse.verse,
      verse.book,
      'verse_of_day'
    );

    // Send to all specified tokens
    const results = [];
    for (const deviceToken of tokensToSend) {
      const result = await sendPushNotification(deviceToken, payload);
      results.push(result);
    }

    // Log the notification
    await db.insert(notificationLog).values({
      notificationTypeId: "verse_of_day",
      verseReference: verseRef,
      verseText: verse.text,
      recipientCount: tokensToSend.length,
      status: results.every(r => r.success) ? "sent" : "partial",
      errorMessage: results.filter(r => !r.success).map(r => r.error).join("; ") || null,
    });

    res.json({
      success: true,
      verse: {
        dayOfYear: verse.dayOfYear,
        reference: verseRef,
        text: verse.text,
        theme: verse.theme,
        notificationText: verse.notificationText,
      },
      results,
    });
  } catch (error: any) {
    console.error("Error sending daily verse test:", error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Send an announcement notification to all users (or specific user)
router.post("/admin/announcement", async (req: Request, res: Response) => {
  try {
    const { title, body, url, userId } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: "title and body are required" });
    }

    // Build the notification payload
    const payload = {
      title,
      body,
      data: {
        type: 'announcement',
        ...(url && { url }), // External URL to open when tapped
      },
    };

    let tokens;
    if (userId) {
      // Send to specific user
      tokens = await db
        .select()
        .from(pushTokens)
        .where(eq(pushTokens.userId, userId));
    } else {
      // Send to all users who have announcements enabled
      const enabledUsers = await db
        .select({ userId: userNotificationPreferences.userId })
        .from(userNotificationPreferences)
        .where(
          and(
            eq(userNotificationPreferences.notificationTypeId, 'announcement'),
            eq(userNotificationPreferences.enabled, true)
          )
        );
      
      const userIds = enabledUsers.map(u => u.userId);
      
      if (userIds.length === 0) {
        // If no preferences exist yet, send to all tokens
        tokens = await db.select().from(pushTokens);
      } else {
        tokens = await db
          .select()
          .from(pushTokens)
          .where(sql`${pushTokens.userId} = ANY(ARRAY[${sql.join(userIds.map(id => sql`${id}`), sql`, `)}])`);
      }
    }

    if (tokens.length === 0) {
      return res.status(404).json({ error: "No registered devices found" });
    }

    // Send to all tokens
    const results = [];
    for (const token of tokens) {
      const result = await sendPushNotification(token.deviceToken, payload);
      results.push({ platform: token.platform, userId: token.userId, ...result });
    }

    // Log the notification
    await db.insert(notificationLog).values({
      notificationTypeId: "announcement",
      verseReference: null,
      verseText: `${title}: ${body}`,
      recipientCount: tokens.length,
      status: results.every(r => r.success) ? "sent" : results.some(r => r.success) ? "partial" : "failed",
      errorMessage: results.filter(r => !r.success).map(r => r.error).join("; ") || null,
    });

    res.json({
      success: true,
      recipientCount: tokens.length,
      successCount: results.filter(r => r.success).length,
      failureCount: results.filter(r => !r.success).length,
      results,
    });
  } catch (error: any) {
    console.error("Error sending announcement:", error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all registered tokens (for debugging)
router.get("/admin/tokens", async (req: Request, res: Response) => {
  try {
    const tokens = await db
      .select({
        id: pushTokens.id,
        userId: pushTokens.userId,
        platform: pushTokens.platform,
        timezone: pushTokens.timezone,
        utcOffset: pushTokens.utcOffset,
        createdAt: pushTokens.createdAt,
      })
      .from(pushTokens)
      .orderBy(sql`${pushTokens.createdAt} DESC`)
      .limit(100);

    res.json(tokens);
  } catch (error: any) {
    console.error("Error getting tokens:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
