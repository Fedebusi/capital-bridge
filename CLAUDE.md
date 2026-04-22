# CapitalBridge — Project State

> Read this at the start of every session. Keep it current and compact.
> **Session discipline:** before closing a session, prune "What's in flight"
> of anything that shipped. Historical sessions belong in `docs/CHANGELOG.md`,
> the backlog belongs in `docs/ROADMAP.md`, agent rules in `AGENTS.md`.
>
> If this file exceeds ~80 lines, something is out of place — split it back.

## What it is

Portfolio-management platform for a real-estate debt fund operating in Spain
(Clikalia / Castlelake capital partner). Manages deals, borrowers, documents,
approvals, and reporting. **No money moves through it.**

## Stack

React 18 + TypeScript + Vite + Tailwind + shadcn/ui on Vercel; Supabase
(Postgres + Auth + Storage + Realtime) as backend; React Query for server
state; Vitest for tests. Dual-mode: demo (no Supabase) ↔ live (Supabase
configured via `isSupabaseConfigured()` in `src/lib/supabase.ts`).

## Supabase instance

- **Project ref:** `slexqygrfyvfqikopmwm`
- **URL:** `https://slexqygrfyvfqikopmwm.supabase.co`
- **Migrations applied locally:** `00001` → `00008` (schema, seed, auth triggers, audit log policy, first-user-admin, lifecycle tables, lifecycle seed, profile self-heal)
- **Auto-deploy:** `.github/workflows/supabase-deploy.yml` — pushes to `main` touching `supabase/migrations/**` auto-apply. Needs repo secrets `SUPABASE_ACCESS_TOKEN` + `SUPABASE_DB_PASSWORD` (still missing in prod — issue #31).

## Durable decisions

Things a future session might undo by accident. Don't.

- **Roles:** `admin`, `portfolio_manager`, `analyst`, `investor`, `viewer`. New signups default to `viewer`. The first live signup auto-promotes to `admin` (migration `00005`).
- **RLS:** all tables. Read = authenticated. Write = admin/analyst/PM. Delete = admin. `get_user_role()` is the canonical helper.
- **PIK engine:** defaults to `dayCount: "30/360"` and `cashInterestMode: "capitalized"`. Interest accrues **only on `status === "disbursed"`** drawdowns.
- **Covenant status:** auto-recomputed at display time by `src/lib/covenants.ts`. DB column is still the source until we add a trigger (see Roadmap).
- **Amounts:** `NUMERIC(15,2)`, EUR, dates ISO, IDs UUID. UI in English, docs mix English/Spanish.
- **Demo mode** must keep working without Supabase — every new Supabase hook needs a demo-mode fallback.

## Do not touch without approval

`src/contexts/AuthContext.tsx`, `src/components/auth/ProtectedRoute.tsx`,
`supabase/migrations/*`, `.github/workflows/*`, `package.json` deps,
`src/hooks/useSupabaseQuery.ts` mutations.

## What's in flight

Branch `claude/review-daily-progress-TT9Sw` has 3 unmerged launch-prep
commits. Not yet opened as a PR. Everything on this branch is committed,
pushed, tests + build green.

## What's next

See `docs/ROADMAP.md` — gated by **Now** (launch blockers), **Next** (first
weeks), **Later** (quarterly review). Do not add work items to this file.

## Key code entrypoints

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase client + demo-mode switch |
| `src/lib/covenants.ts` | Covenant threshold parsing + auto-recompute |
| `src/lib/investorMetrics.ts` | Derived metrics for InvestorPortal |
| `src/data/pikEngine.ts` | PIK accrual schedule generator |
| `src/hooks/useSupabaseQuery.ts` | All React Query hooks (36+) |
| `src/hooks/useDeals.tsx` | Deals context (demo/live) |
| `src/types/database.ts` | TypeScript types for all tables |
| `docs/LAUNCH_CHECKLIST.md` | Federico's deploy + QA playbook |
