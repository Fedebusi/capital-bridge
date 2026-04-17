import AppLayout from "@/components/layout/AppLayout";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import DueDiligencePanel from "@/components/deals/DueDiligencePanel";
import { useDeals } from "@/hooks/useDeals";
import { useDDItemsForDeal } from "@/hooks/useDealSubdata";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { stageLabels, stageColors, formatMillions, type Deal } from "@/data/sampleDeals";
import { generateDDReport } from "@/lib/generateDDReport";
import { FileDown } from "lucide-react";

function DealDDRow({ deal }: { deal: Deal }) {
  const { data: items } = useDDItemsForDeal(deal.id);
  if (items.length === 0) return null;

  const completed = items.filter((i) => i.status === "completed").length;
  const flagged = items.filter((i) => i.status === "flagged").length;
  const pct = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", stageColors[deal.stage])}>
            {stageLabels[deal.stage]}
          </span>
          <Link to={`/deals/${deal.id}`} className="font-display text-sm font-semibold text-primary hover:text-accent transition-colors">
            {deal.projectName}
          </Link>
          <span className="text-xs text-slate-500">{formatMillions(deal.loanAmount)}</span>
        </div>
        <div className="flex items-center gap-4">
          {flagged > 0 && <span className="text-xs text-destructive font-medium">{flagged} flagged</span>}
          <span className="text-xs text-slate-500">{completed}/{items.length} ({pct}%)</span>
          <button
            onClick={() => generateDDReport(deal, items)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-background px-3 py-1.5 text-xs font-medium text-primary hover:bg-muted transition-colors"
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
}

export default function DueDiligencePage() {
  const { deals, loading } = useDeals();

  if (loading) {
    return <AppLayout><LoadingSkeleton /></AppLayout>;
  }

  const activeDeals = deals.filter((d) => d.stage !== "repaid" && d.stage !== "rejected");

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-primary tracking-tight">Due Diligence</h1>
          <p className="text-slate-500 text-sm mt-1">Track due diligence progress across all active deals</p>
        </div>

        {activeDeals.map((deal) => (
          <DealDDRow key={deal.id} deal={deal} />
        ))}
      </div>
    </AppLayout>
  );
}
