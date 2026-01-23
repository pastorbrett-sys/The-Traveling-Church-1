import admin from "firebase-admin";
import type { RequestHandler } from "express";
import { authStorage } from "./replit_integrations/auth/storage";

let firebaseApp: admin.app.App | null = null;

function getFirebaseAdmin(): admin.app.App {
  if (firebaseApp) {
    console.log("[Firebase Admin] Using existing app instance");
    return firebaseApp;
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  console.log("[Firebase Admin] Initializing new app...");
  console.log("[Firebase Admin] Service account key present:", !!serviceAccount);
  
  if (serviceAccount) {
    try {
      const parsedKey = JSON.parse(serviceAccount);
      console.log("[Firebase Admin] Parsed key - project_id:", parsedKey.project_id);
      console.log("[Firebase Admin] Parsed key - client_email:", parsedKey.client_email);
      console.log("[Firebase Admin] Parsed key - private_key length:", parsedKey.private_key?.length);
      
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(parsedKey),
      });
      console.log("[Firebase Admin] Initialized with service account credentials");
    } catch (error) {
      console.error("[Firebase Admin] Error parsing service account key:", error);
      firebaseApp = admin.initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      });
      console.log("[Firebase Admin] Fell back to project ID only (NO MESSAGING SUPPORT)");
    }
  } else {
    console.log("[Firebase Admin] No service account key - using project ID only (NO MESSAGING SUPPORT)");
    firebaseApp = admin.initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    });
  }

  return firebaseApp;
}

export async function verifyFirebaseToken(idToken: string): Promise<admin.auth.DecodedIdToken | null> {
  try {
    const app = getFirebaseAdmin();
    const decodedToken = await app.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    return null;
  }
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const idToken = authHeader.split("Bearer ")[1];
  
  try {
    const decodedToken = await verifyFirebaseToken(idToken);
    
    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
    };
    
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export async function upsertFirebaseUser(decodedToken: admin.auth.DecodedIdToken, language?: string) {
  const nameParts = (decodedToken.name || "").split(" ");
  const firstName = nameParts[0] || null;
  const lastName = nameParts.slice(1).join(" ") || null;

  return await authStorage.upsertUser({
    id: decodedToken.uid,
    email: decodedToken.email || null,
    firstName,
    lastName,
    profileImageUrl: decodedToken.picture || null,
    language: language || 'en', // Include language preference for new users
  });
}

// ============================================
// PUSH NOTIFICATION FUNCTIONS (FCM)
// ============================================

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface DeepLinkData {
  type: string;
  bookId?: number;
  chapter?: number;
  verse?: number;
  showActionMenu?: boolean;
  triggerHighlight?: boolean;
}

export async function sendPushNotification(
  token: string,
  payload: NotificationPayload
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const app = getFirebaseAdmin();
    const message: admin.messaging.Message = {
      token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'verse_notifications',
        },
      },
    };

    const messageId = await app.messaging().send(message);
    return { success: true, messageId };
  } catch (error: any) {
    console.error("Error sending push notification:", error);
    return { success: false, error: error.message };
  }
}

export async function sendBatchNotifications(
  tokens: string[],
  payload: NotificationPayload
): Promise<{ successCount: number; failureCount: number; errors: string[] }> {
  if (tokens.length === 0) {
    return { successCount: 0, failureCount: 0, errors: [] };
  }

  try {
    const app = getFirebaseAdmin();
    const messages: admin.messaging.Message[] = tokens.map(token => ({
      token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          channelId: 'verse_notifications',
        },
      },
    }));

    // Firebase supports up to 500 messages per batch
    const batchSize = 500;
    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      const response = await app.messaging().sendEach(batch);
      
      successCount += response.successCount;
      failureCount += response.failureCount;
      
      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error) {
          errors.push(`Token ${i + idx}: ${resp.error.message}`);
        }
      });
    }

    return { successCount, failureCount, errors };
  } catch (error: any) {
    console.error("Error sending batch notifications:", error);
    return { successCount: 0, failureCount: tokens.length, errors: [error.message] };
  }
}

export function buildVerseNotificationPayload(
  verseRef: string,
  verseText: string,
  bookId: number,
  chapter: number,
  verse: number
): NotificationPayload {
  const shortText = verseText.length > 100 ? verseText.substring(0, 97) + '...' : verseText;
  
  return {
    title: '✨ Verse of the Week',
    body: `${shortText} - ${verseRef}`,
    data: {
      type: 'verse_of_week',
      bookId: String(bookId),
      chapter: String(chapter),
      verse: String(verse),
      verseRef,
      showActionMenu: 'true',
      triggerHighlight: 'true',
    },
  };
}
