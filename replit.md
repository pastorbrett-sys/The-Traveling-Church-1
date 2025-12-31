# The Traveling Church - Project Documentation

## Overview

The Traveling Church is a full-stack web application for a global, traveling ministry. It provides a comprehensive platform featuring travel locations with an interactive map, an event calendar, a contact form, mission statement, leadership profiles, resources for men, and a WhatsApp community call-to-action. The application aims to showcase the ministry's global reach and connect with its audience, offering an AI Pastor Chat and a SaaS subscription model for enhanced features.

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
- **Navigation**: Includes Mission, Journey, Values, Pastor, Resources, Events, Contact, and AI Pastor. Supports smooth scrolling and mobile responsiveness.

### Feature Specifications
- **Contact Form**: Zod-validated, stores submissions, includes success/error notifications.
- **Event Calendar**: Displays only upcoming events with type indicators and responsive layout.
- **WhatsApp Community Section**: Call-to-action with link to a WhatsApp group.
- **Church Leadership Section**: Displays team members with images, names, titles, and descriptions.
- **Resources for Men Section**: Dedicated section with a call-to-action linking to an external platform.
- **Journey Locations**: Features 6 specific global locations with custom images and display order.
- **AI Pastor Chat**: Dedicated page for AI-powered spiritual guidance using OpenAI GPT-4o with streaming responses and conversation persistence.
- **Stripe Subscription Integration**: Implements Free and Pro SaaS tiers with `stripe-replit-sync` for webhook handling and data synchronization. Pro plan includes AI Pastor Chat and other exclusive features.

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