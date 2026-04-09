import AppLayout from "@/components/layout/AppLayout";
import ApprovalsPanel from "@/components/deals/ApprovalsPanel";
import { useDeals } from "@/hooks/useDeals";
import { stageLabels, stageColors, formatMillions } from "@/data/sampleDeals";
import { sampleApprovals } from "@/data/dealModules";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Shield, Clock, CheckCircle2 } from "lucide-react";

export default function ApprovalsPage() {
  const { deals } = useDeals();
  const dealsWithApprovals = deals.filter(d => sampleApprovals[d.id]);
  const pendingApprovals = dealsWithApprovals.filter(d => {
    const a = sampleApprovals[d.id];
    return a && (a.status === "pending_ic" || a.status === "pending_capital_partner");
  });
  const completedApprovals = dealsWithApprovals.filter(d => {
    const a = sampleApprovals[d.id];
    return a && (a.status === "approved" || a.status === "rejected" || a.status === "approved_with_conditions");
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Approvals</h1>
          <p className="text-slate-500 text-sm mt-1">IC voting, capital partner sign-off, and audit trail</p>
        </div>

        {/* Pending */}
        {pendingApprovals.length > 0 && (
          <div>
            <h2 className="font-display text-base font-semibold text-foreground flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-warning" /> Pending Approval
            </h2>
            {pendingApprovals.map(deal => (
              <div key={deal.id} className="rounded-xl border border-warning/30 bg-card shadow-card overflow-hidden mb-4">
                <div className="p-4 border-b border-border flex items-center justify-between bg-warning/5">
                  <div className="flex items-center gap-3">
                    <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", stageColors[deal.stage])}>
                      {stageLabels[deal.stage]}
                    </span>
                    <Link to={`/deals/${deal.id}`} className="font-display text-sm font-semibold text-foreground hover:text-accent transition-colors">
                      {deal.projectName}
                    </Link>
                    <span className="text-xs text-muted-foreground">{formatMillions(deal.loanAmount)}</span>
                  </div>
                  <span className="rounded-md bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning uppercase">
                    {sampleApprovals[deal.id]?.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="p-4">
                  <ApprovalsPanel dealId={deal.id} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Completed */}
        {completedApprovals.length > 0 && (
          <div>
            <h2 className="font-display text-base font-semibold text-foreground flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-success" /> Completed
            </h2>
            {completedApprovals.map(deal => (
              <div key={deal.id} className="rounded-xl border border-border bg-card shadow-card overflow-hidden mb-4">
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
                  <span className="rounded-md bg-success/10 px-2.5 py-1 text-xs font-semibold text-success uppercase">
                    {sampleApprovals[deal.id]?.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="p-4">
                  <ApprovalsPanel dealId={deal.id} />
                </div>
              </div>
            ))}
          </div>
        )}

        {dealsWithApprovals.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-12 shadow-card text-center">
            <Shield className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No approval records yet</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
