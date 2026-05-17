import type { Express } from "express";
import { authStorage, updateUserLanguage, updateUserTradition, getUserTradition, isValidTraditionProfile } from "./storage";
import { verifyFirebaseToken, upsertFirebaseUser } from "../../firebaseAdmin";
import { openaiClient } from "../../aiRouter";
import { isValidCategory, isValidPersonaTitle, type TraditionProfile } from "@shared/traditions";

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

  // Get/update user tradition (Protestant/Catholic/Orthodox/Other) for AI persona flavoring
  async function resolveUserId(req: any): Promise<string | null> {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const decoded = await verifyFirebaseToken(authHeader.split("Bearer ")[1]);
        if (decoded) return decoded.uid;
      } catch {}
    }
    return (req.session as any)?.userId || (req.user as any)?.claims?.sub || null;
  }

  app.get("/api/user/tradition", async (req: any, res) => {
    try {
      const userId = await resolveUserId(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const tradition = await getUserTradition(userId);
      res.json({ tradition });
    } catch (error) {
      console.error("Error fetching tradition:", error);
      res.status(500).json({ message: "Failed to fetch tradition" });
    }
  });

  app.patch("/api/user/tradition", async (req: any, res) => {
    try {
      const userId = await resolveUserId(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const body = req.body || {};
      if (body.tradition === null) {
        await updateUserTradition(userId, null);
        return res.json({ success: true, profile: null });
      }
      const profile = {
        tradition: typeof body.tradition === "string" ? body.tradition.trim() : "",
        traditionCategory: body.traditionCategory,
        personaTitle: body.personaTitle,
      };
      if (!isValidTraditionProfile(profile)) {
        return res.status(400).json({ message: "Invalid tradition profile" });
      }
      await updateUserTradition(userId, profile);
      res.json({ success: true, profile });
    } catch (error) {
      console.error("Error updating tradition:", error);
      res.status(500).json({ message: "Failed to update tradition" });
    }
  });

  // Classify a free-form "Other" tradition description into our category + persona.
  // Open to guests; lightly rate-limited per IP to prevent OpenAI credit drain.
  const classifyHits = new Map<string, { count: number; resetAt: number }>();
  const CLASSIFY_WINDOW_MS = 60_000;
  const CLASSIFY_MAX = 5;
  app.post("/api/user/tradition/classify", async (req: any, res) => {
    try {
      const ip = (req.headers["x-forwarded-for"]?.toString().split(",")[0].trim()) || req.ip || "unknown";
      const now = Date.now();
      const entry = classifyHits.get(ip);
      if (!entry || entry.resetAt < now) {
        classifyHits.set(ip, { count: 1, resetAt: now + CLASSIFY_WINDOW_MS });
      } else {
        entry.count += 1;
        if (entry.count > CLASSIFY_MAX) {
          return res.status(429).json({ message: "Too many requests, please wait a moment." });
        }
      }
      // Opportunistic cleanup
      if (classifyHits.size > 5000) {
        for (const [k, v] of classifyHits) if (v.resetAt < now) classifyHits.delete(k);
      }
      const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
      if (!text || text.length > 200) {
        return res.status(400).json({ message: "Text is required (max 200 chars)" });
      }
      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        max_completion_tokens: 200,
        messages: [
          {
            role: "system",
            content: `You classify a user-described Christian tradition into a JSON object with exactly these fields:
  - "tradition": a short canonical display name (1-5 words), e.g. "Anglican Communion", "Coptic Orthodox", "Reformed Baptist".
  - "traditionCategory": one of "catholic" | "orthodox" | "protestant" | "other".
      - "catholic" for Roman Catholic and Eastern Catholic churches in communion with Rome (e.g. Maronite, Melkite).
      - "orthodox" for Eastern Orthodox AND Oriental Orthodox (Coptic, Ethiopian Tewahedo, Armenian Apostolic, Syriac, Eritrean).
      - "protestant" for all Reformation and post-Reformation Protestant traditions (Anglican/Episcopal, Lutheran, Methodist, Presbyterian, Reformed, Baptist, Pentecostal, Adventist, Non-denominational, etc.).
      - "other" only for non-Trinitarian / restorationist / unclear (e.g. LDS, Jehovah's Witnesses, Quakers without clergy, or descriptions you cannot place).
  - "personaTitle": exactly "Father" if the tradition's clergy are commonly addressed as "Father" (Catholic, Eastern Orthodox, Oriental Orthodox, Anglican/Episcopal, Maronite, etc.), otherwise "Pastor".
Return only the JSON object. No prose.`,
          },
          { role: "user", content: text },
        ],
      });
      const raw = completion.choices?.[0]?.message?.content || "{}";
      let parsed: any;
      try { parsed = JSON.parse(raw); } catch { parsed = {}; }
      const profile: TraditionProfile = {
        tradition: typeof parsed.tradition === "string" && parsed.tradition.trim() ? parsed.tradition.trim().slice(0, 80) : text.slice(0, 80),
        traditionCategory: isValidCategory(parsed.traditionCategory) ? parsed.traditionCategory : "other",
        personaTitle: isValidPersonaTitle(parsed.personaTitle) ? parsed.personaTitle : "Pastor",
      };
      res.json({ profile });
    } catch (error) {
      console.error("Error classifying tradition:", error);
      res.status(500).json({ message: "Failed to classify tradition" });
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
