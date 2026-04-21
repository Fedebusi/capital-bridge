import AppLayout from "@/components/layout/AppLayout";
import { LoadingSkeleton, EmptyState } from "@/components/LoadingSkeleton";
import DueDiligencePanel from "@/components/deals/DueDiligencePanel";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { useDeals } from "@/hooks/useDeals";
import { useDDItemsForDeal } from "@/hooks/useDealSubdata";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { stageLabels, stageColors, formatMillions, type Deal } from "@/data/sampleDeals";
import { generateDDReport } from "@/lib/generateDDReport";
import { exportToExcel, stampedFilename } from "@/lib/exports/exportToExcel";
import { exportToCsv } from "@/lib/exports/exportToCsv";
import { ddItemRow } from "@/lib/exports/rowBuilders";
import type { DDItem } from "@/data/dealModules";
import { FileDown, ClipboardList } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

function DealDDRow({
  deal,
  onItems,
}: {
  deal: Deal;
  onItems: (dealId: string, dealName: string, items: DDItem[]) => void;
}) {
  const { data: items } = useDDItemsForDeal(deal.id);
  useEffect(() => {
    onItems(deal.id, deal.projectName, items);
  }, [deal.id, deal.projectName, items, onItems]);
  if (items.length === 0) return null;

  const completed = items.filter((i) => i.status === "completed").length;
  const flagged = items.filter((i) => i.status === "flagged").length;
  const pct = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

  return (
    <div className="rounded-2xl bg-slate-50 overflow-hidden">
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
            className="flex items-center gap-1.5 rounded-full bg-white border border-slate-100 px-3 py-1.5 text-xs font-medium text-primary hover:bg-slate-50 transition-colors"
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
  const navigate = useNavigate();
  const [itemsByDeal, setItemsByDeal] = useState<Record<string, { name: string; items: DDItem[] }>>({});

  const registerItems = useCallback((dealId: string, dealName: string, items: DDItem[]) => {
    setItemsByDeal((prev) => {
      const existing = prev[dealId];
      if (existing && existing.items === items && existing.name === dealName) return prev;
      return { ...prev, [dealId]: { name: dealName, items } };
    });
  }, []);

  const allDdRows = Object.values(itemsByDeal).flatMap(({ name, items }) =>
    items.map((it) => ddItemRow(name, it)),
  );

  if (loading) {
    return <AppLayout><LoadingSkeleton /></AppLayout>;
  }

  const activeDeals = deals.filter((d) => d.stage !== "repaid" && d.stage !== "rejected");

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary tracking-tight">Due Diligence</h1>
            <p className="text-slate-500 text-base mt-2">Track due diligence progress across all active deals</p>
          </div>
          <ExportMenu
            disabled={allDdRows.length === 0}
            onExcel={() =>
              exportToExcel(stampedFilename("DueDiligence"), [
                { name: "DD Items", rows: allDdRows },
              ])
            }
            onCsv={() => exportToCsv(stampedFilename("DueDiligence"), allDdRows)}
          />
        </div>

        {activeDeals.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No active deals to diligence"
            description="Due diligence checklists appear here for deals in screening, DD, IC approval, or documentation. Add a deal to the pipeline to get started."
            action={
              <button
                onClick={() => navigate("/pipeline")}
                className="rounded-full bg-accent text-white px-5 py-2 text-sm font-semibold hover:bg-accent/90 transition-colors"
              >
                Go to Pipeline
              </button>
            }
          />
        ) : (
          activeDeals.map((deal) => <DealDDRow key={deal.id} deal={deal} onItems={registerItems} />)
        )}
      </div>
    </AppLayout>
  );
}
