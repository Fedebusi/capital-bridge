# CapitalBridge — User Guides

CapitalBridge is a collaborative workflow and reporting platform for the real estate
debt fund financing residential developments in Spain. It manages **deals, borrowers,
documents, approvals, and reporting** — no money moves through the platform.

This folder contains one short guide per functional role. Pick the one that matches
your day-to-day job:

| Role | Guide | What they do |
|------|-------|--------------|
| **Originator** | [guides/originator.md](guides/originator.md) | Load new deals, fill term sheets, track pipeline |
| **Finance team** | [guides/finance.md](guides/finance.md) | Watch numbers, covenants, reporting, loan status |
| **Architecture / Monitoring** | [guides/architecture.md](guides/architecture.md) | Upload construction photos, milestones, surveyor notes |
| **Admin (fund manager)** | [guides/admin.md](guides/admin.md) | Approve, manage users, export reporting to the capital partner |

## Quick orientation

The app has a left sidebar split in three groups:

- **Dashboard** — *Overview*, *Investor Portal*, *Map*
- **Deal Management** — *Pipeline*, *Screening*, *Loan Book*, *Lifecycle*, *Term Sheets*
- **Operations** — *PIK Engine*, *Construction*, *Borrowers*, *Due Diligence*, *Approvals*, *IT Docs*

Every page name above matches the label you see in the sidebar.

## How roles map to database permissions

The app uses Supabase Row Level Security. Your functional role is mapped to one of
five database roles defined in `supabase/migrations/00001_initial_schema.sql`:

| Functional role | DB role | Can read | Can create / edit | Can delete |
|---|---|---|---|---|
| Originator | `analyst` | all tables | deals, borrowers, DD, term sheets | no |
| Finance | `portfolio_manager` | all tables | deals, drawdowns, covenants, reports | no |
| Architecture | `analyst` | all tables | site visits, certifications, photos, monitoring reports | no |
| Admin | `admin` | everything | everything | yes |
| (Investor) | `investor` | own portfolio only via Investor Portal | no | no |
| (Viewer) | `viewer` | read-only | no | no |

New users start as `viewer` and must be promoted by an admin.

## Getting help

- Platform issues: contact the fund manager (admin role) via email
- Data questions: open a conversation with the Finance team
- For developers: see `CLAUDE.md` at the repo root
