import AppLayout from "@/components/layout/AppLayout";
import { sampleDeals, formatCurrency } from "@/data/sampleDeals";
import { generatePIKSchedule } from "@/data/pikEngine";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

export default function PIKEnginePage() {
  const activeDeals = sampleDeals.filter(d => d.stage === "active" && d.firstDrawdownDate);

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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">PIK Engine & Interest Accrual</h1>
          <p className="text-slate-500 text-sm mt-1">Monthly interest calculation, PIK capitalization, and exposure projection across active deals</p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Total Principal Outstanding" value={formatCurrency(totalPrincipal)} />
          <MetricCard label="Total PIK Accrued" value={formatCurrency(totalPIK)} accent />
          <MetricCard label="Total Exposure" value={formatCurrency(totalExposure)} />
          <MetricCard label="Active Deals" value={`${summaries.length}`} />
        </div>

        {/* Per-Deal Table */}
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" /> Interest Accrual by Deal
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Project</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Rate</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Principal</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">PIK Accrued</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Total Exposure</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Monthly Accrual</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Proj. PIK at Maturity</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Proj. Exposure at Maturity</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Month</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map(({ deal, pik, current }) => (
                  <tr key={deal.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/deals/${deal.id}`} className="font-medium text-foreground hover:text-primary transition-colors">{deal.projectName}</Link>
                    </td>
                    <td className="px-4 py-3 text-center text-foreground">{deal.interestRate}% + {deal.pikSpread}%</td>
                    <td className="px-4 py-3 text-right text-foreground">{formatCurrency(current?.closingPrincipal || 0)}</td>
                    <td className="px-4 py-3 text-right text-accent font-medium">{formatCurrency(current?.closingPIK || 0)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">{formatCurrency(current?.closingExposure || 0)}</td>
                    <td className="px-4 py-3 text-right text-primary">{formatCurrency((current?.cashInterest || 0) + (current?.pikAccrual || 0))}</td>
                    <td className="px-4 py-3 text-right text-warning">{formatCurrency(pik.projectedPIKAtMaturity)}</td>
                    <td className="px-4 py-3 text-right text-warning font-medium">{formatCurrency(pik.projectedTotalExposureAtMaturity)}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{pik.currentMonthIndex + 1}/{deal.tenor}</td>
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
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={cn("font-display text-xl font-bold mt-1", accent ? "text-accent" : "text-foreground")}>{value}</p>
    </div>
  );
}
