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

## Current Status (Last Updated: 2026-04-08)

### Completed
- [x] Full frontend UI (19 pages, 67+ components)
- [x] Supabase client setup with demo/live dual mode
- [x] Complete database schema with RLS and audit triggers
- [x] Authentication system (login, signup, roles, protected routes)
- [x] React Query API hooks for all entities (`useSupabaseQuery.ts`)
- [x] CRUD forms for deals and borrowers (dialog-based)
- [x] Real-time notifications (covenant breaches, stage changes, approvals)
- [x] Error boundary component
- [x] Audit trail logging (automatic on create/update via mutations)
- [x] Document/photo storage hooks

### In Progress
- [ ] Integrate "New Deal" button into more pages (loan book, dashboard)
- [ ] Wire up borrower form to BorrowersPage
- [ ] Add user profile menu to sidebar (with logout, role display)
- [ ] Run migration on Supabase (user needs to do this in SQL Editor)
- [ ] Seed initial data into Supabase

### Pending
- [ ] Tests for financial logic (PIK calculations, screening, waterfall)
- [ ] Design polish pass (after backend is fully wired)
- [ ] CI/CD pipeline (GitHub Actions for lint + test + build)
- [ ] Seed data migration for initial deals/borrowers
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
