import type { Express } from "express";
import { authStorage } from "./storage";
import { verifyFirebaseToken, upsertFirebaseUser } from "../../firebaseAdmin";

export function registerAuthRoutes(app: Express): void {
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
