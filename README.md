# CapitalBridge

Institutional debt fund portfolio management platform. Built for real estate lending operations — deal origination, lifecycle tracking, construction monitoring, PIK accrual, and investor reporting.

## Tech Stack

- **React 18** + **TypeScript** (Vite)
- **Tailwind CSS** + **shadcn/ui** component library
- **Recharts** for data visualization
- **Leaflet** for geographic mapping
- **jsPDF** for PDF report generation

## Getting Started

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

## Project Structure

```
src/
  pages/              # Route-level page components
  components/
    ui/               # shadcn/ui primitives (Button, Dialog, Tabs, etc.)
    layout/           # AppLayout (sidebar + top nav)
    dashboard/        # Dashboard widgets (MetricCard, PortfolioMap, etc.)
    deals/            # Deal detail panels (DD, Approvals, PIK, etc.)
    screening/        # Screening tool component
  data/               # Mock data & type definitions
  lib/                # Utilities (cn helper, PDF generation)
  hooks/              # Custom React hooks
```

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Overview | Portfolio dashboard with NAV, metrics, activity feed |
| `/investor` | Investor Portal | Investor-facing portfolio, performance chart, payments |
| `/map` | Map | Geographic distribution of deals on interactive map |
| `/lifecycle` | Lifecycle | 12-phase deal workflow with milestones |
| `/pipeline` | Pipeline | Deal pipeline with stage filters |
| `/screening` | Screening | Deal opportunity assessment tool |
| `/deals` | Loan Book | Sortable/filterable loan portfolio table |
| `/deals/:id` | Deal Detail | Full deal view with DD, approvals, covenants, etc. |
| `/pik-engine` | PIK Engine | Interest accrual calculations and projections |
| `/construction` | Construction | Site visits, certifications, monitoring reports |
| `/borrowers` | Borrowers | Borrower registry with ratings and KYC status |
| `/borrowers/:id` | Borrower Detail | Profile, exposure, track record, KYC compliance |
| `/due-diligence` | Due Diligence | DD progress tracker with PDF export |
| `/approvals` | Approvals | IC voting and approval workflow |

## Design System

- **Fonts**: Manrope (headlines, extrabold), Inter (body)
- **Primary**: `#19212E` (dark navy)
- **Accent**: emerald for positive indicators
- **Layout**: Fixed sidebar (264px) + sticky top nav
- **Labels**: Uppercase, tracking-widest, 9-11px

## Data

All data is currently mock/sample data in `src/data/`. No backend API is connected.
When integrating a real API, replace the imports from `src/data/` with React Query hooks.
The `@tanstack/react-query` package is already installed and configured in `App.tsx`.

## Scripts

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run test       # Run Vitest
npm run test:watch # Run tests in watch mode
```
