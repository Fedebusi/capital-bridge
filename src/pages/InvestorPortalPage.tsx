import { useMemo, useState } from "react";
import InvestorLayout from "@/components/layout/InvestorLayout";
import { LoadingSkeleton, EmptyState } from "@/components/shared/LoadingSkeleton";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { useDeals } from "@/hooks/useDeals";
import { formatMillions, formatPercent, type Deal } from "@/data/sampleDeals";
import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, PiggyBank, BarChart3, Calendar, ArrowRight, Download, Briefcase, FileSpreadsheet } from "lucide-react";
import { generateTaxReport } from "@/lib/pdf/generateTaxReport";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { exportToExcel, stampedFilename } from "@/lib/exports/exportToExcel";

const portfolioHistory = [
  { month: "Jul", value: 820000, returns: 12000 },
  { month: "Aug", value: 1050000, returns: 18500 },
  { month: "Sep", value: 1320000, returns: 24000 },
  { month: "Oct", value: 1580000, returns: 31000 },
  { month: "Nov", value: 1820000, returns: 38500 },
  { month: "Dec", value: 2100000, returns: 45200 },
  { month: "Jan", value: 2350000, returns: 52800 },
  { month: "Feb", value: 2680000, returns: 61500 },
  { month: "Mar", value: 2950000, returns: 70200 },
];

const allocationData = [
  { name: "Senior Debt", value: 58, color: "#19212E" },
  { name: "Mezzanine", value: 24, color: "#475569" },
  { name: "Bridge", value: 12, color: "#94a3b8" },
  { name: "Equity Co-Invest", value: 6, color: "#cbd5e1" },
];

const upcomingPayments = [
  { project: "Terrazas del Faro", type: "Interest", date: "15 Apr 2026", amount: 42800, status: "scheduled" },
  { project: "Arcos de Canillejas", type: "PIK Accrual", date: "22 Apr 2026", amount: 18200, status: "scheduled" },
  { project: "Jardines de Ruzafa", type: "Principal", date: "30 Apr 2026", amount: 350000, status: "pending" },
  { project: "Palau de Gràcia", type: "Interest", date: "05 May 2026", amount: 31500, status: "scheduled" },
];

type Period = "1M" | "3M" | "6M" | "1Y" | "All";

const PERIOD_WINDOW: Record<Period, number> = {
  "1M": 1,
  "3M": 3,
  "6M": 6,
  "1Y": 12,
  "All": Infinity,
};

/**
 * Exported for testing. Slices the portfolio history to the tail window for a given period.
 */
export function sliceHistory<T>(data: T[], period: Period): T[] {
  const window = PERIOD_WINDOW[period];
  if (!Number.isFinite(window)) return data;
  return data.slice(Math.max(0, data.length - window));
}

/**
 * Exported for testing. Generates a CSV snapshot of the investor's active positions.
 */
