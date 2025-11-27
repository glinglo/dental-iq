# Reactivación Clínicas - Patient Reactivation System

## Overview

Reactivación Clínicas is a healthcare SaaS application designed to help medical clinics identify, segment, and re-engage "lost" patients through multi-channel marketing campaigns. The system automates patient follow-up workflows using SMS, email, and phone calls to improve appointment conversion rates and clinic revenue.

The application targets the Spanish/Latin American healthcare market and replicates core functionality similar to Brevium, focusing on patient lifecycle management, automated segmentation, and campaign performance tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18+ with TypeScript in SPA mode, using Vite for development and building.

**UI Component System**: Shadcn/ui (New York style variant) built on Radix UI primitives with TailwindCSS for styling. The design follows a clean SaaS dashboard pattern inspired by Linear and Notion, emphasizing data clarity and professional healthcare aesthetics.

**State Management**: TanStack Query (React Query v5) for server state management with aggressive caching strategies (staleTime: Infinity). No global client state manager - relies on server state synchronization and React local state.

**Routing**: Wouter for lightweight client-side routing with the following main routes:
- `/` - Dashboard with KPIs
- `/importar` - Patient data import interface
- `/pacientes` - Patient list with segmentation and filtering
- `/campanas` - Campaign creation and management
- `/staff-calls` - Call task management for staff
- `/configuracion` - System configuration

**Design System**: Typography uses Inter/Work Sans for UI and JetBrains Mono for numerical data. Spacing follows Tailwind's standard scale (units of 4, 6, 8, 12, 16). Component hierarchy emphasizes scannable tables and clear information architecture suitable for healthcare data.

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript in ESM mode.

**Development vs Production**: 
- Development mode uses Vite middleware integration for HMR
- Production mode serves pre-built static assets from `dist/public`

**Data Layer**: Currently uses in-memory storage (`MemStorage` class) with mock data generation. The architecture is designed to support database migration through the `IStorage` interface abstraction.

**API Design**: RESTful API structure with endpoints organized by resource:
- `/api/pacientes` - Patient CRUD and calculations
- `/api/campanas` - Campaign management
- `/api/tareas` - Call task tracking
- `/api/dashboard` - Aggregated KPI endpoints

**Business Logic**: Key automated calculations include:
- Patient "lost" status determination (>6 months without visit)
- Priority scoring (Alta/Media/Baja based on months inactive and diagnosis value)
- Campaign performance metrics (conversion rates, contact counts)
- Multi-channel campaign cadence management

### Data Storage Solutions

**Current Implementation**: In-memory storage using TypeScript Maps for rapid prototyping and development.

**Schema Definition**: Drizzle ORM schema defined in `shared/schema.ts` with PostgreSQL dialect targeting Neon serverless database. Schema includes:
- `pacientes` table: Patient records with demographics, visit history, status, and priority
- `campanas` table: Campaign configurations with multi-channel settings
- `tareas_llamadas` table: Phone call tasks with staff assignment and outcome tracking

**Database Migration Strategy**: Drizzle Kit configured for schema push to PostgreSQL (`drizzle.config.ts`). The `IStorage` interface allows seamless transition from mock data to live database without changing application logic.

**Validation**: Zod schemas generated from Drizzle tables using `drizzle-zod` for runtime type safety on API boundaries.

### Authentication and Authorization

**Current State**: No authentication implemented - this is a functional prototype with mock data.

**Planned Approach**: Uses `connect-pg-simple` session store (already in dependencies), suggesting Express session-based authentication with PostgreSQL session persistence when production database is connected.

### External Dependencies

**UI Component Library**: 
- Radix UI primitives (@radix-ui/react-*) for accessible, unstyled components
- shadcn/ui configuration for pre-styled component variants
- class-variance-authority for component variant management

**Styling**:
- TailwindCSS v3+ with custom design tokens
- PostCSS for CSS processing
- Custom CSS variables for theme system (light/dark mode ready)

**Date Handling**: date-fns v3 for date formatting and manipulation with Spanish locale support

**Form Management**: 
- react-hook-form for form state
- @hookform/resolvers for Zod schema validation integration

**Database (Planned)**:
- @neondatabase/serverless for PostgreSQL connection
- Drizzle ORM for type-safe database queries
- drizzle-kit for migrations

**Development Tools**:
- @replit/vite-plugin-runtime-error-modal for enhanced error overlay
- @replit/vite-plugin-cartographer and dev-banner for Replit integration
- tsx for TypeScript execution in development

**Notable Architectural Decisions**:

1. **Mock-First Development**: All data operations use in-memory storage with realistic Spanish-language mock data generators, allowing rapid prototyping before database provisioning.

2. **Interface-Based Storage**: The `IStorage` interface provides a clean contract for data operations, enabling hot-swappable storage implementations (memory → database) without refactoring business logic.

3. **Shared Schema Pattern**: Type definitions in `shared/schema.ts` are consumed by both client and server, ensuring type safety across the full stack.

4. **Query-Centric Frontend**: Heavy reliance on TanStack Query with infinite stale time reduces unnecessary network calls and provides optimistic updates through manual cache invalidation after mutations.

5. **Monorepo Structure**: Client and server code coexist in the same repository with clear separation (`client/`, `server/`, `shared/`) and TypeScript path aliases for clean imports.