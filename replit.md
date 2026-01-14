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
- **AI Bible Buddy**: AI-powered pastoral chat (Pastor Brett), multi-translation Bible reader, smart search, conversational verse insights, and note-taking. Integrates OpenAI GPT-4o for streaming responses and conversation persistence. Includes a Bible Heading Override System, pre-processing headings via `server/data/headingOverrides.json` and AI analysis to ensure accurate section titles.
- **Subscription Management**: Implements Free and Pro SaaS tiers using Stripe for web and RevenueCat for native in-app purchases. Pro plans offer unlimited AI Bible Buddy access and other premium features.
- **User Authentication**: Integrates Replit's OpenID Connect for user sign-in (Google, GitHub, email/password), linking subscriptions to user accounts. Authenticated Pro users can manage subscriptions via Stripe Customer Portal.
- **Native App (Capacitor)**: Supports iOS and Android via Capacitor, with platform-specific UI/UX adaptations like native tab bars, full-screen modals, and safe area handling. API calls from native platforms prepend the production URL and handle session cookies securely. App Transport Security (ATS) is configured for broader compatibility.

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