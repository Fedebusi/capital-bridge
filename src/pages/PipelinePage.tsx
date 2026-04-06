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
          <h1 className="font-display text-2xl font-bold text-foreground">Deal Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-1">Track all deals from screening to repayment</p>
        </div>

        {/* Stage Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
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
                  filter === stage ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
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
