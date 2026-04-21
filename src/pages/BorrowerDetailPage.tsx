import { useParams, Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { sampleBorrowers, ratingColors, kycStatusColors } from "@/data/borrowers";
import { useDeals } from "@/hooks/useDeals";
import { formatCurrency, formatMillions, formatPercent, stageLabels, stageColors } from "@/data/sampleDeals";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useBorrowersQuery } from "@/hooks/useSupabaseQuery";
import type { DbBorrower } from "@/types/database";
import type { Borrower } from "@/data/borrowers";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Building, Users, Shield, TrendingUp, CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";

function dbBorrowerToFrontend(b: DbBorrower): Borrower {
  return {
    id: b.id, name: b.name, group: b.group_name, type: b.type,
    internalRating: b.internal_rating, ratingDate: b.rating_date,
    headquarters: b.headquarters, yearEstablished: b.year_established,
    website: b.website ?? undefined, description: b.description,
    totalExposure: Number(b.total_exposure), totalCommitments: Number(b.total_commitments),
    numberOfActiveDeals: b.number_of_active_deals,
    avgIRR: b.avg_irr ? Number(b.avg_irr) : undefined,
    avgMultiple: b.avg_multiple ? Number(b.avg_multiple) : undefined,
    contacts: [], corporateStructure: [], kyc: [], completedProjects: [], activeDealIds: [],
  };
}

