import { sampleLegalDocs, sampleConditionsPrecedent, sampleSecurityPackages, type LegalDocStatus } from "@/data/dealModules";
import { cn } from "@/lib/utils";
import { FileText, CheckCircle2, Clock, AlertTriangle, Shield, Lock } from "lucide-react";

const docStatusConfig: Record<LegalDocStatus, { label: string; className: string }> = {
  not_started: { label: "Not Started", className: "text-muted-foreground bg-muted" },
  drafting: { label: "Drafting", className: "text-blue-600 bg-blue-50" },
  review: { label: "Review", className: "text-amber-600 bg-amber-50" },
  negotiation: { label: "Negotiation", className: "text-purple-600 bg-purple-50" },
  agreed: { label: "Agreed", className: "text-accent bg-accent/10" },
  executed: { label: "Executed", className: "text-success bg-success/10" },
};

const cpStatusConfig = {
  pending: { icon: Clock, className: "text-muted-foreground", label: "Pending" },
  submitted: { icon: AlertTriangle, className: "text-warning", label: "Submitted" },
  verified: { icon: CheckCircle2, className: "text-success", label: "Verified" },
  waived: { icon: CheckCircle2, className: "text-muted-foreground", label: "Waived" },
};

const secStatusConfig = {
  pending: { label: "Pending", className: "text-muted-foreground bg-muted" },
  in_progress: { label: "In Progress", className: "text-accent bg-accent/10" },
  executed: { label: "Executed", className: "text-success bg-success/10" },
  released: { label: "Released", className: "text-muted-foreground bg-muted" },
};

interface LegalSecurityPanelProps {
  dealId: string;
}

export default function LegalSecurityPanel({ dealId }: LegalSecurityPanelProps) {
  const legalDocs = sampleLegalDocs[dealId] || [];
  const cps = sampleConditionsPrecedent[dealId] || [];
  const security = sampleSecurityPackages[dealId] || [];

  const hasData = legalDocs.length > 0 || cps.length > 0 || security.length > 0;

  if (!hasData) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 shadow-card text-center">
        <Lock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No legal or security data for this deal yet</p>
      </div>
    );
  }

  const cpVerified = cps.filter(c => c.status === "verified" || c.status === "waived").length;
  const allCPsSatisfied = cps.length > 0 && cpVerified === cps.length;

  return (
    <div className="space-y-4">
      {/* Legal Documents */}
      {legalDocs.length > 0 && (
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent" /> Legal Documentation
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Document</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">Version</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Assigned To</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">Deadline</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">Updated</th>
                </tr>
              </thead>
              <tbody>
                {legalDocs.map(doc => {
                  const cfg = docStatusConfig[doc.status];
                  return (
                    <tr key={doc.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">{doc.name}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", cfg.className)}>{cfg.label}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-muted-foreground">v{doc.currentVersion}</td>
                      <td className="px-4 py-3 text-muted-foreground">{doc.assignedTo}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{doc.deadline || "—"}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{doc.lastUpdated}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conditions Precedent */}
      {cps.length > 0 && (
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent" /> Conditions Precedent
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{cpVerified}/{cps.length} satisfied</span>
              {allCPsSatisfied && (
                <span className="rounded-md bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">READY FOR DRAWDOWN</span>
              )}
            </div>
          </div>
          <div>
            {cps.map(cp => {
              const cfg = cpStatusConfig[cp.status];
              const Icon = cfg.icon;
              return (
                <div key={cp.id} className="flex items-center justify-between border-b border-border last:border-0 px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={cn("h-4 w-4 shrink-0", cfg.className)} />
                    <div className="min-w-0">
                      <p className="text-sm text-foreground">{cp.description}</p>
                      <p className="text-xs text-muted-foreground">{cp.category}</p>
                      {cp.notes && <p className="text-xs text-warning mt-0.5">{cp.notes}</p>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={cn("text-xs font-medium", cfg.className)}>{cfg.label}</span>
                    {cp.verifiedBy && <p className="text-xs text-muted-foreground">{cp.verifiedBy} • {cp.verifiedDate}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Security Package */}
      {security.length > 0 && (
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" /> Security Package
            </h3>
          </div>
          <div>
            {security.map(s => {
              const cfg = secStatusConfig[s.status];
              return (
                <div key={s.id} className="flex items-center justify-between border-b border-border last:border-0 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{s.type}</p>
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                    {s.entity && <p className="text-xs text-muted-foreground">Entity: {s.entity}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", cfg.className)}>{cfg.label}</span>
                    {s.registrationDate && <p className="text-xs text-muted-foreground mt-0.5">{s.registrationDate}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
