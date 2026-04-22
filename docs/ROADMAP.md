# CapitalBridge — Roadmap

> **Rule:** items only enter this file when there's intent to ship them in the
> named window. Vague "someday maybe" ideas do **not** belong here. When an
> item ships, move it to `docs/CHANGELOG.md` and delete the row from this file.

## Now — must ship before first live user

Items without which the platform cannot be given to a real admin/investor.

- [ ] **Federico:** add Supabase GitHub secrets (`SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`) and trigger migrations workflow — tracked in issue #31
- [ ] **Federico:** set Vercel env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- [ ] **Federico:** replace legal-page placeholders (`privacy@capitalbridge.com`, `legal@capitalbridge.com`, registered company name/address/tax ID) in `src/pages/PrivacyPage.tsx` and `src/pages/TermsPage.tsx`
- [ ] **Federico:** run `docs/LAUNCH_CHECKLIST.md` §3 smoke tests in live mode after migrations apply

## Next — first weeks after launch

Items that make the platform *professional* rather than *usable*. Address by
priority; items at the top block the most credibility.

- [ ] Cookie consent bug: `useAnalyticsConsent` only reacts to cross-tab `storage` events, so Vercel Analytics does not enable until reload (fix with custom event or context update). File: `src/App.tsx`
- [ ] Covenant status stale in DB: recompute is display-only. Add trigger on `covenants` table or recompute-on-write. Emails/reports that read DB status are currently wrong.
- [ ] Cookie settings revocation: banner stores "rejected" with no way to reopen. Add footer link "Cookie settings" that resets consent.
- [ ] Real XIRR on investor portal tile (currently "Weighted Yield" via position-weighted rate). Needs `cashflows` view aggregating drawdowns + repayments.
- [ ] Transactional email via Resend — covenant breach alerts, stage-change notifications, password reset. Requires Resend API key + DPA.
- [ ] Invite via email API — today the admin UI copies a signup link manually. Use `supabase.auth.admin.inviteUserByEmail()` via Edge function.

## Later — backlog, quarterly review

Legitimate ideas we don't commit to. Re-evaluate quarterly; prune aggressively.

- [ ] NAV snapshot table + monthly capture → real historical portfolio history (currently derived from PIK projections)
- [ ] Tranche-type field on deals → restore "Senior / Mezzanine / Bridge / Equity" allocation chart
- [ ] Delete auth.users via Edge function (today only `profiles` row is removed)
- [ ] Playwright e2e on main flows (signup → create deal → upload doc → advance stage)
- [ ] Mobile-pass LoanBook table with responsive column hiding (currently overflow-x scroll)
- [ ] Bundle size: code-split by route (currently 3.3 MB / 992 KB gzip)
- [ ] Per-covenant `warning_margin_pct` (today fixed at 5% for all)
- [ ] ACT/* day-count correctness for partial first period (today uses full calendar months)
- [ ] Accessibility audit (keyboard nav in dialogs, aria-labels on icon-only buttons)
- [ ] Chatbot AI for portfolio queries
- [ ] Business Central integration
- [ ] Dark mode
- [ ] Custom domain
- [ ] Automatic Supabase backup (requires Pro tier)
