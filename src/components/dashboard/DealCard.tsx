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
    <div
      className="animate-fade-in"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
    >
      <Link
        to={`/deals/${deal.id}`}
        className="group block rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:border-primary/30 hover:shadow-gold"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", stageColors[deal.stage])}>
                {stageLabels[deal.stage]}
              </span>
              {hasCovenantIssue && (
                <AlertTriangle className="h-3.5 w-3.5 text-warning" />
              )}
            </div>
            <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {deal.projectName}
            </h3>
            <p className="text-sm text-muted-foreground truncate">{deal.borrower}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-display text-lg font-bold text-foreground">{formatMillions(deal.loanAmount)}</p>
            <p className="text-xs text-muted-foreground">Facility</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-3 border-t border-border pt-4">
          <div>
            <p className="text-[11px] text-muted-foreground">LTV</p>
            <p className={cn("text-sm font-semibold", deal.ltv > 65 ? "text-warning" : "text-foreground")}>
              {formatPercent(deal.ltv)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">LTC</p>
            <p className="text-sm font-semibold text-foreground">{formatPercent(deal.ltc)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Rate</p>
            <p className="text-sm font-semibold text-foreground">{formatPercent(deal.totalRate)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Tenor</p>
            <p className="text-sm font-semibold text-foreground">{deal.tenor}m</p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{deal.location}</span>
          <span className="flex items-center gap-1"><Building className="h-3 w-3" />{deal.totalUnits} units</span>
        </div>

        {deal.stage === "active" && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Construction</span>
              <span className="font-medium text-foreground">{deal.constructionProgress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted">
              <div
                className="h-1.5 rounded-full bg-primary transition-all"
                style={{ width: `${deal.constructionProgress}%` }}
              />
            </div>
          </div>
        )}
      </Link>
    </div>
  );
}
