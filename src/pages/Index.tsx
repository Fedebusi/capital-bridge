import { useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import DealCard from "@/components/dashboard/DealCard";
import QuickScreenDialog from "@/components/dashboard/QuickScreenDialog";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { sampleDeals, getPortfolioMetrics, formatMillions, formatPercent, stageLabels, type DealStage } from "@/data/sampleDeals";
import { Euro, BarChart3, TrendingUp, Clock, AlertTriangle, FileDown, ArrowRight } from "lucide-react";
import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const aumData = [
  { month: "Oct", value: 4200000 },
  { month: "Nov", value: 5800000 },
  { month: "Dec", value: 7100000 },
  { month: "Jan", value: 9400000 },
  { month: "Feb", value: 12600000 },
  { month: "Mar", value: 16800000 },
  { month: "Apr", value: 21500000 },
];

const sectorData = [
  { name: "Build to Sell", value: 75, color: "hsl(var(--primary))" },
  { name: "Refurbishment", value: 15, color: "hsl(var(--accent))" },
  { name: "Other", value: 10, color: "hsl(var(--muted-foreground))" },
];

const periodOptions = ["Last 6 Months", "Last 12 Months", "YTD"];

export default function DashboardPage() {
  const metrics = getPortfolioMetrics();
  const activeDeals = sampleDeals.filter(d => d.stage === "active");
  const covenantAlerts = sampleDeals.filter(d => d.covenants.some(c => c.status !== "compliant"));
  const [aumPeriod, setAumPeriod] = useState(periodOptions[0]);

  const pipelineVolume = sampleDeals
    .filter(d => ["screening", "due_diligence", "ic_approval", "documentation"].includes(d.stage))
    .reduce((s, d) => s + d.loanAmount, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Portfolio Overview</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <QuickScreenDialog />
            <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-sm">
              <FileDown className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total AUM" value={formatMillions(metrics.totalCommitments)} change="+12.5%" changeDirection="up" icon={Euro} highlight />
          <MetricCard label="Active Loans" value={`${metrics.activeDeals}`} change={`+${metrics.pipelineDeals}`} changeDirection="up" icon={BarChart3} />
          <MetricCard label="Avg. LTV" value={formatPercent(metrics.avgLTV)} change="-1.2%" changeDirection="down" icon={TrendingUp} />
          <MetricCard label="Pipeline" value={formatMillions(pipelineVolume)} change={`+${formatMillions(pipelineVolume * 0.25)}`} changeDirection="up" icon={Clock} />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">AUM Growth</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Portfolio value trajectory</p>
              </div>
              <select
                value={aumPeriod}
                onChange={e => setAumPeriod(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {periodOptions.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={aumData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aumGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(165, 55%, 42%)" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="hsl(165, 55%, 42%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(220,10%,46%)" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(220,10%,46%)" }} tickFormatter={v => `€${(v / 1e6).toFixed(0)}M`} />
                  <Tooltip
                    formatter={(v: number) => [`€${(v / 1e6).toFixed(1)}M`, "AUM"]}
                    contentStyle={{ borderRadius: 10, border: "1px solid hsl(220,13%,89%)", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(165, 55%, 42%)" strokeWidth={2.5} fill="url(#aumGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display text-base font-semibold text-foreground">Sector Allocation</h3>
            <p className="text-xs text-muted-foreground mt-0.5">By asset type</p>
            <div className="flex items-center justify-center h-48 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sectorData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" strokeWidth={3} stroke="hsl(0,0%,100%)">
                    {sectorData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v}%`, ""]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-1 justify-center">
              {sectorData.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name} ({s.value}%)
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active Loans */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Active Loans</h2>
              <Link to="/deals" className="flex items-center gap-1 text-xs font-medium text-accent hover:underline">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {activeDeals.map((d, i) => <DealCard key={d.id} deal={d} index={i} />)}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-5">
            {/* Pipeline */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-sm font-semibold text-foreground">Pipeline</h3>
                <Link to="/pipeline" className="text-[11px] font-medium text-accent hover:underline">View →</Link>
              </div>
              {(["screening", "due_diligence", "ic_approval", "documentation"] as DealStage[]).map(stage => {
                const count = sampleDeals.filter(d => d.stage === stage).length;
                return (
                  <div key={stage} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{stageLabels[stage]}</span>
                    <span className="text-sm font-semibold text-foreground">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Covenant Alerts */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-warning" /> Covenant Alerts
              </h3>
              {covenantAlerts.length > 0 ? covenantAlerts.map(d => (
                <div key={d.id} className="border-b border-border py-3 last:border-0 last:pb-0 first:pt-0">
                  <p className="text-sm font-medium text-foreground">{d.projectName}</p>
                  {d.covenants.filter(c => c.status !== "compliant").map(c => (
                    <p key={c.name} className="text-xs text-warning mt-0.5">{c.name}: {c.currentValue} (limit: {c.threshold})</p>
                  ))}
                </div>
              )) : <p className="text-xs text-muted-foreground">All covenants compliant ✓</p>}
            </div>

            {/* Recent Activity */}
            <RecentActivity />

            {/* Portfolio Metrics */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="font-display text-sm font-semibold text-foreground mb-3">Key Metrics</h3>
              <div className="space-y-2.5">
                {[
                  ["Total Disbursed", formatMillions(metrics.totalDisbursed), "text-foreground"],
                  ["Accrued PIK", formatMillions(metrics.totalAccruedPIK), "text-accent"],
                  ["Total GDV", formatMillions(metrics.totalGDV), "text-foreground"],
                  ["Avg LTC", formatPercent(metrics.avgLTC), "text-foreground"],
                ].map(([label, value, color]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className={`text-xs font-semibold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
