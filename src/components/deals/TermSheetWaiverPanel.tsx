import { termSheetStatusLabels, termSheetStatusColors } from "@/data/termSheetData";
import { formatCurrency, type DealStage } from "@/data/sampleDeals";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Clock, FileText, Shield, AlertTriangle, XCircle } from "lucide-react";
import { useTermSheetForDeal, useWaiversForDeal } from "@/hooks/useDealSubdata";

interface TermSheetWaiverPanelProps {
  dealId: string;
  stage?: DealStage;
}

export default function TermSheetWaiverPanel({ dealId, stage }: TermSheetWaiverPanelProps) {
  const { data: ts, loading: tsLoading } = useTermSheetForDeal(dealId);
  const { data: waivers, loading: waiversLoading } = useWaiversForDeal(dealId);

  if (tsLoading || waiversLoading) {
    return (
      <div className="rounded-2xl bg-slate-50 p-8 text-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent mx-auto" />
      </div>
    );
  }

  if (!ts && waivers.length === 0) {
    const tooEarly = stage && ["screening", "due_diligence"].includes(stage);
    return (
      <div className="rounded-2xl bg-slate-50 p-10 flex flex-col items-center text-center">
        <FileText className="h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-primary">
          {tooEarly ? "Term sheet drafted after IC approval" : "No term sheet drafted yet"}
        </h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md">
          {tooEarly
            ? "Deals in screening or due-diligence don't have a term sheet yet. It gets drafted once Investment Committee approves the deal."
            : "Term sheets capture facility size, fees, and security. Draft one from the documentation stage onwards."}
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue={ts ? "termsheet" : "waivers"} className="space-y-4">
      <TabsList className="bg-muted border border-slate-100 flex-wrap h-auto gap-1 p-1">
        {ts && <TabsTrigger value="termsheet">Term Sheet</TabsTrigger>}
        {waivers.length > 0 && <TabsTrigger value="waivers">Waivers ({waivers.length})</TabsTrigger>}
      </TabsList>

      {/* Term Sheet */}
      {ts && (
        <TabsContent value="termsheet" className="space-y-4">
          {/* Status & Capital Partner Validation */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-slate-50 p-6">
              <h3 className="font-display text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent" /> Term Sheet Status
              </h3>
              <div className="space-y-3 text-sm">
                <Row label="Status" value={
                  <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", termSheetStatusColors[ts.currentStatus])}>
                    {termSheetStatusLabels[ts.currentStatus]}
                  </span>
                } />
                <Row label="Version" value={`v${ts.currentVersion}`} />
                {ts.issuedDate && <Row label="Issued" value={ts.issuedDate} />}
                {ts.signedDate && <Row label="Signed" value={ts.signedDate} />}
                {ts.exclusivityEnd && <Row label="Exclusivity Ends" value={ts.exclusivityEnd} />}
              </div>
            </div>

            <div className={cn("rounded-xl border bg-card p-5 shadow-card",
              ts.castlelakeValidation?.approved ? "border-emerald-200" :
              ts.castlelakeValidation?.submitted ? "border-amber-200" : "border-border"
            )}>
              <h3 className="font-display text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent" /> Capital Partner Validation
              </h3>
              {ts.castlelakeValidation ? (
                <div className="space-y-3 text-sm">
                  <Row label="Submitted" value={ts.castlelakeValidation.submitted ? "✓ Yes" : "Not yet"} />
                  {ts.castlelakeValidation.submittedDate && <Row label="Submitted Date" value={ts.castlelakeValidation.submittedDate} />}
                  <Row label="Memo Attached" value={ts.castlelakeValidation.memoAttached ? "✓" : "✗ Missing"} />
                  <Row label="Model Attached" value={ts.castlelakeValidation.modelAttached ? "✓" : "✗ Missing"} />
                  {ts.castlelakeValidation.approved !== undefined && (
                    <Row label="Decision" value={
                      <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium",
                        ts.castlelakeValidation.approved ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      )}>{ts.castlelakeValidation.approved ? "Approved" : "Rejected"}</span>
                    } />
                  )}
                  {ts.castlelakeValidation.approvedBy && <Row label="Approved By" value={ts.castlelakeValidation.approvedBy} />}
                  {ts.castlelakeValidation.conditions && ts.castlelakeValidation.conditions.length > 0 && (
                    <div>
                      <p className="text-slate-500 mb-1">Conditions:</p>
                      <ul className="space-y-1 ml-4">
                        {ts.castlelakeValidation.conditions.map((c, i) => (
                          <li key={i} className="text-primary text-sm flex items-start gap-1.5">
                            <AlertTriangle className="h-3 w-3 text-warning mt-0.5 shrink-0" /> {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Not yet submitted to Capital Partner</p>
              )}
            </div>
          </div>

          {/* Key Terms */}
          <div className="rounded-2xl bg-slate-50 p-6">
            <h3 className="font-display text-sm font-semibold text-primary mb-4">Key Terms</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MiniTerm label="Facility" value={formatCurrency(ts.keyTerms.facility)} />
              <MiniTerm label="Cash Rate" value={`${ts.keyTerms.cashRate}%`} />
              <MiniTerm label="PIK Spread" value={`${ts.keyTerms.pikSpread}%`} />
              <MiniTerm label="All-in Rate" value={`${ts.keyTerms.cashRate + ts.keyTerms.pikSpread}%`} />
              <MiniTerm label="Origination Fee" value={`${ts.keyTerms.originationFee}%`} />
              <MiniTerm label="Exit Fee" value={`${ts.keyTerms.exitFee}%`} />
              <MiniTerm label="Tenor" value={`${ts.keyTerms.tenor} months`} />
              <MiniTerm label="Max LTV" value={`${ts.keyTerms.ltv}%`} />
            </div>
            {ts.keyTerms.securityPackage.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-slate-500 uppercase mb-2">Security Package</p>
                <div className="flex flex-wrap gap-1.5">
                  {ts.keyTerms.securityPackage.map((s, i) => (
                    <span key={i} className="rounded-md bg-muted px-2 py-1 text-xs text-primary">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Version History */}
          <div className="rounded-2xl bg-slate-50 p-6">
            <h3 className="font-display text-sm font-semibold text-primary mb-4">Version History</h3>
            <div className="space-y-2">
              {ts.versions.map(v => (
                <div key={v.version} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500">v{v.version}</span>
                    <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-medium", termSheetStatusColors[v.status])}>
                      {termSheetStatusLabels[v.status]}
                    </span>
                    <span className="text-sm text-primary">{v.updatedBy}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">{v.date}</p>
                    {v.changes && <p className="text-xs text-primary">{v.changes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Trail */}
          <div className="rounded-2xl bg-slate-50 p-6">
            <h3 className="font-display text-sm font-semibold text-primary mb-4">Audit Trail</h3>
            <div className="space-y-2">
              {ts.auditTrail.map((a, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                  <div className="h-2 w-2 rounded-full bg-accent mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-primary">{a.action}</p>
                    {a.detail && <p className="text-xs text-slate-500">{a.detail}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-500">{a.user}</p>
                    <p className="text-xs text-slate-500">{a.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      )}

      {/* Waivers */}
      {waivers.length > 0 && (
        <TabsContent value="waivers" className="space-y-4">
          {waivers.map(w => (
            <div key={w.id} className={cn("rounded-xl border bg-card shadow-card overflow-hidden",
              w.status === "approved" ? "border-emerald-200" :
              w.status === "rejected" ? "border-red-200" :
              "border-amber-200"
            )}>
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-display text-sm font-semibold text-primary">{w.covenantName} — Waiver Request</h4>
                  <p className="text-xs text-slate-500">Requested: {w.requestDate} {w.validityPeriod && `• Validity: ${w.validityPeriod}`}</p>
                </div>
                <span className={cn("rounded-md px-2.5 py-1 text-xs font-medium",
                  w.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                  w.status === "rejected" ? "bg-red-100 text-red-700" :
                  w.status === "cp_review" ? "bg-amber-100 text-amber-700" :
                  "bg-blue-100 text-blue-700"
                )}>{w.status.replace("_", " ").toUpperCase()}</span>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <MiniTerm label="Current Value" value={w.currentValue} />
                  <MiniTerm label="Threshold" value={w.threshold} />
                  <MiniTerm label="Proposed Fee" value={formatCurrency(w.proposedFee)} />
                  <MiniTerm label="Fee Type" value={w.feeType === "flat" ? "Flat Fee" : "bps on outstanding"} />
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-500 uppercase mb-1">Reason</p>
                  <p className="text-sm text-primary">{w.reason}</p>
                </div>
                <div className="grid lg:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-100 p-3">
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Internal Approval</p>
                    {w.internalApproval ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm text-primary">{w.internalApproval.approvedBy} — {w.internalApproval.date}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-500">Pending</span>
                    )}
                  </div>
                  <div className={cn("rounded-lg border p-3",
                    w.cpApproval?.approved ? "border-emerald-200" : "border-border"
                  )}>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Capital Partner Approval</p>
                    {w.cpApproval ? (
                      <div className="flex items-center gap-2">
                        {w.cpApproval.approved ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-destructive" />}
                        <span className="text-sm text-primary">{w.cpApproval.approvedBy} — {w.cpApproval.date}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-warning" />
                        <span className="text-sm text-warning font-medium">Awaiting Capital Partner decision</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Audit Trail */}
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase mb-2">Audit Trail</p>
                  <div className="space-y-1.5">
                    {w.auditTrail.map((a, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <div className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                        <span className="text-slate-500">{a.date}</span>
                        <span className="text-primary">{a.action}</span>
                        {a.detail && <span className="text-slate-500">— {a.detail}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>
      )}
    </Tabs>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="text-right text-primary">{value}</span>
    </div>
  );
}

function MiniTerm({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-2.5">
      <p className="text-[11px] text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="font-display text-sm font-semibold mt-0.5 text-primary">{value}</p>
    </div>
  );
}
