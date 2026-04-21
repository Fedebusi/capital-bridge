# CapitalBridge

Institutional debt fund portfolio management platform. Built for real estate lending operations — deal origination, lifecycle tracking, construction monitoring, PIK accrual, and investor reporting.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Data**: Supabase (PostgreSQL + Auth + Storage + Realtime), React Query
- **Charts**: Recharts; **Maps**: Leaflet; **PDF**: jsPDF
- **Testing**: Vitest + React Testing Library (99 tests)
- **Hosting**: Vercel (frontend) + Supabase (backend)
- **CI/CD**: GitHub Actions (lint + typecheck + test + build on every PR)

## Getting Started

```bash
npm install       # install dependencies
npm run dev       # start dev server at http://localhost:8080
npm run lint      # ESLint
npm test          # Vitest
npm run build     # production build
```

## Dual mode: Demo / Live

The app auto-detects if Supabase is configured (`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in env) and switches accordingly:
- **Demo mode**: no Supabase, uses sample data from `src/data/`
- **Live mode**: full Supabase integration — auth, RLS, realtime, storage

On Vercel the env vars come from the Supabase integration (`NEXT_PUBLIC_*` / `SUPABASE_*`). `vite.config.ts` bridges these into the `VITE_*` prefix that the client expects.

## Repository layout

```
src/
  components/
    ui/            → shadcn primitives
    shared/        → ErrorBoundary, LoadingSkeleton, NavLink
    layout/        → AppLayout (sidebar), InvestorLayout (header-only)
    deals/         → DealCard, DealDetail, panels (DD, Approvals, PIK, …)
    borrowers/     → BorrowerFormDialog
    dashboard/     → QuickScreenDialog, PortfolioMap, DealImportDialog
    pipeline/      → PipelineJourneyRail, PipelineDealDot
    screening/     → ScreeningTool
    auth/          → ProtectedRoute
  pages/           → one file per route (19 pages)
  hooks/           → useDeals, useSupabaseQuery, useDealSubdata, useAuth
  lib/
    pdf/           → generateDDReport, generateTermSheetPDF, generateTaxReport
    exports/       → dealTemplate, exportToCsv, exportToExcel, rowBuilders
    supabase.ts, utils.ts, dbConverters.ts
  data/            → sample data (used as demo + type source)
  types/           → TypeScript types (database.ts)
  contexts/        → AuthContext
  test/            → Vitest tests
supabase/migrations → 9 SQL migrations (schema, RLS, auth, lifecycle, seed)
docs/              → guides, design audits, changelogs
.claude/agents/    → sub-agent definitions (feature-builder, reviewer, finance-auditor, …)
.github/workflows/ → CI (lint+test+build), supabase-deploy (migrations)
```

Key config: `AGENTS.md` (agent briefing), `CLAUDE.md` (session context), `plan.md` (roadmap).

## User roles

- **Originator** — new deals, term sheets, pipeline
- **Finance** — numbers, covenants, reporting, loan status
- **Architecture/Monitoring** — construction photos, milestones, surveyor notes
- **Admin (fund manager)** — full access, approves, exports reporting

## Contributing

Read `AGENTS.md` before contributing. All changes go through PR → CI → squash merge. Never push directly to `main`.

See `plan.md` for the current roadmap and priority queue.

## License

Proprietary — All rights reserved.