export default function BorrowerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { deals } = useDeals();
  const isLive = isSupabaseConfigured();
  const { data: dbBorrowers } = useBorrowersQuery();

  const borrower = isLive && dbBorrowers
    ? dbBorrowers.map(dbBorrowerToFrontend).find(b => b.id === id)
    : sampleBorrowers.find(b => b.id === id);

  if (!borrower) {
    return <AppLayout><div className="flex items-center justify-center py-20"><p className="text-slate-500">Borrower not found</p></div></AppLayout>;
  }

  const linkedDeals = deals.filter(d => borrower.activeDealIds.includes(d.id) || d.borrower === borrower.name);
  const kycValid = borrower.kyc.filter(k => k.status === "valid").length;
  const kycTotal = borrower.kyc.length;
  const allKycValid = kycValid === kycTotal;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Link to="/borrowers" className="mt-1 rounded-full bg-slate-50 hover:bg-slate-100 p-2.5 transition-colors">
            <ArrowLeft className="h-4 w-4 text-slate-500" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={cn("rounded-full px-3 py-1 text-xs font-bold uppercase", ratingColors[borrower.internalRating])}>
                Rating {borrower.internalRating}
              </span>
              <span className="text-xs text-slate-500">Since {borrower.ratingDate}</span>
            </div>
            <h1 className="text-4xl font-bold text-primary tracking-tight">{borrower.name}</h1>
            <p className="text-slate-500 text-base mt-2">{borrower.group} • {borrower.headquarters} • Est. {borrower.yearEstablished}</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {[
            { label: "Total Exposure", value: formatMillions(borrower.totalExposure), accent: false },
            { label: "Commitments", value: formatMillions(borrower.totalCommitments), accent: false },
            { label: "Active Deals", value: `${borrower.numberOfActiveDeals}`, accent: false },
            { label: "Avg IRR", value: borrower.avgIRR ? formatPercent(borrower.avgIRR) : "N/A", accent: true },
            { label: "Avg Multiple", value: borrower.avgMultiple ? `${borrower.avgMultiple.toFixed(2)}x` : "N/A", accent: false },
            { label: "KYC Status", value: allKycValid ? "Valid" : `${kycValid}/${kycTotal}`, accent: false },
          ].map((m) => (
            <div key={m.label} className="rounded-2xl bg-slate-50 p-6 hover:bg-slate-100/70 transition-colors">
              <p className="text-sm text-slate-500 font-medium">{m.label}</p>
              <p className={cn("text-2xl font-bold mt-3 tracking-tight", m.accent ? "text-accent" : "text-primary")}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="bg-muted border border-slate-100 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="exposure">Exposure & Deals</TabsTrigger>
            <TabsTrigger value="track_record">Track Record</TabsTrigger>
            <TabsTrigger value="kyc">KYC & Compliance</TabsTrigger>
          </TabsList>

          {/* Profile */}
          <TabsContent value="profile" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-50 p-6">
                <h3 className="font-display text-sm font-semibold text-primary flex items-center gap-2 mb-4">
                  <Building className="h-4 w-4 text-accent" /> Company Information
                </h3>
                <div className="space-y-3 text-sm">
                  <Row label="Type" value={borrower.type} />
                  <Row label="Headquarters" value={borrower.headquarters} />
                  <Row label="Established" value={`${borrower.yearEstablished}`} />
                  {borrower.website && <Row label="Website" value={borrower.website} />}
                  <Row label="Description" value={borrower.description} />
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-6">
                <h3 className="font-display text-sm font-semibold text-primary flex items-center gap-2 mb-4">
                  <Users className="h-4 w-4 text-accent" /> Key Contacts
                </h3>
                <div className="space-y-3">
                  {borrower.contacts.map(c => (
                    <div key={c.email} className="rounded-lg border border-slate-100 p-3">
                      <p className="text-sm font-medium text-primary">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.role}</p>
                      <p className="text-xs text-slate-500 mt-1">{c.email} • {c.phone}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 rounded-2xl bg-slate-50 p-6">
                <h3 className="font-display text-sm font-semibold text-primary flex items-center gap-2 mb-4">
                  <Shield className="h-4 w-4 text-accent" /> Corporate Structure
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Entity</th>
                        <th className="px-4 py-2.5 text-center text-xs font-medium text-slate-500">Type</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Jurisdiction</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Reg. Number</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Ownership</th>
                      </tr>
                    </thead>
                    <tbody>
                      {borrower.corporateStructure.map(e => (
                        <tr key={e.name} className="border-b border-slate-100 last:border-0">
                          <td className="px-4 py-3 font-medium text-primary">{e.name}</td>
                          <td className="px-4 py-3 text-center"><span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-slate-500">{e.type}</span></td>
                          <td className="px-4 py-3 text-slate-500">{e.jurisdiction}</td>
                          <td className="px-4 py-3 text-slate-500">{e.registrationNumber || "—"}</td>
                          <td className="px-4 py-3 text-slate-500">{e.ownership || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Exposure */}
          <TabsContent value="exposure" className="space-y-4">
            <div className="rounded-2xl bg-slate-50 overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-display text-sm font-semibold text-primary">Linked Deals</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Project</th>
                      <th className="px-4 py-2.5 text-center text-xs font-medium text-slate-500">Stage</th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Facility</th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Exposure</th>
                      <th className="px-4 py-2.5 text-center text-xs font-medium text-slate-500">LTV</th>
                      <th className="px-4 py-2.5 text-center text-xs font-medium text-slate-500">Construction</th>
                      <th className="px-4 py-2.5 text-center text-xs font-medium text-slate-500">Maturity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linkedDeals.map(d => (
                      <tr key={d.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                        <td className="px-4 py-3"><Link to={`/deals/${d.id}`} className="font-medium text-primary hover:text-accent transition-colors">{d.projectName}</Link></td>
                        <td className="px-4 py-3 text-center"><span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase", stageColors[d.stage])}>{stageLabels[d.stage]}</span></td>
                        <td className="px-4 py-3 text-right text-primary">{formatCurrency(d.loanAmount)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-primary">{formatCurrency(d.totalExposure)}</td>
                        <td className="px-4 py-3 text-center text-primary">{formatPercent(d.ltv)}</td>
                        <td className="px-4 py-3 text-center text-primary">{d.constructionProgress}%</td>
                        <td className="px-4 py-3 text-center text-slate-500">{d.expectedMaturity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Track Record */}
          <TabsContent value="track_record" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-2xl bg-slate-50 p-6 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Projects Completed</p>
                <p className="font-display text-3xl font-bold text-primary mt-1">{borrower.completedProjects.length}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-6 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Avg IRR</p>
                <p className="font-display text-3xl font-bold text-accent mt-1">{borrower.avgIRR ? formatPercent(borrower.avgIRR) : "N/A"}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-6 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Avg Multiple</p>
                <p className="font-display text-3xl font-bold text-primary mt-1">{borrower.avgMultiple ? `${borrower.avgMultiple.toFixed(2)}x` : "N/A"}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-display text-sm font-semibold text-primary flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" /> Completed Projects
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Project</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Location</th>
                      <th className="px-4 py-2.5 text-center text-xs font-medium text-slate-500">Year</th>
                      <th className="px-4 py-2.5 text-center text-xs font-medium text-slate-500">Units</th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Loan</th>
                      <th className="px-4 py-2.5 text-center text-xs font-medium text-slate-500">IRR</th>
                      <th className="px-4 py-2.5 text-center text-xs font-medium text-slate-500">Multiple</th>
                      <th className="px-4 py-2.5 text-center text-xs font-medium text-slate-500">Delivery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrower.completedProjects.map(p => (
                      <tr key={p.name} className="border-b border-slate-100 last:border-0">
                        <td className="px-4 py-3 font-medium text-primary">{p.name}</td>
                        <td className="px-4 py-3 text-slate-500">{p.location}</td>
                        <td className="px-4 py-3 text-center text-slate-500">{p.year}</td>
                        <td className="px-4 py-3 text-center text-slate-500">{p.units}</td>
                        <td className="px-4 py-3 text-right text-primary">{formatCurrency(p.loanAmount)}</td>
                        <td className="px-4 py-3 text-center font-semibold text-accent">{formatPercent(p.irr)}</td>
                        <td className="px-4 py-3 text-center text-primary">{p.multiple.toFixed(2)}x</td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium",
                            p.outcome === "on_time" ? "bg-emerald-100 text-emerald-700" :
                            p.outcome === "minor_delay" ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-600"
                          )}>
                            {p.outcome === "on_time" ? "On Time" : p.outcome === "minor_delay" ? `+${p.daysDelay}d` : `+${p.daysDelay}d`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* KYC */}
          <TabsContent value="kyc" className="space-y-4">
            <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 shadow-card">
              <div>
                <p className="text-xs text-slate-500">KYC Compliance</p>
                <p className="font-display text-lg font-bold text-primary">{kycValid}/{kycTotal} valid</p>
              </div>
              <div className="flex-1">
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className={cn("h-2 rounded-full transition-all", allKycValid ? "bg-success" : "bg-warning")} style={{ width: `${(kycValid / kycTotal) * 100}%` }} />
                </div>
              </div>
              {allKycValid ? (
                <span className="rounded-md bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">ALL CLEAR</span>
              ) : (
                <span className="rounded-md bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning">ACTION REQUIRED</span>
              )}
            </div>

            <div className="rounded-2xl bg-slate-50 overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-display text-sm font-semibold text-primary flex items-center gap-2">
                  <Shield className="h-4 w-4 text-accent" /> KYC / AML Checklist
                </h3>
              </div>
              <div>
                {borrower.kyc.map(k => {
                  const Icon = k.status === "valid" ? CheckCircle2 : k.status === "expiring_soon" ? AlertTriangle : k.status === "expired" ? XCircle : Clock;
                  return (
                    <div key={k.item} className="flex items-center justify-between border-b border-slate-100 last:border-0 px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={cn("h-4 w-4 shrink-0", kycStatusColors[k.status])} />
                        <div className="min-w-0">
                          <p className="text-sm text-primary">{k.item}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            {k.lastChecked && <span>Checked: {k.lastChecked}</span>}
                            {k.expiryDate && <span>Expires: {k.expiryDate}</span>}
                          </div>
                          {k.notes && <p className="text-xs text-warning mt-0.5">{k.notes}</p>}
                        </div>
                      </div>
                      <span className={cn("text-xs font-medium capitalize", kycStatusColors[k.status])}>
                        {k.status.replace("_", " ")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="text-right text-primary">{value}</span>
    </div>
  );
}
