# 🏗️ Architecture Overview

A high-level guide to how Vagabond Bible is built.

&nbsp;

---

&nbsp;

## 📦 Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Shadcn/ui |
| **Backend** | Express.js, TypeScript |
| **Database** | PostgreSQL (Neon serverless), Drizzle ORM |
| **State Management** | TanStack Query |
| **Routing** | Wouter |
| **Native Apps** | Capacitor (iOS & Android) |

&nbsp;

---

&nbsp;

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities (queryClient, etc.)
│   │   └── App.tsx         # Main app with routing
│   └── public/             # Static assets
│
├── server/                 # Express backend
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations (IStorage interface)
│   ├── db.ts               # Drizzle database connection
│   ├── firebaseAdmin.ts    # Firebase push notifications
│   ├── notificationCron.ts # Scheduled notification jobs
│   └── email.ts            # Resend email integration
│
├── shared/                 # Shared code (frontend + backend)
│   ├── schema.ts           # Drizzle database schemas
│   └── models/             # TypeScript types
│
├── ios/                    # Capacitor iOS project
├── android/                # Capacitor Android project
└── docs/                   # Developer documentation
```

&nbsp;

---

&nbsp;

## 🔄 Data Flow

```
┌─────────────┐     TanStack Query      ┌─────────────┐
│   React     │ ◄─────────────────────► │  Express    │
│   Frontend  │      /api/* routes      │   Backend   │
└─────────────┘                         └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  PostgreSQL │
                                        │   (Neon)    │
                                        └─────────────┘
```

&nbsp;

---

&nbsp;

## 🎯 Key Patterns

&nbsp;

### Storage Abstraction

All database operations go through the `IStorage` interface in `server/storage.ts`. This allows:

- ✅ Consistent data access patterns
- ✅ Easy testing with mock implementations
- ✅ Clear separation of concerns

&nbsp;

### API Routes

- All endpoints are prefixed with `/api/`
- Request validation using Zod schemas
- Responses are JSON

&nbsp;

### Frontend Data Fetching

- TanStack Query manages all server state
- Automatic caching and background refetching
- Query keys follow pattern: `['/api/resource', id]`

&nbsp;

---

&nbsp;

## 🔐 Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `OPENAI_API_KEY` | OpenAI API for AI features |
| `STRIPE_SECRET_KEY` | Stripe payments |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Push notifications |
| `RESEND_API_KEY` | Email sending |

&nbsp;

---

&nbsp;

## 🌐 External Services

| Service | Purpose |
|---------|---------|
| **Neon** | Serverless PostgreSQL database |
| **OpenAI** | Powers Pastor Brett AI chat |
| **Stripe** | Web subscription billing |
| **RevenueCat** | iOS/Android in-app purchases |
| **Firebase** | Push notifications (FCM) |
| **Resend** | Transactional emails |
