import AppLayout from "@/components/layout/AppLayout";
import DueDiligencePanel from "@/components/deals/DueDiligencePanel";
import { useDeals } from "@/hooks/useDeals";
import { sampleDueDiligence } from "@/data/dealModules";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { stageLabels, stageColors, formatMillions } from "@/data/sampleDeals";
import { generateDDReport } from "@/lib/generateDDReport";
import { FileDown } from "lucide-react";

export default function DueDiligencePage() {
  const { deals } = useDeals();
  const dealsWithDD = deals.filter(d => sampleDueDiligence[d.id]);
  const dealsWithoutDD = deals.filter(d => !sampleDueDiligence[d.id] && d.stage !== "repaid" && d.stage !== "rejected");

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Due Diligence</h1>
          <p className="text-slate-500 text-sm mt-1">Track due diligence progress across all active deals</p>
        </div>

        {dealsWithDD.map(deal => {
          const items = sampleDueDiligence[deal.id] || [];
          const completed = items.filter(i => i.status === "completed").length;
          const flagged = items.filter(i => i.status === "flagged").length;
          const pct = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

          return (
            <div key={deal.id} className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", stageColors[deal.stage])}>
                    {stageLabels[deal.stage]}
                  </span>
                  <Link to={`/deals/${deal.id}`} className="font-display text-sm font-semibold text-foreground hover:text-accent transition-colors">
                    {deal.projectName}
                  </Link>
                  <span className="text-xs text-muted-foreground">{formatMillions(deal.loanAmount)}</span>
                </div>
                <div className="flex items-center gap-4">
                  {flagged > 0 && <span className="text-xs text-destructive font-medium">{flagged} flagged</span>}
                  <span className="text-xs text-muted-foreground">{completed}/{items.length} ({pct}%)</span>
                  <button
                    onClick={() => generateDDReport(deal, items)}
                    className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <FileDown className="h-3.5 w-3.5" />
                    PDF Report
                  </button>
                </div>
              </div>
              <div className="p-4">
                <DueDiligencePanel dealId={deal.id} />
              </div>
            </div>
          );
        })}

        {dealsWithoutDD.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">Deals Without DD Checklist</h3>
            <div className="space-y-2">
              {dealsWithoutDD.map(d => (
                <div key={d.id} className="flex items-center justify-between py-2">
                  <Link to={`/deals/${d.id}`} className="text-sm text-foreground hover:text-accent transition-colors">{d.projectName}</Link>
                  <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", stageColors[d.stage])}>{stageLabels[d.stage]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
