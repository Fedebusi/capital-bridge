import AppLayout from "@/components/layout/AppLayout";
import DealCard from "@/components/dashboard/DealCard";
import { sampleDeals, formatMillions, formatCurrency } from "@/data/sampleDeals";

export default function LoanBookPage() {
  const activeDeals = sampleDeals.filter(d => d.stage === "active" || d.stage === "repaid");

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Loan Book</h1>
          <p className="text-sm text-muted-foreground mt-1">Active and historical loan positions</p>
        </div>

        {/* Loan Table */}
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Project</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Borrower</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Facility</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Disbursed</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">PIK Accrued</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Total Exposure</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Rate</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">LTV</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Construction</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Maturity</th>
                </tr>
              </thead>
              <tbody>
                {activeDeals.map(d => (
                  <tr key={d.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <a href={`/deals/${d.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                        {d.projectName}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{d.borrower}</td>
                    <td className="px-4 py-3 text-right text-foreground">{formatCurrency(d.loanAmount)}</td>
                    <td className="px-4 py-3 text-right text-foreground">{formatCurrency(d.disbursedAmount)}</td>
                    <td className="px-4 py-3 text-right text-primary">{formatCurrency(d.accruedPIK)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">{formatCurrency(d.totalExposure)}</td>
                    <td className="px-4 py-3 text-center text-foreground">{d.totalRate}%</td>
                    <td className="px-4 py-3 text-center text-foreground">{d.ltv.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-center text-foreground">{d.constructionProgress}%</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{d.expectedMaturity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
