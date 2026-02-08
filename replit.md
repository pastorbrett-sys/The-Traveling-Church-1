# The Traveling Church - Compressed Project Documentation

## Overview

The Traveling Church is a full-stack web application designed for a global, traveling ministry. Its core purpose is to showcase the ministry's worldwide reach and foster community engagement through features like an interactive map of travel locations, an event calendar, contact forms, and leadership profiles. A key offering is the "AI Bible Buddy," a comprehensive Bible study tool powered by AI, featuring chat, a reader, smart search, and verse insights. The project aims for a SaaS model, integrating Stripe for subscriptions and RevenueCat for native in-app purchases to offer Free and Pro tiers, enabling expanded access and features for users across web and mobile platforms. The overall vision is to create a dynamic, accessible platform that supports the ministry's mission and connects with its global audience.

## User Preferences

Preferred communication style: Simple, everyday language.
Git/GitHub: NEVER commit chat screenshots to git. Screenshots shared during conversation go to attached_assets/ but should be excluded from commits via .gitignore patterns.

## System Architecture

### Technology Stack
- **Frontend**: React 18 (TypeScript, Vite), Shadcn/ui, Tailwind CSS, TanStack Query, Wouter
- **Backend**: Express.js (TypeScript)
- **Database**: PostgreSQL (Neon serverless) with Drizzle ORM

### Application Architecture
The application uses a component-based frontend architecture and an Express.js backend with `/api` prefixed endpoints. Data persistence is handled by PostgreSQL via Drizzle ORM, with an interface-based storage abstraction allowing for flexible database integration. UUID primary keys and Zod validation ensure data integrity across `Users`, `Locations`, `Events`, and `Contact Submissions` tables. TanStack Query manages data flow and caching between the frontend and API.

### Key Design Decisions
- **UI/UX**: Utilizes Shadcn/ui and Radix UI for accessible, customizable components, styled with Tailwind CSS and a custom theme. Features include custom branding, animated hero sections, smooth-scrolling navigation, and mobile responsiveness.
- **State Management**: TanStack Query is central for server state management, caching, and background refetching.
- **Storage Abstraction**: An `IStorage` interface enables easy switching between in-memory and database storage.
- **Routing**: Wouter provides a lightweight, hook-based routing solution.

### Feature Specifications
- **Contact Form**: Zod-validated forms with submission storage and notifications.
- **Event Calendar**: Displays upcoming events with type indicators.
- **WhatsApp Community**: Direct call-to-action link.
- **Ministry Information**: Dedicated sections for leadership profiles, resources, and specific global journey locations.
- **AI Bible Buddy**: AI-powered pastoral chat (Pastor Brett), multi-translation Bible reader, smart search, conversational verse insights, and note-taking. Uses dual AI routing: English → OpenAI (GPT-4o for search, GPT-4o-mini for chat), non-English → Google Gemini 2.5 Flash (faster, cheaper, better multilingual). Routing logic in `server/aiRouter.ts`. Non-English prompts use "think in English, respond in target language" technique for quality. Includes a Bible Heading Override System, pre-processing headings via `server/data/headingOverrides.json` and AI analysis to ensure accurate section titles.
- **Subscription Management**: Implements Free and Pro SaaS tiers using Stripe for web and RevenueCat for native in-app purchases. Pro plans offer unlimited AI Bible Buddy access and other premium features.
- **Regional Pricing**: Two-tier pricing model ($7.99 Premium for developed markets, $1.99 Emerging for developing markets).
  - **Web**: Device locale detection via `navigator.language` ensures tourists pay premium pricing. Config: `shared/regionalPricing.ts`, endpoints: `/api/pricing/tier`, `/api/stripe/regional-checkout`. Requires: `STRIPE_PRICE_PRO_PREMIUM` and `STRIPE_PRICE_PRO_EMERGING` environment variables.
  - **iOS**: Two separate App Store products (`vagabond_bible_pro_monthly` at $7.99, `pro_monthly_emerging` at $1.99). RevenueCat Targeting automatically shows correct offering based on App Store country. See `docs/NATIVE_REGIONAL_PRICING_SETUP.md`.
  - **Android**: Single product with Google Play regional pricing (TODO).
- **User Authentication**: Integrates Replit's OpenID Connect for user sign-in (Google, GitHub, email/password), linking subscriptions to user accounts. Authenticated Pro users can manage subscriptions via Stripe Customer Portal.
- **Email Automation**: Uses Resend (free tier: 3,000 emails/month) for automated emails:
  - **Welcome Email**: Sent automatically when a new user signs up, introducing AI Bible Buddy features.
  - **Subscription Confirmation**: Sent when a user subscribes to Pro, confirming benefits and thanking them.
  - Implementation: `server/email.ts`, triggered from auth storage (welcome) and Stripe webhooks (subscription).
