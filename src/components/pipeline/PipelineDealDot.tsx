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

  return (
    <Link
      to={`/deals/${deal.id}`}
      className={cn(
        "group/dot relative flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold",
        "shadow-sm ring-2 ring-white transition-all duration-200",
        "hover:scale-110 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent",
        isRejected
          ? "bg-red-100 text-red-700"
          : highlighted
            ? "bg-accent text-white"
            : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
      )}
      style={{ marginTop: stackIndex > 0 ? stackIndex * 6 : 0 }}
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
