import AppLayout from "@/components/layout/AppLayout";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import ApprovalsPanel from "@/components/deals/ApprovalsPanel";
import { useDeals } from "@/hooks/useDeals";
import { useApprovalForDeal } from "@/hooks/useDealSubdata";
import { stageLabels, stageColors, formatMillions, type Deal } from "@/data/sampleDeals";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Shield, Clock, CheckCircle2 } from "lucide-react";

function DealApprovalRow({ deal, variant }: { deal: Deal; variant: "pending" | "completed" }) {
  const { data: approval } = useApprovalForDeal(deal.id);
  if (!approval) return null;
  const isPending = approval.status === "pending_ic" || approval.status === "pending_capital_partner";
  if (variant === "pending" && !isPending) return null;
  if (variant === "completed" && isPending) return null;

  const badgeClass = variant === "pending"
    ? "bg-warning/10 text-warning"
    : "bg-success/10 text-success";
  const headerBg = variant === "pending" ? "bg-warning/5" : "";
  const borderClass = variant === "pending" ? "border-warning/30" : "border-slate-100";

  return (
    <div className={cn("rounded-xl border bg-card shadow-card overflow-hidden mb-4", borderClass)}>
      <div className={cn("p-4 border-b border-slate-100 flex items-center justify-between", headerBg)}>
        <div className="flex items-center gap-3">
          <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", stageColors[deal.stage])}>
            {stageLabels[deal.stage]}
          </span>
          <Link to={`/deals/${deal.id}`} className="font-display text-sm font-semibold text-primary hover:text-accent transition-colors">
            {deal.projectName}
          </Link>
          <span className="text-xs text-slate-500">{formatMillions(deal.loanAmount)}</span>
        </div>
        <span className={cn("rounded-md px-2.5 py-1 text-xs font-semibold uppercase", badgeClass)}>
          {approval.status.replace(/_/g, " ")}
        </span>
      </div>
      <div className="p-4">
        <ApprovalsPanel dealId={deal.id} />
      </div>
    </div>
  );
}

export default function ApprovalsPage() {
  const { deals, loading } = useDeals();

  if (loading) {
    return <AppLayout><LoadingSkeleton /></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-primary tracking-tight">Approvals</h1>
          <p className="text-slate-500 text-sm mt-1">IC voting, capital partner sign-off, and audit trail</p>
        </div>

        <div>
          <h2 className="font-display text-base font-semibold text-primary flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-warning" /> Pending Approval
          </h2>
          {deals.map((deal) => (
            <DealApprovalRow key={`p-${deal.id}`} deal={deal} variant="pending" />
          ))}
        </div>

        <div>
          <h2 className="font-display text-base font-semibold text-primary flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-success" /> Completed
          </h2>
          {deals.map((deal) => (
            <DealApprovalRow key={`c-${deal.id}`} deal={deal} variant="completed" />
          ))}
        </div>

        {deals.length === 0 && (
          <div className="rounded-xl border border-slate-100 bg-white p-12 shadow-card text-center">
            <Shield className="h-12 w-12 text-slate-500/30 mx-auto mb-4" />
            <p className="text-slate-500">No deals yet</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
