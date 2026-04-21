import { ddCategoryLabels, type DDCategory } from "@/data/dealModules";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertTriangle, FileText, Minus, ChevronDown, ChevronRight, Paperclip } from "lucide-react";
import { useState } from "react";
import { useDDItemsForDeal } from "@/hooks/useDealSubdata";
import FileUploadButton from "@/components/ui/FileUploadButton";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useCreateDDDocument } from "@/hooks/useSupabaseQuery";

const statusConfig = {
  completed: { icon: CheckCircle2, label: "Completed", className: "text-success" },
  in_progress: { icon: Clock, label: "In Progress", className: "text-accent" },
  pending: { icon: Clock, label: "Pending", className: "text-slate-500" },
  flagged: { icon: AlertTriangle, label: "Flagged", className: "text-destructive" },
  not_applicable: { icon: Minus, label: "N/A", className: "text-slate-500" },
};

interface DueDiligencePanelProps {
  dealId: string;
}

export default function DueDiligencePanel({ dealId }: DueDiligencePanelProps) {
  const { data: items, loading } = useDDItemsForDeal(dealId);
  const categories = Object.keys(ddCategoryLabels) as DDCategory[];
  const [expanded, setExpanded] = useState<string[]>(categories);
  const createDoc = useCreateDDDocument();
  const canUpload = isSupabaseConfigured();

  if (loading) {
    return (
      <div className="rounded-2xl bg-slate-50 p-8 shadow-card text-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent mx-auto" />
      </div>
    );
  }

  const toggle = (cat: string) =>
    setExpanded(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-50 p-10 flex flex-col items-center text-center">
        <FileText className="h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-primary">No due diligence items yet</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md">
          Due diligence checklists are generated when a deal advances to the DD stage. Move the deal forward to start tracking findings.
        </p>
      </div>
    );
  }

  const totalCompleted = items.filter(i => i.status === "completed").length;
  const totalFlagged = items.filter(i => i.status === "flagged").length;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center gap-6 rounded-2xl bg-slate-50 p-4 shadow-card">
        <div>
          <p className="text-xs text-slate-500">Progress</p>
          <p className="font-display text-lg font-bold text-primary">{totalCompleted}/{items.length}</p>
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
          <div key={cat} className="rounded-2xl bg-slate-50 overflow-hidden">
            <button
              onClick={() => toggle(cat)}
              className="flex w-full items-center justify-between p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                <h3 className="font-display text-sm font-semibold text-primary">{ddCategoryLabels[cat]}</h3>
              </div>
              <span className="text-xs text-slate-500">{catCompleted}/{catItems.length} completed</span>
            </button>
            {isExpanded && (
              <div className="border-t border-border">
                {catItems.map(item => {
                  const cfg = statusConfig[item.status];
                  const Icon = cfg.icon;
                  return (
                    <div key={item.id} className="flex items-center justify-between border-b border-slate-100 last:border-0 px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={cn("h-4 w-4 shrink-0", cfg.className)} />
                        <div className="min-w-0">
                          <p className="text-sm text-primary truncate">{item.label}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            {item.assignee && <span>{item.assignee}</span>}
                            {item.dueDate && <span>Due: {item.dueDate}</span>}
                            {item.completedDate && <span>Done: {item.completedDate}</span>}
                          </div>
                          {item.notes && <p className="text-xs text-destructive mt-0.5">{item.notes}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.documents && item.documents.length > 0 && (
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <FileText className="h-3 w-3" /> {item.documents.length}
                          </span>
                        )}
                        {canUpload && (
                          <FileUploadButton
                            bucket="documents"
                            pathPrefix={`deals/${dealId}/dd/${item.id}`}
                            label="Attach"
                            icon={<Paperclip className="h-3.5 w-3.5" />}
                            compact
                            onUploaded={async ({ path, file }) => {
                              await createDoc.mutateAsync({
                                dd_item_id: item.id,
                                name: file.name,
                                version: 1,
                                upload_date: new Date().toISOString().slice(0, 10),
                                storage_path: path,
                              });
                            }}
                          />
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
