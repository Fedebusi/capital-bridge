import { sampleTermSheets, sampleEnhancedWaivers, termSheetStatusLabels, termSheetStatusColors } from "@/data/termSheetData";
import { formatCurrency } from "@/data/sampleDeals";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Clock, FileText, Shield, AlertTriangle, XCircle } from "lucide-react";

interface TermSheetWaiverPanelProps {
  dealId: string;
}

export default function TermSheetWaiverPanel({ dealId }: TermSheetWaiverPanelProps) {
  const ts = sampleTermSheets[dealId];
  const waivers = sampleEnhancedWaivers[dealId] || [];

  if (!ts && waivers.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">No term sheet or waiver data available for this deal</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue={ts ? "termsheet" : "waivers"} className="space-y-4">
      <TabsList className="bg-muted border border-border flex-wrap h-auto gap-1 p-1">
        {ts && <TabsTrigger value="termsheet">Term Sheet</TabsTrigger>}
        {waivers.length > 0 && <TabsTrigger value="waivers">Waivers ({waivers.length})</TabsTrigger>}
      </TabsList>

      {/* Term Sheet */}
      {ts && (
        <TabsContent value="termsheet" className="space-y-4">
          {/* Status & Castlelake Validation */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="font-display text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
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
              <h3 className="font-display text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent" /> Castlelake Validation
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
                      <p className="text-muted-foreground mb-1">Conditions:</p>
                      <ul className="space-y-1 ml-4">
                        {ts.castlelakeValidation.conditions.map((c, i) => (
                          <li key={i} className="text-foreground text-sm flex items-start gap-1.5">
                            <AlertTriangle className="h-3 w-3 text-warning mt-0.5 shrink-0" /> {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not yet submitted to Castlelake</p>
              )}
            </div>
          </div>

          {/* Key Terms */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display text-sm font-semibold text-foreground mb-4">Key Terms</h3>
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
                <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Security Package</p>
                <div className="flex flex-wrap gap-1.5">
                  {ts.keyTerms.securityPackage.map((s, i) => (
                    <span key={i} className="rounded-md bg-muted px-2 py-1 text-xs text-foreground">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Version History */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display text-sm font-semibold text-foreground mb-4">Version History</h3>
            <div className="space-y-2">
              {ts.versions.map(v => (
                <div key={v.version} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground">v{v.version}</span>
                    <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-medium", termSheetStatusColors[v.status])}>
                      {termSheetStatusLabels[v.status]}
                    </span>
                    <span className="text-sm text-foreground">{v.updatedBy}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{v.date}</p>
                    {v.changes && <p className="text-xs text-foreground">{v.changes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Trail */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display text-sm font-semibold text-foreground mb-4">Audit Trail</h3>
            <div className="space-y-2">
              {ts.auditTrail.map((a, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <div className="h-2 w-2 rounded-full bg-accent mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{a.action}</p>
                    {a.detail && <p className="text-xs text-muted-foreground">{a.detail}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">{a.user}</p>
                    <p className="text-xs text-muted-foreground">{a.date}</p>
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
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h4 className="font-display text-sm font-semibold text-foreground">{w.covenantName} — Waiver Request</h4>
                  <p className="text-xs text-muted-foreground">Requested: {w.requestDate} {w.validityPeriod && `• Validity: ${w.validityPeriod}`}</p>
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
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Reason</p>
                  <p className="text-sm text-foreground">{w.reason}</p>
                </div>
                <div className="grid lg:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Internal Approval</p>
                    {w.internalApproval ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm text-foreground">{w.internalApproval.approvedBy} — {w.internalApproval.date}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Pending</span>
                    )}
                  </div>
                  <div className={cn("rounded-lg border p-3",
                    w.cpApproval?.approved ? "border-emerald-200" : "border-border"
                  )}>
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Castlelake Approval</p>
                    {w.cpApproval ? (
                      <div className="flex items-center gap-2">
                        {w.cpApproval.approved ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-destructive" />}
                        <span className="text-sm text-foreground">{w.cpApproval.approvedBy} — {w.cpApproval.date}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-warning" />
                        <span className="text-sm text-warning font-medium">Awaiting Castlelake decision</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Audit Trail */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Audit Trail</p>
                  <div className="space-y-1.5">
                    {w.auditTrail.map((a, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <div className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                        <span className="text-muted-foreground">{a.date}</span>
                        <span className="text-foreground">{a.action}</span>
                        {a.detail && <span className="text-muted-foreground">— {a.detail}</span>}
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
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right text-foreground">{value}</span>
    </div>
  );
}

function MiniTerm({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-2.5">
      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="font-display text-sm font-semibold mt-0.5 text-foreground">{value}</p>
    </div>
  );
}
