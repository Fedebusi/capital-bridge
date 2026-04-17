# Architecture / Monitoring Guide

## Who this is for

Architects, quantity surveyors, and construction monitors who visit sites, record
progress, upload photos, and certify that works are complete before each drawdown.

## What you see

Your sidebar sections:

- **Construction** — site visits, certifications, monitoring reports, retention
- **Lifecycle** — the 12-phase view; construction phases are where your inputs
  matter most
- **Loan Book** — to see the **Construction** progress bar and drawdown status
- **Map** — geographic view of every site you are monitoring

## Common workflows

### 1. Log a site visit

1. Click **Construction**.
2. Find the deal you just visited — each row shows current progress on the
   right.
3. Open the site-visit section of the monitoring panel and record: date,
   surveyor, progress %, notes.
4. Upload photos. The `site-photos` bucket is wired via `useUploadDocument` in
   `src/hooks/useSupabaseQuery.ts`.

### 2. Issue a construction certification

1. From the deal row in **Construction**, open the certifications panel.
2. Record the certified works value and the retention amount (5% standard).
3. Save. The certification is linked to the deal and unlocks the next drawdown
   on the originator/finance side.

### 3. Add a monthly monitoring report

1. Still in **Construction**, use the monitoring-report section of the panel.
2. Fill period, headline progress, cost-to-complete forecast, and risks.
3. Upload the PDF — stored in the `documents` bucket and listed on the deal.

### 4. Check cross-site status

1. Open **Map** to plan a multi-site visit.
2. Open **Lifecycle** and look at the *Phase* column — anything between
   "Construction start" and "Final delivery" is your remit.
3. Click **View detail** to jump to the full deal page.

### 5. Track retention release

1. Open the deal detail page from **Construction**.
2. Retention accrues at 5% on each certification. The balance is shown on the
   certifications panel.
3. Retention is released after final completion and a defect-free inspection —
   record both on the same panel.

## What you can't do

You are mapped to the `analyst` database role, focused on construction
monitoring.

- **Allowed**: create and edit site visits, certifications, monitoring reports,
  and upload photos and PDFs.
- **Denied**: cannot **delete** records, change deal terms, approve at IC, or
  manage users.

## FAQ

**Q: How large can a photo upload be?**
A: Photos go into the `site-photos` Supabase bucket. Use web-sized images
(under ~10 MB each).

**Q: Does a certification automatically disburse money?**
A: No. CapitalBridge is a workflow platform — no money moves through it. The
certification unlocks the drawdown record; finance triggers the disbursement
outside the app.

**Q: What is the 5% retention rule?**
A: Retention is 5% of certified works, accrued on every certification and
released only after final completion and a defect-free inspection. See the
business-logic notes in `CLAUDE.md`.

**Q: Can I edit a visit I logged yesterday?**
A: Yes — you can update records. Deletion is admin-only per
`supabase/migrations/00001_initial_schema.sql`.

**Q: How do I get a map of every site I cover?**
A: Click **Map** in the sidebar. Every deal with coordinates is plotted.
