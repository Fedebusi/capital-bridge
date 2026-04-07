import { useParams, Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { sampleBorrowers, ratingColors, kycStatusColors } from "@/data/borrowers";
import { sampleDeals, formatCurrency, formatMillions, formatPercent, stageLabels, stageColors } from "@/data/sampleDeals";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Building, Users, Shield, TrendingUp, CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";

export default function BorrowerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const borrower = sampleBorrowers.find(b => b.id === id);

  if (!borrower) {
    return <AppLayout><div className="flex items-center justify-center py-20"><p className="text-muted-foreground">Borrower not found</p></div></AppLayout>;
  }

  const linkedDeals = sampleDeals.filter(d => borrower.activeDealIds.includes(d.id));
  const kycValid = borrower.kyc.filter(k => k.status === "valid").length;
  const kycTotal = borrower.kyc.length;
  const allKycValid = kycValid === kycTotal;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Link to="/borrowers" className="mt-1 rounded-lg border border-border bg-card p-2 hover:bg-muted transition-colors">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className={cn("rounded-md px-2.5 py-1 text-xs font-bold uppercase", ratingColors[borrower.internalRating])}>
                Rating {borrower.internalRating}
              </span>
              <span className="text-xs text-muted-foreground">Since {borrower.ratingDate}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-primary">{borrower.name}</h1>
            <p className="text-slate-500 text-sm mt-1">{borrower.group} • {borrower.headquarters} • Est. {borrower.yearEstablished}</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: "Total Exposure", value: formatMillions(borrower.totalExposure) },
            { label: "Commitments", value: formatMillions(borrower.totalCommitments) },
            { label: "Active Deals", value: `${borrower.numberOfActiveDeals}` },
            { label: "Avg IRR", value: borrower.avgIRR ? formatPercent(borrower.avgIRR) : "N/A" },
            { label: "Avg Multiple", value: borrower.avgMultiple ? `${borrower.avgMultiple.toFixed(2)}x` : "N/A" },
            { label: "KYC Status", value: allKycValid ? "Valid" : `${kycValid}/${kycTotal}` },
          ].map((m, i) => (
            <div key={m.label} className="rounded-lg border border-border bg-card p-3 animate-fade-in" style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{m.label}</p>
              <p className="font-display text-lg font-bold mt-0.5 text-foreground">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="bg-muted border border-border flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="exposure">Exposure & Deals</TabsTrigger>
            <TabsTrigger value="track_record">Track Record</TabsTrigger>
            <TabsTrigger value="kyc">KYC & Compliance</TabsTrigger>
          </TabsList>

          {/* Profile */}
          <TabsContent value="profile" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
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

              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                  <Users className="h-4 w-4 text-accent" /> Key Contacts
                </h3>
                <div className="space-y-3">
                  {borrower.contacts.map(c => (
                    <div key={c.email} className="rounded-lg border border-border p-3">
                      <p className="text-sm font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.role}</p>
                      <p className="text-xs text-muted-foreground mt-1">{c.email} • {c.phone}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-card">
                <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                  <Shield className="h-4 w-4 text-accent" /> Corporate Structure
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Entity</th>
                        <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">Type</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Jurisdiction</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Reg. Number</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Ownership</th>
                      </tr>
                    </thead>
                    <tbody>
                      {borrower.corporateStructure.map(e => (
                        <tr key={e.name} className="border-b border-border last:border-0">
                          <td className="px-4 py-3 font-medium text-foreground">{e.name}</td>
                          <td className="px-4 py-3 text-center"><span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{e.type}</span></td>
                          <td className="px-4 py-3 text-muted-foreground">{e.jurisdiction}</td>
                          <td className="px-4 py-3 text-muted-foreground">{e.registrationNumber || "—"}</td>
                          <td className="px-4 py-3 text-muted-foreground">{e.ownership || "—"}</td>
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
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-display text-sm font-semibold text-foreground">Linked Deals</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Project</th>
                      <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">Stage</th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Facility</th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Exposure</th>
                      <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">LTV</th>
                      <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">Construction</th>
                      <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">Maturity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linkedDeals.map(d => (
                      <tr key={d.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3"><Link to={`/deals/${d.id}`} className="font-medium text-foreground hover:text-accent transition-colors">{d.projectName}</Link></td>
                        <td className="px-4 py-3 text-center"><span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase", stageColors[d.stage])}>{stageLabels[d.stage]}</span></td>
                        <td className="px-4 py-3 text-right text-foreground">{formatCurrency(d.loanAmount)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-foreground">{formatCurrency(d.totalExposure)}</td>
                        <td className="px-4 py-3 text-center text-foreground">{formatPercent(d.ltv)}</td>
                        <td className="px-4 py-3 text-center text-foreground">{d.constructionProgress}%</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{d.expectedMaturity}</td>
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
              <div className="rounded-xl border border-border bg-card p-5 shadow-card text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Projects Completed</p>
                <p className="font-display text-3xl font-bold text-foreground mt-1">{borrower.completedProjects.length}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-card text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg IRR</p>
                <p className="font-display text-3xl font-bold text-accent mt-1">{borrower.avgIRR ? formatPercent(borrower.avgIRR) : "N/A"}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-card text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Multiple</p>
                <p className="font-display text-3xl font-bold text-foreground mt-1">{borrower.avgMultiple ? `${borrower.avgMultiple.toFixed(2)}x` : "N/A"}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" /> Completed Projects
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Project</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Location</th>
                      <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">Year</th>
                      <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">Units</th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Loan</th>
                      <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">IRR</th>
                      <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">Multiple</th>
                      <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">Delivery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrower.completedProjects.map(p => (
                      <tr key={p.name} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{p.location}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{p.year}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{p.units}</td>
                        <td className="px-4 py-3 text-right text-foreground">{formatCurrency(p.loanAmount)}</td>
                        <td className="px-4 py-3 text-center font-semibold text-accent">{formatPercent(p.irr)}</td>
                        <td className="px-4 py-3 text-center text-foreground">{p.multiple.toFixed(2)}x</td>
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
            <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
              <div>
                <p className="text-xs text-muted-foreground">KYC Compliance</p>
                <p className="font-display text-lg font-bold text-foreground">{kycValid}/{kycTotal} valid</p>
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

            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4 text-accent" /> KYC / AML Checklist
                </h3>
              </div>
              <div>
                {borrower.kyc.map(k => {
                  const Icon = k.status === "valid" ? CheckCircle2 : k.status === "expiring_soon" ? AlertTriangle : k.status === "expired" ? XCircle : Clock;
                  return (
                    <div key={k.item} className="flex items-center justify-between border-b border-border last:border-0 px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={cn("h-4 w-4 shrink-0", kycStatusColors[k.status])} />
                        <div className="min-w-0">
                          <p className="text-sm text-foreground">{k.item}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
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
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right text-foreground">{value}</span>
    </div>
  );
}
