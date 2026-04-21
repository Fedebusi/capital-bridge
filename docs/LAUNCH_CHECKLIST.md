# CapitalBridge — Launch Checklist

> Last updated: 2026-04-21. Follow top-to-bottom. Each section has a clear
> acceptance criterion so there is no ambiguity about "done".

---

## 1. Supabase — go live

**Owner:** Federico — only actions.

- [ ] In GitHub repo settings → *Secrets and variables → Actions*, add:
  - `SUPABASE_ACCESS_TOKEN` (personal access token from https://app.supabase.com/account/tokens)
  - `SUPABASE_DB_PASSWORD` (the DB password you set when provisioning the project)
- [ ] Trigger the *Supabase Deploy Migrations* workflow:
  - Actions → `Supabase Deploy Migrations` → *Run workflow* on `main`
- [ ] Confirm migrations `00001` → `00008` are applied (Supabase dashboard → Database → Migrations)
- [ ] In Supabase dashboard → Authentication → Providers, ensure Email is enabled
- [ ] (Optional but recommended) Enable email confirmations in Auth settings

**Acceptance:** you can sign up with a fresh email on the live site and a
profile row appears in the `profiles` table with `role = 'viewer'`.

---

## 2. Environment variables

**Set in Vercel → Project → Settings → Environment Variables (Production + Preview).**

| Variable | Required | Notes |
|----------|----------|-------|
| `VITE_SUPABASE_URL` | ✅ | `https://slexqygrfyvfqikopmwm.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ✅ | From Supabase → Project Settings → API → anon public key |
| `VITE_SENTRY_DSN` | optional | Error monitoring DSN. Leave empty to disable. |

**Acceptance:** `vercel env ls` lists all three (two required, one optional)
and the most recent deployment picks them up.

---

## 3. Sanity-check the live environment

Log in with your admin account first — you'll be seeded as `admin` via
migration `00005_first_user_admin.sql`.

- [ ] `/dashboard` — counts show real numbers (not demo data)
- [ ] `/pipeline` — kanban renders, can create a deal
- [ ] `/deals/:id` — all 7 panels (DD, approvals, term sheet, PIK, construction, waterfall, legal) load
- [ ] `/investor` — tiles show real committed/deployed/returns; quarter accrual > 0 if any deal is active
- [ ] `/admin/users` — your profile appears as admin; invite dialog produces the correct signup URL
- [ ] `/privacy` and `/terms` render with correct links
- [ ] Cookie banner appears on first visit, disappears after choice, and analytics only loads when accepted

---

## 4. User onboarding — first 48h

- [ ] From `/admin/users`, share the signup link with each team member
- [ ] Once they sign up (default `viewer`), promote them to the correct role
- [ ] Verify at least one `portfolio_manager` and one `analyst` exist
- [ ] Remove any test accounts you created during verification

**Acceptance:** only real team members have access; no unassigned viewers remain.

---

## 5. Data bootstrap — first deal live

- [ ] Decide: seed demo deals in production (migration 00002) or start clean?
  - If clean: connect to Supabase SQL editor and run `DELETE FROM deals;` after back-up
- [ ] Create the first real borrower from `/borrowers` → *New Borrower*
- [ ] Create the first real deal from `/pipeline` → *New Deal* with all 21 fields
- [ ] Upload the signed term sheet PDF on the deal detail page
- [ ] Add covenants on the covenants tab — statuses auto-recompute from thresholds
- [ ] Log the first drawdown — only `status = "disbursed"` drawdowns accrue PIK

---

## 6. Legal compliance (Spain / EU)

- [ ] Replace `privacy@capitalbridge.com` and `legal@capitalbridge.com` in
      `src/pages/PrivacyPage.tsx` and `src/pages/TermsPage.tsx` with real
      addresses you monitor
- [ ] Add the fund's registered company name, address, and tax ID to both
      legal pages (section 1)
- [ ] Register the platform with the Spanish AEPD if processing investor
      personal data above the statutory threshold
- [ ] Confirm your AML / KYC record-retention policy matches 10-year requirement
      mentioned in Privacy §4
- [ ] If you enable transactional email, sign the DPA with Resend (or
      equivalent provider)

---

## 7. Observability

- [ ] Sentry project created, DSN added to Vercel env vars — a test error
      should appear in the Sentry dashboard within 60s
- [ ] Vercel Analytics automatically tracks page views once users opt-in via
      the cookie banner
- [ ] (Recommended) Set up Supabase log drains and a basic alert for
      authentication failures above N / 5-min

---

## 8. Smoke-test script (run before every production deploy)

From the root of the repo:

```bash
npm install
npm run lint      # must be 0 errors
npm test          # must be 124+ passing
npm run build     # must succeed
```

Then on the deployed URL:

1. Sign up a throwaway email → verify profile appears
2. Promote to admin from `/admin/users` using your main account
3. Create a deal → refresh → still there
4. Upload a document on DD tab → file appears in Supabase Storage
5. Advance a deal's stage → audit log entry is created
6. Log out → cookie banner persists choice

---

## 9. Rollback plan

If a deploy breaks production:

- Vercel → Deployments → find the last known-good deployment → *Promote to Production*
- Supabase migrations are sticky (applied once, not rolled back automatically). If
  a migration broke the DB, restore from the previous daily backup (Supabase
  Pro tier — confirm this is enabled before launch)

---

## 10. Post-launch — first 30 days

- [ ] Monitor Sentry daily for new errors
- [ ] Review audit logs weekly for unusual activity
- [ ] Capture NAV / AUM snapshots monthly (future work: automated)
- [ ] Collect user feedback from the first admin + analyst + investor using
      the platform live

---

## Support contacts

- **Platform owner:** Federico Busi
- **Privacy inquiries:** privacy@capitalbridge.com (replace before launch)
- **Legal inquiries:** legal@capitalbridge.com (replace before launch)
- **Supabase status:** https://status.supabase.com
- **Vercel status:** https://www.vercel-status.com
