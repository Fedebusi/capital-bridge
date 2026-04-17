# CapitalBridge — Agent Briefing

> This file is read by Claude Code at the start of every session.
> It defines who we are, what the product does, and how agents should behave.

## Product

CapitalBridge is a collaborative workflow and reporting platform for a real estate debt fund (Clikalia + Castlelake) financing residential developments in Spain. It is NOT a banking app — no money moves through it. It manages deals, borrowers, documents, approvals, and reporting.

## User Roles

| Role | What they do |
|------|-------------|
| **Originator** | Loads new deals, fills term sheets, tracks pipeline |
| **Finance team** | Views numbers, covenants, reporting, loan status |
| **Architecture / Monitoring** | Uploads construction photos, milestones, surveyor notes |
| **Admin (fund manager)** | Sees everything, approves, exports reporting for Castlelake |

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Realtime)
- **State:** React Query (Supabase) + React Context (demo mode)
- **Hosting:** Vercel (frontend) + Supabase (backend)
- **Testing:** Vitest + React Testing Library
- **CI/CD:** GitHub Actions (lint + typecheck + test + build on every PR)

## Code Conventions

- **Commits:** conventional commits (`feat:`, `fix:`, `polish:`, `chore:`, `docs:`)
- **Branches:** `feat/*`, `fix/*`, `polish/*`, `chore/*`, `docs/*` — never push to `main` directly
- **Components:** functional React components, hooks for data, Tailwind for styling
- **Types:** all DB types in `src/types/database.ts`, frontend types in respective data files
- **Tests:** in `src/test/`, one test file per module, use Vitest

## Design System

- **Accent color:** indigo/violet (`hsl(245 75% 65%)`)
- **Cards:** `rounded-2xl bg-slate-50 p-6` (borderless, soft background)
- **Buttons:** `rounded-full` primary, `rounded-full bg-slate-50` secondary
- **Typography:** `text-4xl font-bold tracking-tight` for h1, `text-base` for subtitles
- **Spacing:** `space-y-8` between sections, `gap-5` between cards

## DO NOT TOUCH without human approval

These files/areas require explicit approval from Federico before any modification:

1. `src/contexts/AuthContext.tsx` — auth logic
2. `src/components/auth/ProtectedRoute.tsx` — route protection
3. `supabase/migrations/*` — database schema changes
4. `src/hooks/useSupabaseQuery.ts` — RLS-sensitive queries (read is OK, new mutations need review)
5. File upload code in `useUploadDocument()` — GDPR sensitive
6. `.github/workflows/*` — CI/CD pipeline
7. `package.json` — new dependencies

## Sub-Agents

| Agent | Role | Branch |
|-------|------|--------|
| `feature-builder` | Implements P0/P1 features end-to-end | `feat/*` |
| `bug-fixer` | Fixes bugs with regression tests | `fix/*` |
| `ux-polisher` | Visual fixes, empty states, responsive | `polish/*` |
| `ux-designer` | Emotional/narrative design — flows, microcopy, feedback | `design/ux-*` |
| `ui-designer` | Pragmatic/visual design — layout, spacing, hierarchy, tokens | `design/ui-*` |
| `reviewer` | Reviews PRs, produces structured comments | (no branch) |
| `doc-writer` | Maintains docs and user guides | `docs/*` |

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase client (demo/live switch) |
| `src/hooks/useDeals.tsx` | Deals context (demo/live) |
| `src/hooks/useSupabaseQuery.ts` | 36 React Query hooks |
| `src/types/database.ts` | TypeScript types for all tables |
| `src/data/sampleDeals.ts` | Demo data (6 deals) |
| `src/data/borrowers.ts` | Demo data (5 borrowers) |
| `plan.md` | Implementation plan and roadmap |
