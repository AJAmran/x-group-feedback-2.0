# X-Group Feedback System - Developer & AI Agent Guide

This document serves as the single source of truth for the X-Group Feedback System frontend codebase. It is designed to rapidly onboard human developers and AI coding agents.

## 1. Project Overview
- **Business Purpose**: A comprehensive guest feedback management system for X-Group Hospitality (a chain of restaurants in Bangladesh).
- **Target Users**:
  - **Guests**: Access the public-facing feedback form to rate their dining experience.
  - **Admins/Management**: Access a private dashboard to track KPIs, analyze trends, manage feedback, and generate reports.
- **Core Features**:
  - Public 3-step feedback form with real-time validation and glassmorphism UI.
  - Admin dashboard with executive overview, analytics charts, branch leaderboards, and report generation.
- **User Workflows**:
  - **Guest**: Navigates to `/?branch=X-01` -> Fills in contact info -> Rates categories -> Provides additional info -> Submits -> Sees confetti success screen.
  - **Admin**: Logs in at `/login` -> Views dashboard KPIs -> Filters feedback in the table -> Exports reports.

## 2. Architecture
- **Framework**: Next.js 16 (App Router)
- **Paradigm**: The application serves strictly as the **frontend client**. It delegates database operations and core business logic to an external Express.js backend.
- **Folder Structure**:
  ```
  src/
  ├── app/                  # Next.js App Router (pages, layouts, middleware)
  ├── assets/               # Static assets (images, icons)
  ├── components/           # Reusable UI components (Input, FeedbackForm, etc.)
  │   └── ui/               # Lower-level granular components
  ├── features/             # Feature-specific logic (e.g., auth actions, dashboard server actions)
  ├── hooks/                # Custom React hooks (e.g., useFeedbackForm)
  ├── lib/                  # Utilities, API clients, constants, config
  └── types/                # TypeScript interfaces and type definitions
  ```
- **Component Hierarchy**: Heavy use of Server Components for layout and data fetching, intermixed with Client Components (`"use client"`) for interactivity (Framer Motion, React Hook Form).
- **Routing**: Next.js file-system routing.
  - `/` - Public feedback form
  - `/login` - Admin login
  - `/dashboard/*` - Protected admin routes
- **State Management**: 
  - Form state: `react-hook-form`
  - Client state: React hooks (`useState`, `useSyncExternalStore`)
  - Server state: Handled via Next.js Server Actions calling the Express API.
- **Data Flow**: Server Actions (`src/features/dashboard/actions.ts`) fetch data from the Express backend and pass it to React Server Components. Client components use `src/lib/api.ts` to push data directly to the backend.

## 3. Technologies
- **Frameworks**: Next.js 16.0.7, React 19.2.0
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x (using OKLCH colors, glassmorphism, mesh gradients)
- **UI & Animations**: Framer Motion 12.x, Lucide React (icons)
- **Forms & Validation**: `react-hook-form`, Zod
- **Data Visualization**: Recharts, `@tanstack/react-table`
- **Build Tools**: ESLint 9 (Flat config), PostCSS

## 4. API Integration
- **Current API Structure**: 
  - The frontend communicates with an external Express.js backend API (configured via `NEXT_PUBLIC_API_URL`, defaulting to `http://127.0.0.1:5000`).
  - Prisma and database logic exist **entirely on the backend**. There is no Prisma client in this frontend repository.
- **Expected Backend Integration Points**:
  - `POST /api/v1/feedbacks` - Submit feedback
  - `GET /api/v1/branches/active` - Fetch active branches (public)
  - `GET /api/v1/branches` - Fetch all branches (auth required)
  - `GET /api/v1/analytics/ratings` - Rating analytics & distribution
  - `GET /api/v1/analytics/monthly` - Monthly trend data
  - `GET /api/v1/analytics/satisfaction` - Customer satisfaction rate
  - `GET /api/v1/feedbacks` - List feedbacks (paginated/filtered)
  - `GET /api/v1/feedbacks/:id` - Feedback details
