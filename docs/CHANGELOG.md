# CapitalBridge — Changelog

> Append-only log of sessions. Do **not** read at the start of a new session —
> it's history, not current state. Current state lives in `CLAUDE.md`.
> Roadmap lives in `docs/ROADMAP.md`.

## 2026-04-21 — Launch-prep batch 2 (commit `2345322`)

- User management admin page at `/admin/users` (list, change role, delete profile, copy invite link)
- Legal pages `/privacy` + `/terms` (GDPR-aligned, Spanish law)
- Cookie banner gating Vercel Analytics behind explicit consent
- Nav sidebar gets "Administration" group (admin only)
- PIKEnginePage empty state
- LandingPage canvas made responsive
- `docs/LAUNCH_CHECKLIST.md` — Federico-facing deploy & QA playbook

## 2026-04-21 — Launch-prep batch 1 (commit `a12458d`)

- PIK engine: `dayCount` option (30/360 | ACT/360 | ACT/365), `cashInterestMode` (capitalized | paid), interest only on `status === "disbursed"` drawdowns
- `src/lib/covenants.ts` — covenant auto-recompute (parses threshold + current-value, 5% warning band), wired into DealDetail + DealCard
- Screening tool gets optional "Current Appraisal" input → second LTV criterion
- `src/lib/investorMetrics.ts` — derived portfolioHistory, allocationData, upcomingPayments, summary tiles (no more magic × 0.35 / × 1.2 / × 0.7)
- Tests: 80 → 124 (+44)

## 2026-04-21 — PR #49: finance audit + design + file org

- Finance: NAV calculation (was 7× overstated), weighted avgLTV/LTC/Rate, totalReturns now includes repaid, totalCommitments excludes pre-closing
- Design: landing responsive + headline breakpoints, hero circles constrained, button shadows softened
- File org: `src/components/shared/`, `src/lib/pdf/`, dead test removed
- New agent: `finance-auditor`

## 2026-04-17..20 — P0 sub-data wiring

- PR #26: DD, approvals, IC votes, term sheets, waivers, construction, legal wired to Supabase
- PR #27: File upload UI for DD documents and site-visit photos
- PR #28: Lint fix (7 pre-existing errors)
- PR #29: Lifecycle tables (migration 00006) + wiring
- PR #30: Auto-apply migrations workflow
- Tests: 22 → 64

## Earlier — pre-launch-prep baseline

- Edit/Delete UI for deals + borrowers (commit `17474c8`)
- Stage change button on deal detail
- Searchbar
- Dual-mode demo/live architecture via `isSupabaseConfigured()`
- Auth trigger fixes (migrations 00003, 00004, 00005, 00008)
- First user becomes admin (migration 00005)
