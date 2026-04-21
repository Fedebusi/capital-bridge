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
- **Migrations**:
  - `00001_initial_schema.sql` — all tables, RLS, storage buckets
  - `00002_seed_data.sql` — sample deals, borrowers, contacts, KYC, drawdowns etc.
  - `00003_fix_auth_trigger.sql` — fixed `handle_new_user` with safe defaults + error handling
  - `00004_fix_audit_logs_policy.sql` — RLS fix for audit log inserts
  - `00005_first_user_admin.sql` — first signup becomes admin
  - `00006_lifecycle_tables.sql` — 4 lifecycle tables (`deal_lifecycles`, `lifecycle_phases`, `phase_substeps`, `phase_milestones`) + RLS + `phase_status` enum
- **Auto-deploy**: `.github/workflows/supabase-deploy.yml` runs `supabase db push --include-all` on every push to `main` touching `supabase/migrations/**`. Requires two repo secrets: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`. See issue #31.
- **Auth trigger**: fixed in migration 00003 — everyone starts as `viewer`, admin promotes.

## Current Status (Last Updated: 2026-04-21)

### Latest session (2026-04-21) — PR #49
- 3 parallel audits (finance, design, file org) completed
- **Finance fixes (critical)**: NAV calculation (was 7× overstated), weighted avgLTV/LTC/Rate, totalReturns now includes repaid, totalCommitments excludes pre-closing
- **Design fixes**: landing responsive + headline breakpoints, hero circles constrained (no overlap), button shadows softened
- **File org**: `src/components/shared/`, `src/lib/pdf/`, dead test removed
- **Agent system**: `finance-auditor` agent added

### Pending finance items (not in PR #49)
- PIK engine: day-count convention (1/12 vs ACT/360) — needs deal-level config
- PIK engine: cash-interest capitalization mode (today always capitalized, should be configurable)
- PIK engine: interest accrued on non-disbursed tranches (should be disbursed-only)
- Screening LTV uses GDV instead of current appraisal
- Covenant statuses hardcoded (should auto-recompute from current values)
- InvestorPortal hardcoded `portfolioHistory`, `allocationData`, `upcomingPayments`, tile magic numbers (committed/realized/distributions = × arbitrary)



### P0 — DONE (in-session PRs)

- [x] **P0.1** Edit/Delete UI for deals + borrowers (pre-existing, commit `17474c8`)
- [x] **P0.2** Stage change button on deal detail (pre-existing)
- [x] **P0.3** Sub-data wired to Supabase with dual-mode fallback — PR #26 (DD, approvals, IC votes, term sheets, waivers, construction, legal) + PR #29 (lifecycle tables + wiring)
- [x] **P0.4** Searchbar (pre-existing)
- [x] **P0.5** File upload UI for DD documents and site-visit photos — PR #27
- [x] **Infra** Lint fix 7 pre-existing errors — PR #28
- [x] **Infra** Auto-apply migrations workflow — PR #30
- [x] Tests: 64 passing (22 original + 16 converter + 13 file upload + 13 lifecycle converter)

### Blocked on Federico (tracked in issue #31)

- [ ] Add `SUPABASE_ACCESS_TOKEN` + `SUPABASE_DB_PASSWORD` secrets to GitHub repo
- [ ] Trigger `Supabase Deploy Migrations` workflow to apply `00006` (lifecycle tables) on prod DB
- [ ] Manual QA end-to-end in live mode: file upload on DD item + site visit, RLS checks, lifecycle page rendering real data

### P1 — In progress (3 background agents launched 2026-04-17)

- [ ] Empty states + CTA across all list pages (`ux-polisher`)
- [ ] Lifecycle seed migration `00007_lifecycle_seed.sql` (1 lifecycle per deal, 12 phase stubs)
- [ ] User guides for the 4 roles (`doc-writer` → `docs/guides/*.md`)

### P1 — Remaining

- [ ] User management UI (invite users, change role) — requires auth review
- [ ] Transactional email (covenant breach, stage change, waiver decisions) — requires Resend/SendGrid config
- [ ] Mobile optimization pass

### P2 — Pending

- [ ] Chatbot AI for data queries
- [ ] Business Central integration
- [ ] Dark mode
- [ ] Custom domain
- [ ] Automatic Supabase backup

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase client (with demo mode fallback) |
| `src/lib/dbConverters.ts` | DB row → frontend type converters (pure, unit-tested) |
| `src/types/database.ts` | Full TypeScript types for all DB tables |
| `src/contexts/AuthContext.tsx` | Auth state, login/signup, role checking |
| `src/hooks/useDeals.tsx` | Deals context (demo data + live Supabase) |
| `src/hooks/useSupabaseQuery.ts` | All React Query hooks for Supabase |
| `src/hooks/useDealSubdata.ts` | Dual-mode wrappers (live → Supabase, demo → sample data) |
| `src/hooks/useRealtimeNotifications.ts` | Real-time toast notifications |
| `src/components/auth/ProtectedRoute.tsx` | Route-level auth guard |
| `src/components/deals/DealFormDialog.tsx` | Create/edit deal form |
| `src/components/borrowers/BorrowerFormDialog.tsx` | Create/edit borrower form |
| `src/components/ui/FileUploadButton.tsx` | Reusable upload button wrapping `useUploadDocument` |
| `src/components/ErrorBoundary.tsx` | Global error boundary |
| `.github/workflows/ci.yml` | CI: lint + typecheck + test + build |
| `.github/workflows/supabase-deploy.yml` | Auto-apply migrations on merge to `main` |
| `supabase/migrations/*.sql` | DB schema + RLS (00001..00006) |

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
