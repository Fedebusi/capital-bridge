import AppLayout from "@/components/layout/AppLayout";
import { LoadingSkeleton, EmptyState } from "@/components/shared/LoadingSkeleton";
import DealCard from "@/components/dashboard/DealCard";
import DealImportDialog from "@/components/dashboard/DealImportDialog";
import { DealFormDialog } from "@/components/deals/DealFormDialog";
import PipelineJourneyRail from "@/components/pipeline/PipelineJourneyRail";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { stageLabels, type DealStage } from "@/data/sampleDeals";
import { exportToExcel, stampedFilename } from "@/lib/exports/exportToExcel";
import { exportToCsv } from "@/lib/exports/exportToCsv";
import { downloadDealTemplateXlsx } from "@/lib/exports/dealTemplate";
import { dealRow } from "@/lib/exports/rowBuilders";
import { useDeals } from "@/hooks/useDeals";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Briefcase, Plus, Search } from "lucide-react";

const stages: DealStage[] = ["screening", "due_diligence", "ic_approval", "documentation", "active", "repaid"];

export default function PipelinePage() {
  const { deals, loading } = useDeals();
  const [filter, setFilter] = useState<DealStage | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDeals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return deals.filter((d) => {
      if (filter !== "all" && d.stage !== filter) return false;
      if (!q) return true;
      return (
        d.projectName.toLowerCase().includes(q) ||
        d.borrower.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q)
      );
    });
  }, [deals, filter, searchQuery]);

  if (loading) {
    return <AppLayout><LoadingSkeleton /></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary tracking-tight">Deal Pipeline</h1>
            <p className="text-slate-500 text-base mt-2">
              Track every deal along its 12-phase journey — from origination to close-out.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <DealFormDialog />
            <DealImportDialog />
            <ExportMenu
              disabled={filteredDeals.length === 0}
              onExcel={() =>
                exportToExcel(stampedFilename("Pipeline"), [
                  { name: "Pipeline", rows: filteredDeals.map(dealRow) },
                ])
              }
              onCsv={() => exportToCsv(stampedFilename("Pipeline"), filteredDeals.map(dealRow))}
              onTemplate={downloadDealTemplateXlsx}
              templateLabel="Download deal template"
            />
          </div>
        </header>

        {/* Journey Rail */}
        {deals.length > 0 && <PipelineJourneyRail deals={deals} />}

        {/* Search + stage filters */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative md:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by project, borrower, or location…"
                className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-primary placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                aria-label="Search deals"
              />
            </div>
          </div>

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
              title={
                searchQuery.trim()
                  ? "No deals match your search"
                  : `No deals in ${stageLabels[filter as DealStage]}`
              }
              description={
                searchQuery.trim()
                  ? "Try a different search term or clear filters to see the full pipeline."
                  : "No deals match this stage filter. Try a different stage or create a new deal to get started."
              }
              action={
                <button
                  onClick={() => {
                    setFilter("all");
                    setSearchQuery("");
                  }}
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
