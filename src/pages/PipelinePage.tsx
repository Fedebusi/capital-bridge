import AppLayout from "@/components/layout/AppLayout";
import DealCard from "@/components/dashboard/DealCard";
import { sampleDeals, stageLabels, type DealStage } from "@/data/sampleDeals";
import { useState } from "react";
import { cn } from "@/lib/utils";

const stages: DealStage[] = ["screening", "due_diligence", "ic_approval", "documentation", "active", "repaid"];

export default function PipelinePage() {
  const [filter, setFilter] = useState<DealStage | "all">("all");
  
  const filteredDeals = filter === "all" ? sampleDeals : sampleDeals.filter(d => d.stage === filter);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Deal Pipeline</h1>
          <p className="text-slate-500 text-sm mt-1">Track all deals from screening to repayment</p>
        </div>

        {/* Stage Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              filter === "all" ? "bg-primary text-white shadow-sm" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
            )}
          >
            All ({sampleDeals.length})
          </button>
          {stages.map(stage => {
            const count = sampleDeals.filter(d => d.stage === stage).length;
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
