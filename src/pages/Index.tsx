import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { sampleDeals, getPortfolioMetrics, formatMillions, formatPercent, stageLabels, type DealStage } from "@/data/sampleDeals";
import { TrendingUp, Wallet, ShieldCheck, Rocket, ArrowRight, Info } from "lucide-react";

const recentActivity = [
  {
    entity: "Oakwood Tech Mezzanine",
    subtitle: "Series B Refinance",
    type: "Funding",
    amount: "€12,400,000",
    status: "completed" as const,
  },
  {
    entity: "Beacon Real Estate Port.",
    subtitle: "Commercial Senior Debt",
    type: "Repayment",
    amount: "€4,850,000",
    status: "completed" as const,
  },
  {
    entity: "Solaris Grid Infrastructure",
    subtitle: "Bridge Loan Facility",
    type: "Funding",
    amount: "€32,000,000",
    status: "processing" as const,
  },
  {
    entity: "Meridian Logistics Hub",
    subtitle: "Warehouse Development",
    type: "Drawdown",
    amount: "€8,200,000",
    status: "completed" as const,
  },
];

const sectorAllocation = [
  { name: "Residential Dev", pct: 42 },
  { name: "Commercial", pct: 28 },
  { name: "Infrastructure", pct: 18 },
  { name: "Refurbishment", pct: 12 },
];

export default function DashboardPage() {
  const metrics = getPortfolioMetrics();
  const activeDeals = sampleDeals.filter(d => d.stage === "active");

  const pipelineVolume = sampleDeals
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
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-extrabold text-primary">Portfolio Overview</h1>
            <p className="text-slate-500 text-sm mt-1">Strategic Institutional Debt Aggregation & Allocation</p>
          </div>
          <div className="flex space-x-2">
            <button className="bg-white border border-slate-200 px-4 py-2 rounded text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
              Export Report
            </button>
            <Link
              to="/pipeline"
              className="bg-primary text-white px-4 py-2 rounded text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Deploy Capital
            </Link>
          </div>
        </header>

        {/* Hero Metrics */}
        <section className="grid grid-cols-12 gap-6">
          {/* NAV Card */}
          <div className="col-span-12 lg:col-span-7 bg-slate-50 border border-slate-100 rounded-xl p-8 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                Net Asset Value (NAV)
              </span>
              <h2 className="text-4xl font-extrabold text-primary tracking-tight">
                {formatMillions(totalNAV)}
              </h2>
              <div className="flex items-center space-x-2 mt-2 text-emerald-600 font-bold text-xs">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+4.2% VS LAST QTR</span>
              </div>
            </div>
            <div className="flex space-x-12 mt-12 pt-6 border-t border-slate-200/50">
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Available Dry Powder</span>
                <p className="text-xl font-bold text-primary mt-1">{formatMillions(pipelineVolume)}</p>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Weighted Avg Life</span>
                <p className="text-xl font-bold text-primary mt-1">4.2 Years</p>
              </div>
            </div>
          </div>

          {/* Portfolio Diversity */}
          <div className="col-span-12 lg:col-span-5 bg-white border border-slate-100 rounded-xl p-8 flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6">Portfolio Diversity</span>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-4xl font-extrabold text-primary tracking-tight">{metrics.activeDeals}</h3>
                  <p className="text-xs text-slate-500 font-medium">Active Credit Facilities</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-primary">{formatPercent(avgRate)}</span>
                  <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">Avg Interest Rate</p>
                </div>
              </div>
              {/* Stacked bar */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div className="bg-primary h-full" style={{ width: "65%" }} />
                <div className="bg-slate-400 h-full" style={{ width: "25%" }} />
                <div className="bg-slate-200 h-full" style={{ width: "10%" }} />
              </div>
              <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400">
                <span className="text-slate-600">Senior Debt (65%)</span>
                <span>Mezzanine (25%)</span>
                <span>Bridge (10%)</span>
              </div>
            </div>
          </div>

          {/* Three small metric cards */}
          <div className="col-span-12 md:col-span-4 bg-white border border-slate-100 rounded-lg p-6 hover:shadow-sm transition-shadow">
            <Wallet className="h-5 w-5 text-primary mb-3" />
            <h3 className="text-2xl font-extrabold text-primary">{formatMillions(metrics.totalDisbursed * 0.12)}</h3>
            <p className="text-xs text-slate-500 font-medium">Quarterly Distributable Cash</p>
          </div>
          <div className="col-span-12 md:col-span-4 bg-white border border-slate-100 rounded-lg p-6 hover:shadow-sm transition-shadow">
            <ShieldCheck className="h-5 w-5 text-primary mb-3" />
            <h3 className="text-2xl font-extrabold text-primary">0.02%</h3>
            <p className="text-xs text-slate-500 font-medium">Impaired Asset Ratio</p>
          </div>
          <div className="col-span-12 md:col-span-4 bg-white border border-slate-100 rounded-lg p-6 hover:shadow-sm transition-shadow">
            <Rocket className="h-5 w-5 text-primary mb-3" />
            <h3 className="text-2xl font-extrabold text-primary">12.1%</h3>
            <p className="text-xs text-slate-500 font-medium">Annualized Fund IRR</p>
          </div>
        </section>

        {/* Bottom Section */}
        <section className="grid grid-cols-12 gap-8">
          {/* Activity Feed Table */}
          <div className="col-span-12 lg:col-span-8 bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider">Recent Activity</h2>
              <Link to="/deals" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">
                View All Transactions
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-6 py-3">Entity / Transaction</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100">
                  {recentActivity.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-primary">{item.entity}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.subtitle}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold uppercase">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-primary">{item.amount}</td>
                      <td className="px-6 py-4 text-right">
                        {item.status === "completed" ? (
                          <span className="inline-flex items-center text-emerald-600 font-bold text-[10px]">
                            <span className="h-1.5 w-1.5 bg-emerald-600 rounded-full mr-1.5" />
                            COMPLETED
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-blue-600 font-bold text-[10px]">
                            <span className="h-1.5 w-1.5 bg-blue-600 rounded-full mr-1.5 animate-pulse" />
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
          <div className="col-span-12 lg:col-span-4 flex flex-col space-y-6">
            {/* Sector Allocation */}
            <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-6">Sector Allocation</h3>
              <div className="space-y-4">
                {sectorAllocation.map((sector) => (
                  <div key={sector.name}>
                    <div className="flex justify-between text-[10px] font-bold mb-1.5 uppercase">
                      <span className="text-slate-600">{sector.name}</span>
                      <span className="text-primary">{sector.pct}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${sector.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/deals"
                className="w-full mt-8 border border-slate-200 text-slate-400 py-2 rounded text-[9px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
              >
                Detailed Analytics <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Compliance Notice */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex items-start space-x-3">
              <div className="bg-white p-1.5 rounded border border-slate-100 text-primary shrink-0">
                <Info className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-primary uppercase tracking-wide">Compliance Notice</h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                  Quarterly asset valuation audits are scheduled for next Monday. Ensure documentation is current.
                </p>
              </div>
            </div>

            {/* Pipeline Summary */}
            <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Pipeline</h3>
                <Link to="/pipeline" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">
                  View
                </Link>
              </div>
              {(["screening", "due_diligence", "ic_approval", "documentation"] as DealStage[]).map(stage => {
                const count = sampleDeals.filter(d => d.stage === stage).length;
                return (
                  <div key={stage} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{stageLabels[stage]}</span>
                    <span className="text-sm font-bold text-primary">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
