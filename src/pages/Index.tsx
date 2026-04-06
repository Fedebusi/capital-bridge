import AppLayout from "@/components/layout/AppLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import DealCard from "@/components/dashboard/DealCard";
import { sampleDeals, getPortfolioMetrics, formatMillions, formatPercent, stageLabels, type DealStage } from "@/data/sampleDeals";
import { DollarSign, TrendingUp, FolderOpen, BarChart3, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const metrics = getPortfolioMetrics();
  const activeDeals = sampleDeals.filter(d => d.stage === "active");
  const covenantAlerts = sampleDeals.filter(d => d.covenants.some(c => c.status !== "compliant"));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Portfolio Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time overview of fund activity and exposure</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total Commitments" value={formatMillions(metrics.totalCommitments)} subValue={`${metrics.totalDeals} deals`} icon={DollarSign} highlight />
          <MetricCard label="Current Exposure" value={formatMillions(metrics.totalExposure)} subValue={`Incl. ${formatMillions(metrics.totalAccruedPIK)} PIK`} icon={TrendingUp} />
          <MetricCard label="Avg LTV (Active)" value={formatPercent(metrics.avgLTV)} subValue={`LTC: ${formatPercent(metrics.avgLTC)}`} icon={BarChart3} />
          <MetricCard label="Pipeline" value={`${metrics.pipelineDeals}`} subValue="Deals in process" icon={FolderOpen} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">Active Loans</h2>
            {activeDeals.map((d, i) => <DealCard key={d.id} deal={d} index={i} />)}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-warning" /> Covenant Alerts
              </h3>
              {covenantAlerts.length > 0 ? covenantAlerts.map(d => (
                <div key={d.id} className="border-b border-border py-3 last:border-0 last:pb-0 first:pt-0">
                  <p className="text-sm font-medium text-foreground">{d.projectName}</p>
                  {d.covenants.filter(c => c.status !== "compliant").map(c => (
                    <p key={c.name} className="text-xs text-warning mt-0.5">{c.name}: {c.currentValue} (limit: {c.threshold})</p>
                  ))}
                </div>
              )) : <p className="text-xs text-muted-foreground">All covenants compliant ✓</p>}
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="font-display text-sm font-semibold text-foreground mb-3">Pipeline Summary</h3>
              {(["screening", "due_diligence", "ic_approval", "documentation"] as DealStage[]).map(stage => (
                <div key={stage} className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">{stageLabels[stage]}</span>
                  <span className="text-sm font-semibold text-foreground">{sampleDeals.filter(d => d.stage === stage).length}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
