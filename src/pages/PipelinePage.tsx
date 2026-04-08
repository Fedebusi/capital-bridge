import AppLayout from "@/components/layout/AppLayout";
import DealCard from "@/components/dashboard/DealCard";
import DealImportDialog from "@/components/dashboard/DealImportDialog";
import { DealFormDialog } from "@/components/deals/DealFormDialog";
import { stageLabels, type DealStage } from "@/data/sampleDeals";
import { exportDealsToExcel } from "@/lib/excelDealImport";
import { useDeals } from "@/hooks/useDeals";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";

const stages: DealStage[] = ["screening", "due_diligence", "ic_approval", "documentation", "active", "repaid"];

export default function PipelinePage() {
  const { deals } = useDeals();
  const [filter, setFilter] = useState<DealStage | "all">("all");

  const filteredDeals = filter === "all" ? deals : deals.filter(d => d.stage === filter);

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-extrabold text-primary">Deal Pipeline</h1>
            <p className="text-slate-500 text-sm mt-1">Track all deals from screening to repayment</p>
          </div>
          <div className="flex items-center gap-2">
            <DealFormDialog />
            <DealImportDialog />
            <button
              onClick={() => exportDealsToExcel(deals)}
              className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Export Excel
            </button>
          </div>
        </header>

        {/* Stage Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              filter === "all" ? "bg-primary text-white shadow-sm" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
            )}
          >
            All ({deals.length})
          </button>
          {stages.map(stage => {
            const count = deals.filter(d => d.stage === stage).length;
            return (
              <button
                key={stage}
                onClick={() => setFilter(stage)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  filter === stage ? "bg-primary text-white shadow-sm" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                )}
              >
                {stageLabels[stage]} ({count})
              </button>
            );
          })}
        </div>

        {/* Deal Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeals.map((deal, i) => (
            <DealCard key={deal.id} deal={deal} index={i} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
