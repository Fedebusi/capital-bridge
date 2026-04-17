import AppLayout from "@/components/layout/AppLayout";
import { LoadingSkeleton, EmptyState } from "@/components/LoadingSkeleton";
import DealCard from "@/components/dashboard/DealCard";
import DealImportDialog from "@/components/dashboard/DealImportDialog";
import { DealFormDialog } from "@/components/deals/DealFormDialog";
import { stageLabels, type DealStage } from "@/data/sampleDeals";
import { exportDealsToExcel } from "@/lib/excelDealImport";
import { useDeals } from "@/hooks/useDeals";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Download, Briefcase, Plus } from "lucide-react";

const stages: DealStage[] = ["screening", "due_diligence", "ic_approval", "documentation", "active", "repaid"];

export default function PipelinePage() {
  const { deals, loading } = useDeals();
  const [filter, setFilter] = useState<DealStage | "all">("all");

  if (loading) {
    return <AppLayout><LoadingSkeleton /></AppLayout>;
  }

  const filteredDeals = filter === "all" ? deals : deals.filter(d => d.stage === filter);

  return (
    <AppLayout>
      <div className="space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-primary tracking-tight">Deal Pipeline</h1>
            <p className="text-slate-500 text-base mt-2">Track all deals from screening to repayment</p>
          </div>
          <div className="flex items-center gap-3">
            <DealFormDialog />
            <DealImportDialog />
            <button
              onClick={() => exportDealsToExcel(deals)}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 px-5 py-2.5 rounded-full text-sm font-semibold text-slate-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export Excel
            </button>
          </div>
        </header>

        {/* Stage Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              filter === "all" ? "bg-primary text-white shadow-sm" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
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
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  filter === stage ? "bg-primary text-white shadow-sm" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                )}
              >
                {stageLabels[stage]} ({count})
              </button>
            );
          })}
        </div>

        {/* Deal Grid */}
        {filteredDeals.length === 0 ? (
          deals.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No deals in the pipeline yet"
              description="Start tracking your first deal — originate a new opportunity or import an existing pipeline from Excel."
              action={
                <DealFormDialog
                  trigger={
                    <button className="flex items-center gap-2 rounded-full bg-accent text-white px-5 py-2 text-sm font-semibold hover:bg-accent/90 transition-colors shadow-sm shadow-accent/20">
                      <Plus className="h-4 w-4" />
                      New Deal
                    </button>
                  }
                />
              }
            />
          ) : (
            <EmptyState
              icon={Briefcase}
              title={`No deals in ${stageLabels[filter as DealStage]}`}
              description="No deals match this stage filter. Try a different stage or create a new deal to get started."
              action={
                <button
                  onClick={() => setFilter("all")}
                  className="rounded-full bg-accent text-white px-5 py-2 text-sm font-semibold hover:bg-accent/90 transition-colors"
                >
                  Show all deals
                </button>
              }
            />
          )
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDeals.map((deal, i) => (
              <DealCard key={deal.id} deal={deal} index={i} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
