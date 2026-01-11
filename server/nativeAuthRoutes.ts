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
  // Step 1: Generate a short-lived auth code
  // Can use either Firebase ID token OR session cookie (for Safari View Controller)
  app.post("/api/native-auth/generate-code", async (req, res) => {
    try {
      const { idToken } = req.body;
      let uid: string | undefined;
      let userEmail: string | undefined;
      
      // Method 1: Use Firebase ID token if provided
      if (idToken) {
        const decodedToken = await verifyFirebaseToken(idToken);
        if (decodedToken) {
          uid = decodedToken.uid;
          userEmail = decodedToken.email;
          console.log("[Native Auth] Using ID token for user:", userEmail);
        }
      }
      
      // Method 2: Fall back to session cookie (for Safari View Controller where Firebase client auth is unavailable)
      if (!uid && (req.session as any)?.user?.firebaseUid) {
        uid = (req.session as any).user.firebaseUid;
        userEmail = (req.session as any).user.email;
        console.log("[Native Auth] Using session cookie for user:", userEmail);
      }
      
      if (!uid) {
        console.log("[Native Auth] No valid auth found - no ID token and no session");
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Generate a secure, random code
      const code = crypto.randomBytes(32).toString("hex");
      
      // Store UID with 60 second expiry (single use)
      authCodes.set(code, {
        uid: uid,
        expiresAt: Date.now() + 60000,
      });
      
      console.log("[Native Auth] Generated auth code for user:", userEmail);
      
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
