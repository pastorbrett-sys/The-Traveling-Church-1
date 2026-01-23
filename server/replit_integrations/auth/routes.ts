import type { Express } from "express";
import { authStorage, updateUserLanguage } from "./storage";
import { verifyFirebaseToken, upsertFirebaseUser } from "../../firebaseAdmin";

export function registerAuthRoutes(app: Express): void {
  // Update user language preference (called by frontend on app load)
  app.post("/api/auth/language", async (req: any, res) => {
    try {
      const { language } = req.body;
      if (!language || (language !== 'en' && language !== 'am')) {
        return res.status(400).json({ message: "Invalid language. Must be 'en' or 'am'" });
      }
      
      // Get user ID from session or token
      let userId: string | null = null;
      
      // First try Bearer token (for native apps)
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const idToken = authHeader.split("Bearer ")[1];
        try {
          const decodedToken = await verifyFirebaseToken(idToken);
          if (decodedToken) {
            userId = decodedToken.uid;
          }
        } catch (tokenError) {
          console.error("Token verification error:", tokenError);
        }
      }
      
      // Fall back to session
      if (!userId) {
        userId = (req.session as any)?.userId || (req.user as any)?.claims?.sub;
      }
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Update user's language preference
      await updateUserLanguage(userId, language);
      console.log(`[Auth] Updated language for user ${userId} to ${language}`);
      
      res.json({ success: true, language });
    } catch (error) {
      console.error("Error updating user language:", error);
      res.status(500).json({ message: "Failed to update language" });
    }
  });

  app.get("/api/auth/user", async (req: any, res) => {
    try {
      // First try Bearer token (for native apps that can't use cookies)
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const idToken = authHeader.split("Bearer ")[1];
        try {
          const decodedToken = await verifyFirebaseToken(idToken);
          if (decodedToken) {
            // Get or create user from Firebase token
            const user = await upsertFirebaseUser(decodedToken);
            return res.json(user);
          }
        } catch (tokenError) {
          console.error("Token verification error:", tokenError);
        }
      }

      // Fall back to session (for web apps with cookies)
      const userId = (req.session as any)?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await authStorage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
