# X-Group Feedback System

A comprehensive guest feedback management system for **X-Group Hospitality** — a chain of restaurants and hospitality venues in Bangladesh. The system comprises a **public-facing feedback form** where guests can rate their dining experience, and a **private admin dashboard** for management to track KPIs, analyze trends, manage feedback, and generate reports.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Branch Configuration](#branch-configuration)
- [Design System](#design-system)
- [Deployment](#deployment)
- [License](#license)

---

## Features

### Public Feedback Form (`/`)
- **3-step submission flow**: Guest Information → Rate Your Visit → Additional Details
- **Real-time validation** with Zod + react-hook-form (visual feedback — green check / red cross badges)
- **5 rating categories**: Food, Service, Environment, Event, Overall — each with Excellent / Good / Average levels
- **Color-coded ratings**: Purple (Excellent), Light Purple (Good), Gray (Average)
- **Branch selection** via URL parameter (`?branch=X-01`)
- **Auto-generated feedback IDs** for reference
- **Glassmorphism UI** with animated gradient background and floating orbs
- **Error handling** with retry logic (exponential backoff, 30s timeout)
- **Success view** with confetti animation and reference number
- **Fully responsive** — mobile, tablet, desktop

### Admin Dashboard (`/dashboard`)
- **Executive Overview** — 10 KPI cards: Total Feedback, Feedback Today/Week/Month, Average Rating, Positive/Negative %, Net Satisfaction, Returning Guests, Recommendation Rate
- **Intelligence & Insights** — Automated month-over-month analysis, sentiment trends, complaint keyword detection, weekend pattern recognition
- **Alerts System** — Critical (branch below threshold), Warning (service decline / negative spike), Info (low volume)
- **Feedback Management** — Filterable/sortable table with pagination, detail modal, status management (pending / reviewed / flagged)
- **Analytics** — 6+ charts: rating trend line, daily volume area, rating distribution bar, category performance bar, sentiment donut, branch comparison bar
- **Branch Performance** — Leaderboard, best/worst branch cards, health score grid
- **Reports** — Pre-defined templates (Daily, Weekly, Monthly, Quarterly) with CSV/Excel/PDF export, plus live report generator
- **Settings** — Password change for admin account
- **Light/Dark mode** toggle via `ThemeToggle` component

### Architecture
- **Full-stack Next.js App Router** — server actions for data fetching, API routes for external submissions
- **JWT-based authentication** with httpOnly cookies (24h session)
- **TypeScript** throughout — full type safety
- **Prisma ORM** with MySQL (production) / SQLite (development)
- **Server components** for data pages, client components for interactivity

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js | 16.0.7 | Full-stack React framework (App Router) |
| **UI** | React | 19.2.0 | Frontend library |
| **Language** | TypeScript | 5.x | Type safety |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS with glassmorphism |
| **Forms** | react-hook-form | 7.68.0 | Form state management |
| **Validation** | Zod | 4.1.13 | Schema validation |
| **Animations** | Framer Motion | 12.x | Micro-interactions & page transitions |
| **Charts** | Recharts | 3.8.1 | Data visualization |
| **Icons** | Lucide React | 0.556.0 | Icon library |
| **Tables** | @tanstack/react-table | 8.21.3 | Table logic |
| **Excel** | xlsx | 0.18.5 | CSV/Excel report export |
| **Dates** | date-fns | 4.4.0 | Date formatting |
| **CSS utils** | clsx / tailwind-merge | — | Classname merging |
| **ORM** | Prisma | 6.19.3 | Database ORM |
| **Auth** | jose (JWT) + bcryptjs | 6.x / 3.x | JWT sessions & password hashing |
| **Database** | MySQL (prod) / SQLite (dev) | — | Via Prisma |
| **Linting** | ESLint | 9.x | Flat config with Next.js + TypeScript |

---

## Quick Start

### Prerequisites
- Node.js 20+
- npm, yarn, pnpm, or bun

### Installation

```bash
git clone <repository-url>
cd x-group-feedback-2.0

# Install dependencies
npm install

# Set up database (SQLite for local dev)
# Update prisma/schema.prisma provider to "sqlite" and DATABASE_URL in .env to:
#   DATABASE_URL="file:./dev.db"
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the feedback form.

### Admin Login

1. After seeding, navigate to [http://localhost:3000/login](http://localhost:3000/login)
2. Use the credentials defined in your `.env` (default: `admin` / `Xgroup@2026`)

> **Security Warning**: Change the default admin password and `SESSION_SECRET` before deploying to production.

### Branch Selection

```bash
http://localhost:3000?branch=X-01   # Xian Restaurant
http://localhost:3000?branch=X-03   # Xinxian Restaurant
http://localhost:3000?branch=X-05   # Xian Chinese Restaurant
http://localhost:3000?branch=X-07   # Four Seasons
http://localhost:3000?branch=X-09   # Golden Chimney
# See prisma/seed.ts for all 17 branches
```

---

## Project Structure

```
x-group-feedback-2.0/
├── prisma/
│   ├── schema.prisma          # Database schema (User, Branch, Feedback, Review)
│   └── seed.ts                # Seeder: 1 admin, 17 branches, 200 sample feedbacks
├── public/
│   └── logo.webp              # X-Group logo
├── src/
│   ├── app/
│   │   ├── api/feedback/route.ts   # POST endpoint for feedback submissions
│   │   ├── login/page.tsx          # Admin login page
│   │   ├── dashboard/              # Protected admin dashboard
│   │   │   ├── page.tsx            # Executive Overview (KPI cards)
│   │   │   ├── analytics/          # Advanced analytics & charts
│   │   │   ├── branches/           # Branch performance & leaderboard
│   │   │   ├── feedback/           # Feedback table, filters, details
│   │   │   │   └── report/         # Printable report generator
│   │   │   ├── reports/            # Pre-defined report templates
│   │   │   └── settings/           # Change password
│   │   ├── layout.tsx              # Root layout (fonts, theme, mesh background)
│   │   ├── page.tsx                # Public feedback form
│   │   ├── globals.css             # Global styles (glassmorphism, squircle)
│   │   └── proxy.ts                # Next.js 16 route interception (protects /dashboard/*)
│   ├── components/
│   │   ├── FeedbackForm.tsx        # 3-step feedback form
│   │   ├── Input.tsx               # Glassmorphism input/textarea component
│   │   ├── RatingRow.tsx           # Rating button group (Excellent/Good/Average)
│   │   ├── SuccessView.tsx         # Post-submit success with confetti
│   │   ├── ErrorView.tsx           # Error state with retry
│   │   ├── ThemeToggle.tsx         # Light/dark mode toggle
│   │   ├── dashboard/
│   │   │   ├── sidebar.tsx         # Collapsible nav sidebar
│   │   │   ├── topnav.tsx          # Top navigation with user menu
│   │   │   └── kpi-card.tsx        # KPI metric display card
│   │   └── ui/
│   │       ├── FormSection.tsx     # Section wrapper with title
│   │       └── SelectionGrid.tsx   # Radio-button grid (age group, source)
│   ├── features/
│   │   ├── auth/actions.ts         # Server actions: login, logout, changePassword
│   │   └── dashboard/actions.ts    # Server actions: stats, feedback, branches, reports
│   ├── hooks/
│   │   └── useFeedbackForm.ts      # Custom form hook (state, validation, submission)
│   ├── lib/
│   │   ├── api.ts                  # Client-side submitFeedback with retry
│   │   ├── auth.ts                 # createSession, destroySession, getSession, requireAuth
│   │   ├── config.ts               # APP_CONFIG (labels, placeholders, messages)
│   │   ├── constants.ts            # BRANCH_MAP, AGE_GROUPS, SOURCES, RATING_OPTIONS
│   │   ├── prisma.ts               # Singleton Prisma client
│   │   └── utils.ts                # cn() classname utility
│   └── types/
│       └── index.ts                # Enums & interfaces (FeedbackSubmission, etc.)
├── .env                            # Environment variables
├── next.config.ts                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
├── postcss.config.mjs              # PostCSS configuration
└── eslint.config.mjs               # ESLint flat config
```

---

## Database Schema

### Models

**`User`** — Admin accounts
| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | Primary key |
| `username` | String | Unique |
| `passwordHash` | String | bcrypt hash |
| `fullName` | String | Display name |
| `email` | String | Unique |
| `role` | String | Default `"admin"` |
| `lastLoginAt` | DateTime? | Nullable |
| `createdAt` | DateTime | Auto |
| `updatedAt` | DateTime | Auto |

**`Branch`** — Restaurant branches
| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | Primary key |
| `code` | String | Unique (e.g. `"X-01"`) |
| `name` | String | Branch name |
| `address` | String? | Optional |
| `phone` | String? | Optional |
| `email` | String? | Optional |
| `status` | String | Default `"active"` |
| `createdAt` | DateTime | Auto |
| `updatedAt` | DateTime | Auto |

**`Feedback`** — Guest feedback submissions
| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | Primary key |
| `feedbackId` | String | Unique, auto-generated (e.g. `"019392"`) |
| `branchCode` | String | FK → Branch.code |
| `branchName` | String | Denormalized |
| `guestName` | String | Required |
| `guestContact` | String | Email or phone |
| `ageGroup` | String? | `"Below 18"`, `"18-30"`, `"31-45"`, `"46-60"`, `"Above 60"` |
| `source` | String? | `"Social Media"`, `"Word of Mouth"`, etc. |
| `wouldRecommend` | Boolean? | Yes/No |
| `foodRating` | String? | `EXCELLENT` / `GOOD` / `AVERAGE` |
| `serviceRating` | String? | Same |
| `environmentRating` | String? | Same |
| `eventRating` | String? | Same |
| `overallRating` | String? | Same |
| `comments` | String? | Free text |
| `sentimentLabel` | String? | `"positive"` / `"neutral"` / `"negative"` |
| `createdAt` | DateTime | Auto |

**`Review`** — Admin review actions on feedback
| Field | Type | Notes |
|-------|------|-------|
| `id` | String (CUID) | Primary key |
| `feedbackId` | String | Unique FK → Feedback.id (onDelete Cascade) |
| `status` | String | `"pending"`, `"reviewed"`, `"flagged"` |
| `note` | String? | Optional internal note |
| `reviewedAt` | DateTime | Auto |
| `reviewedBy` | String | FK → User.id |

### Default Branches (Seeded)
| Code | Name |
|------|------|
| X-01 | Xian Restaurant |
| X-02 | Xenial Restaurant |
| X-03 | Xinxian Restaurant |
| X-04 | Xotic Restaurant |
| X-05 | Xian Chinese Restaurant |
| X-06 | Xpression Lounge & Restaurant |
| X-07 | Four Seasons |
| X-08 | Golden Palace |
| X-09 | Golden Chimney |
| X-10 | Golden Dragon |
| X-11 | Golden Spoon |
| X-12 | Golden Fork |
| X-13 | Prince’s Lounge & Restaurant |
| X-14 | Zam Zam Convention Center |
| X-15 | Zam Zam Restaurant |
| X-16 | Xian Restaurant (Gulshan) |
| X-21 | Xoom Restaurant |

---

## API Reference

### POST `/api/feedback`

Submit guest feedback. Public endpoint — no authentication required.

**Request Body:**
```typescript
{
  feedbackId: string;
  branchCode: string;
  branchName: string;
  submittedAt: string;          // ISO timestamp
  guest: {
    name: string;               // Required
    contact: string;            // Required (email or phone)
  };
  ratings: {
    FOOD: "EXCELLENT" | "GOOD" | "AVERAGE" | null;
    SERVICE: "EXCELLENT" | "GOOD" | "AVERAGE" | null;
    ENVIRONMENT: "EXCELLENT" | "GOOD" | "AVERAGE" | null;
    EVENT: "EXCELLENT" | "GOOD" | "AVERAGE" | null;
    OVERALL: "EXCELLENT" | "GOOD" | "AVERAGE" | null;
  };
  comments: string | null;
  ageGroup: string | null;
  source: string | null;
}
```

**Response (201):**
```typescript
{
  success: true,
  message: "Feedback submitted successfully",
  feedbackId: string
}
```

**Response (400/500):**
```typescript
{
  success: false,
  error: string
}
```

### POST `/api/auth/login`

Admin login. Returns JWT set as httpOnly cookie.

**Request Body:**
```json
{
  "username": "admin",
  "password": "Xgroup@2026"
}
```

### Server Actions (internal, used by dashboard)

All dashboard data fetching uses Next.js server actions in `src/features/dashboard/actions.ts`:
- `getDashboardStats()` — KPI metrics for executive overview
- `getFeedbackList(params)` — Paginated, filterable feedback list
- `getBranchPerformance()` — Branch comparison data
- `getAnalyticsData()` — Chart data for analytics page
- `getInsights()` — Automated intelligence insights
- `getAlertsData()` — Alert items for alert cards
- `getReportData(type, params)` — Data for report templates
- `updateFeedbackStatus(id, status)` — Review feedback (pending/reviewed/flagged)

---

## Authentication

The system uses **JWT-based authentication** with httpOnly cookies.

| Mechanism | Details |
|-----------|---------|
| **Library** | `jose` (JWT) + `bcryptjs` (password hashing) |
| **Cookie name** | `xgroup_session` |
| **Session duration** | 24 hours |
| **Security** | httpOnly, secure (in production), sameSite: lax |
| **Route Interception** | `src/proxy.ts` — Next.js 16 route interceptor, protects `/dashboard/*`, bypasses `/login`, `/api/auth/login`, `/api/feedback`, `/` |

### Auth Flow
1. Admin submits credentials at `/login`
2. Server validates against bcrypt hash in DB, creates JWT with `username` + `role` claims
3. JWT stored in httpOnly cookie
4. Middleware reads cookie on every `/dashboard/*` request, verifies JWT, redirects to `/login` if invalid/expired
5. Server actions call `requireAuth()` to validate session server-side

---

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `file:./dev.db` (SQLite) / MySQL URL | Database connection string |
| `SESSION_SECRET` | `xgroup-super-secret-key-change-in-production-min-32-chars` | JWT signing secret (min 32 chars) |
| `ADMIN_USERNAME` | `admin` | Default admin username for seeding |
| `ADMIN_PASSWORD` | `Xgroup@2026` | Default admin password for seeding |
| `ADMIN_EMAIL` | `admin@xgroup.com` | Admin email for seeding |
| `ADMIN_FULL_NAME` | `X-Group Administrator` | Admin display name for seeding |

> **⚠️ Security**: Change `SESSION_SECRET`, `ADMIN_PASSWORD`, and `ADMIN_USERNAME` before deploying to production. Do not commit real secrets to version control.

---

## Available Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `npm run dev` | `next dev` | Start development server |
| `npm run build` | `next build` | Production build |
| `npm start` | `next start` | Start production server |
| `npm run lint` | `eslint` | Run ESLint |
| `npm run db:generate` | `prisma generate` | Generate Prisma client |
| `npm run db:migrate` | `prisma migrate dev --name init` | Create/apply migrations |
| `npm run db:push` | `prisma db push` | Push schema to database |
| `npm run db:seed` | `prisma db seed` | Seed database (via tsx) |
| `npm run db:studio` | `prisma studio` | Open Prisma Studio GUI |

> The `postinstall` hook auto-generates the Prisma client after `npm install`.

---

## Branch Configuration

Branch names are defined in `src/lib/constants.ts`:

```typescript
export const BRANCH_MAP: Record<string, string> = {
  "X-01": "Xian Restaurant",
  "X-02": "Xenial Restaurant",
  "X-03": "Xinxian Restaurant",
  // ... add or edit branches here
};
```

To add a new branch, add an entry to `BRANCH_MAP` and insert a corresponding row in the database via `npm run db:studio` or a migration.

---

## Design System

### Color Palette
```css
--brand-primary: hsl(238, 48%, 34%);        /* Deep purple */
--brand-primary-light: hsl(238, 55%, 65%);  /* Light purple */
--brand-glow: hsl(238, 60%, 70%);           /* Glow effect */
--brand-dark: hsl(238, 52%, 25%);           /* Dark purple */
```

### Typography
- **Primary**: Poppins (300–800)
- **Body**: Inter
- **Display**: Outfit
- **Monospace**: JetBrains Mono

### Rating Colors
- **Excellent**: Dark purple (`--brand-dark`)
- **Good**: Light purple (`--brand-primary-light`)
- **Average**: Slate gray

---

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
npm i -g vercel
vercel deploy
```

### Production Database
1. Set `DATABASE_URL` to your MySQL connection string in `.env`
2. Update `prisma/schema.prisma` provider to `"mysql"`:
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```
3. Run `npm run db:migrate` to apply schema
4. Run `npm run db:seed` to populate initial data

### Production Optimizations (built-in)
- Console statements removed (keeps errors/warnings)
- Image formats: WebP + AVIF
- Package import optimization (lucide-react, framer-motion, zod, react-hook-form)
- `X-Powered-By` header disabled
- Compression enabled
- Source maps disabled

---

## License

Private — X-Group Hospitality Systems © 2025

---

## Contributing

This is a private project for X-Group Hospitality. For internal contributions, please contact the development team.

---

## Support

For technical support or questions, contact the X-Group IT department.

---

**Built with ❤️ for X-Group Hospitality**
