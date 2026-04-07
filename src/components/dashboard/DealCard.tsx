import { Deal, stageLabels, stageColors, formatMillions, formatPercent } from "@/data/sampleDeals";
import { cn } from "@/lib/utils";
import { MapPin, Building, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface DealCardProps {
  deal: Deal;
  index?: number;
}

export default function DealCard({ deal, index = 0 }: DealCardProps) {
  const hasCovenantIssue = deal.covenants.some(c => c.status !== "compliant");

  return (
    <div className="animate-fade-in" style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}>
      <Link
        to={`/deals/${deal.id}`}
        className="group block rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-200"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={cn("inline-flex items-center rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide", stageColors[deal.stage])}>
                {stageLabels[deal.stage]}
              </span>
              {hasCovenantIssue && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
            </div>
            <h3 className="font-headline text-[15px] font-bold text-primary group-hover:text-slate-600 transition-colors truncate">
              {deal.projectName}
            </h3>
            <p className="text-xs text-slate-400 truncate mt-0.5">{deal.borrower}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-headline text-lg font-extrabold text-primary">{formatMillions(deal.loanAmount)}</p>
            <p className="text-[10px] text-slate-400 font-medium">Facility</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-3 border-t border-slate-100 pt-4">
          <div>
            <p className="text-[10px] text-slate-400 font-medium">LTV</p>
            <p className={cn("text-sm font-bold", deal.ltv > 65 ? "text-amber-500" : "text-primary")}>{formatPercent(deal.ltv)}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium">LTC</p>
            <p className="text-sm font-bold text-primary">{formatPercent(deal.ltc)}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium">Rate</p>
            <p className="text-sm font-bold text-primary">{formatPercent(deal.totalRate)}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium">Tenor</p>
            <p className="text-sm font-bold text-primary">{deal.tenor}m</p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{deal.location}</span>
          <span className="flex items-center gap-1"><Building className="h-3 w-3" />{deal.totalUnits} units</span>
        </div>

        {deal.stage === "active" && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-400">Construction</span>
              <span className="font-bold text-primary">{deal.constructionProgress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100">
              <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${deal.constructionProgress}%` }} />
            </div>
          </div>
        )}
      </Link>
    </div>
  );
}
