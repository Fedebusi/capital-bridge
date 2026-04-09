import { cn } from "@/lib/utils";
import { type DealLifecycle, phaseStatusColors } from "@/data/lifecyclePhases";

interface LifecycleProgressBarProps {
  lifecycle: DealLifecycle;
  compact?: boolean;
}

export default function LifecycleProgressBar({ lifecycle, compact }: LifecycleProgressBarProps) {
  return (
    <div className={cn("flex items-center gap-0.5", compact ? "" : "py-2")}>
      {lifecycle.phases.map((phase, i) => {
        const isCurrent = phase.id === lifecycle.currentPhase;
        return (
          <div key={phase.id} className="flex-1 group relative">
            <div className={cn(
              "rounded-full transition-all",
              compact ? "h-1.5" : "h-2",
              phase.status === "completed" ? "bg-emerald-500" :
              phase.status === "in_progress" ? "bg-accent" :
              phase.status === "blocked" ? "bg-destructive" :
              "bg-muted-foreground/20",
              isCurrent && "ring-2 ring-accent/30"
            )} />
            {!compact && (
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                <div className="bg-foreground text-background rounded px-2 py-1 text-xs font-medium whitespace-nowrap shadow-lg">
                  {phase.number}. {phase.name}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