- **Authentication Flow**: 
  - Admin logs in via `/api/auth/login` (frontend route or backend endpoint depending on setup), which sets an `accessToken` httpOnly cookie.
  - `src/proxy.ts` (Next.js 16's route interception file) protects `/dashboard/*` by checking for the `accessToken`.
  - Server actions attach `Cookie: accessToken=${token}` to backend requests.
- **Error Handling**: `src/lib/api.ts` handles fetch timeouts, parses API errors, and standardizes them into `ApiError` objects for the frontend to consume. Forms implement exponential backoff retry logic.

## 5. Business Logic
- **Authentication**: JWT-based. Sessions last 24 hours.
- **Feedback Flow**: 5 core rating categories (Food, Service, Environment, Event, Overall). Ratings are converted from UI ENUMS (EXCELLENT, GOOD, AVERAGE, POOR, VERY_POOR) to Integers (5, 4, 3, 2, 1) before hitting the backend.
- **Dashboard**: Generates aggregated stats, NPS (Net Promoter Score), and sentiment analysis.
- **Branch Management**: Feedbacks are tightly coupled to a `branchId` (UUID). The frontend maps a branch name (or `branchCode` from URL) to the backend `branchId`.

## 6. Development Standards
- **Naming Conventions**: 
  - Files/Folders: `kebab-case` or `camelCase` for utilities, `PascalCase` for React components.
  - Types/Interfaces: PascalCase (e.g., `FeedbackSubmissionRequest`).
- **Reusable Component Rules**: Separate purely visual UI components (`src/components/ui/`) from domain-specific features (`src/components/FeedbackForm.tsx`).
- **Hooks**: Keep logic separate from presentation. e.g., `useFeedbackForm` manages form validation, submission state, and API retries.
- **Constants**: Defined centrally in `src/lib/constants.ts` and `src/lib/config.ts`. Avoid magic strings.
- **Types**: Strict typing. Use Zod for runtime validation mirroring TypeScript types.

## 7. Performance
- **Current Optimizations**:
  - Dynamic imports (`next/dynamic`) for heavy client components.
  - Suspense boundaries for loading states.
  - Exponential backoff for API submissions.
- **Potential Bottlenecks**:
  - Backend latency blocking server components on the dashboard.
- **Best Practices to Follow**: 
  - Always use `useSyncExternalStore` for hydration-safe mounting checks.
  - Favor server actions for data fetching on the admin panel to reduce client bundle size.
- **Things to Avoid**: 
  - Do not use Prisma or database queries in the frontend codebase. All data must flow through the Express API.

## 8. AI Agent Guidelines
**Before making any changes, AI agents MUST follow these rules:**
- **Architecture Rules**: Remember this is the **frontend only**. Do not attempt to run `prisma generate`, `prisma migrate`, or create backend database schemas here.
- **Coding Standards**: Maintain TypeScript strictness. Do not use `any` unless absolutely necessary (e.g., bridging generic API responses).
- **Design System Rules**: 
  - **DO NOT** use generic Tailwind colors (e.g., `bg-red-500`) unless explicitly maintaining legacy components.
  - Adhere to the "iOS 26" design system (OKLCH colors, glass/frosted effects, mesh gradients, `liquid-glass`, `glass-card`, `btn-ios`).
  - Maintain the existing micro-animations using Framer Motion.
- **File Organization**: Place Next.js pages in `src/app`, UI components in `src/components`, API logic in `src/lib/api.ts`, and Server Actions in `src/features/*/actions.ts`.
- **Safe Refactoring**: When modifying API request shapes, ensure compatibility with `src/lib/api.ts` mapping functions (e.g., enum-to-integer conversions).
- **Read-Only Contexts**: Treat `src/lib/config.ts` as the source of truth for text and labels.

## 9. Missing Documentation
- **Deployment Strategy**: Vercel configuration for proxying or connecting to the external Express backend is not fully documented in the repository.
- **Mock Fallbacks**: If the Express backend is unreachable, there is limited documentation on how the frontend handles mock data fallback in the development environment.
- **Environment Variables**: A complete list of required environment variables for connecting to the backend is needed in `.env.example`.
