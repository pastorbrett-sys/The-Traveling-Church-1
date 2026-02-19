import type { Express, Request, Response } from "express";
import { chatStorage } from "./storage";
import { nanoid } from "nanoid";
import { storage } from "../../storage";
import { stripeStorage } from "../../stripeStorage";
import { checkUsageLimit, incrementUsage } from "../../usageService";
import { getAIClient, getChatModel, getMultilingualInstruction, isNonEnglish, geminiStreamContent } from "../../aiRouter";
import { verifyFirebaseToken } from "../../firebaseAdmin";
import { FEATURE_LIMITS, PRO_LIMITS_PREMIUM, PRO_LIMITS_EMERGING } from "@shared/schema";

const FREE_MESSAGE_LIMIT = FEATURE_LIMITS.chat_message;
const proSessions = new Set<string>();

const verseInsightCache = new Map<string, string>();

function getInsightCacheKey(content: string, translation: string): string | null {
  const insightMatch = content.match(/(?:በአጭሩ ይህን ጥቅስ አብራራ|Please explain this Bible verse)[\s\S]*?"(.+?)"\s*\((.+?)\)/);
  if (insightMatch) {
    return `insight:${translation}:${insightMatch[2]}`;
  }
  return null;
}

function getSessionId(req: Request, res: Response): string {
  let sessionId = req.cookies?.pastor_session;
  if (!sessionId) {
    sessionId = nanoid();
    res.cookie("pastor_session", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "none" as const,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }
  return sessionId;
}

function isProSession(sessionId: string): boolean {
  return proSessions.has(sessionId);
}

export function markSessionAsPro(sessionId: string): void {
  proSessions.add(sessionId);
}

async function getAuthenticatedUserId(req: any): Promise<string | null> {
  // Check for Firebase Bearer token auth (set by isAuthenticated middleware)
  if (req.user?.uid) {
    return req.user.uid;
  }
  // Check for Firebase auth (stored in session)
  if (req.session?.userId) {
    return req.session.userId;
  }
  // Check for Replit auth (stored via passport)
  if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
    return req.user.claims.sub;
  }
  // Direct Bearer token verification (for routes without isAuthenticated middleware)
  const authHeader = req.headers?.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const idToken = authHeader.split("Bearer ")[1];
      const decodedToken = await verifyFirebaseToken(idToken);
      if (decodedToken) {
        req.user = { uid: decodedToken.uid, email: decodedToken.email };
        return decodedToken.uid;
      }
    } catch (error) {
      // Token verification failed
    }
  }
  return null;
}

async function checkUserProStatusWithTier(req: any): Promise<{ isPro: boolean; pricingTier?: 'premium' | 'emerging' }> {
  const userId = await getAuthenticatedUserId(req);
  if (userId) {
    try {
      const user = await storage.getUser(userId);
      if (user?.stripeCustomerId) {
        const subscription = await stripeStorage.getCustomerSubscription(user.stripeCustomerId) as any;
        if ((subscription?.status === 'active' || subscription?.status === 'trialing') 
            && !subscription?.cancel_at_period_end) {
          return { isPro: true, pricingTier: (user.pricingTier as 'premium' | 'emerging') || 'premium' };
        }
      }
      if (user?.revenueCatEntitlement) {
        const now = new Date();
        const expiresAt = user.revenueCatExpiresAt;
        if (!expiresAt || expiresAt > now) {
          return { isPro: true, pricingTier: (user.pricingTier as 'premium' | 'emerging') || 'premium' };
        }
      }
    } catch (error) {
      console.error("Error checking user pro status:", error);
    }
  }
  return { isPro: false };
}

async function checkUserProStatus(req: any): Promise<boolean> {
  const result = await checkUserProStatusWithTier(req);
  return result.isPro;
}


const SYSTEM_PROMPT = `You are Pastor Brett, a compassionate AI assistant for "The Best AI Bible Tools Ever Built" providing spiritual guidance and pastoral support. Your role is to:
- Offer comfort, encouragement, and biblical wisdom
- Listen with empathy and understanding
- Share relevant scripture when appropriate
- Provide thoughtful, non-judgmental responses
- Encourage faith and hope in difficult times
- Respect all beliefs while sharing Christian perspective
- Be warm, approachable, and caring

Remember: You are here to support, not to replace professional counseling or in-person pastoral care. For serious mental health concerns, always encourage seeking professional help. Keep responses concise but meaningful.`;

const SYSTEM_PROMPT_AMHARIC = `አንተ ፓስተር ብሬት ነህ፣ ለ"The Best AI Bible Tools Ever Built" ርኅሩኅ የመጽሐፍ ቅዱስ ረዳት። በአማርኛ (ፊደል) ብቻ መልስ ስጥ። ጥቅሶችን አብራራ፣ ታሪካዊ ዳራ ስጥ፣ ለዛሬ ተግባራዊ ትርጉም አካትት። ምላሽህ ተፈጥሯዊ አማርኛ ይሁን።`;

function getSystemPrompt(translation: string): string {
  if (isNonEnglish(translation)) {
    return SYSTEM_PROMPT_AMHARIC;
  }
  return SYSTEM_PROMPT;
}

