import { type VoteDecision } from "@/data/dealModules";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertTriangle, Clock, Shield, FileText } from "lucide-react";
import { formatCurrency, type DealStage } from "@/data/sampleDeals";
import { useApprovalForDeal, useWaiversForDeal } from "@/hooks/useDealSubdata";

const voteLabels: Record<VoteDecision, { label: string; className: string }> = {
  approve: { label: "Approved", className: "text-success bg-success/10" },
  reject: { label: "Rejected", className: "text-destructive bg-destructive/10" },
  approve_with_conditions: { label: "Approved w/ Conditions", className: "text-warning bg-warning/10" },
};

interface ApprovalsPanelProps {
  dealId: string;
  stage?: DealStage;
}

export default function ApprovalsPanel({ dealId, stage }: ApprovalsPanelProps) {
  const { data: approval, loading: approvalLoading } = useApprovalForDeal(dealId);
  const { data: waivers, loading: waiversLoading } = useWaiversForDeal(dealId);

  if (approvalLoading || waiversLoading) {
    return (
      <div className="rounded-2xl bg-slate-50 p-8 shadow-card text-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent mx-auto" />
      </div>
    );
  }

  if (!approval && waivers.length === 0) {
    const preIC = stage && ["screening", "due_diligence"].includes(stage);
    return (
      <div className="rounded-2xl bg-slate-50 p-10 flex flex-col items-center text-center">
        <Shield className="h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-primary">
          {preIC ? "IC vote happens after due diligence" : "No approval records yet"}
        </h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md">
          {preIC
            ? "This deal hasn't been submitted to Investment Committee yet. IC votes and Capital Partner sign-offs appear here after DD is complete."
            : "Investment Committee votes and Capital Partner sign-offs will appear here once the deal is submitted for approval."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {approval && (
        <>
          {/* IC Voting */}
          <div className="rounded-2xl bg-slate-50 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-primary">Investment Committee</h3>
              <span className="text-xs text-slate-500">Date: {approval.icDate}</span>
            </div>
            <div className="p-4 space-y-3">
              {approval.votes.map(v => {
                const cfg = voteLabels[v.decision];
                return (
                  <div key={v.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                    <div>
                      <p className="text-sm font-medium text-primary">{v.voter}</p>
                      <p className="text-xs text-slate-500">{v.role}</p>
                      {v.conditions && <p className="text-xs text-warning mt-1">Condition: {v.conditions}</p>}
                    </div>
                    <span className={cn("rounded-md px-2.5 py-1 text-xs font-semibold", cfg.className)}>{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Capital Partner Sign-Off */}
          <div className="rounded-2xl bg-slate-50 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-display text-sm font-semibold text-primary">Capital Partner Sign-Off</h3>
            </div>
            <div className="p-4">
              {approval.capitalPartnerSignOff ? (
                <div className={cn("rounded-lg border p-4", approval.capitalPartnerSignOff.approved ? "border-success/20 bg-success/5" : "border-destructive/20 bg-destructive/5")}>
                  <div className="flex items-center gap-3">
                    {approval.capitalPartnerSignOff.approved ? <CheckCircle2 className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}
                    <div>
                      <p className="text-sm font-semibold text-primary">{approval.capitalPartnerSignOff.approved ? "Approved" : "Rejected"}</p>
                      <p className="text-xs text-slate-500">By: {approval.capitalPartnerSignOff.signedBy} • {approval.capitalPartnerSignOff.date}</p>
                      {approval.capitalPartnerSignOff.conditions && <p className="text-xs text-warning mt-1">{approval.capitalPartnerSignOff.conditions}</p>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-warning/20 bg-warning/5 p-4 flex items-center gap-3">
                  <Clock className="h-5 w-5 text-warning" />
                  <div>
                    <p className="text-sm font-semibold text-primary">Pending</p>
                    <p className="text-xs text-slate-500">Awaiting capital partner review and sign-off</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Audit Trail */}
          {approval.auditTrail.length > 0 && (
            <div className="rounded-2xl bg-slate-50 overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-display text-sm font-semibold text-primary">Audit Trail</h3>
              </div>
              <div className="p-4">
                <div className="relative space-y-0 border-l-2 border-border ml-3">
                  {approval.auditTrail.map((entry, i) => (
                    <div key={i} className="relative pl-6 pb-4 last:pb-0">
                      <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                      <p className="text-sm text-primary">{entry.action}</p>
                      <p className="text-xs text-slate-500">{entry.user} • {entry.date}</p>
                      {entry.detail && <p className="text-xs text-slate-500 italic">{entry.detail}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Covenant Waivers */}
      {waivers.length > 0 && (
        <div className="rounded-2xl bg-slate-50 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-display text-sm font-semibold text-primary">Covenant Waiver Requests</h3>
          </div>
          <div className="p-4 space-y-3">
            {waivers.map(w => (
              <div key={w.id} className="rounded-lg border border-warning/20 bg-warning/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-primary">{w.covenantName} Waiver</p>
                  <span className="rounded-md bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">{w.status.replace(/_/g, " ").toUpperCase()}</span>
                </div>
                <p className="text-xs text-slate-500">{w.reason}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  <span>Requested: {w.requestDate}</span>
                  <span>Proposed fee: {formatCurrency(w.proposedFee)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
