import type { Express, Request, Response } from "express";
import OpenAI from "openai";
import { chatStorage } from "./storage";
import { nanoid } from "nanoid";
import { storage } from "../../storage";
import { stripeStorage } from "../../stripeStorage";
import { checkUsageLimit, incrementUsage } from "../../usageService";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const FREE_MESSAGE_LIMIT = 10;
const sessionMessageCounts = new Map<string, number>();
const proSessions = new Set<string>();

function getSessionId(req: Request, res: Response): string {
  let sessionId = req.cookies?.pastor_session;
  if (!sessionId) {
    sessionId = nanoid();
    res.cookie("pastor_session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }
  return sessionId;
}

function getSessionMessageCount(sessionId: string): number {
  return sessionMessageCounts.get(sessionId) || 0;
}

function incrementSessionMessageCount(sessionId: string): number {
  const current = getSessionMessageCount(sessionId);
  const newCount = current + 1;
  sessionMessageCounts.set(sessionId, newCount);
  return newCount;
}

function isProSession(sessionId: string): boolean {
  return proSessions.has(sessionId);
}

export function markSessionAsPro(sessionId: string): void {
  proSessions.add(sessionId);
}

async function checkUserProStatus(req: any): Promise<boolean> {
  if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
    const userId = req.user.claims.sub;
    try {
      const user = await storage.getUser(userId);
      if (user?.stripeCustomerId) {
        const subscription = await stripeStorage.getCustomerSubscription(user.stripeCustomerId) as any;
        if ((subscription?.status === 'active' || subscription?.status === 'trialing') 
            && !subscription?.cancel_at_period_end) {
          return true;
        }
      }
    } catch (error) {
      console.error("Error checking user pro status:", error);
    }
  }
  return false;
}

export function getSessionStats(sessionId: string): { messageCount: number; isPro: boolean; limit: number } {
  return {
    messageCount: getSessionMessageCount(sessionId),
    isPro: isProSession(sessionId),
    limit: FREE_MESSAGE_LIMIT,
  };
}

const SYSTEM_PROMPT = `You are Pastor Brett, a compassionate AI Bible Buddy providing spiritual guidance and pastoral support. Your role is to:
- Offer comfort, encouragement, and biblical wisdom
- Listen with empathy and understanding
- Share relevant scripture when appropriate
- Provide thoughtful, non-judgmental responses
- Encourage faith and hope in difficult times
- Respect all beliefs while sharing Christian perspective
- Be warm, approachable, and caring

Remember: You are here to support, not to replace professional counseling or in-person pastoral care. For serious mental health concerns, always encourage seeking professional help. Keep responses concise but meaningful.`;

export function registerChatRoutes(app: Express): void {
  app.get("/api/chat/session-stats", async (req: Request, res: Response) => {
    const sessionId = getSessionId(req, res);
    const isUserPro = await checkUserProStatus(req);
    const isSessionPro = isProSession(sessionId);
    const isPro = isUserPro || isSessionPro;
    
    // Get database-backed usage count for authenticated users
    let messageCount = 0;
    const userId = (req as any).firebaseUid || (req.session as any)?.userId;
    if (userId) {
      const user = await storage.getUser(userId);
      if (user) {
        const usageResult = await checkUsageLimit(user.id, "chat_message", isPro);
        messageCount = usageResult.currentUsage;
      }
    }
    
    res.json({
      messageCount,
      isPro,
      limit: FREE_MESSAGE_LIMIT,
    });
  });

  app.get("/api/conversations", async (req: Request, res: Response) => {
    try {
      const sessionId = getSessionId(req, res);
      const conversations = await chatStorage.getConversationsBySession(sessionId);
      res.json(conversations);
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
        const userId = (req as any).firebaseUid || (req.session as any)?.userId;
        if (!userId) {
          return res.status(401).json({ error: "Authentication required for verse insights" });
        }
        
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(401).json({ error: "User not found" });
        }
        
        const isPro = await checkUserProStatus(req);
        
        // Check usage limit
        const usageResult = await checkUsageLimit(user.id, "verse_insight", isPro);
        if (!usageResult.allowed) {
          return res.status(429).json({ 
            error: "Verse insight limit reached",
            code: "USAGE_LIMIT_EXCEEDED",
            feature: "verse_insight",
            resetAt: usageResult.resetAt
          });
        }
        
        // Increment usage
        await incrementUsage(user.id, "verse_insight", isPro);
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
      if (typeof content !== "string" || !content.trim()) {
        return res.status(400).json({ error: "Message content is required" });
      }

      const sessionId = getSessionId(req, res);
      
      // Check if this is a verse insight conversation (bypass chat limit for these)
      const conversation = await chatStorage.getConversation(conversationId, sessionId);
      const isVerseInsight = conversation?.title?.startsWith("Insight:");
      
      const isUserPro = await checkUserProStatus(req);
      const isSessionPro = isProSession(sessionId);
      const isPro = isUserPro || isSessionPro;
      
      // Get authenticated user for database-backed usage tracking
      const userId = (req as any).firebaseUid || (req.session as any)?.userId;
      
      // Only enforce chat message limit for regular chat, not verse insights
      if (!isPro && !isVerseInsight && userId) {
        const user = await storage.getUser(userId);
        if (user) {
          const usageResult = await checkUsageLimit(user.id, "chat_message", isPro);
          if (!usageResult.allowed) {
            return res.status(429).json({ 
              error: "Message limit reached", 
              code: "LIMIT_REACHED",
              feature: "chat_message",
              messageCount: usageResult.currentUsage,
              limit: usageResult.limit,
              resetAt: usageResult.resetAt,
            });
          }
        }
      }

      // Only increment chat count for regular chat conversations (database-backed)
      if (!isPro && !isVerseInsight && userId) {
        const user = await storage.getUser(userId);
        if (user) {
          await incrementUsage(user.id, "chat_message", isPro);
        }
      }

      await chatStorage.createMessage(conversationId, "user", content.trim());

      const messages = await chatStorage.getMessagesByConversation(conversationId);
      const chatMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }))
      ];

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: chatMessages,
        stream: true,
        max_completion_tokens: 2048,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          fullResponse += text;
          res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
        }
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

      const followUpPrompt = `You are Pastor Brett, a warm and compassionate AI Bible Buddy. The user just asked: "${question}"

You already provided this brief answer: "${answer}"

Now, generate a SHORT (1-2 sentences max) pastoral follow-up invitation to continue the discussion. Be warm, inviting, and specific to the topic. Examples of good follow-ups:
- "Would you like me to walk through any of these passages together?"
- "Is there a particular aspect of this topic you'd like to explore further?"
- "What questions come to mind as you reflect on this?"

Generate ONLY the follow-up question/invitation, nothing else.`;

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: followUpPrompt }],
        stream: true,
        max_completion_tokens: 150,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          fullResponse += text;
          res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
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