export function registerChatRoutes(app: Express): void {
  app.get("/api/chat/session-stats", async (req: Request, res: Response) => {
    const sessionId = getSessionId(req, res);
    const proStatus = await checkUserProStatusWithTier(req);
    const isSessionPro = isProSession(sessionId);
    const isPro = proStatus.isPro || isSessionPro;
    
    const authUserId = await getAuthenticatedUserId(req);
    if (!authUserId) {
      return res.status(401).json({
        error: "Authentication required",
        messageCount: 0,
        isPro: false,
        limit: FREE_MESSAGE_LIMIT,
      });
    }
    
    let messageCount = 0;
    const user = await storage.getUser(authUserId);
    if (user) {
      const usageResult = await checkUsageLimit(user.id, "chat_message", isPro, proStatus.pricingTier);
      messageCount = usageResult.currentUsage;
    }
    
    res.json({
      messageCount,
      isPro,
      limit: isPro ? (proStatus.pricingTier === 'emerging' ? PRO_LIMITS_EMERGING.chat_message : PRO_LIMITS_PREMIUM.chat_message) : FREE_MESSAGE_LIMIT,
      pricingTier: proStatus.pricingTier,
      resetType: isPro ? 'daily' : 'monthly',
    });
  });

  app.get("/api/conversations", async (req: Request, res: Response) => {
    try {
      const sessionId = getSessionId(req, res);
      const allConversations = await chatStorage.getConversationsBySession(sessionId);
      
      // Filter out feature-specific temporary conversations so they don't appear in Pastor Chat
      // These are: Verse Insights ("Insight:"), Book Synopsis ("Give me a short synopsis"), 
      // and Continue Discussion ("Discussion:") - all bypass chat limits and should be invisible
      const pastorChatConversations = allConversations.filter(conv => {
        const title = conv.title || "";
        return !title.startsWith("Insight:") && 
               !title.startsWith("Give me a short synopsis") && 
               !title.startsWith("Discussion:");
      });
      
      res.json(pastorChatConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const sessionId = getSessionId(req, res);
      const conversation = await chatStorage.getConversation(id, sessionId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      const messages = await chatStorage.getMessagesByConversation(id);
      res.json({ ...conversation, messages });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const sessionId = getSessionId(req, res);
      const title = typeof req.body?.title === "string" ? req.body.title.slice(0, 100) : "New Chat";
      
      // Check if this is a verse insight conversation
      const isVerseInsight = title.startsWith("Insight:");
      
      if (isVerseInsight) {
        // Get authenticated user for usage tracking
        const authUserId = await getAuthenticatedUserId(req);
        if (!authUserId) {
          return res.status(401).json({ error: "Authentication required for verse insights" });
        }
        
        const user = await storage.getUser(authUserId);
        if (!user) {
          return res.status(401).json({ error: "User not found" });
        }
        
        const proStatus = await checkUserProStatusWithTier(req);
        const isPro = proStatus.isPro;
        
        const usageResult = await checkUsageLimit(user.id, "verse_insight", isPro, proStatus.pricingTier);
        if (!usageResult.allowed) {
          return res.status(429).json({ 
            error: "Verse insight limit reached",
            code: "USAGE_LIMIT_EXCEEDED",
            feature: "verse_insight",
            resetAt: usageResult.resetAt,
            creditsRemaining: usageResult.creditsRemaining,
            resetType: isPro ? 'daily' : 'monthly',
          });
        }
        
        await incrementUsage(user.id, "verse_insight", isPro, proStatus.pricingTier);
      }
      
      const conversation = await chatStorage.createConversation(title, sessionId);
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.delete("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const sessionId = getSessionId(req, res);
      await chatStorage.deleteConversation(id, sessionId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  app.post("/api/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id);
      if (isNaN(conversationId)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }

      const content = req.body?.content;
      const translation = req.body?.translation || "KJV";
      if (typeof content !== "string" || !content.trim()) {
        return res.status(400).json({ error: "Message content is required" });
      }

      const sessionId = getSessionId(req, res);
      
      // Check if this is a feature-specific conversation (bypass chat limit for these)
      const conversation = await chatStorage.getConversation(conversationId, sessionId);
      const isVerseInsight = conversation?.title?.startsWith("Insight:");
      const isBookSynopsis = conversation?.title?.startsWith("Give me a short synopsis");
      const isContinueDiscussion = conversation?.title?.startsWith("Discussion:");
      const isFeatureConversation = isVerseInsight || isBookSynopsis || isContinueDiscussion;
      
      const proStatus = await checkUserProStatusWithTier(req);
      const isSessionPro = isProSession(sessionId);
      const isPro = proStatus.isPro || isSessionPro;
      
      const authUserId = await getAuthenticatedUserId(req);
      
      if (!isFeatureConversation && !authUserId) {
        return res.status(401).json({ 
          error: "Authentication required",
          code: "AUTH_REQUIRED"
        });
      }
      
      if (!isFeatureConversation && authUserId) {
        const user = await storage.getUser(authUserId);
        if (user) {
          const usageResult = await checkUsageLimit(user.id, "chat_message", isPro, proStatus.pricingTier);
          if (!usageResult.allowed) {
            return res.status(429).json({ 
              error: "Message limit reached", 
              code: "LIMIT_REACHED",
              feature: "chat_message",
              messageCount: usageResult.currentUsage,
              limit: usageResult.limit,
              resetAt: usageResult.resetAt,
              creditsRemaining: usageResult.creditsRemaining,
              resetType: isPro ? 'daily' : 'monthly',
            });
          }
        }
      }

      if (!isFeatureConversation && authUserId) {
        const user = await storage.getUser(authUserId);
        if (user) {
          await incrementUsage(user.id, "chat_message", isPro, proStatus.pricingTier);
        }
      }

      await chatStorage.createMessage(conversationId, "user", content.trim());

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const cacheKey = isVerseInsight ? getInsightCacheKey(content, translation) : null;
      const cachedResponse = cacheKey ? verseInsightCache.get(cacheKey) : null;

      if (cachedResponse) {
        console.log(`[Chat AI] Cache HIT for ${cacheKey}`);
        res.write(`data: ${JSON.stringify({ content: cachedResponse })}\n\n`);
        await chatStorage.createMessage(conversationId, "assistant", cachedResponse);
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
        return;
      }

      const messages = await chatStorage.getMessagesByConversation(conversationId);
      const chatMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: getSystemPrompt(translation) },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }))
      ];

      const aiModel = getChatModel(translation);
      console.log(`[Chat AI] Translation: ${translation}, Model: ${aiModel}, NonEnglish: ${isNonEnglish(translation)}`);

      let fullResponse = "";

      if (isNonEnglish(translation)) {
        for await (const text of geminiStreamContent(aiModel, chatMessages, { maxTokens: 1024, temperature: 0 })) {
          fullResponse += text;
          res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
        }
      } else {
        const aiClient = getAIClient(translation);
        const stream = await aiClient.chat.completions.create({
          model: aiModel,
          messages: chatMessages,
          stream: true,
          max_completion_tokens: 2048,
        });

        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) {
            fullResponse += text;
            res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
          }
        }
      }

      if (cacheKey && fullResponse) {
        verseInsightCache.set(cacheKey, fullResponse);
        console.log(`[Chat AI] Cached response for ${cacheKey} (cache size: ${verseInsightCache.size})`);
      }

      await chatStorage.createMessage(conversationId, "assistant", fullResponse);

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error sending message:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to send message" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to send message" });
      }
    }
  });

  // Seed a conversation with initial question and answer from Smart Search
  app.post("/api/conversations/:id/seed", async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id);
      if (isNaN(conversationId)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }

      const { question, answer, followUp } = req.body;
      if (typeof question !== "string" || typeof answer !== "string") {
        return res.status(400).json({ error: "Question and answer are required" });
      }

      // Save both messages to the database
      await chatStorage.createMessage(conversationId, "user", question.trim());
      await chatStorage.createMessage(conversationId, "assistant", answer.trim());
      
      // Save follow-up message if provided (for book synopsis feature)
      if (typeof followUp === "string" && followUp.trim()) {
        await chatStorage.createMessage(conversationId, "assistant", followUp.trim());
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error seeding conversation:", error);
      res.status(500).json({ error: "Failed to seed conversation" });
    }
  });

  // Generate a contextual follow-up prompt from Pastor Brett
  app.post("/api/conversations/:id/follow-up", async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id);
      if (isNaN(conversationId)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }

      const { question, answer } = req.body;
      if (typeof question !== "string" || typeof answer !== "string") {
        return res.status(400).json({ error: "Question and answer are required" });
      }

      const translation = req.body?.translation || "KJV";
      const langInstruction = getMultilingualInstruction(translation);

      const followUpPrompt = `You are Pastor Brett, a warm and compassionate AI assistant for "The Best AI Bible Tools Ever Built". The user just asked: "${question}"

You already provided this brief answer: "${answer}"

Now, generate a SHORT (1-2 sentences max) pastoral follow-up invitation to continue the discussion. Be warm, inviting, and specific to the topic. Examples of good follow-ups:
- "Would you like me to walk through any of these passages together?"
- "Is there a particular aspect of this topic you'd like to explore further?"
- "What questions come to mind as you reflect on this?"

Generate ONLY the follow-up question/invitation, nothing else.${langInstruction}`;

      const aiModel = getChatModel(translation);

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      let fullResponse = "";

      if (isNonEnglish(translation)) {
        for await (const text of geminiStreamContent(aiModel, [{ role: "user", content: followUpPrompt }], { maxTokens: 500 })) {
          fullResponse += text;
          res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
        }
      } else {
        const aiClient = getAIClient(translation);
        const stream = await aiClient.chat.completions.create({
          model: aiModel,
          messages: [{ role: "user", content: followUpPrompt }],
          stream: true,
          max_completion_tokens: 150,
        });

        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) {
            fullResponse += text;
            res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
          }
        }
      }

      // Save the follow-up to the database
      await chatStorage.createMessage(conversationId, "assistant", fullResponse);

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error generating follow-up:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to generate follow-up" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to generate follow-up" });
      }
    }
  });
}
