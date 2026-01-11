# The Traveling Church - Project Documentation

## Overview

The Traveling Church is a full-stack web application for a global, traveling ministry. It provides a comprehensive platform featuring travel locations with an interactive map, an event calendar, a contact form, mission statement, leadership profiles, resources for men, and a WhatsApp community call-to-action. The application aims to showcase the ministry's global reach and connect with its audience, offering an AI Bible Buddy (comprehensive Bible study tool with AI chat, Bible reader, smart search, and verse insights) and a SaaS subscription model for enhanced features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Technology Stack
- **Frontend**: React 18 (TypeScript, Vite), Shadcn/ui (Radix UI), Tailwind CSS, TanStack Query, Wouter
- **Backend**: Express.js (TypeScript)
- **Database**: PostgreSQL (Neon serverless) with Drizzle ORM

### Application Architecture

**Frontend**: Component-based architecture with reusable UI components, page-specific components, and custom hooks.
**Backend**: Express server with API endpoints prefixed with `/api`. Uses an in-memory storage implementation (`MemStorage`) for development, designed for future database integration.
**Database Schema**: Includes tables for `Users`, `Locations`, `Events`, `Contact Submissions`. UUID primary keys are used, and Drizzle ORM with Zod validation ensures type safety and data integrity.
**Data Flow**: Frontend uses TanStack Query to interact with Express API endpoints, which in turn access the storage layer.

### Key Design Decisions

- **Component Library**: Shadcn/ui + Radix UI chosen for accessibility, customizability, and strong TypeScript support.
- **State Management**: TanStack Query for efficient server state management, caching, and background refetching.
- **Storage Abstraction**: An interface-based design (`IStorage`) allows for flexible switching between in-memory and database storage.
- **Routing**: Wouter provides a lightweight, hook-based routing solution suitable for SPAs.
- **Styling**: Tailwind CSS with a custom theme system using CSS variables for consistent design.

### UI/UX Decisions
- **Logo**: Custom image logo for branding, clickable to scroll to home.
- **Hero Section Animations**: Title ("The Traveling Church") animates letter-by-letter, followed by a fade-in animation for the mission text.
- **Navigation**: Includes Home, Missions, Programs, AI Bible Buddy, and Contact. Supports smooth scrolling and mobile responsiveness.

### Feature Specifications
- **Contact Form**: Zod-validated, stores submissions, includes success/error notifications.
- **Event Calendar**: Displays only upcoming events with type indicators and responsive layout.
- **WhatsApp Community Section**: Call-to-action with link to a WhatsApp group.
- **Church Leadership Section**: Displays team members with images, names, titles, and descriptions.
- **Resources for Men Section**: Dedicated section with a call-to-action linking to an external platform.
- **Journey Locations**: Features 6 specific global locations with custom images and display order.
- **AI Bible Buddy**: Comprehensive Bible study tool featuring AI-powered pastoral chat (Pastor Brett), Bible reader with multiple translations, smart search, conversational verse insights with follow-up questions, and note-taking capabilities. Uses OpenAI GPT-4o with streaming responses and conversation persistence.
- **Bible Heading Override System**: Pre-processed heading identification that distinguishes true section headings from paragraph breaks. Uses `server/data/headingOverrides.json` to store corrections. The analysis script (`scripts/analyzeHeadings.ts`) uses AI to identify false positive headings. Manual refinements can be made by editing the JSON file directly without code changes. All 66 books have been analyzed (7,086 false positives identified across Genesis through Revelation). Uses strict criteria: only superscriptions like "A Psalm of David" and true section titles are kept as headings.
- **Stripe Subscription Integration**: Implements Free and Pro SaaS tiers with `stripe-replit-sync` for webhook handling and data synchronization. Pro plan includes unlimited AI Bible Buddy access and other exclusive features.
- **Replit Auth Integration**: Users can sign in via Replit's OpenID Connect authentication (supports Google, GitHub, email/password). Subscriptions are linked to authenticated user accounts for cross-device access.
- **Subscription Management**: Authenticated Pro users can manage their subscription (cancel, update payment) via Stripe Customer Portal integration.

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL.
- **Google Cloud Storage**: Backend for Replit Object Storage, used for all custom images.

### UI & Component Libraries
- **Radix UI**: Unstyled, accessible component primitives.
- **Lucide React**: Icon library.
- **Embla Carousel**: Carousel functionality.
- **CMDK**: Command menu component.
- **Vaul**: Drawer/bottom sheet component.

### Development Tools
- **Drizzle Kit**: Database migration and schema management.
- **Vite**: Frontend build tool and dev server.
- **esbuild**: Fast JavaScript bundler for server-side code.
- **TSX**: TypeScript execution engine.
- **Replit-specific Vite Plugins**: For development error modal, code mapping, and dev banner.

