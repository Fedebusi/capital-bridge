import AppLayout from "@/components/layout/AppLayout";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import ConstructionMonitoringPanel from "@/components/deals/ConstructionMonitoringPanel";
import { useDeals } from "@/hooks/useDeals";
import { stageLabels, stageColors, formatMillions, type Deal } from "@/data/sampleDeals";
import {
  useSiteVisitsForDeal,
  useCertificationsForDeal,
  useMonitoringReportsForDeal,
} from "@/hooks/useDealSubdata";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

function DealMonitoringRow({ deal }: { deal: Deal }) {
  const { data: visits } = useSiteVisitsForDeal(deal.id);
  const { data: certs } = useCertificationsForDeal(deal.id);
  const { data: reports } = useMonitoringReportsForDeal(deal.id);

  const hasData = visits.length > 0 || certs.length > 0 || reports.length > 0;
  if (!hasData) return null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", stageColors[deal.stage])}>
            {stageLabels[deal.stage]}
          </span>
          <Link to={`/deals/${deal.id}`} className="font-display text-sm font-semibold text-primary hover:text-accent transition-colors">
            {deal.projectName}
          </Link>
          <span className="text-xs text-slate-500">{formatMillions(deal.loanAmount)}</span>
        </div>
        <span className="text-xs text-slate-500">Progress: <strong className="text-primary">{deal.constructionProgress}%</strong></span>
      </div>
      <div className="p-4">
        <ConstructionMonitoringPanel dealId={deal.id} />
      </div>
    </div>
  );
}

export default function ConstructionMonitoringPage() {
  const { deals, loading } = useDeals();

  if (loading) {
    return <AppLayout><LoadingSkeleton /></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-primary tracking-tight">Construction Monitoring</h1>
          <p className="text-slate-500 text-sm mt-1">Site visits, certifications, monitoring reports, and retention tracking</p>
        </div>

        {deals.map((deal) => (
          <DealMonitoringRow key={deal.id} deal={deal} />
        ))}
      </div>
    </AppLayout>
  );
}
