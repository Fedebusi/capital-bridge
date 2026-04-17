import AppLayout from "@/components/layout/AppLayout";
import { LoadingSkeleton, EmptyState } from "@/components/LoadingSkeleton";
import ApprovalsPanel from "@/components/deals/ApprovalsPanel";
import { useDeals } from "@/hooks/useDeals";
import { useApprovalForDeal } from "@/hooks/useDealSubdata";
import { stageLabels, stageColors, formatMillions, type Deal } from "@/data/sampleDeals";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Shield, Clock, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

function DealApprovalRow({
  deal,
  variant,
  onRender,
}: {
  deal: Deal;
  variant: "pending" | "completed";
  onRender: (id: string, rendered: boolean) => void;
}) {
  const { data: approval } = useApprovalForDeal(deal.id);
  const isPending = approval?.status === "pending_ic" || approval?.status === "pending_capital_partner";
  const shouldRender = !!approval && (variant === "pending" ? isPending : !isPending);

  useEffect(() => {
    onRender(deal.id, shouldRender);
  }, [deal.id, shouldRender, onRender]);

  if (!shouldRender || !approval) return null;

  const badgeClass = variant === "pending"
    ? "bg-warning/10 text-warning"
    : "bg-success/10 text-success";
  const headerBg = variant === "pending" ? "bg-warning/5" : "";
  const borderClass = variant === "pending" ? "border-warning/30" : "border-slate-100";

  return (
    <div className={cn("rounded-2xl border bg-card shadow-card overflow-hidden mb-4", borderClass)}>
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
  const navigate = useNavigate();
  const [pendingRendered, setPendingRendered] = useState<Record<string, boolean>>({});
  const [completedRendered, setCompletedRendered] = useState<Record<string, boolean>>({});

  if (loading) {
    return <AppLayout><LoadingSkeleton /></AppLayout>;
  }

  const firstDealId = deals[0]?.id;
  const pendingCount = Object.values(pendingRendered).filter(Boolean).length;
  const completedCount = Object.values(completedRendered).filter(Boolean).length;

  const goToDeal = () => {
    if (firstDealId) navigate(`/deals/${firstDealId}`);
    else navigate("/pipeline");
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-primary tracking-tight">Approvals</h1>
          <p className="text-slate-500 text-base mt-2">IC voting, capital partner sign-off, and audit trail</p>
        </div>

        {deals.length === 0 ? (
          <EmptyState
            icon={Shield}
            title="No deals yet"
            description="IC votes, capital partner sign-offs, and covenant waivers appear here once you have deals in the pipeline."
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
            <div>
              <h2 className="font-display text-base font-semibold text-primary flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-warning" /> Pending Approval
              </h2>
              {deals.map((deal) => (
                <DealApprovalRow
                  key={`p-${deal.id}`}
                  deal={deal}
                  variant="pending"
                  onRender={(id, rendered) =>
                    setPendingRendered((prev) => (prev[id] === rendered ? prev : { ...prev, [id]: rendered }))
                  }
                />
              ))}
              {pendingCount === 0 && (
                <EmptyState
                  icon={Clock}
                  title="No pending approvals"
                  description="Deals awaiting IC vote or Capital Partner sign-off will appear here. Submissions are initiated from each deal's detail page."
                  action={
                    <button
                      onClick={goToDeal}
                      className="rounded-full bg-accent text-white px-5 py-2 text-sm font-semibold hover:bg-accent/90 transition-colors"
                    >
                      Go to deal
                    </button>
                  }
                />
              )}
            </div>

            <div>
              <h2 className="font-display text-base font-semibold text-primary flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-success" /> Completed
              </h2>
              {deals.map((deal) => (
                <DealApprovalRow
                  key={`c-${deal.id}`}
                  deal={deal}
                  variant="completed"
                  onRender={(id, rendered) =>
                    setCompletedRendered((prev) => (prev[id] === rendered ? prev : { ...prev, [id]: rendered }))
                  }
                />
              ))}
              {completedCount === 0 && (
                <EmptyState
                  icon={CheckCircle2}
                  title="No completed approvals yet"
                  description="Once the IC and Capital Partner sign off on a deal, the approval record will be archived here."
                />
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
