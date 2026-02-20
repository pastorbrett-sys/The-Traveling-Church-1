import { db } from "../../storage";
import { conversations, messages } from "@shared/schema";
import { eq, desc, and, or, isNull } from "drizzle-orm";
import { sql } from "drizzle-orm";

export interface IChatStorage {
  getConversation(id: number, sessionId: string, userId?: string | null): Promise<typeof conversations.$inferSelect | undefined>;
  getConversationsBySession(sessionId: string, userId?: string | null): Promise<(typeof conversations.$inferSelect)[]>;
  createConversation(title: string, sessionId: string, userId?: string | null): Promise<typeof conversations.$inferSelect>;
  deleteConversation(id: number, sessionId: string, userId?: string | null): Promise<void>;
  getMessagesByConversation(conversationId: number): Promise<(typeof messages.$inferSelect)[]>;
  createMessage(conversationId: number, role: string, content: string): Promise<typeof messages.$inferSelect>;
  migrateSessionToUser(sessionId: string, userId: string): Promise<void>;
}

export const chatStorage: IChatStorage = {
  async getConversation(id: number, sessionId: string, userId?: string | null) {
    if (userId) {
      const [conversation] = await db.select().from(conversations).where(
        and(eq(conversations.id, id), eq(conversations.userId, userId))
      );
      return conversation;
    }
    const [conversation] = await db.select().from(conversations).where(
      and(eq(conversations.id, id), eq(conversations.sessionId, sessionId), isNull(conversations.userId))
    );
    return conversation;
  },

  async getConversationsBySession(sessionId: string, userId?: string | null) {
    if (userId) {
      return db.select().from(conversations)
        .where(eq(conversations.userId, userId))
        .orderBy(desc(conversations.createdAt));
    }
    return db.select().from(conversations)
      .where(and(eq(conversations.sessionId, sessionId), isNull(conversations.userId)))
      .orderBy(desc(conversations.createdAt));
  },

  async createConversation(title: string, sessionId: string, userId?: string | null) {
    const [conversation] = await db.insert(conversations).values({ title, sessionId, userId: userId || null }).returning();
    return conversation;
  },

  async deleteConversation(id: number, sessionId: string, userId?: string | null) {
    const conversation = await this.getConversation(id, sessionId, userId);
    if (conversation) {
      await db.delete(messages).where(eq(messages.conversationId, id));
      await db.delete(conversations).where(eq(conversations.id, id));
    }
  },

  async getMessagesByConversation(conversationId: number) {
    return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  },

  async createMessage(conversationId: number, role: string, content: string) {
    const [message] = await db.insert(messages).values({ conversationId, role, content }).returning();
    return message;
  },

  async migrateSessionToUser(sessionId: string, userId: string) {
    await db.update(conversations)
      .set({ userId })
      .where(and(eq(conversations.sessionId, sessionId), isNull(conversations.userId)));
  },
};

