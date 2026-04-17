import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { phaseDefinitions, type PhaseId } from "@/data/lifecyclePhases";
import type { Deal } from "@/data/sampleDeals";
import { stageToPhaseId, phaseShortLabels } from "./pipelineStageMap";
import PipelineDealDot from "./PipelineDealDot";

interface PipelineJourneyRailProps {
  deals: Deal[];
  /** Current lowest phase (by number) — controls completed-vs-future styling. */
  activePhaseNumber?: number;
}

/**
 * Horizontal journey visualization of all deals across the 12 lifecycle phases.
 * Each phase is a node on a rail; deals are dots positioned at their current phase.
 * On mobile the rail collapses into a vertical stepper.
 */
export default function PipelineJourneyRail({
  deals,
  activePhaseNumber,
}: PipelineJourneyRailProps) {
  const [hoveredPhase, setHoveredPhase] = useState<PhaseId | null>(null);

  // Group deals by their mapped phaseId. Rejected deals are excluded from the rail.
  const dealsByPhase = useMemo(() => {
    const map = new Map<PhaseId, Deal[]>();
    for (const deal of deals) {
      const phaseId = stageToPhaseId[deal.stage];
      if (!phaseId) continue;
      const arr = map.get(phaseId) ?? [];
      arr.push(deal);
      map.set(phaseId, arr);
    }
    return map;
  }, [deals]);

  // The "furthest" phase number that has any deals — used to decide which
  // sections of the rail render as "completed" (solid) vs "future" (dashed).
  const furthestActive = useMemo(() => {
    if (activePhaseNumber) return activePhaseNumber;
    let max = 0;
    for (const phase of phaseDefinitions) {
      if ((dealsByPhase.get(phase.id)?.length ?? 0) > 0 && phase.number > max) {
        max = phase.number;
      }
    }
    return max;
  }, [dealsByPhase, activePhaseNumber]);

  return (
    <section
      aria-label="Deal lifecycle journey"
      className="rounded-2xl bg-slate-50 p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-primary tracking-tight">
            Lifecycle Journey
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Every deal plotted on its 12-phase path — from origination to close-out.
          </p>
        </div>
        <JourneyLegend />
      </div>

      {/* Desktop / tablet: horizontal rail */}
      <div className="mt-8 hidden md:block">
        <HorizontalRail
          dealsByPhase={dealsByPhase}
          hoveredPhase={hoveredPhase}
          setHoveredPhase={setHoveredPhase}
          furthestActive={furthestActive}
        />
      </div>

      {/* Mobile: vertical stepper */}
      <div className="mt-6 md:hidden">
        <VerticalStepper
          dealsByPhase={dealsByPhase}
          hoveredPhase={hoveredPhase}
          setHoveredPhase={setHoveredPhase}
          furthestActive={furthestActive}
        />
      </div>
    </section>
  );
}

// ===== Legend =====

function JourneyLegend() {
  return (
    <div className="hidden sm:flex items-center gap-4 text-[11px] font-medium text-slate-500">
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Completed
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-accent" />
        Current
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-slate-300" />
        Upcoming
      </span>
    </div>
  );
}

// ===== Horizontal rail =====

interface RailProps {
  dealsByPhase: Map<PhaseId, Deal[]>;
  hoveredPhase: PhaseId | null;
  setHoveredPhase: (id: PhaseId | null) => void;
  furthestActive: number;
}

