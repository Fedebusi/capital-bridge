import AppLayout from "@/components/layout/AppLayout";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useDeals } from "@/hooks/useDeals";
import { formatMillions, formatPercent, formatCurrency, stageLabels, stageColors } from "@/data/sampleDeals";
import { sampleTermSheets, sampleEnhancedWaivers, termSheetStatusLabels, termSheetStatusColors } from "@/data/termSheetData";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { FileText, Shield, Clock, CheckCircle2, AlertTriangle, Lock, Banknote, Percent, Calendar, Building2, Printer } from "lucide-react";
import { generateTermSheetPDF } from "@/lib/generateTermSheetPDF";

export default function TermSheetPage() {
  const { deals, loading } = useDeals();

  if (loading) {
    return <AppLayout><LoadingSkeleton /></AppLayout>;
  }

  const dealsWithTS = deals.filter(d => sampleTermSheets[d.id]);

  return (
    <AppLayout>
      <div className="space-y-8">
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-extrabold text-primary">Term Sheets & Covenants</h1>
            <p className="text-slate-500 text-sm mt-1">Term sheet lifecycle, key terms, security packages, and covenant waivers</p>
          </div>
        </header>

        {dealsWithTS.map(deal => {
          const ts = sampleTermSheets[deal.id];
          const waivers = sampleEnhancedWaivers[deal.id] || [];
          const kt = ts.keyTerms;

          return (
            <div key={deal.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={cn("rounded-lg px-2.5 py-0.5 text-xs font-bold uppercase", stageColors[deal.stage])}>
                    {stageLabels[deal.stage]}
                  </span>
                  <Link to={`/deals/${deal.id}`} className="text-[15px] font-bold text-primary hover:text-slate-600 transition-colors">
                    {deal.projectName}
                  </Link>
                  <span className="text-xs text-slate-400">{deal.borrower}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => generateTermSheetPDF(deal, ts)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-wide"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Print PDF
                  </button>
                  <span className={cn("rounded-lg px-3 py-1 text-xs font-bold uppercase", termSheetStatusColors[ts.currentStatus])}>
                    {termSheetStatusLabels[ts.currentStatus]}
                  </span>
                </div>
              </div>

              <div className="p-6 grid lg:grid-cols-3 gap-6">
                {/* Key Terms */}
                <div className="lg:col-span-2 space-y-5">
                  <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-emerald-600" /> Key Terms
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { icon: Banknote, label: "Facility", value: formatCurrency(kt.facility), color: "bg-emerald-50 text-emerald-600" },
                      { icon: Percent, label: "Cash Rate", value: `${kt.cashRate}%`, color: "bg-blue-50 text-blue-600" },
                      { icon: Percent, label: "PIK Spread", value: `${kt.pikSpread}%`, color: "bg-violet-50 text-violet-600" },
                      { icon: Percent, label: "Total Rate", value: `${kt.cashRate + kt.pikSpread}%`, color: "bg-primary/5 text-primary" },
                      { icon: Calendar, label: "Tenor", value: `${kt.tenor} months`, color: "bg-amber-50 text-amber-600" },
                      { icon: Building2, label: "Max LTV", value: `${kt.ltv}%`, color: "bg-rose-50 text-rose-600" },
                      { icon: Building2, label: "Max LTC", value: `${kt.ltc}%`, color: "bg-orange-50 text-orange-600" },
                      { icon: Percent, label: "Min Pre-Sales", value: `${kt.minPresales}%`, color: "bg-cyan-50 text-cyan-600" },
                    ].map(term => (
                      <div key={term.label} className="rounded-xl border border-slate-200 p-3 hover:shadow-sm transition-all">
                        <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center mb-2", term.color)}>
                          <term.icon className="h-3.5 w-3.5" />
                        </div>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{term.label}</p>
                        <p className="text-sm font-extrabold text-primary mt-0.5">{term.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Fees */}
                  <div className="flex gap-4">
                    <div className="rounded-xl bg-slate-50 px-4 py-3 flex-1">
                      <p className="text-xs text-slate-400 font-medium uppercase">Origination Fee</p>
                      <p className="text-lg font-extrabold text-primary">{kt.originationFee}%</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-4 py-3 flex-1">
                      <p className="text-xs text-slate-400 font-medium uppercase">Exit Fee</p>
                      <p className="text-lg font-extrabold text-primary">{kt.exitFee}%</p>
                    </div>
                    {ts.exclusivityEnd && (
                      <div className="rounded-xl bg-slate-50 px-4 py-3 flex-1">
                        <p className="text-xs text-slate-400 font-medium uppercase">Exclusivity Until</p>
                        <p className="text-lg font-extrabold text-primary">{ts.exclusivityEnd}</p>
                      </div>
                    )}
                  </div>

                  {/* Security Package */}
                  <div>
                    <h3 className="text-sm font-bold text-primary flex items-center gap-2 mb-3">
                      <Lock className="h-4 w-4 text-blue-600" /> Security Package
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {kt.securityPackage.map(item => (
                        <div key={item} className="flex items-center gap-2 rounded-lg bg-blue-50/50 border border-blue-100/50 px-3 py-2">
                          <Shield className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          <span className="text-xs font-medium text-slate-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Covenant Waivers */}
                  {waivers.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-primary flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-amber-500" /> Active Waivers
                      </h3>
                      {waivers.map(w => (
                        <div key={w.id} className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-primary">{w.covenantName}</span>
                            <span className={cn(
                              "rounded-lg px-2.5 py-0.5 text-[11px] font-bold uppercase",
                              w.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                              w.status === "rejected" ? "bg-red-100 text-red-600" :
                              "bg-amber-100 text-amber-700"
                            )}>
                              {w.status.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">{w.reason}</p>
                          <div className="flex gap-6 text-[11px]">
                            <div><span className="text-slate-400">Current:</span> <span className="font-bold text-red-500">{w.currentValue}</span></div>
                            <div><span className="text-slate-400">Threshold:</span> <span className="font-bold text-primary">{w.threshold}</span></div>
                            <div><span className="text-slate-400">Fee:</span> <span className="font-bold text-primary">€{w.proposedFee.toLocaleString("it-IT")}</span></div>
                            {w.validityPeriod && <div><span className="text-slate-400">Period:</span> <span className="font-bold text-primary">{w.validityPeriod}</span></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Audit Trail + CP Validation */}
                <div className="space-y-5">
                  {/* Capital Partner Validation */}
                  {ts.castlelakeValidation && (
                    <div className="rounded-xl border border-slate-200 p-4">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-wide mb-3">Capital Partner Validation</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Submitted</span>
                          <span className="font-bold text-primary flex items-center gap-1">
                            {ts.castlelakeValidation.submitted ? <><CheckCircle2 className="h-3 w-3 text-emerald-500" /> {ts.castlelakeValidation.submittedDate}</> : "Pending"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Approved</span>
                          <span className="font-bold text-primary flex items-center gap-1">
                            {ts.castlelakeValidation.approved === true ? <><CheckCircle2 className="h-3 w-3 text-emerald-500" /> {ts.castlelakeValidation.approvedDate}</> :
                             ts.castlelakeValidation.approved === false ? <span className="text-red-500">Rejected</span> :
                             <><Clock className="h-3 w-3 text-amber-500" /> Pending</>}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Memo</span>
                          <span className={cn("font-bold", ts.castlelakeValidation.memoAttached ? "text-emerald-600" : "text-red-500")}>
                            {ts.castlelakeValidation.memoAttached ? "Attached" : "Missing"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Model</span>
                          <span className={cn("font-bold", ts.castlelakeValidation.modelAttached ? "text-emerald-600" : "text-amber-500")}>
                            {ts.castlelakeValidation.modelAttached ? "Attached" : "Pending"}
                          </span>
                        </div>
                        {ts.castlelakeValidation.conditions && ts.castlelakeValidation.conditions.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-200">
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Conditions</p>
                            {ts.castlelakeValidation.conditions.map((c, i) => (
                              <p key={i} className="text-[11px] text-amber-700 bg-amber-50 rounded px-2 py-1 mt-1">{c}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Version History */}
                  <div className="rounded-xl border border-slate-200 p-4">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wide mb-3">Version History</h4>
                    <div className="space-y-2">
                      {ts.versions.map(v => (
                        <div key={v.version} className="flex items-start gap-2 text-[11px]">
                          <span className="bg-slate-100 text-primary font-bold rounded px-1.5 py-0.5 shrink-0">v{v.version}</span>
                          <div>
                            <span className="text-slate-400">{v.date}</span> — <span className="font-medium text-slate-600">{v.updatedBy}</span>
                            {v.changes && <p className="text-slate-400 mt-0.5">{v.changes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Audit Trail */}
                  <div className="rounded-xl border border-slate-200 p-4">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wide mb-3">Audit Trail</h4>
                    <div className="relative">
                      <div className="absolute left-[5px] top-2 bottom-2 w-px bg-slate-100" />
                      <div className="space-y-3">
                        {ts.auditTrail.map((entry, i) => (
                          <div key={i} className="flex gap-3 relative">
                            <div className="h-3 w-3 rounded-full bg-slate-200 border-2 border-white shrink-0 mt-0.5 z-10" />
                            <div>
                              <p className="text-[11px] font-bold text-primary">{entry.action}</p>
                              <p className="text-xs text-slate-400">{entry.user} · {entry.date}</p>
                              {entry.detail && <p className="text-xs text-slate-400 mt-0.5">{entry.detail}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
