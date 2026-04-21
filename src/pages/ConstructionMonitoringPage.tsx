import AppLayout from "@/components/layout/AppLayout";
import { LoadingSkeleton, EmptyState } from "@/components/LoadingSkeleton";
import ConstructionMonitoringPanel from "@/components/deals/ConstructionMonitoringPanel";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { useDeals } from "@/hooks/useDeals";
import { stageLabels, stageColors, formatMillions, type Deal } from "@/data/sampleDeals";
import {
  useSiteVisitsForDeal,
  useCertificationsForDeal,
  useMonitoringReportsForDeal,
} from "@/hooks/useDealSubdata";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { HardHat } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { exportToExcel, stampedFilename } from "@/lib/exports/exportToExcel";
import { exportToCsv } from "@/lib/exports/exportToCsv";
import { siteVisitRow, certificationRow, monitoringReportRow } from "@/lib/exports/rowBuilders";
import type { SiteVisit, ConstructionCertification, MonitoringReport } from "@/data/constructionMonitoring";

function DealMonitoringRow({
  deal,
  onRender,
  onData,
}: {
  deal: Deal;
  onRender: (id: string, rendered: boolean) => void;
  onData: (
    dealId: string,
    dealName: string,
    payload: { visits: SiteVisit[]; certs: ConstructionCertification[]; reports: MonitoringReport[] },
  ) => void;
}) {
  const { data: visits } = useSiteVisitsForDeal(deal.id);
  const { data: certs } = useCertificationsForDeal(deal.id);
  const { data: reports } = useMonitoringReportsForDeal(deal.id);

  const hasData = visits.length > 0 || certs.length > 0 || reports.length > 0;

  useEffect(() => {
    onRender(deal.id, hasData);
  }, [deal.id, hasData, onRender]);

  useEffect(() => {
    onData(deal.id, deal.projectName, { visits, certs, reports });
  }, [deal.id, deal.projectName, visits, certs, reports, onData]);

  if (!hasData) return null;

  return (
    <div className="rounded-2xl bg-slate-50 overflow-hidden">
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
  const navigate = useNavigate();
  const [rendered, setRendered] = useState<Record<string, boolean>>({});
  const [dataByDeal, setDataByDeal] = useState<
    Record<string, { name: string; visits: SiteVisit[]; certs: ConstructionCertification[]; reports: MonitoringReport[] }>
  >({});

  const registerData = useCallback(
    (
      dealId: string,
      dealName: string,
      payload: { visits: SiteVisit[]; certs: ConstructionCertification[]; reports: MonitoringReport[] },
    ) => {
      setDataByDeal((prev) => {
        const existing = prev[dealId];
        if (
          existing &&
          existing.visits === payload.visits &&
          existing.certs === payload.certs &&
          existing.reports === payload.reports &&
          existing.name === dealName
        )
          return prev;
        return { ...prev, [dealId]: { name: dealName, ...payload } };
      });
    },
    [],
  );

  const siteVisitRows = Object.values(dataByDeal).flatMap((v) => v.visits.map((sv) => siteVisitRow(v.name, sv)));
  const certRows = Object.values(dataByDeal).flatMap((v) => v.certs.map((c) => certificationRow(v.name, c)));
  const reportRows = Object.values(dataByDeal).flatMap((v) => v.reports.map((r) => monitoringReportRow(v.name, r)));
  const hasAny = siteVisitRows.length + certRows.length + reportRows.length > 0;

  if (loading) {
    return <AppLayout><LoadingSkeleton /></AppLayout>;
  }

  const firstDealId = deals[0]?.id;
  const renderedCount = Object.values(rendered).filter(Boolean).length;

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary tracking-tight">Construction Monitoring</h1>
            <p className="text-slate-500 text-base mt-2">Site visits, certifications, monitoring reports, and retention tracking</p>
          </div>
          <ExportMenu
            disabled={!hasAny}
            onExcel={() =>
              exportToExcel(stampedFilename("Construction"), [
                { name: "Site Visits", rows: siteVisitRows },
                { name: "Certifications", rows: certRows },
                { name: "Monitoring Reports", rows: reportRows },
              ])
            }
            onCsv={() => exportToCsv(stampedFilename("Construction_SiteVisits"), siteVisitRows)}
          />
        </div>

        {deals.length === 0 ? (
          <EmptyState
            icon={HardHat}
            title="No deals to monitor yet"
            description="Site visits, certifications, and monitoring reports appear here once a deal has drawn funds and construction begins."
            action={
              <button
                onClick={() => navigate("/pipeline")}
                className="rounded-full bg-accent text-white px-5 py-2 text-sm font-semibold hover:bg-accent/90 transition-colors"
              >
                Go to Pipeline
              </button>
            }
          />
        ) : (
          <>
            {deals.map((deal) => (
              <DealMonitoringRow
                key={deal.id}
                deal={deal}
                onRender={(id, r) =>
                  setRendered((prev) => (prev[id] === r ? prev : { ...prev, [id]: r }))
                }
                onData={registerData}
              />
            ))}
            {renderedCount === 0 && (
              <EmptyState
                icon={HardHat}
                title="No construction data yet"
                description="Log site visits, upload photos, and record certifications from each deal's detail page to populate this view."
                action={
                  <button
                    onClick={() => firstDealId && navigate(`/deals/${firstDealId}`)}
                    className="rounded-full bg-accent text-white px-5 py-2 text-sm font-semibold hover:bg-accent/90 transition-colors"
                  >
                    Go to deal
                  </button>
                }
              />
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
