import AppLayout from "@/components/layout/AppLayout";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import ConstructionMonitoringPanel from "@/components/deals/ConstructionMonitoringPanel";
import { useDeals } from "@/hooks/useDeals";
import { stageLabels, stageColors, formatMillions } from "@/data/sampleDeals";
import { sampleCertifications, sampleMonitoringReports, sampleSiteVisits } from "@/data/constructionMonitoring";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { HardHat } from "lucide-react";

export default function ConstructionMonitoringPage() {
  const { deals, loading } = useDeals();

  if (loading) {
    return <AppLayout><LoadingSkeleton /></AppLayout>;
  }

  const dealsWithMonitoring = deals.filter(d =>
    sampleSiteVisits[d.id] || sampleCertifications[d.id] || sampleMonitoringReports[d.id]
  );
  const dealsWithout = deals.filter(d =>
    !sampleSiteVisits[d.id] && !sampleCertifications[d.id] && !sampleMonitoringReports[d.id] &&
    d.stage !== "repaid" && d.stage !== "rejected" && d.stage !== "screening"
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Construction Monitoring</h1>
          <p className="text-slate-500 text-sm mt-1">Site visits, certifications, monitoring reports, and retention tracking</p>
        </div>

        {dealsWithMonitoring.map(deal => (
          <div key={deal.id} className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", stageColors[deal.stage])}>
                  {stageLabels[deal.stage]}
                </span>
                <Link to={`/deals/${deal.id}`} className="font-display text-sm font-semibold text-foreground hover:text-accent transition-colors">
                  {deal.projectName}
                </Link>
                <span className="text-xs text-muted-foreground">{formatMillions(deal.loanAmount)}</span>
              </div>
              <span className="text-xs text-muted-foreground">Progress: <strong className="text-foreground">{deal.constructionProgress}%</strong></span>
            </div>
            <div className="p-4">
              <ConstructionMonitoringPanel dealId={deal.id} />
            </div>
          </div>
        ))}

        {dealsWithout.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <HardHat className="h-4 w-4 text-muted-foreground" /> Deals Without Monitoring Data
            </h3>
            <div className="space-y-2">
              {dealsWithout.map(d => (
                <div key={d.id} className="flex items-center justify-between py-2">
                  <Link to={`/deals/${d.id}`} className="text-sm text-foreground hover:text-accent transition-colors">{d.projectName}</Link>
                  <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", stageColors[d.stage])}>{stageLabels[d.stage]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
