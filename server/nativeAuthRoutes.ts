import type { Express } from "express";
import crypto from "crypto";
import admin from "firebase-admin";
import { verifyFirebaseToken } from "./firebaseAdmin";

// In-memory store for auth codes (short-lived, single use)
// Auth codes store user UID for custom token generation
const authCodes = new Map<string, { uid: string; expiresAt: number }>();

function getFirebaseAdmin(): admin.app.App {
  // Re-use existing initialized app
  try {
    return admin.app();
  } catch {
    // Initialize if not already done
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccount) {
      try {
        const parsedKey = JSON.parse(serviceAccount);
        return admin.initializeApp({
          credential: admin.credential.cert(parsedKey),
        });
      } catch {
        return admin.initializeApp({
          projectId: "travelingchurch-1b4ab",
        });
      }
    }
    return admin.initializeApp({
      projectId: "travelingchurch-1b4ab",
    });
  }
}

// Clean up expired codes every minute
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  authCodes.forEach((data, code) => {
    if (data.expiresAt < now) {
      keysToDelete.push(code);
    }
  });
  keysToDelete.forEach(key => authCodes.delete(key));
}, 60000);

export function registerNativeAuthRoutes(app: Express) {
  // Step 1: Generate a short-lived auth code from Firebase ID token
  // Called by the web callback page after Firebase auth completes
  app.post("/api/native-auth/generate-code", async (req, res) => {
    try {
      const { idToken } = req.body;
      
      if (!idToken) {
        return res.status(400).json({ error: "Missing idToken" });
      }
      
      // Verify the Firebase ID token and extract the UID
      const decodedToken = await verifyFirebaseToken(idToken);
      
      if (!decodedToken) {
        return res.status(401).json({ error: "Invalid ID token" });
      }
      
      // Generate a secure, random code
      const code = crypto.randomBytes(32).toString("hex");
      
      // Store UID with 60 second expiry (single use)
      authCodes.set(code, {
        uid: decodedToken.uid,
        expiresAt: Date.now() + 60000,
      });
      
      console.log("[Native Auth] Generated auth code for user:", decodedToken.email);
      
      res.json({ code });
    } catch (error) {
      console.error("[Native Auth] Error generating code:", error);
      res.status(500).json({ error: "Failed to generate auth code" });
    }
  });
  
  // Step 2: Exchange auth code for custom token
  // Called by the native app after receiving deep link
  app.post("/api/native-auth/exchange", async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: "Missing code" });
      }
      
      const data = authCodes.get(code);
      
      if (!data) {
        return res.status(400).json({ error: "Invalid or expired code" });
      }
      
      // Delete immediately (single use)
      authCodes.delete(code);
      
      // Check expiry
      if (data.expiresAt < Date.now()) {
        return res.status(400).json({ error: "Code expired" });
      }
      
      // Create a custom token for the user
      const firebaseAdmin = getFirebaseAdmin();
      const customToken = await firebaseAdmin.auth().createCustomToken(data.uid);
      
      console.log("[Native Auth] Generated custom token for UID:", data.uid);
      
      // Return the custom token - the client will use signInWithCustomToken
      res.json({ customToken });
    } catch (error) {
      console.error("[Native Auth] Error exchanging code:", error);
      res.status(500).json({ error: "Failed to exchange code" });
    }
  });
  
  console.log("Native auth routes registered");
}
