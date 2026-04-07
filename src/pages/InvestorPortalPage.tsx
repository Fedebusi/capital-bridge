import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { sampleDeals, formatMillions, formatPercent } from "@/data/sampleDeals";
import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, PiggyBank, BarChart3, Calendar, ArrowRight, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

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

export default function InvestorPortalPage() {
  const [period, setPeriod] = useState("6M");
  const activeDeals = sampleDeals.filter(d => d.stage === "active");
  const totalInvested = activeDeals.reduce((s, d) => s + d.disbursedAmount, 0);
  const totalReturns = activeDeals.reduce((s, d) => s + d.accruedPIK, 0);
  const avgYield = activeDeals.length > 0 ? activeDeals.reduce((s, d) => s + d.totalRate, 0) / activeDeals.length : 0;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <header className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Investor Portal</p>
            <h1 className="text-2xl font-extrabold text-primary">My Portfolio</h1>
            <p className="text-slate-500 text-sm mt-1">Welcome back. Here's your investment summary.</p>
          </div>
          <div className="flex space-x-2">
            <button className="bg-white border border-slate-200 px-4 py-2 rounded text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
              <Download className="h-3.5 w-3.5" />
              Tax Report
            </button>
            <button className="bg-primary text-white px-4 py-2 rounded text-xs font-bold hover:bg-slate-800 transition-colors">
              Invest Now
            </button>
          </div>
        </header>

        {/* Hero Stats */}
        <section className="grid grid-cols-12 gap-6">
          {/* Portfolio Value */}
          <div className="col-span-12 lg:col-span-8 bg-gradient-to-br from-primary to-slate-700 rounded-xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
            <div className="relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Total Portfolio Value</span>
              <h2 className="text-4xl font-extrabold tracking-tight mt-2">{formatMillions(totalInvested + totalReturns)}</h2>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-bold text-emerald-400">+12.4% all-time return</span>
              </div>
            </div>
            <div className="relative z-10 flex gap-12 mt-10 pt-6 border-t border-white/10">
              <div>
                <span className="text-[9px] text-white/50 uppercase font-bold tracking-widest">Capital Invested</span>
                <p className="text-xl font-bold mt-1">{formatMillions(totalInvested)}</p>
              </div>
              <div>
                <span className="text-[9px] text-white/50 uppercase font-bold tracking-widest">Total Returns</span>
                <p className="text-xl font-bold mt-1 text-emerald-400">{formatMillions(totalReturns)}</p>
              </div>
              <div>
                <span className="text-[9px] text-white/50 uppercase font-bold tracking-widest">Avg Yield</span>
                <p className="text-xl font-bold mt-1">{formatPercent(avgYield)}</p>
              </div>
              <div>
                <span className="text-[9px] text-white/50 uppercase font-bold tracking-widest">Active Positions</span>
                <p className="text-xl font-bold mt-1">{activeDeals.length}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="col-span-12 lg:col-span-4 grid grid-rows-3 gap-4">
            <div className="bg-white border border-slate-100 rounded-xl p-5 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <PiggyBank className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">This Quarter</p>
                <p className="text-xl font-extrabold text-primary">{formatMillions(totalReturns * 0.35)}</p>
                <p className="text-[10px] text-emerald-600 font-bold mt-0.5">+8.2% vs last quarter</p>
              </div>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl p-5 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Annualized IRR</p>
                <p className="text-xl font-extrabold text-primary">12.1%</p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Net of fees</p>
              </div>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl p-5 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                <Calendar className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Next Payment</p>
                <p className="text-xl font-extrabold text-primary">15 Apr</p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">€42,800 — Terrazas del Faro</p>
              </div>
            </div>
          </div>
        </section>

        {/* Charts */}
        <section className="grid grid-cols-12 gap-6">
          {/* Performance Chart */}
          <div className="col-span-12 lg:col-span-8 bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Portfolio Performance</h3>
                <p className="text-[10px] text-slate-400 mt-1">Net asset value over time</p>
              </div>
              <div className="flex bg-slate-100 rounded p-0.5">
                {["1M", "3M", "6M", "1Y", "All"].map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wide transition-all",
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
                <AreaChart data={portfolioHistory} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
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
          <div className="col-span-12 lg:col-span-4 bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Asset Allocation</h3>
            <p className="text-[10px] text-slate-400 mb-4">By investment type</p>
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
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">{item.name}</span>
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
          <div className="col-span-12 lg:col-span-8 bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider">My Investments</h2>
              <Link to="/deals" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {activeDeals.map(deal => {
                const returnRate = deal.loanAmount > 0 ? (deal.accruedPIK / deal.loanAmount) * 100 : 0;
                return (
                  <Link
                    key={deal.id}
                    to={`/deals/${deal.id}`}
                    className="flex items-center gap-5 px-6 py-4 hover:bg-slate-50 transition-colors group"
                  >
                    {/* Project thumbnail */}
                    <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{deal.assetType.substring(0, 3)}</span>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-primary group-hover:text-slate-600 transition-colors truncate">{deal.projectName}</p>
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[8px] font-bold uppercase shrink-0">Active</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{deal.location} · {deal.borrower}</p>
                      {/* Progress */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${deal.constructionProgress}%` }} />
                        </div>
                        <span className="text-[9px] font-bold text-slate-400">{deal.constructionProgress}%</span>
                      </div>
                    </div>
                    {/* Financials */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-extrabold text-primary">{formatMillions(deal.disbursedAmount)}</p>
                      <p className="text-[10px] text-slate-400">invested</p>
                    </div>
                    <div className="text-right shrink-0 w-20">
                      <p className="text-sm font-extrabold text-emerald-600">+{formatMillions(deal.accruedPIK)}</p>
                      <p className="text-[10px] text-slate-400">{formatPercent(deal.totalRate)} yield</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Upcoming Payments */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Upcoming Payments</h3>
              <div className="space-y-3">
                {upcomingPayments.map((payment, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className={cn(
                      "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 text-[9px] font-bold",
                      payment.type === "Interest" ? "bg-blue-50 text-blue-600" :
                      payment.type === "Principal" ? "bg-emerald-50 text-emerald-600" :
                      "bg-violet-50 text-violet-600"
                    )}>
                      {payment.type.substring(0, 3).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-primary truncate">{payment.project}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">{payment.date}</p>
                    </div>
                    <p className="text-xs font-bold text-primary shrink-0">
                      €{payment.amount.toLocaleString("it-IT")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Investment Summary */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-6">
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
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{label}</span>
                    <span className="text-xs font-bold text-primary">{value}</span>
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
