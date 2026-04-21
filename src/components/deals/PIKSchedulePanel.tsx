import { generatePIKSchedule, type PIKScheduleEntry } from "@/data/pikEngine";
import { sampleDeals, formatCurrency, formatPercent } from "@/data/sampleDeals";
import { cn } from "@/lib/utils";
import { TrendingUp, AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";

interface PIKSchedulePanelProps {
  dealId: string;
}

export default function PIKSchedulePanel({ dealId }: PIKSchedulePanelProps) {
  const deal = sampleDeals.find(d => d.id === dealId);
  const [showProjected, setShowProjected] = useState(true);

  const pikSummary = useMemo(() => {
    if (!deal || !deal.firstDrawdownDate) return null;
    return generatePIKSchedule({
      dealId: deal.id,
      loanAmount: deal.loanAmount,
      cashRate: deal.interestRate,
      pikSpread: deal.pikSpread,
      tenor: deal.tenor,
      firstDrawdownDate: deal.firstDrawdownDate,
      drawdowns: deal.drawdowns.map(dd => ({
        scheduledDate: dd.scheduledDate,
        amount: dd.amount,
        status: dd.status,
      })),
    });
  }, [deal]);

  if (!pikSummary) {
    return (
      <div className="rounded-2xl bg-slate-50 p-8 text-center">
        <p className="text-sm text-slate-500">No PIK schedule available — deal not yet active</p>
      </div>
    );
  }

  const displaySchedule = showProjected
    ? pikSummary.schedule
    : pikSummary.schedule.slice(0, pikSummary.currentMonthIndex + 1);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Total PIK Accrued (to date)" value={formatCurrency(pikSummary.totalCashInterestToDate + pikSummary.totalPIKAccruedToDate)} accent />
        <SummaryCard label="Cash Interest (to date)" value={formatCurrency(pikSummary.totalCashInterestToDate)} />
        <SummaryCard label="PIK Spread (to date)" value={formatCurrency(pikSummary.totalPIKAccruedToDate)} />
        <SummaryCard label="Projected at Maturity" value={formatCurrency(pikSummary.projectedPIKAtMaturity)} warn />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-primary flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-accent" />
          Monthly Accrual Schedule
        </h3>
        <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
          <input
            type="checkbox"
            checked={showProjected}
            onChange={() => setShowProjected(!showProjected)}
            className="rounded border-border"
          />
          Show projected months
        </label>
      </div>

      {/* Schedule Table */}
      <div className="rounded-2xl bg-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-3 py-2.5 text-left text-[11px] font-medium text-slate-500">Month</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-medium text-slate-500">Date</th>
                <th className="px-3 py-2.5 text-right text-[11px] font-medium text-slate-500">Opening Principal</th>
                <th className="px-3 py-2.5 text-right text-[11px] font-medium text-slate-500">Drawdown</th>
                <th className="px-3 py-2.5 text-right text-[11px] font-medium text-slate-500">Cash Interest</th>
                <th className="px-3 py-2.5 text-right text-[11px] font-medium text-slate-500">PIK Accrual</th>
                <th className="px-3 py-2.5 text-right text-[11px] font-medium text-slate-500">Closing PIK</th>
                <th className="px-3 py-2.5 text-right text-[11px] font-medium text-slate-500">Total Exposure</th>
              </tr>
            </thead>
            <tbody>
              {displaySchedule.map((entry, i) => {
                const isPast = i <= pikSummary.currentMonthIndex;
                const isCurrent = i === pikSummary.currentMonthIndex;
                return (
                  <tr
                    key={entry.month}
                    className={cn(
                      "border-b border-slate-100 last:border-0 transition-colors",
                      isCurrent ? "bg-accent/5 font-medium" : isPast ? "" : "text-slate-500/70"
                    )}
                  >
                    <td className="px-3 py-2">{entry.month}</td>
                    <td className="px-3 py-2">
                      {entry.date}
                      {isCurrent && <span className="ml-1.5 text-xs rounded px-1.5 py-0.5 bg-accent/10 text-accent font-semibold">CURRENT</span>}
                    </td>
                    <td className="px-3 py-2 text-right">{formatCurrency(entry.openingPrincipal)}</td>
                    <td className="px-3 py-2 text-right">{entry.drawdown > 0 ? formatCurrency(entry.drawdown) : "—"}</td>
                    <td className="px-3 py-2 text-right text-primary">{formatCurrency(entry.cashInterest)}</td>
                    <td className="px-3 py-2 text-right text-primary">{formatCurrency(entry.pikAccrual)}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(entry.closingPIK)}</td>
                    <td className="px-3 py-2 text-right font-semibold">{formatCurrency(entry.closingExposure)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, accent, warn }: { label: string; value: string; accent?: boolean; warn?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-3">
      <p className="text-[11px] text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={cn("font-display text-lg font-bold mt-0.5",
        accent ? "text-accent" : warn ? "text-warning" : "text-primary"
      )}>{value}</p>
    </div>
  );
}
