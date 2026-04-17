import { sampleRetentions } from "@/data/constructionMonitoring";
import { formatCurrency } from "@/data/sampleDeals";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Clock, AlertTriangle, Camera, FileText, HardHat, Banknote } from "lucide-react";
import {
  useSiteVisitsForDeal,
  useCertificationsForDeal,
  useMonitoringReportsForDeal,
} from "@/hooks/useDealSubdata";

interface ConstructionMonitoringPanelProps {
  dealId: string;
}

export default function ConstructionMonitoringPanel({ dealId }: ConstructionMonitoringPanelProps) {
  const { data: visits, loading: visitsLoading } = useSiteVisitsForDeal(dealId);
  const { data: certs, loading: certsLoading } = useCertificationsForDeal(dealId);
  const { data: reports, loading: reportsLoading } = useMonitoringReportsForDeal(dealId);
  const retention = sampleRetentions[dealId];

  if (visitsLoading || certsLoading || reportsLoading) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white p-8 text-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent mx-auto" />
      </div>
    );
  }

  const hasData = visits.length > 0 || certs.length > 0 || reports.length > 0;

  if (!hasData) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white p-8 text-center">
        <HardHat className="h-8 w-8 text-slate-500 mx-auto mb-2" />
        <p className="text-sm text-slate-500">No construction monitoring data available for this deal</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="reports" className="space-y-4">
      <TabsList className="bg-muted border border-slate-100 flex-wrap h-auto gap-1 p-1">
        <TabsTrigger value="reports">Monitoring Reports</TabsTrigger>
        <TabsTrigger value="certifications">Certifications</TabsTrigger>
        <TabsTrigger value="visits">Site Visits</TabsTrigger>
        <TabsTrigger value="retentions">Retentions</TabsTrigger>
      </TabsList>

      {/* Monitoring Reports */}
      <TabsContent value="reports" className="space-y-4">
        {reports.map(r => (
          <div key={r.id} className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-display text-sm font-semibold text-primary">Report #{r.reportNumber} — {r.period}</h4>
                <p className="text-xs text-slate-500">{r.date} • {r.preparedBy}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge label={r.scheduleStatus.replace("_", " ")} type={r.scheduleStatus === "on_track" || r.scheduleStatus === "ahead" ? "success" : r.scheduleStatus === "minor_delay" ? "warning" : "danger"} />
                <StatusBadge label={r.costStatus.replace("_", " ")} type={r.costStatus === "within_budget" || r.costStatus === "under_budget" ? "success" : r.costStatus === "minor_overrun" ? "warning" : "danger"} />
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MiniMetric label="Construction" value={`${r.constructionProgress}%`} />
                <MiniMetric label="Budget Used" value={`${r.budgetUtilization}%`} />
                <MiniMetric label="Quality" value={r.qualityAssessment.replace("_", " ")} />
                <MiniMetric label="Drawdown Rec." value={r.drawdownRecommendation} highlight={r.drawdownRecommendation === "approve"} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase mb-1.5">Key Findings</p>
                <ul className="space-y-1">
                  {r.keyFindings.map((f, i) => (
                    <li key={i} className="text-sm text-primary flex items-start gap-2">
                      <span className="text-accent mt-0.5">•</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500 uppercase mb-1">Recommendation</p>
                <p className="text-sm text-primary">{r.recommendation}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>Next: <strong className="text-primary">{r.nextMilestone}</strong></span>
                <span>Due: {r.nextMilestoneDate}</span>
                {r.drawdownAmount && <span>Amount: <strong className="text-primary">{formatCurrency(r.drawdownAmount)}</strong></span>}
              </div>
            </div>
          </div>
        ))}
      </TabsContent>

      {/* Certifications */}
      <TabsContent value="certifications">
        <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Period</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Certified</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Retention (5%)</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Net Payable</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Cumulative</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {certs.map(c => (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-primary">#{c.certNumber}</td>
                    <td className="px-4 py-3 text-slate-500">{c.period}</td>
                    <td className="px-4 py-3 text-right text-primary">{formatCurrency(c.certifiedAmount)}</td>
                    <td className="px-4 py-3 text-right text-warning">{formatCurrency(c.retentionAmount)}</td>
                    <td className="px-4 py-3 text-right font-medium text-primary">{formatCurrency(c.netPayable)}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{formatCurrency(c.cumulativeCertified)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium",
                        c.status === "paid" ? "bg-emerald-100 text-emerald-700" :
                        c.status === "approved" ? "bg-blue-100 text-blue-700" :
                        c.status === "submitted" ? "bg-amber-100 text-amber-700" :
                        c.status === "disputed" ? "bg-red-100 text-red-700" :
                        "bg-muted text-slate-500"
                      )}>{c.status.charAt(0).toUpperCase() + c.status.slice(1)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </TabsContent>

      {/* Site Visits */}
      <TabsContent value="visits" className="space-y-4">
        {visits.map(v => (
          <div key={v.id} className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-display text-sm font-semibold text-primary">{v.date} — Site Inspection</h4>
                <p className="text-xs text-slate-500">{v.inspector} {v.weatherConditions && `• ${v.weatherConditions}`} {v.workersOnSite && `• ${v.workersOnSite} workers`}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">Progress: <strong className="text-primary">{v.constructionProgress}%</strong></span>
                <span className={cn("text-xs font-medium", v.deviation >= 0 ? "text-emerald-600" : "text-destructive")}>
                  {v.deviation >= 0 ? "+" : ""}{v.deviation}% vs plan
                </span>
                <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium",
                  v.recommendation === "proceed" ? "bg-emerald-100 text-emerald-700" :
                  v.recommendation === "review" ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                )}>{v.recommendation}</span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <ul className="space-y-1">
                {v.findings.map((f, i) => (
                  <li key={i} className="text-sm text-primary flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span> {f}
                  </li>
                ))}
              </ul>
              {v.photos.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase mb-1.5 flex items-center gap-1"><Camera className="h-3 w-3" /> Photos ({v.photos.length})</p>
                  <div className="flex gap-2 flex-wrap">
                    {v.photos.map((p, i) => (
                      <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-xs text-slate-500">
                        📷 {p.caption}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </TabsContent>

      {/* Retentions */}
      <TabsContent value="retentions">
        {retention ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MiniMetric label="Retention Rate" value={`${retention.retentionRate}%`} />
              <MiniMetric label="Total Retained" value={formatCurrency(retention.totalRetained)} />
              <MiniMetric label="Released" value={formatCurrency(retention.totalReleased)} />
              <MiniMetric label="Balance Held" value={formatCurrency(retention.retentionBalance)} highlight />
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <p className="text-xs font-medium text-slate-500 uppercase mb-2">Release Conditions</p>
              <ul className="space-y-1.5">
                {retention.releaseConditions.map((c, i) => (
                  <li key={i} className="text-sm text-primary flex items-start gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-500 mt-0.5 shrink-0" /> {c}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Certification</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Retained</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {retention.entries.map(e => (
                    <tr key={e.certId} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3 text-primary">Cert #{e.certNumber}</td>
                      <td className="px-4 py-3 text-right text-primary">{formatCurrency(e.retainedAmount)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium",
                          e.status === "held" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                        )}>{e.status === "held" ? "Held" : "Released"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-100 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">No retention schedule configured</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function StatusBadge({ label, type }: { label: string; type: "success" | "warning" | "danger" }) {
  return (
    <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-medium capitalize",
      type === "success" ? "bg-emerald-100 text-emerald-700" :
      type === "warning" ? "bg-amber-100 text-amber-700" :
      "bg-red-100 text-red-700"
    )}>{label}</span>
  );
}

function MiniMetric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-3">
      <p className="text-[11px] text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={cn("font-display text-sm font-bold mt-0.5 capitalize", highlight ? "text-accent" : "text-primary")}>{value}</p>
    </div>
  );
}
