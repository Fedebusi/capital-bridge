import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Deal } from "@/data/sampleDeals";
import { formatMillions, stageLabels } from "@/data/sampleDeals";

interface PipelineDealDotProps {
  deal: Deal;
  /** Whether the deal's current phase is highlighted (hovered) */
  highlighted?: boolean;
  /** Stack index for vertical offset when deals share the same phase */
  stackIndex?: number;
}

/**
 * A small circular marker representing a deal on the journey rail.
 * Initials-based avatar, links to the deal detail page, shows a tooltip on hover.
 */
export default function PipelineDealDot({
  deal,
  highlighted = false,
  stackIndex = 0,
}: PipelineDealDotProps) {
  const initials = deal.projectName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const isRejected = deal.stage === "rejected";

  // Stack deals with overlap instead of gaps so they always fit the column.
  // Negative margin-top pulls each successive dot up by 18px so a 3-dot stack
  // occupies ~72px total (36 + 18 + 18) rather than 120px.
  const overlapMarginTop = stackIndex === 0 ? 0 : -18;

  return (
    <Link
      to={`/deals/${deal.id}`}
      className={cn(
        "group/dot relative flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold",
        "shadow-sm ring-2 ring-white transition-all duration-200",
        "hover:scale-110 hover:shadow-md hover:z-10 focus:outline-none focus:ring-2 focus:ring-accent",
        isRejected
          ? "bg-red-100 text-red-700"
          : highlighted
            ? "bg-accent text-white"
            : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
      )}
      style={{ marginTop: overlapMarginTop, zIndex: 10 - stackIndex }}
      aria-label={`${deal.projectName} — ${stageLabels[deal.stage]}`}
    >
      {initials || "D"}
      {/* Tooltip */}
      <div
        className={cn(
          "pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2",
          "whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white",
          "opacity-0 shadow-lg transition-opacity duration-150 group-hover/dot:opacity-100",
        )}
      >
        <div className="font-semibold">{deal.projectName}</div>
        <div className="text-slate-300">
          {formatMillions(deal.loanAmount)} · {stageLabels[deal.stage]}
        </div>
      </div>
    </Link>
  );
}