- **Native App (Capacitor)**: Supports iOS and Android via Capacitor, with platform-specific UI/UX adaptations like native tab bars, full-screen modals, and safe area handling. API calls from native platforms prepend the production URL and handle session cookies securely. App Transport Security (ATS) is configured for broader compatibility.
  - **Android Safe Area Fix**: Uses `@capacitor-community/safe-area` plugin to fix Android WebView's broken `env(safe-area-inset-*)` CSS variables (Chromium <140 bug). MainActivity.java enables edge-to-edge mode via `EdgeToEdge.enable(this)`. The plugin auto-detects Chromium version and applies correct padding.
  - **Native-Only Plugin Imports**: Plugins like `capacitor-music-controls-plugin-v3`, `@capacitor/haptics`, and `@capacitor/local-notifications` use dynamic imports via `Function('m', 'return import(m)')` to prevent Vite from statically analyzing them during build. This avoids "Failed to resolve import" errors since these plugins only exist at runtime on native platforms. See `client/src/contexts/prayer-audio-context.tsx` for the pattern.
- **Verse Sharing**: Canvas-based image generation with 21 background options. Native Share API integration for iOS/Android. Custom share format with verse reference and Vagabond Bible branding. See `client/src/components/verse-share-sheet.tsx`.
- **Prayer Timer**: Background meditation music with crossfade between tracks. Features:
  - **Lock Screen Controls**: iOS/Android lock screen displays track info, artwork ("Music by Pastor Brett"), and play/pause controls via `capacitor-music-controls-plugin-v3`.
  - **Persistent Timer State**: Timer continues running when navigating away from the prayer timer page. Global timer state managed in `PrayerAudioContext` persists across route changes. When user returns, page syncs with global timer.
  - **Floating Prayer Button**: Persistent circular golden button (`#c08e00`, matching CTA buttons) with animated audio bars appears when navigating away while audio plays. iOS PiP-style physics (velocity-based momentum, friction, spring animation). Draggable to any corner with position memory via localStorage. Cross-platform compatible (web/iOS/Android) with safe area support.
  - **Timer Completion Alarm**: Plays a gentle chime sound and haptic feedback when timer ends. Uses `@capacitor/local-notifications` for native iOS/Android with sound file in native bundles (`timer_chime.wav`). Falls back to HTMLAudioElement or Web Audio API for web. Android 8+ uses notification channel `timer_complete`. iOS requires sound file added to Xcode project bundle manually.
  - **Implementation**: `client/src/contexts/prayer-audio-context.tsx` (global audio + timer state), `client/src/components/floating-prayer-button.tsx`, `client/src/pages/prayer-timer.tsx`.
- **Push Notifications**: Firebase Cloud Messaging (FCM) integration for verse reminders.
  - **Timezone-aware delivery**: Hourly cron job sends notifications at user's local time.
  - **Verse of the Week**: AI-selected verse with graphic, sent Tuesdays 8am local. Uses GPT-4o with 8 rotating themes.
  - **Daily Verse**: 365 curated verses from `server/dailyVerseData.ts`, sent daily 8am local (skipped on weekly verse day).
  - **Collision detection**: Per-user, per-timezone - daily verse skips only for users who would receive weekly verse that day AND have weekly enabled.
  - **Priority system**: `notification_types.priority` column (weekly=10, daily=5, announcement=1). Higher priority wins on collision.
  - **World English Bible (WEB)**: Uses public domain translation to avoid copyright issues.
  - **Deep linking**: Tapping notification opens directly to the verse with highlight animation.
  - **Database tables**: `push_tokens`, `notification_types`, `user_notification_preferences`, `notification_log`.
  - **Configurable types**: Each notification type has separate day/time settings in database. Schedule changes via DB auto-adapt collision logic.
  - **User preferences**: Toggle on/off per notification type in Profile settings.
  - **Firebase setup**: APNs key S48F6S762Z (Sandbox & Production), Team ID FBD94PWXT2. Service account key in FIREBASE_SERVICE_ACCOUNT_KEY secret.
  - **Implementation**: `server/notificationCron.ts`, `server/firebaseAdmin.ts`, `server/verseSelection.ts`, `server/dailyVerseData.ts`, `client/src/hooks/usePushNotifications.ts`.
- **Apple Sign-In Configuration** (for native iOS):
  - **Required in Apple Developer Console**:
    1. App ID (`com.vagabondbible.app`) must have "Sign in with Apple" capability enabled
    2. Services ID (e.g., `com.vagabondbible.app.service`) with Firebase callback URL: `https://travelingchurch-1b4ab.firebaseapp.com/__/auth/handler`
    3. Private Key (.p8 file) for OAuth code flow - download Key ID and save securely
  - **Required in Firebase Console** (Authentication → Sign-in method → Apple):
    - Services ID (from step 2 above)
    - Apple Team ID: FBD94PWXT2
    - Key ID (from step 3 above)
    - Private Key contents (paste from .p8 file)
  - **Required in Xcode**:
    - "Sign in with Apple" capability in Signing & Capabilities
    - URL Type with REVERSED_CLIENT_ID: `com.googleusercontent.apps.120766949732-5fu6t0hegaaaf8fdqenn2gu0mplghh5e`
  - **Troubleshooting**: See `docs/APPLE_SIGNIN_TROUBLESHOOTING.md`

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL.
- **Google Cloud Storage**: For custom images via Replit Object Storage.

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
- **OpenAI**: Powers the AI Bible Buddy (GPT-4o).
- **Stripe**: For web subscription billing and management (`stripe-replit-sync`).
- **RevenueCat**: For native iOS/Android in-app purchases and subscriptions (`@revenuecat/purchases-capacitor`).