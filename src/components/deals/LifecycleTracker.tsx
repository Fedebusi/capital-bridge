import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertTriangle, ChevronDown, ChevronRight, Users, Flag, XCircle } from "lucide-react";
import { useState } from "react";
import {
  type DealLifecycle, type LifecyclePhase, type PhaseStatus,
  phaseStatusColors, phaseStatusLabels, agentOrgColors, agentOrgLabels,
} from "@/data/lifecyclePhases";

interface LifecycleTrackerProps {
  lifecycle: DealLifecycle;
}

export default function LifecycleTracker({ lifecycle }: LifecycleTrackerProps) {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(lifecycle.currentPhase);

  return (
    <div className="space-y-1">
      {lifecycle.phases.map((phase, i) => {
        const isExpanded = expandedPhase === phase.id;
        const isCurrent = phase.id === lifecycle.currentPhase;
        const completedSubsteps = phase.substeps.filter(s => s.status === "completed").length;
        const totalSubsteps = phase.substeps.length;
        const completedMilestones = phase.milestones.filter(m => m.achieved).length;
        const totalMilestones = phase.milestones.length;

        return (
          <div key={phase.id} className={cn(
            "rounded-xl border transition-all",
            isCurrent ? "border-accent/40 bg-accent/5 shadow-sm" :
            phase.status === "completed" ? "border-emerald-200/60 bg-card" :
            phase.status === "blocked" ? "border-red-200/60 bg-card" :
            "border-border bg-card"
          )}>
            {/* Phase Header */}
            <button
              onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors rounded-xl"
            >
              {/* Phase Number & Icon */}
              <div className={cn(
                "flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold shrink-0",
                phase.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                phase.status === "in_progress" ? "bg-accent/20 text-accent" :
                phase.status === "blocked" ? "bg-red-100 text-red-700" :
                "bg-muted text-muted-foreground"
              )}>
                {phase.status === "completed" ? <CheckCircle2 className="h-4 w-4" /> : phase.number}
              </div>

              {/* Phase Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm font-semibold text-foreground truncate">
                    {phase.number}. {phase.name}
                  </h3>
                  {isCurrent && (
                    <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-accent/20 text-accent uppercase tracking-wide">
                      Current
                    </span>
                  )}
                  <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", phaseStatusColors[phase.status])}>
                    {phaseStatusLabels[phase.status]}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                  {totalSubsteps > 0 && <span>{completedSubsteps}/{totalSubsteps} steps</span>}
                  {totalMilestones > 0 && <span className="flex items-center gap-0.5"><Flag className="h-3 w-3" /> {completedMilestones}/{totalMilestones} milestones</span>}
                  {phase.estimatedDuration && <span>~{phase.estimatedDuration}</span>}
                  {phase.startDate && <span>Started: {phase.startDate}</span>}
                  {phase.completedDate && <span className="text-emerald-600">Done: {phase.completedDate}</span>}
                </div>
              </div>

              {/* Expand Icon */}
              {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-4">
                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed pl-11">{phase.description}</p>

                {/* Agents */}
                <div className="pl-11">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Users className="h-3 w-3" /> Agentes
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {phase.agents.map((a, j) => (
                      <span key={j} className={cn("rounded-md border px-2 py-1 text-xs", agentOrgColors[a.organization])}>
                        <strong>{a.name}</strong> — {a.role}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Milestones (Hitos) */}
                {phase.milestones.length > 0 && (
                  <div className="pl-11">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Flag className="h-3 w-3" /> Hitos (Milestones)
                    </p>
                    <div className="space-y-1.5">
                      {phase.milestones.map((m, j) => (
                        <div key={j} className={cn(
                          "flex items-start gap-2 rounded-lg border p-2.5",
                          m.achieved ? "border-emerald-200/60 bg-emerald-50/50" : "border-border bg-muted/30"
                        )}>
                          {m.achieved ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" /> : <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
                          <div>
                            <p className="text-sm text-foreground">{m.description}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {m.achievedDate && <span className="text-xs text-emerald-600">{m.achievedDate}</span>}
                              {m.evidence && <span className="text-xs text-muted-foreground">📄 {m.evidence}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Substeps */}
                {phase.substeps.length > 0 && (
                  <div className="pl-11">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Steps</p>
                    <div className="space-y-1">
                      {phase.substeps.map(s => (
                        <div key={s.id} className="flex items-start gap-2 py-1.5">
                          <StatusIcon status={s.status} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={cn("text-sm", s.status === "completed" ? "text-muted-foreground" : "text-foreground")}>{s.label}</p>
                              <span className={cn("rounded px-1.5 py-0.5 text-xs font-medium", phaseStatusColors[s.status])}>
                                {phaseStatusLabels[s.status]}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {s.assignee && <span>{s.assignee}</span>}
                              {s.completedDate && <span>• {s.completedDate}</span>}
                            </div>
                            {s.notes && <p className="text-xs text-warning mt-0.5">⚠ {s.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatusIcon({ status }: { status: PhaseStatus }) {
  switch (status) {
    case "completed": return <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />;
    case "in_progress": return <Clock className="h-4 w-4 text-accent mt-0.5 shrink-0" />;
    case "blocked": return <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />;
    case "skipped": return <XCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />;
    default: return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 mt-0.5 shrink-0" />;
  }
}
