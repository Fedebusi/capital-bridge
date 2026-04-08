# CapitalBridge - Project Context

> **IMPORTANT**: Read this file at the start of every session. It contains decisions,
> architecture choices, and current status that persist across conversations.

## Project Overview

**CapitalBridge** is an institutional debt fund portfolio management platform for real
estate lending operations. Built for deal originators, portfolio managers, and investors.

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **State**: React Query (Supabase) + React Context (local/demo mode)
- **Hosting**: Vercel (frontend) + Supabase (backend)

## Architecture Decisions

### Dual Mode: Demo / Live
The app runs in **demo mode** (mock data, no login required) when `VITE_SUPABASE_URL`
is not set. When Supabase credentials are configured in `.env`, it switches to **live
mode** with real database, auth, and real-time notifications. This is controlled by
`isSupabaseConfigured()` in `src/lib/supabase.ts`.

### Database Schema
Full schema in `supabase/migrations/00001_initial_schema.sql`. Key tables:
- `profiles` (extends auth.users with role)
- `deals` + sub-tables: `drawdowns`, `covenants`, `unit_sales`, `screening_criteria`
- `borrowers` + sub-tables: `borrower_contacts`, `corporate_entities`, `kyc_records`, `completed_projects`
- `due_diligence_items`, `dd_documents`
- `approval_records`, `ic_votes`
- `legal_documents`, `conditions_precedent`, `security_items`
- `term_sheets`, `term_sheet_versions`, `waivers`
- `site_visits`, `site_visit_photos`, `construction_certifications`, `monitoring_reports`
- `audit_logs`

### Row Level Security (RLS)
- All tables have RLS enabled
- Roles: `admin`, `analyst`, `portfolio_manager`, `investor`, `viewer`
- Read: all authenticated users
- Write: admin, analyst, portfolio_manager
- Delete: admin only
- `get_user_role()` function used across all policies

### Authentication
- Supabase Auth with email/password
- Profile auto-created on signup via DB trigger (`handle_new_user`)
- New users get `viewer` role by default — admin promotes them
- `AuthContext` wraps the entire app
- `ProtectedRoute` component for route-level access control

### Storage Buckets
- `documents` — DD reports, legal docs, term sheets
- `site-photos` — Construction monitoring photos

## Supabase Setup

- **GitHub Integration**: Connected to `Fedebusi/capital-bridge`
- **Production branch**: `main` (auto-deploy migrations on push)
- **Working directory**: `.` (migrations at `supabase/migrations/`)
- **Plan**: Free tier (branching requires Pro)

### Required Environment Variables
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Supabase Instance

- **URL**: `https://slexqygrfyvfqikopmwm.supabase.co`
- **Ref ID**: `slexqygrfyvfqikopmwm`
- **Anon key**: configured in `.env` (not committed)
- **Migrations** (auto-deploy on merge to `main`):
  - `00001_initial_schema.sql` — all tables, RLS, storage buckets (already executed)
  - `00002_seed_data.sql` — sample deals, borrowers, contacts, KYC, drawdowns etc.
  - `00003_fix_auth_trigger.sql` — fixed `handle_new_user` with safe defaults + error handling
- **Auth trigger**: fixed in migration 00003 — everyone starts as `viewer`, admin promotes.

## Current Status (Last Updated: 2026-04-08)

### Completed
- [x] Full frontend UI (19 pages, 67+ components)
- [x] Supabase client setup with demo/live dual mode (`src/lib/supabase.ts`)
- [x] `.env` file configured with Supabase URL + anon key
- [x] `.env` added to `.gitignore`
- [x] Complete database schema with RLS and audit triggers (migration run on Supabase)
- [x] Authentication system code (login page, AuthContext, ProtectedRoute)
- [x] React Query API hooks for all entities (`src/hooks/useSupabaseQuery.ts`)
- [x] CRUD forms for deals and borrowers (dialog-based)
- [x] Real-time notifications (covenant breaches, stage changes, approvals)
- [x] Error boundary component
- [x] Audit trail logging (automatic on create/update via mutations)
- [x] Document/photo storage hooks
- [x] Tests: 22 passing (PIK engine + deal screening logic)
- [x] Seed data SQL prepared (`supabase/seed.sql`)
- [x] "New Deal" button added to Pipeline page

### In Progress
- [ ] Merge branch to `main` — this auto-deploys migrations 00002 (seed) + 00003 (auth fix)
- [ ] After merge: test user creation in Supabase Authentication
- [ ] Re-enable login redirect in `ProtectedRoute.tsx` once auth works
- [ ] Wire up all pages to use Supabase data when available
- [ ] Add "New Deal" / "New Borrower" / "Edit" / stage change buttons across pages

### Blocked / Deferred
- [ ] Login redirect commented out in `ProtectedRoute.tsx` (search for TODO)
      Re-enable once auth trigger is confirmed working after migration 00003.
- [ ] User profile menu in sidebar (depends on auth)
- [ ] Role-based access enforcement (depends on auth)

### Pending
- [ ] Design polish pass (after backend is fully wired)
- [ ] CI/CD pipeline (GitHub Actions for lint + test + build)
- [ ] Mobile optimizations for forms
- [ ] Branding customization ("APEX CAPITAL" still hardcoded in PDFs)

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase client (with demo mode fallback) |
| `src/types/database.ts` | Full TypeScript types for all DB tables |
| `src/contexts/AuthContext.tsx` | Auth state, login/signup, role checking |
| `src/hooks/useDeals.tsx` | Deals context (demo data + live Supabase) |
| `src/hooks/useSupabaseQuery.ts` | All React Query hooks for Supabase |
| `src/hooks/useRealtimeNotifications.ts` | Real-time toast notifications |
| `src/components/auth/ProtectedRoute.tsx` | Route-level auth guard |
| `src/components/deals/DealFormDialog.tsx` | Create/edit deal form |
| `src/components/borrowers/BorrowerFormDialog.tsx` | Create/edit borrower form |
| `src/components/ErrorBoundary.tsx` | Global error boundary |
| `supabase/migrations/00001_initial_schema.sql` | Complete DB schema |
| `supabase/seed.sql` | Sample data (6 deals, 5 borrowers + sub-entities) |

## Business Logic Notes

- **PIK Engine**: Interest calculated monthly on (principal + accrued PIK). Full PIK
  structure — both cash interest and PIK spread are capitalized. Logic in `src/data/pikEngine.ts`.
- **Screening**: Deals scored against criteria (LTV ≤65%, LTC ≤75%, pre-sales ≥30%,
  developer ≥5 projects). Logic in `src/pages/ScreeningPage.tsx`.
- **Waterfall**: Mandatory prepayment from unit sales. Release prices set at ~40% of
  list price. 50% cash sweep on excess. Logic in `src/data/waterfallData.ts`.
- **Construction Monitoring**: 5% retention on certifications, released after final
  completion and defect-free inspection.
- **Term Sheets**: Require Capital Partner (CastleLake) validation before issuance.
  Waivers need both internal + CP approval.

## Conventions
- All financial amounts stored as NUMERIC(15,2) in DB
- Dates as ISO strings (YYYY-MM-DD)
- IDs are UUIDs (Supabase default)
- Spanish market focus (deals in Spain, EUR currency)
- UI language: English
- Documentation: Mix of English and Spanish
