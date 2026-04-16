import { useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { formatMillions, formatPercent, stageLabels, stageColors, type DealStage } from "@/data/sampleDeals";
import { useDeals } from "@/hooks/useDeals";
import { exportDealsToExcel } from "@/lib/excelDealImport";
import { cn } from "@/lib/utils";
import { Search, ArrowUpDown, TrendingUp, Wallet, ShieldCheck, Building2, Download } from "lucide-react";

const filterStages: { label: string; value: DealStage | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Repaid", value: "repaid" },
  { label: "Documentation", value: "documentation" },
  { label: "IC Approval", value: "ic_approval" },
  { label: "Due Diligence", value: "due_diligence" },
  { label: "Screening", value: "screening" },
];

export default function LoanBookPage() {
  const { deals: allDeals, loading } = useDeals();
  const [activeFilter, setActiveFilter] = useState<DealStage | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"loanAmount" | "ltv" | "totalRate" | "maturity">("loanAmount");

  if (loading) {
    return <AppLayout><LoadingSkeleton /></AppLayout>;
  }

  const filtered = allDeals
    .filter(d => activeFilter === "all" ? d.stage !== "rejected" : d.stage === activeFilter)
    .filter(d => searchQuery === "" || d.projectName.toLowerCase().includes(searchQuery.toLowerCase()) || d.borrower.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "loanAmount") return b.loanAmount - a.loanAmount;
      if (sortBy === "ltv") return b.ltv - a.ltv;
      if (sortBy === "totalRate") return b.totalRate - a.totalRate;
      return a.expectedMaturity.localeCompare(b.expectedMaturity);
    });

  const totalExposure = filtered.reduce((s, d) => s + d.totalExposure, 0);
  const totalFacilities = filtered.reduce((s, d) => s + d.loanAmount, 0);
  const avgLTV = filtered.length > 0 ? filtered.reduce((s, d) => s + d.ltv, 0) / filtered.length : 0;
  const avgRate = filtered.length > 0 ? filtered.reduce((s, d) => s + d.totalRate, 0) / filtered.length : 0;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-primary tracking-tight">Loan Book</h1>
            <p className="text-slate-500 text-base mt-2">Active and historical loan positions</p>
          </div>
          <button
            onClick={() => exportDealsToExcel(filtered)}
            className="bg-slate-50 hover:bg-slate-100 px-5 py-2.5 rounded-full text-sm font-semibold text-slate-700 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export to Excel
          </button>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-2xl bg-slate-50 p-7 hover:bg-slate-100/70 transition-colors">
            <p className="text-sm text-slate-500 font-medium">Total Facilities</p>
            <p className="text-3xl font-bold text-primary mt-4 tracking-tight">{formatMillions(totalFacilities)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-7 hover:bg-slate-100/70 transition-colors">
            <p className="text-sm text-slate-500 font-medium">Total Exposure</p>
            <p className="text-3xl font-bold text-primary mt-4 tracking-tight">{formatMillions(totalExposure)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-7 hover:bg-slate-100/70 transition-colors">
            <p className="text-sm text-slate-500 font-medium">Avg LTV</p>
            <p className="text-3xl font-bold text-primary mt-4 tracking-tight">{formatPercent(avgLTV)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-7 hover:bg-slate-100/70 transition-colors">
            <p className="text-sm text-slate-500 font-medium">Avg Rate</p>
            <p className="text-3xl font-bold text-accent mt-4 tracking-tight">{formatPercent(avgRate)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {filterStages.map(f => {
              const count = f.value === "all"
                ? allDeals.filter(d => d.stage !== "rejected").length
                : allDeals.filter(d => d.stage === f.value).length;
              return (
                <button
                  key={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    activeFilter === f.value
                      ? "bg-primary text-white shadow-sm"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  )}
                >
                  {f.label} ({count})
                </button>
              );
            })}
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="bg-slate-50 border-0 rounded-full py-2.5 pl-11 pr-5 text-sm w-64 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-accent/30 transition-all"
              placeholder="Search deals..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-6 py-3">Project</th>
                  <th className="px-6 py-3">Stage</th>
                  <th className="px-6 py-3 cursor-pointer hover:text-slate-600" onClick={() => setSortBy("loanAmount")}>
                    <span className="flex items-center gap-1">Facility <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="px-6 py-3">Disbursed</th>
                  <th className="px-6 py-3">PIK Accrued</th>
                  <th className="px-6 py-3 cursor-pointer hover:text-slate-600" onClick={() => setSortBy("totalRate")}>
                    <span className="flex items-center gap-1">Rate <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="px-6 py-3 cursor-pointer hover:text-slate-600" onClick={() => setSortBy("ltv")}>
                    <span className="flex items-center gap-1">LTV <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="px-6 py-3">Construction</th>
                  <th className="px-6 py-3 cursor-pointer hover:text-slate-600" onClick={() => setSortBy("maturity")}>
                    <span className="flex items-center gap-1">Maturity <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {filtered.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/deals/${d.id}`} className="group">
                        <div className="font-bold text-primary group-hover:text-slate-600 transition-colors">{d.projectName}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{d.borrower} · {d.location}</div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2 py-0.5 rounded text-[11px] font-bold uppercase", stageColors[d.stage])}>
                        {stageLabels[d.stage]}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">{formatMillions(d.loanAmount)}</td>
                    <td className="px-6 py-4 text-slate-600">{formatMillions(d.disbursedAmount)}</td>
                    <td className="px-6 py-4 text-emerald-600 font-bold">{formatMillions(d.accruedPIK)}</td>
                    <td className="px-6 py-4 font-bold text-primary">{formatPercent(d.totalRate)}</td>
                    <td className="px-6 py-4">
                      <span className={cn("font-bold", d.ltv > 65 ? "text-amber-500" : "text-primary")}>
                        {formatPercent(d.ltv)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${d.constructionProgress}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-400">{d.constructionProgress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{d.expectedMaturity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing {filtered.length} of {allDeals.length} deals
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
