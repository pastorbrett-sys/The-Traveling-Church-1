# The Traveling Church - Compressed Project Documentation

## Overview

The Traveling Church is a full-stack web application for a global, traveling ministry, aiming to showcase its worldwide reach and foster community engagement. Key features include an interactive map, event calendar, contact forms, leadership profiles, and an "AI Bible Buddy" for comprehensive Bible study. The project is designed for a SaaS model, incorporating Free and Pro subscription tiers via Stripe for web and RevenueCat for native in-app purchases, expanding access and features across web and mobile platforms. The overarching goal is to provide a dynamic, accessible platform supporting the ministry's mission and connecting with its global audience.

## User Preferences

Preferred communication style: Simple, everyday language.
Git/GitHub: NEVER commit chat screenshots to git. Screenshots shared during conversation go to attached_assets/ but should be excluded from commits via .gitignore patterns.
Native build commands (Android Studio / Xcode): ALWAYS include `node scripts/prepare-native-build.js` in the command sequence before `npx cap sync`. This script strips large Traveling-Church-only assets that aren't needed in the Sea Scroll native app, keeping the bundle size down. Correct order is: `npm install` → `npm run build` → `node scripts/prepare-native-build.js` → `npx cap sync android` (or `ios`) → `npx cap open android` (or `ios`).

## CRITICAL — DO NOT RENAME

The following strings are intentionally kept as "Vagabond Bible" even though the user-facing brand is "Sea Scroll". DO NOT rename these without explicit user approval AND coordinated dashboard changes — renaming will break paying subscribers and production infrastructure:

- **`"Vagabond Bible Pro"`** — RevenueCat entitlement identifier. Configured in App Store Connect, Google Play, and RevenueCat dashboards. Used in `server/revenueCatWebhook.ts` and `client/src/contexts/revenuecat-context.tsx`. Renaming breaks Pro access for every paying user instantly.
- **`vagabondbible.com`** — production domain (webhooks, email links).
- **`com.vagabondbible.app`** — iOS/Android bundle ID. Tied to App Store / Play Store listings.
- **Asset filenames** containing `vagabond-bible-*` (e.g. `vagabond-bible-header.png`) — internal file references; rename would require re-uploading assets.
- **Test IDs and gtag/analytics event names** — keep historical names so analytics continuity is preserved.

## System Architecture

### Technology Stack
- **Frontend**: React 18 (TypeScript, Vite), Shadcn/ui, Tailwind CSS, TanStack Query, Wouter
- **Backend**: Express.js (TypeScript)
- **Database**: PostgreSQL (Neon serverless) with Drizzle ORM

### Application Architecture
The application uses a component-based frontend and an Express.js backend with `/api` prefixed endpoints. Data is persisted in PostgreSQL via Drizzle ORM, utilizing an interface-based storage abstraction for flexibility. Data integrity is maintained with UUID primary keys and Zod validation across core entities. TanStack Query manages frontend data flow, caching, and synchronization with the API. The application supports native iOS and Android via Capacitor, with platform-specific adaptations and secure API handling.

### UI/UX Decisions
The UI/UX prioritizes accessibility and customization, leveraging Shadcn/ui and Radix UI with Tailwind CSS for styling and a custom theme. Design elements include custom branding, animated hero sections, smooth-scrolling navigation, and full mobile responsiveness. Native platforms benefit from adaptations like tab bars and safe area handling.

### Technical Implementations
- **AI Bible Buddy**: Integrates OpenAI (GPT-4o-mini/GPT-4o) for English content and Google Gemini 2.5 Flash for non-English (Amharic) content, managed by `server/aiRouter.ts`. Features chat, a multi-translation Bible reader, smart search, and conversational verse insights. Includes a Bible Heading Override System and a first-time chat experience with quick-select buttons. Guest users receive limited free messages before requiring login.
- **Subscription Management**: Implements Free and Pro SaaS tiers using Stripe for web and RevenueCat for native in-app purchases. Features regional pricing with server-side IP-based detection for web (Stripe) and RevenueCat targeting for iOS.
- **User Authentication**: Integrates Replit's OpenID Connect (Google, GitHub, email/password) for user sign-in and links subscriptions.
- **Email Automation**: Uses Resend for automated welcome and subscription confirmation emails.
- **PWA Install**: Provides a Progressive Web App (PWA) installation option with a minimal service worker and a custom hook for `beforeinstallprompt` event handling.
- **Verse Sharing**: Generates shareable images of Bible verses with various backgrounds and integrates with native Share APIs.
- **Prayer Timer**: Features background meditation music with lock screen controls, persistent timer state across navigation, a draggable floating prayer button, and an alarm with haptic feedback upon completion.
- **Push Notifications**: Utilizes Firebase Cloud Messaging (FCM) for timezone-aware daily and weekly verse reminders. Supports localized notifications through AI-driven translation for non-English users, with a configurable priority system for collision detection.
- **Service Reminders**: Weekly email reminders for Bible study services, sent every Thursday at 9 AM UTC via `server/serviceReminderCron.ts`. Subscribers sign up via `/api/service-reminders` with email and auto-detected timezone. Emails show localized service times and Google Meet links. DB table: `service_reminders`.
- **Apple Sign-In**: Configured for native iOS applications, requiring specific settings in Apple Developer Console, Firebase Console, and Xcode.

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL.
- **Google Cloud Storage**: Used for custom images.

### UI & Component Libraries
- **Radix UI**: Accessible component primitives.
- **Lucide React**: Icon library.
- **Embla Carousel**: Carousel functionality.
- **CMDK**: Command menu component.
- **Vaul**: Drawer/bottom sheet component.

### Form & Validation
- **React Hook Form**: Form state management.
- **Zod**: Schema validation.
- **Drizzle Zod**: Drizzle ORM and Zod integration.

### Utilities
- **date-fns**: Date manipulation.
- **class-variance-authority**: Variant-based component styles.
- **clsx** & **tailwind-merge**: Conditional className utilities.
- **nanoid**: Unique ID generation.
- **connect-pg-simple**: PostgreSQL session store.

### API Integrations
- **OpenAI**: Powers the AI Bible Buddy.
- **Google Gemini**: Powers Amharic AI translations.
- **Stripe**: For web subscription billing and management.
- **RevenueCat**: For native iOS/Android in-app purchases and subscriptions.
- **Resend**: For automated email sending (welcome, subscription, weekly Bible study reminders).
- **Firebase Cloud Messaging (FCM)**: For push notifications.