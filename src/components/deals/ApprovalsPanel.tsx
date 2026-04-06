import { sampleApprovals, sampleWaivers, type VoteDecision } from "@/data/dealModules";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertTriangle, Clock, Shield, FileText } from "lucide-react";
import { formatCurrency } from "@/data/sampleDeals";

const voteLabels: Record<VoteDecision, { label: string; className: string }> = {
  approve: { label: "Approved", className: "text-success bg-success/10" },
  reject: { label: "Rejected", className: "text-destructive bg-destructive/10" },
  approve_with_conditions: { label: "Approved w/ Conditions", className: "text-warning bg-warning/10" },
};

interface ApprovalsPanelProps {
  dealId: string;
}

export default function ApprovalsPanel({ dealId }: ApprovalsPanelProps) {
  const approval = sampleApprovals[dealId];
  const waivers = sampleWaivers[dealId] || [];

  if (!approval && waivers.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 shadow-card text-center">
        <Shield className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No approval records for this deal</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {approval && (
        <>
          {/* IC Voting */}
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-foreground">Investment Committee</h3>
              <span className="text-xs text-muted-foreground">Date: {approval.icDate}</span>
            </div>
            <div className="p-4 space-y-3">
              {approval.votes.map(v => {
                const cfg = voteLabels[v.decision];
                return (
                  <div key={v.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{v.voter}</p>
                      <p className="text-xs text-muted-foreground">{v.role}</p>
                      {v.conditions && <p className="text-xs text-warning mt-1">Condition: {v.conditions}</p>}
                    </div>
                    <span className={cn("rounded-md px-2.5 py-1 text-xs font-semibold", cfg.className)}>{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Capital Partner Sign-Off */}
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-display text-sm font-semibold text-foreground">Capital Partner Sign-Off</h3>
            </div>
            <div className="p-4">
              {approval.capitalPartnerSignOff ? (
                <div className={cn("rounded-lg border p-4", approval.capitalPartnerSignOff.approved ? "border-success/20 bg-success/5" : "border-destructive/20 bg-destructive/5")}>
                  <div className="flex items-center gap-3">
                    {approval.capitalPartnerSignOff.approved ? <CheckCircle2 className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}
                    <div>
                      <p className="text-sm font-semibold text-foreground">{approval.capitalPartnerSignOff.approved ? "Approved" : "Rejected"}</p>
                      <p className="text-xs text-muted-foreground">By: {approval.capitalPartnerSignOff.signedBy} • {approval.capitalPartnerSignOff.date}</p>
                      {approval.capitalPartnerSignOff.conditions && <p className="text-xs text-warning mt-1">{approval.capitalPartnerSignOff.conditions}</p>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-warning/20 bg-warning/5 p-4 flex items-center gap-3">
                  <Clock className="h-5 w-5 text-warning" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Pending</p>
                    <p className="text-xs text-muted-foreground">Awaiting capital partner review and sign-off</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Audit Trail */}
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-display text-sm font-semibold text-foreground">Audit Trail</h3>
            </div>
            <div className="p-4">
              <div className="relative space-y-0 border-l-2 border-border ml-3">
                {approval.auditTrail.map((entry, i) => (
                  <div key={i} className="relative pl-6 pb-4 last:pb-0">
                    <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                    <p className="text-sm text-foreground">{entry.action}</p>
                    <p className="text-xs text-muted-foreground">{entry.user} • {entry.date}</p>
                    {entry.detail && <p className="text-xs text-muted-foreground italic">{entry.detail}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Covenant Waivers */}
      {waivers.length > 0 && (
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-display text-sm font-semibold text-foreground">Covenant Waiver Requests</h3>
          </div>
          <div className="p-4 space-y-3">
            {waivers.map(w => (
              <div key={w.id} className="rounded-lg border border-warning/20 bg-warning/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-foreground">{w.covenantName} Waiver</p>
                  <span className="rounded-md bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">{w.status.replace("_", " ").toUpperCase()}</span>
                </div>
                <p className="text-xs text-muted-foreground">{w.reason}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
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
