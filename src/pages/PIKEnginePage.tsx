import AppLayout from "@/components/layout/AppLayout";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { useDeals } from "@/hooks/useDeals";
import { formatCurrency } from "@/data/sampleDeals";
import { generatePIKSchedule } from "@/data/pikEngine";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import { exportToExcel, stampedFilename } from "@/lib/exports/exportToExcel";
import { exportToCsv } from "@/lib/exports/exportToCsv";

export default function PIKEnginePage() {
  const { deals, loading } = useDeals();

  if (loading) {
    return <AppLayout><LoadingSkeleton /></AppLayout>;
  }

  const activeDeals = deals.filter(d => d.stage === "active" && d.firstDrawdownDate);

  const summaries = activeDeals.map(deal => {
    const pik = generatePIKSchedule({
      dealId: deal.id,
      loanAmount: deal.loanAmount,
      cashRate: deal.interestRate,
      pikSpread: deal.pikSpread,
      tenor: deal.tenor,
      firstDrawdownDate: deal.firstDrawdownDate!,
      drawdowns: deal.drawdowns.map(dd => ({ scheduledDate: dd.scheduledDate, amount: dd.amount, status: dd.status })),
    });
    const current = pik.schedule[pik.currentMonthIndex];
    return { deal, pik, current };
  });

  const totalExposure = summaries.reduce((s, x) => s + (x.current?.closingExposure || 0), 0);
  const totalPIK = summaries.reduce((s, x) => s + (x.current?.closingPIK || 0), 0);
  const totalPrincipal = summaries.reduce((s, x) => s + (x.current?.closingPrincipal || 0), 0);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary tracking-tight">PIK Engine & Interest Accrual</h1>
            <p className="text-slate-500 text-base mt-2">Monthly interest calculation, PIK capitalization, and exposure projection across active deals</p>
          </div>
          <ExportMenu
            disabled={summaries.length === 0}
            onExcel={() => {
              const summaryRows = summaries.map(({ deal, pik, current }) => ({
                Project: deal.projectName,
                "Cash Rate (%)": deal.interestRate,
                "PIK Spread (%)": deal.pikSpread,
                "Principal (EUR)": current?.closingPrincipal ?? 0,
                "PIK Accrued (EUR)": current?.closingPIK ?? 0,
                "Total Exposure (EUR)": current?.closingExposure ?? 0,
                "Monthly Accrual (EUR)": (current?.cashInterest ?? 0) + (current?.pikAccrual ?? 0),
                "Projected PIK at Maturity (EUR)": pik.projectedPIKAtMaturity,
                "Projected Exposure at Maturity (EUR)": pik.projectedTotalExposureAtMaturity,
                "Month": `${pik.currentMonthIndex + 1}/${deal.tenor}`,
              }));
              const scheduleRows = summaries.flatMap(({ deal, pik }) =>
                pik.schedule.map((e) => ({
                  Deal: deal.projectName,
                  Month: e.month,
                  Date: e.date,
                  "Opening Principal (EUR)": e.openingPrincipal,
                  "Opening PIK (EUR)": e.openingPIK,
                  "Drawdown (EUR)": e.drawdown,
                  "Repayment (EUR)": e.repayment,
                  "Cash Interest (EUR)": e.cashInterest,
                  "PIK Accrual (EUR)": e.pikAccrual,
                  "Closing Principal (EUR)": e.closingPrincipal,
                  "Closing PIK (EUR)": e.closingPIK,
                  "Closing Exposure (EUR)": e.closingExposure,
                })),
              );
              exportToExcel(stampedFilename("PIKEngine"), [
                { name: "Summary", rows: summaryRows },
                { name: "Schedule", rows: scheduleRows },
              ]);
            }}
            onCsv={() =>
              exportToCsv(
                stampedFilename("PIKEngine"),
                summaries.map(({ deal, pik, current }) => ({
                  Project: deal.projectName,
                  "Principal (EUR)": current?.closingPrincipal ?? 0,
                  "PIK Accrued (EUR)": current?.closingPIK ?? 0,
                  "Total Exposure (EUR)": current?.closingExposure ?? 0,
                  "Projected Exposure at Maturity (EUR)": pik.projectedTotalExposureAtMaturity,
                })),
              )
            }
          />
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <MetricCard label="Total Principal Outstanding" value={formatCurrency(totalPrincipal)} />
          <MetricCard label="Total PIK Accrued" value={formatCurrency(totalPIK)} accent />
          <MetricCard label="Total Exposure" value={formatCurrency(totalExposure)} />
          <MetricCard label="Active Deals" value={`${summaries.length}`} />
        </div>

        {/* Per-Deal Table */}
        <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-display text-sm font-semibold text-primary flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" /> Interest Accrual by Deal
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Project</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Rate</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Principal</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">PIK Accrued</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Total Exposure</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Monthly Accrual</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Proj. PIK at Maturity</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Proj. Exposure at Maturity</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Month</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map(({ deal, pik, current }) => (
                  <tr key={deal.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/deals/${deal.id}`} className="font-medium text-primary hover:text-primary transition-colors">{deal.projectName}</Link>
                    </td>
                    <td className="px-4 py-3 text-center text-primary">{deal.interestRate}% + {deal.pikSpread}%</td>
                    <td className="px-4 py-3 text-right text-primary">{formatCurrency(current?.closingPrincipal || 0)}</td>
                    <td className="px-4 py-3 text-right text-accent font-medium">{formatCurrency(current?.closingPIK || 0)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-primary">{formatCurrency(current?.closingExposure || 0)}</td>
                    <td className="px-4 py-3 text-right text-primary">{formatCurrency((current?.cashInterest || 0) + (current?.pikAccrual || 0))}</td>
                    <td className="px-4 py-3 text-right text-warning">{formatCurrency(pik.projectedPIKAtMaturity)}</td>
                    <td className="px-4 py-3 text-right text-warning font-medium">{formatCurrency(pik.projectedTotalExposureAtMaturity)}</td>
                    <td className="px-4 py-3 text-center text-slate-500">{pik.currentMonthIndex + 1}/{deal.tenor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-6 hover:bg-slate-100/70 transition-colors">
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className={cn("text-2xl font-bold mt-3 tracking-tight", accent ? "text-accent" : "text-primary")}>{value}</p>
    </div>
  );
}
