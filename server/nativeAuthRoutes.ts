import type { Express } from "express";
import crypto from "crypto";

// In-memory store for auth codes (short-lived, single use)
// In production, use Redis or similar
const authCodes = new Map<string, { idToken: string; expiresAt: number }>();

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
      
      // Generate a secure, random code
      const code = crypto.randomBytes(32).toString("hex");
      
      // Store with 60 second expiry (single use)
      authCodes.set(code, {
        idToken,
        expiresAt: Date.now() + 60000,
      });
      
      console.log("[Native Auth] Generated auth code for token exchange");
      
      res.json({ code });
    } catch (error) {
      console.error("[Native Auth] Error generating code:", error);
      res.status(500).json({ error: "Failed to generate auth code" });
    }
  });
  
  // Step 2: Exchange auth code for session
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
      
      console.log("[Native Auth] Exchanging code for session");
      
      // Return the ID token - the client will use it to complete auth
      res.json({ idToken: data.idToken });
    } catch (error) {
      console.error("[Native Auth] Error exchanging code:", error);
      res.status(500).json({ error: "Failed to exchange code" });
    }
  });
  
  console.log("Native auth routes registered");
}
