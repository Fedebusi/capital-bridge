import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import QuickScreenDialog from "@/components/dashboard/QuickScreenDialog";
import { useDeals } from "@/hooks/useDeals";
import { getPortfolioMetrics, formatMillions, formatPercent, stageLabels, type DealStage } from "@/data/sampleDeals";
import { Wallet, ShieldCheck, Rocket, ArrowRight, Info, ArrowUpRight, Activity, Clock, CheckCircle2, AlertTriangle, FileText, DollarSign, Gavel } from "lucide-react";
import { cn } from "@/lib/utils";

const timelineEvents = [
  { date: "07 Apr", time: "09:30", icon: DollarSign, color: "bg-emerald-500", ring: "ring-emerald-500/20", title: "Drawdown #4 disbursed", subtitle: "Terrazas del Faro — €1.8M released to borrower", tag: "Funding" },
  { date: "05 Apr", time: "14:15", icon: CheckCircle2, color: "bg-blue-500", ring: "ring-blue-500/20", title: "IC Committee approved", subtitle: "Mirador del Port — Unanimous approval (5/5 votes)", tag: "Approval" },
  { date: "03 Apr", time: "11:00", icon: AlertTriangle, color: "bg-amber-500", ring: "ring-amber-500/20", title: "LTV covenant watch triggered", subtitle: "Arcos de Canillejas — LTV at 66.2% (limit: 65%)", tag: "Alert" },
  { date: "01 Apr", time: "16:45", icon: FileText, color: "bg-violet-500", ring: "ring-violet-500/20", title: "DD report completed", subtitle: "Palau de Gràcia — All 18 items cleared, 0 flagged", tag: "Due Diligence" },
  { date: "28 Mar", time: "10:00", icon: Gavel, color: "bg-rose-500", ring: "ring-rose-500/20", title: "Term sheet executed", subtitle: "Villa Marina Benahavís — €9.2M facility, 24-month tenor", tag: "Legal" },
  { date: "25 Mar", time: "09:00", icon: DollarSign, color: "bg-emerald-500", ring: "ring-emerald-500/20", title: "Full repayment received", subtitle: "Costa Brava Residences — €6.4M principal + €890K PIK", tag: "Repayment" },
];

const recentActivity = [
  { entity: "Oakwood Tech Mezzanine", subtitle: "Series B Refinance", type: "Funding", amount: "€12,400,000", status: "completed" as const },
  { entity: "Beacon Real Estate Port.", subtitle: "Commercial Senior Debt", type: "Repayment", amount: "€4,850,000", status: "completed" as const },
  { entity: "Solaris Grid Infrastructure", subtitle: "Bridge Loan Facility", type: "Funding", amount: "€32,000,000", status: "processing" as const },
  { entity: "Meridian Logistics Hub", subtitle: "Warehouse Development", type: "Drawdown", amount: "€8,200,000", status: "completed" as const },
];

const sectorAllocation = [
  { name: "Residential Dev", pct: 42, color: "bg-emerald-500" },
  { name: "Commercial", pct: 28, color: "bg-blue-500" },
  { name: "Infrastructure", pct: 18, color: "bg-violet-500" },
  { name: "Refurbishment", pct: 12, color: "bg-amber-500" },
];