### Form & Validation
- **React Hook Form**: Form state management.
- **Zod**: Schema validation.
- **Drizzle Zod**: Integration for Drizzle schemas and Zod.

### Utilities
- **date-fns**: Date manipulation and formatting.
- **class-variance-authority**: For variant-based component styles.
- **clsx** & **tailwind-merge**: Conditional className utilities.
- **nanoid**: Unique ID generation.
- **connect-pg-simple**: PostgreSQL session store.

### Stripe Integration
- **stripe-replit-sync**: For Stripe webhook handling and data synchronization.

### RevenueCat Integration (In-App Purchases)
- **@revenuecat/purchases-capacitor**: Handles native iOS/Android in-app purchases and subscriptions.
- **SDK Initialization**: RevenueCat SDK only initializes on true native platforms (Capacitor runtime), not on web or simulated native mode.
- **Entitlement**: Uses "Vagabond Bible Pro" entitlement to track Pro subscription status on native platforms.
- **UI Integration**: Native users see app store-specific subscription management guidance; web users continue to use Stripe portal.
- **Product ID**: `vagabond_bible_pro_monthly` for the monthly Pro subscription.
- **Future Work**: Backend sync endpoint needed to inform the server about RevenueCat purchases so usage limits align with native subscriptions.

### Native App (Capacitor)
- **Platforms**: iOS and Android via Capacitor
- **App ID**: `com.vagabondbible.app`
- **Native Tab Bar**: Dark gradient bottom navigation (#1a1a1a to #000000) with gold active states (#b8860b)
- **Platform Detection**: `Capacitor.isNativePlatform()` for true native detection; `usePlatform()` hook for UI-level native simulation
- **Full-screen Modals**: All mobile modals use full-screen layout with inset-0 positioning
- **Safe Area Patterns**:
  - Full-screen dialogs: Add `style={isNative ? { paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)' } : undefined}` to DialogContent
  - Paywall modals: Add `style={isNative ? { paddingTop: 'env(safe-area-inset-top, 0px)' } : undefined}` to DialogContent with inner div padding
  - Absolute positioned buttons inside modals: Use `style={isNative ? { top: 'calc(env(safe-area-inset-top, 0px) + 16px)' } : { top: '16px' }}`
  - Bottom navigation: Fixed at `bottom: calc(env(safe-area-inset-bottom, 0px))` with 64px tab bar height
  - Textarea visibility: Always add `text-foreground` class to ensure dark text on light backgrounds

## Native App Build Process (CRITICAL)

### Environment Variables for Native Builds
- **IMPORTANT**: Replit configuration variables do NOT interpolate secrets. `${SECRET_NAME}` is passed as literal text.
- Frontend env vars must start with `VITE_` prefix to be accessible in client code.
- `VITE_REVENUECAT_SDK_KEY` must be set to the ACTUAL API key value directly (e.g., `appl_xxxxx`), NOT a reference like `${REVENUECAT_SDK_KEY}`.
- Environment variables are embedded at BUILD TIME by Vite. Changes require rebuild.

### iOS Build Workflow (The-Traveling-Church-1 folder on Desktop)

**User prefers consolidated commands per step (fewer steps, multiple commands chained together):**

**Step 1:** Download ZIP from Replit (three dots → Download as ZIP)

**Step 2:** Extract to build folder, then in Terminal:
```
cd ~/Desktop/The-Traveling-Church-1
```

**Step 3:** Install and build:
```
npm install && npm run build && npx cap sync ios
```

**Step 4:** Update Podfile:
```
sed -i '' "s/platform :ios, '14.0'/platform :ios, '15.0'/" ios/App/Podfile
```

**Step 5:** Install pods and open Xcode:
```
cd ios/App && pod install && open App.xcworkspace
```

**Step 6:** In Xcode, press **Cmd+Shift+K** to clean, then **Cmd+R** to run on iPhone

### API Calls on Native
- All `/api/...` calls use `apiFetch()` helper from `queryClient.ts`
- `apiFetch()` prepends production URL (`https://the-traveling-church-brettlindstrom.replit.app`) when `Capacitor.isNativePlatform()` is true
- Server has CORS configured for `capacitor://localhost` and `https://localhost`
- Session cookies use `sameSite: "none"` and `secure: true` for cross-origin requests

### App Transport Security (iOS)
- Info.plist includes `NSAppTransportSecurity` with `NSAllowsArbitraryLoads: true`
- Required for Firebase and other services that may use HTTP endpoints