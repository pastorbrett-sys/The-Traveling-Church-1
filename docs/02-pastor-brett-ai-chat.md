# 🙏 Pastor Brett (AI Chat)

Pastor Brett is an AI-powered pastoral assistant that provides biblical guidance and answers questions about faith.

&nbsp;

---

&nbsp;

## 🎯 Overview

| Feature | Details |
|---------|---------|
| **Model** | OpenAI GPT-4o |
| **Streaming** | Yes (real-time response) |
| **Persistence** | Conversations stored per user |
| **Translation** | World English Bible (WEB) |

&nbsp;

---

&nbsp;

## ⚙️ How It Works

&nbsp;

### Frontend Flow

`client/src/pages/pastor-chat.tsx`

1. User types and sends a message
2. Message sent to `/api/chat` endpoint
3. Response streams back using Server-Sent Events (SSE)
4. Conversation displays in chat bubbles

&nbsp;

### Backend Flow

`server/routes.ts`

1. Receives user message
2. Loads conversation history from database
3. Sends to OpenAI with Pastor Brett system prompt
4. Streams response back to client
5. Saves complete response to database

&nbsp;

---

&nbsp;

## 🎭 System Prompt

Pastor Brett's personality is defined with:

- ✝️ Warm, pastoral tone
- 📖 Biblical grounding (WEB translation)
- 💚 Non-judgmental approach
- 🤝 Supportive and encouraging

&nbsp;

---

&nbsp;

## 📂 Key Files

| File | Purpose |
|------|---------|
| `client/src/pages/pastor-chat.tsx` | Chat UI component |
| `server/routes.ts` | `/api/chat` endpoint |
| `shared/models/chat.ts` | Chat message types |

&nbsp;

---

&nbsp;

## 📊 Usage Limits

### Free Tier

| Feature | Monthly Limit |
|---------|---------------|
| 💬 Chat Messages | 10 |
| 🔍 Smart Search | 5 |
| 📖 Book Synopsis | 2 |
| 💡 Verse Insights | 6 |

&nbsp;

### Pro Tier

✨ **Unlimited access** to all AI features

&nbsp;

---

&nbsp;

## 🔗 Related Features

| Feature | Description |
|---------|-------------|
| **Verse Insights** | AI commentary on specific verses |
| **Smart Search** | AI-powered Bible search |
| **Book Synopsis** | AI summaries of Bible books |
