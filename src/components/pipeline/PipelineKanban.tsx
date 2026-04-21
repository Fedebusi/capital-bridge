import { useState, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { stageLabels, stageColors, formatMillions, type Deal, type DealStage } from "@/data/sampleDeals";
import { useDeals } from "@/hooks/useDeals";
import { useUpdateDeal } from "@/hooks/useSupabaseQuery";
import { isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";
import { Building2, ArrowRight } from "lucide-react";

const KANBAN_STAGES: DealStage[] = [
  "screening",
  "due_diligence",
  "ic_approval",
  "documentation",
  "active",
  "repaid",
];

const stageAccent: Record<DealStage, string> = {
  screening: "bg-slate-100 text-slate-600",
  due_diligence: "bg-amber-50 text-amber-700",
  ic_approval: "bg-violet-50 text-violet-700",
  documentation: "bg-blue-50 text-blue-700",
  active: "bg-emerald-50 text-emerald-700",
  repaid: "bg-slate-50 text-slate-500",
  rejected: "bg-rose-50 text-rose-700",
};

// --- Kanban Column ---

function KanbanColumn({ stage, deals }: { stage: DealStage; deals: Deal[] }) {
  const { isOver, setNodeRef } = useDroppable({ id: `column-${stage}` });
  const total = deals.reduce((s, d) => s + d.loanAmount, 0);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 min-w-[260px] rounded-2xl transition-colors",
        isOver ? "bg-accent/5 ring-2 ring-accent/30" : "bg-slate-50"
      )}
    >
      {/* Column header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide", stageAccent[stage])}>
            {stageLabels[stage]}
          </span>
          <span className="text-xs font-medium text-slate-400">{deals.length}</span>
        </div>
        {total > 0 && (
          <span className="text-[11px] font-semibold text-slate-500">{formatMillions(total)}</span>
        )}
      </div>

      {/* Cards stack */}
      <div className="p-3 space-y-2 min-h-[120px]">
        {deals.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-xs text-slate-400">
            Drop deals here
          </div>
        ) : (
          deals.map(deal => <KanbanCard key={deal.id} deal={deal} />)
        )}
      </div>
    </div>
  );
}

// --- Draggable Card ---

function KanbanCard({ deal, dragging }: { deal: Deal; dragging?: boolean }) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
    data: { deal },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Only navigate if this wasn't a drag (click without move)
        if (!isDragging) {
          e.stopPropagation();
          navigate(`/deals/${deal.id}`);
        }
      }}
      className={cn(
        "bg-white rounded-xl border border-slate-100 p-3 cursor-grab active:cursor-grabbing transition-all",
        isDragging || dragging ? "opacity-50 shadow-lg" : "hover:border-accent/40 hover:shadow-sm"
      )}
    >
      <div className="flex items-start gap-2 mb-2">
        <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
          <Building2 className="h-4 w-4 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary truncate leading-tight">{deal.projectName}</p>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">{deal.borrower}</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-[11px] text-slate-400">{deal.location}</span>
        <span className="text-xs font-bold text-primary">{formatMillions(deal.loanAmount)}</span>
      </div>
      {deal.ltv > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full",
                deal.ltv > 70 ? "bg-rose-400" : deal.ltv > 60 ? "bg-amber-400" : "bg-emerald-400"
              )}
              style={{ width: `${Math.min(100, deal.ltv)}%` }}
            />
          </div>
          <span className="text-[10px] font-semibold text-slate-400 tabular-nums">LTV {deal.ltv.toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}

// --- Main Kanban ---

export default function PipelineKanban() {
  const { deals, updateDealInContext } = useDeals();
  const updateDeal = useUpdateDeal();
  const isLive = isSupabaseConfigured();
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const columns = useMemo(() => {
    const grouped: Record<DealStage, Deal[]> = {
      screening: [],
      due_diligence: [],
      ic_approval: [],
      documentation: [],
      active: [],
      repaid: [],
      rejected: [],
    };
    deals.forEach(d => {
      if (d.stage in grouped) grouped[d.stage].push(d);
    });
    return grouped;
  }, [deals]);

  function handleDragStart(e: DragStartEvent) {
    const deal = e.active.data.current?.deal as Deal | undefined;
    if (deal) setActiveDeal(deal);
  }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveDeal(null);
    const { active, over } = e;
    if (!over) return;

    const deal = active.data.current?.deal as Deal | undefined;
    const targetStage = String(over.id).replace("column-", "") as DealStage;

    if (!deal || deal.stage === targetStage) return;
    if (!KANBAN_STAGES.includes(targetStage)) return;

    try {
      if (isLive) {
        await updateDeal.mutateAsync({ id: deal.id, stage: targetStage });
      } else {
        updateDealInContext(deal.id, { stage: targetStage });
      }
      toast.success(
        <span className="flex items-center gap-2">
          <span className="font-medium">{deal.projectName}</span>
          <ArrowRight className="h-3 w-3 text-slate-400" />
          <span>{stageLabels[targetStage]}</span>
        </span>
      );
    } catch {
      toast.error("Could not change stage. Try again.");
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {KANBAN_STAGES.map(stage => (
            <KanbanColumn key={stage} stage={stage} deals={columns[stage]} />
          ))}
        </div>
      </div>
      <DragOverlay>{activeDeal ? <KanbanCard deal={activeDeal} dragging /> : null}</DragOverlay>
    </DndContext>
  );
}
