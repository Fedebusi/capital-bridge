import AppLayout from "@/components/layout/AppLayout";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import LifecycleProgressBar from "@/components/deals/LifecycleProgressBar";
import { useDeals } from "@/hooks/useDeals";
import { useLifecycleForDeal } from "@/hooks/useDealSubdata";
import { stageLabels, stageColors, formatMillions, type Deal } from "@/data/sampleDeals";
import {
  type DealLifecycle,
  getCurrentPhaseNumber,
  getLifecycleProgress,
} from "@/data/lifecyclePhases";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Flag, Users, ArrowRight } from "lucide-react";

export default function LifecyclePage() {
  const { deals, loading } = useDeals();

  if (loading) {
    return <AppLayout><LoadingSkeleton /></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-primary tracking-tight">Deal Lifecycle</h1>
          <p className="text-slate-500 text-sm mt-1">12-phase workflow from origination to close-out — agents, milestones, and progress tracking</p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Completed</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-accent" /> In Progress</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-destructive" /> Blocked</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" /> Not Started</span>
        </div>

        {/* Deal Cards with Lifecycle */}
        <div className="space-y-4">
          {deals.map((deal) => (
            <DealLifecycleCard key={deal.id} deal={deal} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

function DealLifecycleCard({ deal }: { deal: Deal }) {
  const { data: lifecycle } = useLifecycleForDeal(deal.id);
  if (!lifecycle) return null;
  return <DealLifecycleCardContent deal={deal} lifecycle={lifecycle} />;
}

function DealLifecycleCardContent({ deal, lifecycle }: { deal: Deal; lifecycle: DealLifecycle }) {
  const progress = getLifecycleProgress(lifecycle);
  const currentPhaseNum = getCurrentPhaseNumber(lifecycle);
  const currentPhase = lifecycle.phases.find((p) => p.id === lifecycle.currentPhase);
  const blockedPhases = lifecycle.phases.filter((p) => p.status === "blocked");
  const pendingMilestones = lifecycle.phases
    .flatMap((p) => p.milestones.filter((m) => !m.achieved))
    .slice(0, 3);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", stageColors[deal.stage])}>
              {stageLabels[deal.stage]}
            </span>
            <Link to={`/deals/${deal.id}`} className="font-display text-sm font-semibold text-primary hover:text-accent transition-colors">
              {deal.projectName}
            </Link>
            <span className="text-xs text-slate-500">{formatMillions(deal.loanAmount)}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Phase {currentPhaseNum}/12</span>
            <span className="text-xs font-semibold text-accent">{progress}%</span>
            <Link to={`/deals/${deal.id}`} className="flex items-center gap-1 text-xs text-accent hover:underline">
              View detail <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Progress Bar */}
        <LifecycleProgressBar lifecycle={lifecycle} />
      </div>

      {/* Current Phase + Next Milestones */}
      <div className="p-4 grid lg:grid-cols-3 gap-4">
        {/* Current Phase */}
        <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
          <p className="text-[11px] text-slate-500 uppercase tracking-wide mb-1">Current Phase</p>
          <p className="text-sm font-semibold text-primary">{currentPhase?.number}. {currentPhase?.name}</p>
          {currentPhase && (
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <Users className="h-3 w-3" />
              <span>{currentPhase.agents.slice(0, 3).map((a) => a.name).join(", ")}</span>
            </div>
          )}
        </div>

        {/* Next Milestones */}
        <div className="rounded-lg border border-slate-100 p-3">
          <p className="text-[11px] text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
            <Flag className="h-3 w-3" /> Next Milestones
          </p>
          {pendingMilestones.length > 0 ? (
            <ul className="space-y-1">
              {pendingMilestones.map((m, i) => (
                <li key={i} className="text-xs text-primary truncate">• {m.description}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-600 font-medium">All milestones achieved ✓</p>
          )}
        </div>

        {/* Blockers / Alerts */}
        <div className="rounded-lg border border-slate-100 p-3">
          <p className="text-[11px] text-slate-500 uppercase tracking-wide mb-1">Blockers</p>
          {blockedPhases.length > 0 ? (
            blockedPhases.map((p) => (
              <p key={p.id} className="text-xs text-destructive">⚠ {p.name}: {p.substeps.find((s) => s.status === "blocked")?.notes || "Blocked"}</p>
            ))
          ) : (
            <p className="text-xs text-emerald-600 font-medium">No blockers ✓</p>
          )}
        </div>
      </div>
    </div>
  );
}