function HorizontalRail({
  dealsByPhase,
  hoveredPhase,
  setHoveredPhase,
  furthestActive,
}: RailProps) {
  return (
    <div className="overflow-x-auto pb-4 -mx-2 px-2">
      <div className="relative min-w-[1100px]">
        {/* The continuous rail line */}
        <div className="absolute left-0 right-0 top-[76px] h-0.5 flex">
          {phaseDefinitions.map((phase, i) => {
            if (i === phaseDefinitions.length - 1) return null;
            const isCompleted = phase.number < furthestActive;
            return (
              <div
                key={phase.id}
                className={cn(
                  "flex-1",
                  isCompleted
                    ? "bg-emerald-400"
                    : "border-t-2 border-dashed border-slate-300 -mt-[1px]",
                )}
              />
            );
          })}
        </div>

        <div className="relative grid grid-cols-12 gap-1">
          {phaseDefinitions.map((phase) => {
            const phaseDeals = dealsByPhase.get(phase.id) ?? [];
            const isCurrent = phase.number === furthestActive;
            const isCompleted = phase.number < furthestActive;
            const isHighlighted = hoveredPhase === phase.id;

            return (
              <PhaseColumn
                key={phase.id}
                phaseId={phase.id}
                phaseNumber={phase.number}
                phaseName={phaseShortLabels[phase.id]}
                phaseDeals={phaseDeals}
                isCurrent={isCurrent}
                isCompleted={isCompleted}
                isHighlighted={isHighlighted}
                onHover={setHoveredPhase}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ===== Vertical stepper (mobile) =====

function VerticalStepper({
  dealsByPhase,
  hoveredPhase,
  setHoveredPhase,
  furthestActive,
}: RailProps) {
  return (
    <ol className="relative space-y-4 pl-10">
      <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-200" />
      {phaseDefinitions.map((phase) => {
        const phaseDeals = dealsByPhase.get(phase.id) ?? [];
        const isCurrent = phase.number === furthestActive;
        const isCompleted = phase.number < furthestActive;
        const isHighlighted = hoveredPhase === phase.id;
        const hasDeals = phaseDeals.length > 0;

        return (
          <li
            key={phase.id}
            className="relative"
            onMouseEnter={() => setHoveredPhase(phase.id)}
            onMouseLeave={() => setHoveredPhase(null)}
          >
            <PhaseNode
              phaseNumber={phase.number}
              isCurrent={isCurrent}
              isCompleted={isCompleted}
              isHighlighted={isHighlighted}
              hasDeals={hasDeals}
              className="absolute -left-10 top-0"
            />
            <div
              className={cn(
                "rounded-xl bg-white p-3 transition-colors",
                isHighlighted && "ring-2 ring-accent/40",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-primary">
                  {phaseShortLabels[phase.id]}
                </span>
                {hasDeals && (
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
                    {phaseDeals.length}
                  </span>
                )}
              </div>
              {phaseDeals.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {phaseDeals.map((deal, i) => (
                    <PipelineDealDot key={deal.id} deal={deal} stackIndex={0} highlighted={isCurrent && i === 0} />
                  ))}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ===== Phase column (desktop) =====

interface PhaseColumnProps {
  phaseId: PhaseId;
  phaseNumber: number;
  phaseName: string;
  phaseDeals: Deal[];
  isCurrent: boolean;
  isCompleted: boolean;
  isHighlighted: boolean;
  onHover: (id: PhaseId | null) => void;
}

function PhaseColumn({
  phaseId,
  phaseNumber,
  phaseName,
  phaseDeals,
  isCurrent,
  isCompleted,
  isHighlighted,
  onHover,
}: PhaseColumnProps) {
  const hasDeals = phaseDeals.length > 0;

  return (
    <div
      className="flex flex-col items-center"
      onMouseEnter={() => onHover(phaseId)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Deals stacked above the node */}
      <div className="flex h-16 flex-col items-center justify-end gap-1">
        {phaseDeals.slice(0, 3).map((deal, i) => (
          <PipelineDealDot
            key={deal.id}
            deal={deal}
            stackIndex={i}
            highlighted={isHighlighted || isCurrent}
          />
        ))}
        {phaseDeals.length > 3 && (
          <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
            +{phaseDeals.length - 3}
          </span>
        )}
      </div>

      {/* The node */}
      <PhaseNode
        phaseNumber={phaseNumber}
        isCurrent={isCurrent}
        isCompleted={isCompleted}
        isHighlighted={isHighlighted}
        hasDeals={hasDeals}
      />

      {/* Label */}
      <div
        className={cn(
          "mt-3 max-w-[7.5rem] text-center text-[11px] font-semibold leading-tight transition-colors",
          isCurrent
            ? "text-accent"
            : isCompleted
              ? "text-emerald-700"
              : isHighlighted
                ? "text-primary"
                : "text-slate-400",
        )}
      >
        {phaseName}
      </div>
      {hasDeals && (
        <div className="mt-1 text-[10px] font-medium text-slate-500">
          {phaseDeals.length} deal{phaseDeals.length === 1 ? "" : "s"}
        </div>
      )}
    </div>
  );
}

// ===== The phase node (circle on the rail) =====

interface PhaseNodeProps {
  phaseNumber: number;
  isCurrent: boolean;
  isCompleted: boolean;
  isHighlighted: boolean;
  hasDeals: boolean;
  className?: string;
}

function PhaseNode({
  phaseNumber,
  isCurrent,
  isCompleted,
  isHighlighted,
  hasDeals,
  className,
}: PhaseNodeProps) {
  return (
    <div
      className={cn(
        "relative z-10 flex items-center justify-center rounded-full font-bold transition-all duration-200",
        isCurrent
          ? "h-9 w-9 bg-accent text-white text-xs shadow-md shadow-accent/30 ring-4 ring-accent/15"
          : isCompleted
            ? "h-7 w-7 bg-emerald-500 text-white text-[11px]"
            : hasDeals
              ? "h-7 w-7 bg-amber-100 text-amber-700 text-[11px] ring-2 ring-amber-200"
              : "h-6 w-6 bg-white text-slate-400 text-[10px] ring-2 ring-slate-200",
        isHighlighted && !isCurrent && "scale-110",
        className,
      )}
    >
      {phaseNumber}
    </div>
  );
}
