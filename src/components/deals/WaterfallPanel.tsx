import { sampleWaterfalls } from "@/data/waterfallData";
import { formatCurrency, formatPercent } from "@/data/sampleDeals";
import { cn } from "@/lib/utils";
import { ArrowDown, Banknote, CheckCircle2, Clock } from "lucide-react";

interface WaterfallPanelProps {
  dealId: string;
}

export default function WaterfallPanel({ dealId }: WaterfallPanelProps) {
  const wf = sampleWaterfalls[dealId];

  if (!wf) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">No waterfall / release price schedule configured for this deal</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Mandatory Prepayment Rate" value="100% of Release Price" />
        <SummaryCard label="Cash Sweep" value={`${wf.cashSweepRate}% of excess`} />
        <SummaryCard label="Total Prepayment (projected)" value={formatCurrency(wf.totalMandatoryPrepayment)} accent />
        <SummaryCard label="Balloon at Maturity (est.)" value={formatCurrency(wf.projectedBalloonAtMaturity)} warn />
      </div>

      {/* Release Price Schedule */}
      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-display text-sm font-semibold text-primary flex items-center gap-2">
            <Banknote className="h-4 w-4 text-accent" /> Release Price per Unit
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Minimum prepayment required to release mortgage on each unit</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Unit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Type</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">List Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Release Price</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">RP %</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Sale Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Prepayment</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">To Promoter</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {wf.releasePrices.map(rp => (
                <tr key={rp.unit} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-primary">{rp.unit}</td>
                  <td className="px-4 py-3 text-slate-500">{rp.type}</td>
                  <td className="px-4 py-3 text-right text-primary">{formatCurrency(rp.listPrice)}</td>
                  <td className="px-4 py-3 text-right font-medium text-accent">{formatCurrency(rp.releasePrice)}</td>
                  <td className="px-4 py-3 text-center text-slate-500">{rp.releasePricePercent}%</td>
                  <td className="px-4 py-3 text-right text-primary">{rp.salePrice ? formatCurrency(rp.salePrice) : "—"}</td>
                  <td className="px-4 py-3 text-right text-primary">{rp.mandatoryPrepayment ? formatCurrency(rp.mandatoryPrepayment) : "—"}</td>
                  <td className="px-4 py-3 text-right text-primary">{rp.excessToPromoter ? formatCurrency(rp.excessToPromoter) : "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium",
                      rp.status === "released" || rp.status === "paid" ? "bg-emerald-100 text-emerald-700" :
                      rp.status === "sale_pending" ? "bg-amber-100 text-amber-700" :
                      "bg-muted text-slate-500"
                    )}>
                      {rp.status === "unreleased" ? "Unreleased" :
                       rp.status === "sale_pending" ? "Sale Pending" :
                       rp.status === "released" ? "Released" : "Paid"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Waterfall Flow */}
      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-display text-sm font-semibold text-primary flex items-center gap-2">
            <ArrowDown className="h-4 w-4 text-accent" /> Payment Waterfall
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Chronological cash flow from sales to repayment</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Event</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Gross</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Prepayment</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Fees</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">To Promoter</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Remaining Principal</th>
              </tr>
            </thead>
            <tbody>
              {wf.waterfall.map((w, i) => (
                <tr key={i} className={cn("border-b border-slate-100 last:border-0",
                  w.type === "balloon" ? "bg-accent/5 font-medium" : ""
                )}>
                  <td className="px-4 py-3 text-primary">{w.date}</td>
                  <td className="px-4 py-3 text-primary">{w.description}</td>
                  <td className="px-4 py-3 text-right text-primary">{w.grossAmount > 0 ? formatCurrency(w.grossAmount) : "—"}</td>
                  <td className="px-4 py-3 text-right text-accent">{w.mandatoryPrepayment > 0 ? formatCurrency(w.mandatoryPrepayment) : "—"}</td>
                  <td className="px-4 py-3 text-right text-primary">{w.feePayment > 0 ? formatCurrency(w.feePayment) : "—"}</td>
                  <td className="px-4 py-3 text-right text-primary">{w.netToPromoter > 0 ? formatCurrency(w.netToPromoter) : "—"}</td>
                  <td className="px-4 py-3 text-right font-medium text-primary">{formatCurrency(w.remainingPrincipal)}</td>
                </tr>
              ))}
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
      <p className={cn("font-display text-sm font-bold mt-0.5",
        accent ? "text-accent" : warn ? "text-warning" : "text-primary"
      )}>{value}</p>
    </div>
  );
}