export function buildPositionsCsv(deals: Deal[]): string {
  const header = [
    "Project",
    "Borrower",
    "Location",
    "Asset Type",
    "Stage",
    "Loan Amount (EUR)",
    "Disbursed (EUR)",
    "Outstanding (EUR)",
    "Accrued PIK (EUR)",
    "Interest Rate (%)",
    "PIK Spread (%)",
    "Total Rate (%)",
    "LTV (%)",
    "LTC (%)",
    "Construction Progress (%)",
    "Maturity",
  ];
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = deals.map(d =>
    [
      d.projectName,
      d.borrower,
      d.location,
      d.assetType,
      d.stage,
      d.loanAmount.toFixed(2),
      d.disbursedAmount.toFixed(2),
      d.outstandingPrincipal.toFixed(2),
      d.accruedPIK.toFixed(2),
      d.interestRate.toFixed(2),
      d.pikSpread.toFixed(2),
      d.totalRate.toFixed(2),
      d.ltv.toFixed(2),
      d.ltc.toFixed(2),
      d.constructionProgress.toFixed(0),
      d.maturityDate,
    ].map(escape).join(","),
  );
  return [header.join(","), ...rows].join("\n");
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function InvestorPortalPage() {
  const [period, setPeriod] = useState<Period>("6M");
  const { deals, loading } = useDeals();
  const location = useLocation();
  const isReportsView = location.pathname === "/investor/reports";

  const chartData = useMemo(() => sliceHistory(portfolioHistory, period), [period]);

  if (loading) {
    return <InvestorLayout><LoadingSkeleton /></InvestorLayout>;
  }

  const activeDeals = deals.filter(d => d.stage === "active");
  // Returns include BOTH accrued (active) and realized (repaid) to reflect true portfolio performance.
  const repaidDeals = deals.filter(d => d.stage === "repaid");
  const totalInvested = activeDeals.reduce((s, d) => s + d.disbursedAmount, 0);
  const totalReturns =
    activeDeals.reduce((s, d) => s + d.accruedPIK, 0) +
    repaidDeals.reduce((s, d) => s + d.accruedPIK, 0);
  // Position-weighted yield (not arithmetic mean)
  const yieldWeight = activeDeals.reduce((s, d) => s + d.disbursedAmount, 0);
  const avgYield = yieldWeight > 0
    ? activeDeals.reduce((s, d) => s + d.disbursedAmount * d.totalRate, 0) / yieldWeight
    : 0;

  function buildPositionRows(): Record<string, unknown>[] {
    return activeDeals.map((d) => ({
      Project: d.projectName,
      Borrower: d.borrower,
      Location: d.location,
      "Asset Type": d.assetType,
      Stage: d.stage,
      "Loan Amount (EUR)": d.loanAmount,
      "Disbursed (EUR)": d.disbursedAmount,
      "Outstanding (EUR)": d.outstandingPrincipal,
      "Accrued PIK (EUR)": d.accruedPIK,
      "Total Rate (%)": d.totalRate,
      "LTV (%)": d.ltv,
      "Construction Progress (%)": d.constructionProgress,
      Maturity: d.maturityDate,
    }));
  }

  function handleExportCsv() {
    if (activeDeals.length === 0) {
      toast.error("No active positions to export");
      return;
    }
    const csv = buildPositionsCsv(activeDeals);
    const today = new Date().toISOString().split("T")[0];
    downloadCsv(`CapitalBridge_Positions_${today}.csv`, csv);
    toast.success(`Exported ${activeDeals.length} position${activeDeals.length === 1 ? "" : "s"}`);
  }

  function handleExportExcel() {
    if (activeDeals.length === 0) {
      toast.error("No active positions to export");
      return;
    }
    const returnsRows = portfolioHistory.map((h) => ({
      Month: h.month,
      "NAV (EUR)": h.value,
      "Returns (EUR)": h.returns,
    }));
    const allocationRows = allocationData.map((a) => ({
      Tranche: a.name,
      "Allocation (%)": a.value,
    }));
    const upcomingRows = upcomingPayments.map((p) => ({
      Project: p.project,
      Type: p.type,
      Date: p.date,
      "Amount (EUR)": p.amount,
      Status: p.status,
    }));
    exportToExcel(stampedFilename("InvestorPortal"), [
      { name: "Positions", rows: buildPositionRows() },
      { name: "Returns", rows: returnsRows },
      { name: "Allocation", rows: allocationRows },
      { name: "Upcoming Payments", rows: upcomingRows },
    ]);
    toast.success(`Exported ${activeDeals.length} position${activeDeals.length === 1 ? "" : "s"} to Excel`);
  }

  function handleTaxReport() {
    if (activeDeals.length === 0) {
      toast.error("No positions yet — nothing to report");
      return;
    }
    generateTaxReport(deals);
    toast.success("Tax report downloaded");
  }

  if (isReportsView) {
    return (
      <InvestorLayout>
        <div className="space-y-8">
          <header>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Investor Portal</p>
            <h1 className="text-4xl font-bold text-primary tracking-tight">Reports & Exports</h1>
            <p className="text-slate-500 text-base mt-2">
              Download reports and exports covering your positions, returns, and fiscal obligations.
            </p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-50 rounded-2xl p-6 flex flex-col gap-4">
              <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Download className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary tracking-tight">Tax Report (PDF)</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Fiscal-year summary of interest, PIK accrual, fees and withholding tax across all positions.
                </p>
              </div>
              <button
                type="button"
                onClick={handleTaxReport}
                className="self-start rounded-full bg-primary text-white px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 flex flex-col gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary tracking-tight">Portfolio Export (Excel)</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Multi-sheet workbook with positions, returns, allocation and upcoming payments.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportExcel}
                className="self-start rounded-full bg-emerald-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Download Excel
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 flex flex-col gap-4">
              <div className="h-12 w-12 rounded-2xl bg-slate-200 flex items-center justify-center">
                <FileSpreadsheet className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary tracking-tight">Positions Export (CSV)</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Machine-readable snapshot of every active position — loan, rate, LTV, maturity.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportCsv}
                className="self-start rounded-full bg-slate-700 text-white px-5 py-2.5 text-sm font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Download CSV
              </button>
            </div>
          </section>

          <section className="bg-slate-50 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider">Recent Activity</h2>
              <Link
                to="/investor"
                className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1"
              >
                Back to Portfolio <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {upcomingPayments.map((payment, i) => (
                <div key={i} className="flex items-center gap-5 px-6 py-4">
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold",
                    payment.type === "Interest" ? "bg-blue-50 text-blue-600" :
                    payment.type === "Principal" ? "bg-emerald-50 text-emerald-600" :
                    "bg-violet-50 text-violet-600",
                  )}>
                    {payment.type.substring(0, 3).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-primary">{payment.project}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{payment.type} · {payment.date}</p>
                  </div>
                  <p className="text-sm font-bold text-primary">
                    €{payment.amount.toLocaleString("it-IT")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </InvestorLayout>
    );
  }

  return (
    <InvestorLayout>
      <div className="space-y-8">
        {/* Header */}
        <header className="flex justify-between items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Investor Portal</p>
            <h1 className="text-4xl font-bold text-primary tracking-tight">My Portfolio</h1>
            <p className="text-slate-500 text-base mt-2">Welcome back. Here's your investment summary.</p>
          </div>
          <div className="flex items-center gap-3">
            <ExportMenu
              disabled={activeDeals.length === 0}
              onExcel={handleExportExcel}
              onCsv={handleExportCsv}
            />
            <button
              type="button"
              onClick={handleTaxReport}
              className="bg-slate-50 hover:bg-slate-100 px-5 py-3 rounded-full text-sm font-semibold text-slate-700 transition-colors flex items-center gap-2"
              title="Download fiscal-year tax report"
            >
              <Download className="h-4 w-4" />
              Tax Report
            </button>
            <Link
              to="/deals"
              className="bg-accent text-white px-5 py-3 rounded-full text-sm font-semibold hover:bg-accent/90 transition-colors shadow-sm shadow-accent/20 inline-flex items-center gap-2"
            >
              Invest Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        {/* Hero Stats */}
        <section className="grid grid-cols-12 gap-5">
          {/* Portfolio Value */}
          <div className="col-span-12 lg:col-span-8 bg-gradient-to-br from-primary to-slate-700 rounded-2xl p-10 text-white relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/5 rounded-full" />
            <div className="absolute -bottom-16 left-12 w-40 h-40 bg-white/5 rounded-full" />
            <div className="relative z-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/60">Total Portfolio Value</span>
              <h2 className="text-5xl font-bold tracking-tight mt-3">{formatMillions(totalInvested + totalReturns)}</h2>
              <div className="flex items-center gap-2 mt-3">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">+12.4% all-time return</span>
              </div>
            </div>
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 pt-6 border-t border-white/10">
              <div>
                <span className="text-xs text-white/50 uppercase font-semibold tracking-wider">Capital Invested</span>
                <p className="text-2xl font-bold mt-2">{formatMillions(totalInvested)}</p>
              </div>
              <div>
                <span className="text-xs text-white/50 uppercase font-semibold tracking-wider">Total Returns</span>
                <p className="text-2xl font-bold mt-2 text-emerald-400">{formatMillions(totalReturns)}</p>
              </div>
              <div>
                <span className="text-xs text-white/50 uppercase font-semibold tracking-wider">Avg Yield</span>
                <p className="text-2xl font-bold mt-2">{formatPercent(avgYield)}</p>
              </div>
              <div>
                <span className="text-xs text-white/50 uppercase font-semibold tracking-wider">Active Positions</span>
                <p className="text-2xl font-bold mt-2">{activeDeals.length}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="col-span-12 lg:col-span-4 grid grid-rows-3 gap-5">
            <div className="bg-slate-50 rounded-2xl p-6 flex items-center gap-4 hover:bg-slate-100/70 transition-colors">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                <PiggyBank className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">This Quarter</p>
                <p className="text-2xl font-bold text-primary mt-1 tracking-tight">{formatMillions(totalReturns * 0.35)}</p>
                <p className="text-xs text-emerald-600 font-semibold mt-1">+8.2% vs last quarter</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 flex items-center gap-4 hover:bg-slate-100/70 transition-colors">
              <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Annualized IRR</p>
                <p className="text-2xl font-bold text-primary mt-1 tracking-tight">12.1%</p>
                <p className="text-xs text-slate-500 mt-1">Net of fees</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 flex items-center gap-4 hover:bg-slate-100/70 transition-colors">
              <div className="h-12 w-12 rounded-2xl bg-violet-100 flex items-center justify-center shrink-0">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Next Payment</p>
                <p className="text-2xl font-bold text-primary mt-1 tracking-tight">15 Apr</p>
                <p className="text-xs text-slate-500 mt-1">€42,800 — Terrazas del Faro</p>
              </div>
            </div>
          </div>
        </section>

        {/* Charts */}
        <section className="grid grid-cols-12 gap-6">
          {/* Performance Chart */}
          <div className="col-span-12 lg:col-span-8 bg-slate-50 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Portfolio Performance</h3>
                <p className="text-xs text-slate-400 mt-1">Net asset value over time</p>
              </div>
              <div className="flex bg-slate-100 rounded p-0.5" role="tablist" aria-label="Time period">
                {(["1M", "3M", "6M", "1Y", "All"] as Period[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    role="tab"
                    aria-selected={period === p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "px-3 py-1 rounded text-xs font-bold uppercase tracking-wide transition-all",
                      period === p ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#19212E" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#19212E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} tickFormatter={v => `€${(v / 1e6).toFixed(1)}M`} />
                  <Tooltip
                    formatter={(v: number) => [`€${(v / 1e6).toFixed(2)}M`, "Portfolio Value"]}
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 11, fontWeight: 600, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#19212E" strokeWidth={2.5} fill="url(#portfolioGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Allocation */}
          <div className="col-span-12 lg:col-span-4 bg-slate-50 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Asset Allocation</h3>
            <p className="text-xs text-slate-400 mb-4">By investment type</p>
            <div className="flex items-center justify-center h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    dataKey="value"
                    strokeWidth={3}
                    stroke="#fff"
                  >
                    {allocationData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v}%`, ""]} contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2.5 mt-4">
              {allocationData.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-primary">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Active Investments + Upcoming Payments */}
        <section className="grid grid-cols-12 gap-6">
          {/* Active Investments */}
          <div className="col-span-12 lg:col-span-8 bg-slate-50 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider">My Investments</h2>
              <Link to="/deals" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {activeDeals.length === 0 && (
                <div className="p-6">
                  <EmptyState
                    icon={Briefcase}
                    title="No active investments yet"
                    description="Your active positions will show here once deals go live. Browse available opportunities to place capital."
                    action={
                      <Link
                        to="/deals"
                        className="rounded-full bg-accent text-white px-5 py-2 text-sm font-semibold hover:bg-accent/90 transition-colors inline-flex items-center gap-2"
                      >
                        Browse deals <ArrowRight className="h-4 w-4" />
                      </Link>
                    }
                  />
                </div>
              )}
              {activeDeals.map(deal => {
                return (
                  <Link
                    key={deal.id}
                    to={`/deals/${deal.id}`}
                    className="flex items-center gap-5 px-6 py-4 hover:bg-slate-50 transition-colors group"
                  >
                    {/* Project thumbnail */}
                    <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-slate-500 uppercase">{deal.assetType.substring(0, 3)}</span>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-primary group-hover:text-slate-600 transition-colors truncate">{deal.projectName}</p>
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[8px] font-bold uppercase shrink-0">Active</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{deal.location} · {deal.borrower}</p>
                      {/* Progress */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${deal.constructionProgress}%` }} />
                        </div>
                        <span className="text-[11px] font-bold text-slate-400">{deal.constructionProgress}%</span>
                      </div>
                    </div>
                    {/* Financials */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-extrabold text-primary">{formatMillions(deal.disbursedAmount)}</p>
                      <p className="text-xs text-slate-400">invested</p>
                    </div>
                    <div className="text-right shrink-0 w-20">
                      <p className="text-sm font-extrabold text-emerald-600">+{formatMillions(deal.accruedPIK)}</p>
                      <p className="text-xs text-slate-400">{formatPercent(deal.totalRate)} yield</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Upcoming Payments */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="bg-slate-50 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Upcoming Payments</h3>
              <div className="space-y-3">
                {upcomingPayments.map((payment, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className={cn(
                      "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold",
                      payment.type === "Interest" ? "bg-blue-50 text-blue-600" :
                      payment.type === "Principal" ? "bg-emerald-50 text-emerald-600" :
                      "bg-violet-50 text-violet-600"
                    )}>
                      {payment.type.substring(0, 3).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-primary truncate">{payment.project}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{payment.date}</p>
                    </div>
                    <p className="text-xs font-bold text-primary shrink-0">
                      €{payment.amount.toLocaleString("it-IT")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Investment Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Summary</h3>
              <div className="space-y-3">
                {[
                  ["Capital Committed", formatMillions(totalInvested * 1.2)],
                  ["Capital Deployed", formatMillions(totalInvested)],
                  ["Unrealized Gains", formatMillions(totalReturns * 0.7)],
                  ["Realized Gains", formatMillions(totalReturns * 0.3)],
                  ["Distributions", formatMillions(totalReturns * 0.15)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
                    <span className="text-xs font-bold text-primary">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </InvestorLayout>
  );
}
