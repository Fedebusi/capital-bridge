import { sampleDueDiligence, ddCategoryLabels, type DDCategory, type DDItem } from "@/data/dealModules";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertTriangle, FileText, Minus, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

const statusConfig = {
  completed: { icon: CheckCircle2, label: "Completed", className: "text-success" },
  in_progress: { icon: Clock, label: "In Progress", className: "text-accent" },
  pending: { icon: Clock, label: "Pending", className: "text-muted-foreground" },
  flagged: { icon: AlertTriangle, label: "Flagged", className: "text-destructive" },
  not_applicable: { icon: Minus, label: "N/A", className: "text-muted-foreground" },
};

interface DueDiligencePanelProps {
  dealId: string;
}

export default function DueDiligencePanel({ dealId }: DueDiligencePanelProps) {
  const items = sampleDueDiligence[dealId] || [];
  const categories = Object.keys(ddCategoryLabels) as DDCategory[];
  const [expanded, setExpanded] = useState<string[]>(categories);

  const toggle = (cat: string) =>
    setExpanded(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 shadow-card text-center">
        <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No due diligence checklist for this deal yet</p>
      </div>
    );
  }

  const totalCompleted = items.filter(i => i.status === "completed").length;
  const totalFlagged = items.filter(i => i.status === "flagged").length;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center gap-6 rounded-xl border border-border bg-card p-4 shadow-card">
        <div>
          <p className="text-xs text-muted-foreground">Progress</p>
          <p className="font-display text-lg font-bold text-foreground">{totalCompleted}/{items.length}</p>
        </div>
        <div className="flex-1">
          <div className="h-2 w-full rounded-full bg-muted">
            <div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${(totalCompleted / items.length) * 100}%` }} />
          </div>
        </div>
        {totalFlagged > 0 && (
          <div className="flex items-center gap-1 text-sm text-destructive font-medium">
            <AlertTriangle className="h-4 w-4" /> {totalFlagged} flagged
          </div>
        )}
      </div>

      {/* Categories */}
      {categories.map(cat => {
        const catItems = items.filter(i => i.category === cat);
        if (catItems.length === 0) return null;
        const isExpanded = expanded.includes(cat);
        const catCompleted = catItems.filter(i => i.status === "completed").length;

        return (
          <div key={cat} className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <button
              onClick={() => toggle(cat)}
              className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                <h3 className="font-display text-sm font-semibold text-foreground">{ddCategoryLabels[cat]}</h3>
              </div>
              <span className="text-xs text-muted-foreground">{catCompleted}/{catItems.length} completed</span>
            </button>
            {isExpanded && (
              <div className="border-t border-border">
                {catItems.map(item => {
                  const cfg = statusConfig[item.status];
                  const Icon = cfg.icon;
                  return (
                    <div key={item.id} className="flex items-center justify-between border-b border-border last:border-0 px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={cn("h-4 w-4 shrink-0", cfg.className)} />
                        <div className="min-w-0">
                          <p className="text-sm text-foreground truncate">{item.label}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            {item.assignee && <span>{item.assignee}</span>}
                            {item.dueDate && <span>Due: {item.dueDate}</span>}
                            {item.completedDate && <span>Done: {item.completedDate}</span>}
                          </div>
                          {item.notes && <p className="text-xs text-destructive mt-0.5">{item.notes}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.documents && item.documents.length > 0 && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <FileText className="h-3 w-3" /> {item.documents.length}
                          </span>
                        )}
                        <span className={cn("text-xs font-medium", cfg.className)}>{cfg.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
