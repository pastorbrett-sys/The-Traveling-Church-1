import type { Express, Request, Response } from "express";
import OpenAI from "openai";
import { chatStorage } from "./storage";
import { nanoid } from "nanoid";
import { storage } from "../../storage";
import { stripeStorage } from "../../stripeStorage";

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

// Check if authenticated user has an active subscription (not cancelled)
async function checkUserProStatus(req: any): Promise<boolean> {
  // First check if user is authenticated
  if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
    const userId = req.user.claims.sub;
    try {
      const user = await storage.getUser(userId);
      if (user?.stripeCustomerId) {
        const subscription = await stripeStorage.getCustomerSubscription(user.stripeCustomerId) as any;
        // Check if subscription is active AND not set to cancel at period end
        // This ensures immediate revocation when user cancels
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

export function registerChatRoutes(app: Express): void {
  // Get session stats for message limit tracking
  app.get("/api/chat/session-stats", async (req: Request, res: Response) => {
    const sessionId = getSessionId(req, res);
    
    // Check authenticated user's subscription status first
    const isUserPro = await checkUserProStatus(req);
    const isSessionPro = isProSession(sessionId);
    const isPro = isUserPro || isSessionPro;
    
    res.json({
      messageCount: getSessionMessageCount(sessionId),
      isPro,
      limit: FREE_MESSAGE_LIMIT,
    });
  });

  // Get all conversations
  app.get("/api/conversations", async (req: Request, res: Response) => {
    try {
      const conversations = await chatStorage.getAllConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Get single conversation with messages
  app.get("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const conversation = await chatStorage.getConversation(id);
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

  // Create new conversation
  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const title = typeof req.body?.title === "string" ? req.body.title.slice(0, 100) : "New Chat";
      const conversation = await chatStorage.createConversation(title);
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Delete conversation
  app.delete("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await chatStorage.deleteConversation(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // Send message and get AI response (streaming)
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

      // Check message limit for free users
      const sessionId = getSessionId(req, res);
      const messageCount = getSessionMessageCount(sessionId);
      
      // Check both authenticated subscription and session-based pro status
      const isUserPro = await checkUserProStatus(req);
      const isSessionPro = isProSession(sessionId);
      const isPro = isUserPro || isSessionPro;
      
      if (!isPro && messageCount >= FREE_MESSAGE_LIMIT) {
        return res.status(402).json({ 
          error: "Message limit reached", 
          code: "LIMIT_REACHED",
          messageCount,
          limit: FREE_MESSAGE_LIMIT,
        });
      }

      // Increment message count for free users
      if (!isPro) {
        incrementSessionMessageCount(sessionId);
      }

      // Save user message
      await chatStorage.createMessage(conversationId, "user", content.trim());

      // Get conversation history for context
      const messages = await chatStorage.getMessagesByConversation(conversationId);
      const chatMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        {
          role: "system",
          content: `You are a compassionate AI Pastor providing spiritual guidance and pastoral support. Your role is to:
- Offer comfort, encouragement, and biblical wisdom
- Listen with empathy and understanding
- Share relevant scripture when appropriate
- Provide thoughtful, non-judgmental responses
- Encourage faith and hope in difficult times
- Respect all beliefs while sharing Christian perspective
- Be warm, approachable, and caring

Remember: You are here to support, not to replace professional counseling or in-person pastoral care. For serious mental health concerns, always encourage seeking professional help. Keep responses concise but meaningful.`
        },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }))
      ];

      // Set up SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Stream response from OpenAI
      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: chatMessages,
        stream: true,
        max_completion_tokens: 2048,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      // Save assistant message
      await chatStorage.createMessage(conversationId, "assistant", fullResponse);

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error sending message:", error);
      // Check if headers already sent (SSE streaming started)
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to send message" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to send message" });
      }
    }
  });
}

