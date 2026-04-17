# Originator Guide

## Who this is for

Deal originators who source new lending opportunities, push them through screening,
and own a deal until it reaches Investment Committee approval.

## What you see

Your day-to-day sidebar sections:

- **Pipeline** — kanban list of every deal grouped by stage
- **Screening** — scoring tool for new opportunities
- **Borrowers** — sponsor registry, track record, KYC
- **Due Diligence** — per-deal DD checklist
- **Term Sheets** — key terms and waiver requests
- **Lifecycle** — 12-phase workflow view
- **Overview** — daily entry point

## Common workflows

### 1. Score a new opportunity

1. Open **Screening**.
2. Fill the scoring form: LTV, LTC, pre-sales, developer track record.
3. Read the score card — it flags any breach of fund criteria (LTV ≤65%, LTC
   ≤75%, pre-sales ≥30%, developer ≥5 completed projects).
4. If it passes, go to **Pipeline** and click **New Deal**.

### 2. Create a new deal

1. Click **Pipeline**.
2. Click **New Deal** (top-right).
3. Fill the **New Deal** dialog: project name, borrower, location, amount, LTV,
   LTC, cash rate, PIK spread, tenor, expected drawdowns.
4. Click **Save** — the deal appears in the `Screening` column.

### 3. Onboard a new borrower

1. Click **Borrowers**.
2. Click **New Borrower** (top-right).
3. Fill the **New Borrower** dialog: legal name, group, type, HQ, year.
4. Save, then open the borrower page to add contacts, entities, KYC, and
   completed projects.

### 4. Track due diligence

1. Open **Due Diligence**.
2. Find your deal row — it shows `completed / total` items and any that are
   **flagged**.
3. Click the deal name to tick items as they clear.
4. Use **PDF Report** (top-right of the row) to export the DD pack before IC.

### 5. Prepare the term sheet

1. Go to **Term Sheets**, find your deal card.
2. Review the **Key Terms** grid (facility, rates, LTV, LTC, pre-sales, fees).
3. Click **Print PDF** to generate the document for signature.
4. If a term needs to breach a standard limit, raise a waiver from the deal
   detail page — the capital partner must approve.

## What you can't do

You are mapped to the `analyst` database role.

- **Allowed**: create and edit deals, borrowers, DD items, term sheets; upload
  DD documents.
- **Denied**: cannot **delete** anything (admin only), cannot approve at IC,
  cannot promote users.

## FAQ

**Q: Can I start a deal without a borrower record?**
A: No — create the borrower first on the **Borrowers** page.

**Q: Where do I see every deal I own?**
A: The **Pipeline** page. Use the stage filter chips to narrow by stage.

**Q: Can I delete a deal I created by mistake?**
A: No. Ask an admin — only `admin` has delete permissions per
`supabase/migrations/00001_initial_schema.sql`.

**Q: What happens after I submit a deal for IC?**
A: Its stage moves to `ic_approval` and it appears on the **Approvals** page.

**Q: Where is the deal's full history?**
A: The deal detail page (`/deals/:id`) has tabs for lifecycle, DD, term sheet,
drawdowns, covenants, approvals, legal, and construction monitoring.
