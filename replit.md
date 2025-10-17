# The Traveling Church - Project Documentation

## Overview

The Traveling Church is a full-stack web application showcasing a global, traveling ministry. The application presents information about a faith-based organization that reaches people worldwide. Built with a modern React frontend and Express backend, it serves as a comprehensive platform featuring:

- **Travel locations** with interactive world map
- **Event calendar** for upcoming gatherings (online recurring events)
- **Contact form** for inquiries and connection
- **Mission statement** and core values presentation
- **Church leadership** section with photos and roles
- **Resources for Men** section with link to external platform
- **WhatsApp community** call-to-action for joining the online community

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
- **Locations table**: Stores travel location information (id, name, country, imageUrl, description, displayOrder)
- **Blog Posts table**: Stores Pastor Brett's journal entries (id, title, content, locationId, imageUrl, createdAt)
- **Events table**: Stores upcoming and past gatherings (id, title, description, date, location, type, scheduleLabel, timeLabel)
  - `scheduleLabel` (optional): Custom display for recurring events (e.g., "Every Friday")
  - `timeLabel` (optional): Custom time range display (e.g., "8-9pm EDT")
- **Testimonials table**: Stores congregation member stories (id, name, location, content, createdAt)
- **Contact Submissions table**: Stores contact form submissions (id, name, email, message, createdAt)
- Schema definitions in `shared/schema.ts` using Drizzle ORM with Zod validation
- UUID primary keys generated via PostgreSQL's `gen_random_uuid()`
- Date coercion in schemas handles both string and Date inputs for timestamp fields
- Locations ordered by displayOrder column for consistent presentation sequence

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

## Recent Changes

### Completed Features (October 2025)
All core features have been implemented and tested:

1. **Contact Form** (`client/src/components/contact-form.tsx`)
   - Full validation with Zod schema
   - Success/error toast notifications
   - Stores submissions in PostgreSQL database
   - Mobile-responsive design

2. **Event Calendar** (`client/src/components/event-calendar.tsx`)
   - Displays upcoming events only (past events hidden)
   - Event type indicators (online/in-person)
   - Date and time formatting with date-fns
   - Schema date coercion for API compatibility
   - Responsive grid layout
   - Recurring events use scheduleLabel and timeLabel fields for custom display
   - Current events: Mens Group (Every Friday, 8-9pm EDT) and International Vibe Service (Every Week Sunday, Noon-1:30PM EDT)

3. **WhatsApp Community Section** (`client/src/components/whatsapp-section.tsx`)
   - Call-to-action section positioned after Mission section
   - WhatsApp green icon and branding
   - Heading: "Join Our Global Community"
   - Descriptive text about connecting with global believers
   - Button text: "Join Whatsapp"
   - Links to WhatsApp group: https://chat.whatsapp.com/DrytNuW5LSxEHlNQdszJP0?mode=wwc
   - Opens in new tab with security attributes
   - Fully responsive for mobile and desktop
   - Gradient background with primary/secondary colors

4. **Church Leadership Section** (`client/src/components/leadership-section.tsx`)
   - Displays church leadership team
   - Two-column grid layout (desktop), stacked on mobile
   - Features Daniel Stockdale (Treasurer) and Josh Castillo (Community Growth)
   - Each leader has: circular profile image, name, title, and short description
   - Images: Daniel_1760680915194.jpg and Josh_1760681040173.jpg
   - Positioned after Values section
   - Responsive with lazy-loaded images

5. **Resources for Men Section** (`client/src/components/men-resources-section.tsx`)
   - Dedicated section for men's ministry resources
   - Centered content with Users icon from lucide-react
   - Heading: "Resources for Men"
   - Message about Men of God platform supporting men who carry burdens
   - CTA button linking to Men of God platform (https://www.menofgod.com)
   - Positioned after Leadership section
   - Warm, supportive messaging aligned with ministry focus

### Branding & Navigation Updates
- **Logo**: Replaced text logo with custom image logo (`attached_assets/Traveling Church Logo_1760305502132.png`)
  - Logo displays at h-7 (28px) height
  - Vertically centered in navigation bar
  - Clickable to scroll to home section

- **Hero Section Animations**: 
  - **Title**: "The Traveling Church" animates on page load
    - Letter-by-letter fade-in effect from left to right
    - Each letter fades in with 0.05s delay stagger
    - Smooth 0.3s fade-in with upward movement (translateY)
    - "Church" appears on its own line
  - **Mission Text**: Fades in after title completes
    - Starts at 1s delay with 0% opacity
    - Floats up from bottom (30px translateY) to normal position
    - 0.8s fade-in duration with ease-out easing
    - Reaches full opacity when complete
  - Total animation sequence: ~1.8 seconds
  
- **Navigation** (`client/src/components/navigation.tsx`):
  - Mission, Journey, Values, Pastor, Resources, Events, Contact
  - Removed "Map", "Journal" (Pastor's Journal/Blog), and "Stories" (Testimonials) navigation links
  - Added "Resources" link for Men's Resources section
  - Smooth scroll behavior with active section tracking
  - Mobile-responsive navigation bar with hamburger menu

### Removed Sections (October 2025)
- **Pastor's Journal/Blog**: Removed blog section and all related components
- **Testimonials**: Removed testimonials section and all related components  
- **Past Gatherings**: Removed past events display from Event Calendar - only upcoming events shown now

### Journey Locations Update
Updated to feature 6 specific locations with custom images, ordered by displayOrder:
1. **The Jordan River, Israel** - Baptism site where John baptized Jesus
2. **Jerusalem, Israel** - Walking the holy streets
3. **Cambodia** - Ministering to communities rising from hardship
4. **Thailand** - Sharing Christ's love among golden temples
5. **Egypt** - Following the path of the Holy Family
6. **Ethiopia** - Ancient Christianity cradle

### API Endpoints
Active endpoints implemented in `server/routes.ts`:
- `/api/locations` - GET locations for journey section
- `/api/events` - GET events (upcoming only displayed)
- `/api/contact` - POST contact submissions

Removed endpoints:
- `/api/blog` - Removed (Pastor's Journal/Blog feature removed)
- `/api/testimonials` - Removed (Testimonials feature removed)