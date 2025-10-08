# The Traveling Church - Project Documentation

## Overview

The Traveling Church is a full-stack web application showcasing a global, traveling ministry. The application presents information about a faith-based organization that reaches people worldwide, featuring travel locations, mission statements, values, and pastoral information. Built with a modern React frontend and Express backend, it serves as an informational platform for this unique ministry approach.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Technology Stack
- **Frontend Framework**: React 18 with TypeScript, using Vite as the build tool
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme variables for consistent design
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL (via Neon serverless) with Drizzle ORM for type-safe database operations
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing

### Application Architecture

**Frontend Structure**:
- Component-based architecture with reusable UI components in `client/src/components/ui/`
- Page components in `client/src/pages/` for different routes
- Feature-specific components in `client/src/components/` (navigation, hero, mission, etc.)
- Custom hooks in `client/src/hooks/` for shared logic
- Centralized theme configuration using CSS custom properties

**Backend Structure**:
- Express server with route registration in `server/routes.ts`
- In-memory storage implementation (`MemStorage`) in `server/storage.ts` that pre-populates travel location data
- Modular Vite integration for development with HMR support
- API endpoints prefixed with `/api` for clear separation from static assets

**Database Schema**:
- **Users table**: Stores user authentication data (id, username, password)
- **Locations table**: Stores travel location information (id, name, country, imageUrl, description)
- Schema definitions in `shared/schema.ts` using Drizzle ORM with Zod validation
- UUID primary keys generated via PostgreSQL's `gen_random_uuid()`

**Data Flow**:
1. Frontend components use TanStack Query to fetch data from API endpoints
2. API routes in Express handle requests and interact with storage layer
3. Storage layer (currently in-memory, prepared for database) manages data persistence
4. Drizzle ORM provides type-safe database operations and schema validation

### Key Design Decisions

**Component Library Choice (Shadcn/ui + Radix UI)**:
- **Rationale**: Provides accessible, customizable components without being a heavy framework dependency
- **Benefits**: Full control over component code, excellent TypeScript support, accessibility built-in
- **Trade-offs**: Requires more manual setup compared to pre-packaged UI libraries

**State Management (TanStack Query)**:
- **Rationale**: Specialized for server state with built-in caching, background refetching, and optimistic updates
- **Benefits**: Reduces boilerplate for API calls, automatic cache management, better UX with loading states
- **Configuration**: Disabled automatic refetching (`refetchOnWindowFocus: false`) for more predictable behavior

**Storage Layer Abstraction**:
- **Rationale**: Interface-based design (`IStorage`) allows switching between in-memory and database implementations
- **Current Implementation**: `MemStorage` with hardcoded initial data for development
- **Migration Path**: Easy transition to database-backed storage by implementing the same interface

**Routing Strategy (Wouter)**:
- **Rationale**: Lightweight alternative to React Router with minimal API surface
- **Benefits**: Smaller bundle size, simple hook-based API, sufficient for single-page applications
- **Trade-offs**: Fewer features than React Router, but adequate for this use case

**Build Configuration**:
- **Development**: Vite dev server with HMR, Replit-specific plugins for enhanced development experience
- **Production**: Separate builds for client (Vite) and server (esbuild), output to `dist/` directory
- **Asset Handling**: Static assets served from `dist/public` in production

**Styling Approach**:
- **Rationale**: Tailwind CSS for utility-first styling with custom design system via CSS variables
- **Theme System**: Color palette using HSL values for easy light/dark mode support
- **Customization**: Border radius and spacing controlled through CSS custom properties

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL database hosting
  - Connection via `@neondatabase/serverless` package
  - Configuration through `DATABASE_URL` environment variable
  - Used with Drizzle ORM for type-safe queries

### UI & Component Libraries
- **Radix UI**: Unstyled, accessible component primitives (accordion, dialog, dropdown, etc.)
- **Lucide React**: Icon library for consistent iconography
- **Embla Carousel**: Carousel/slider functionality
- **CMDK**: Command menu component
- **Vaul**: Drawer/bottom sheet component

### Development Tools
- **Drizzle Kit**: Database migration and schema management tool
- **Vite**: Frontend build tool and dev server
- **esbuild**: Fast JavaScript bundler for server-side code
- **TSX**: TypeScript execution engine for development

### Replit-Specific Integrations
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Code mapping for better debugging
- **@replit/vite-plugin-dev-banner**: Development environment indicator

### Form & Validation
- **React Hook Form**: Form state management with `@hookform/resolvers`
- **Zod**: Schema validation for forms and database operations
- **Drizzle Zod**: Integration between Drizzle schemas and Zod validation

### Utilities
- **date-fns**: Date manipulation and formatting
- **class-variance-authority**: Utility for creating variant-based component styles
- **clsx** & **tailwind-merge**: Conditional className utilities
- **nanoid**: Unique ID generation
- **connect-pg-simple**: PostgreSQL session store for Express (prepared for authentication)