export default function DashboardPage() {
  const { deals, loading } = useDeals();

  if (loading) {
    return <AppLayout><LoadingSkeleton /></AppLayout>;
  }

  const metrics = getPortfolioMetrics(deals);
  const activeDeals = deals.filter(d => d.stage === "active");

  const pipelineVolume = deals
    .filter(d => ["screening", "due_diligence", "ic_approval", "documentation"].includes(d.stage))
    .reduce((s, d) => s + d.loanAmount, 0);

  const totalNAV = metrics.totalCommitments + metrics.totalAccruedPIK;
  const avgRate = activeDeals.length > 0
    ? activeDeals.reduce((s, d) => s + d.totalRate, 0) / activeDeals.length
    : 0;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-primary tracking-tight">Portfolio Overview</h1>
            <p className="text-slate-500 text-base mt-2">Strategic Institutional Debt Aggregation & Allocation</p>
          </div>
          <div className="flex items-center gap-3">
            <QuickScreenDialog />
            <button className="bg-slate-50 hover:bg-slate-100 px-5 py-3 rounded-full text-sm font-semibold text-slate-700 transition-colors">
              Export Report
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="grid grid-cols-12 gap-4">
          {/* NAV Hero Card */}
          <div className="col-span-12 lg:col-span-7 bg-gradient-to-br from-primary via-slate-800 to-slate-700 rounded-xl p-7 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4" />
            <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-emerald-500/10 rounded-full translate-y-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-white/50">Net Asset Value</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold">LIVE</span>
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight">{formatMillions(totalNAV)}</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20">
                  <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400">+4.2%</span>
                </div>
                <span className="text-[11px] text-white/40">vs last quarter</span>
              </div>
            </div>
            <div className="relative z-10 flex gap-10 mt-8 pt-5 border-t border-white/10">
              <div>
                <span className="text-[11px] text-white/40 uppercase font-bold tracking-widest">Dry Powder</span>
                <p className="text-lg font-bold mt-0.5">{formatMillions(pipelineVolume)}</p>
              </div>
              <div>
                <span className="text-[11px] text-white/40 uppercase font-bold tracking-widest">Avg Life</span>
                <p className="text-lg font-bold mt-0.5">4.2 Yrs</p>
              </div>
              <div>
                <span className="text-[11px] text-white/40 uppercase font-bold tracking-widest">Deals</span>
                <p className="text-lg font-bold mt-0.5">{metrics.activeDeals + metrics.pipelineDeals}</p>
              </div>
            </div>
          </div>

          {/* Portfolio Diversity */}
          <div className="col-span-12 lg:col-span-5 bg-white rounded-xl p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Portfolio Diversity</span>
              <div className="flex justify-between items-end mt-4">
                <div>
                  <h3 className="text-4xl font-extrabold text-primary tracking-tight">{metrics.activeDeals}</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Active Facilities</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-primary">{formatPercent(avgRate)}</span>
                  <p className="text-[11px] uppercase font-bold text-slate-400 tracking-widest">Avg Rate</p>
                </div>
              </div>
            </div>
            {/* Stacked bar */}
            <div className="mt-6">
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                <div className="bg-primary h-full rounded-full" style={{ width: "65%" }} />
                <div className="bg-slate-400 h-full rounded-full" style={{ width: "25%" }} />
                <div className="bg-slate-300 h-full rounded-full" style={{ width: "10%" }} />
              </div>
              <div className="flex justify-between mt-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                <span className="text-primary">Senior (65%)</span>
                <span>Mezz (25%)</span>
                <span>Bridge (10%)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Metric Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: "Total AUM", value: formatMillions(metrics.totalCommitments), accent: false },
            { label: "Total Invested", value: formatMillions(metrics.totalDisbursed), accent: false },
            { label: "Available Capital", value: formatMillions(metrics.totalCommitments - metrics.totalDisbursed), accent: false },
            { label: "Avg. Returns", value: "8.6%", accent: true },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl bg-slate-50 p-7 hover:bg-slate-100/70 transition-colors">
              <p className="text-sm text-slate-500 font-medium leading-tight">{card.label}</p>
              <p className={cn(
                "text-3xl font-bold mt-4 tracking-tight",
                card.accent ? "text-accent" : "text-primary"
              )}>{card.value}</p>
            </div>
          ))}
        </section>

        {/* Bottom Section */}
        <section className="grid grid-cols-12 gap-4">
          {/* Activity Feed Table */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary/5 flex items-center justify-center">
                  <Activity className="h-3.5 w-3.5 text-primary" />
                </div>
                <h2 className="text-sm font-bold text-primary">Recent Activity</h2>
              </div>
              <Link to="/deals" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/80 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-6 py-2.5">Entity / Transaction</th>
                    <th className="px-6 py-2.5">Type</th>
                    <th className="px-6 py-2.5">Amount</th>
                    <th className="px-6 py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-50">
                  {recentActivity.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="font-bold text-primary text-sm">{item.entity}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{item.subtitle}</div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase",
                          item.type === "Funding" ? "bg-blue-50 text-blue-600" :
                          item.type === "Repayment" ? "bg-emerald-50 text-emerald-600" :
                          "bg-amber-50 text-amber-600"
                        )}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-bold text-primary">{item.amount}</td>
                      <td className="px-6 py-3.5 text-right">
                        {item.status === "completed" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs">
                            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                            COMPLETED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-bold text-xs">
                            <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse" />
                            PROCESSING
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right column */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            {/* Sector Allocation */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-primary mb-5">Sector Allocation</h3>
              {/* Mini donut visualization */}
              <div className="flex items-center gap-5 mb-5">
                <div className="relative h-20 w-20 shrink-0">
                  <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="37.07 87.96" strokeDashoffset="0" className="transition-all" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="24.64 87.96" strokeDashoffset="-37.07" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#8b5cf6" strokeWidth="4" strokeDasharray="15.83 87.96" strokeDashoffset="-61.71" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="10.56 87.96" strokeDashoffset="-77.54" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[11px] font-extrabold text-primary">100%</span>
                  </div>
                </div>
                <div className="space-y-2 flex-1">
                  {sectorAllocation.map(s => (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", s.color)} />
                        <span className="text-[11px] text-slate-500 font-medium">{s.name}</span>
                      </div>
                      <span className="text-[11px] font-bold text-primary">{s.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link
                to="/deals"
                className="w-full border border-slate-200 text-slate-500 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
              >
                Analytics <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Pipeline Summary */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-primary">Pipeline</h3>
                <Link to="/pipeline" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-0.5">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              {(["screening", "due_diligence", "ic_approval", "documentation"] as DealStage[]).map(stage => {
                const count = deals.filter(d => d.stage === stage).length;
                return (
                  <div key={stage} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                    <span className="text-[11px] text-slate-500 font-medium">{stageLabels[stage]}</span>
                    <span className="text-sm font-bold text-primary bg-slate-50 px-2 py-0.5 rounded-md">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Compliance Notice */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 flex items-start gap-3 border border-amber-100/50">
              <div className="bg-white p-2 rounded-lg shadow-sm shrink-0">
                <Info className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-amber-800">Compliance Notice</h4>
                <p className="text-xs text-amber-700/70 mt-1 leading-relaxed">
                  Quarterly asset valuation audits are scheduled for next Monday. Ensure documentation is current.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Timeline */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-violet-50 flex items-center justify-center">
                <Clock className="h-3.5 w-3.5 text-violet-600" />
              </div>
              <h2 className="text-sm font-bold text-primary">Event Timeline</h2>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last 14 days</span>
          </div>
          <div className="p-6">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-slate-200 via-slate-200 to-transparent" />

              <div className="space-y-1">
                {timelineEvents.map((event, i) => (
                  <div key={i} className="flex gap-4 group">
                    {/* Dot */}
                    <div className="relative shrink-0 pt-0.5">
                      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center ring-4 z-10 relative", event.color, event.ring)}>
                        <event.icon className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    {/* Content */}
                    <div className="flex-1 pb-6 group-last:pb-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-slate-400">{event.date} · {event.time}</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-lg text-[11px] font-bold uppercase",
                          event.tag === "Funding" || event.tag === "Repayment" ? "bg-emerald-50 text-emerald-600" :
                          event.tag === "Approval" ? "bg-blue-50 text-blue-600" :
                          event.tag === "Alert" ? "bg-amber-50 text-amber-600" :
                          event.tag === "Legal" ? "bg-rose-50 text-rose-600" :
                          "bg-violet-50 text-violet-600"
                        )}>
                          {event.tag}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-primary">{event.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{event.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
