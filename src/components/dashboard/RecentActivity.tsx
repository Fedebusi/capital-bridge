import { cn } from "@/lib/utils";
import { FileText, CheckCircle2, AlertTriangle, DollarSign, Clock } from "lucide-react";

const activities = [
  { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", label: "IC approved Jardines de Ruzafa", time: "2h ago" },
  { icon: DollarSign, color: "text-accent", bg: "bg-accent/10", label: "Drawdown #3 disbursed — Terrazas del Faro", time: "5h ago" },
  { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", label: "LTV covenant watch — Arcos de Canillejas", time: "1d ago" },
  { icon: FileText, color: "text-muted-foreground", bg: "bg-muted", label: "DD report generated — Palau de Gràcia", time: "2d ago" },
  { icon: Clock, color: "text-muted-foreground", bg: "bg-muted", label: "New deal received — Mirador del Port", time: "3d ago" },
];

export default function RecentActivity() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <h3 className="font-display text-sm font-semibold text-foreground mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((a, i) => (
          <div key={i} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
            <div className={cn("rounded-lg p-1.5 mt-0.5", a.bg)}>
              <a.icon className={cn("h-3.5 w-3.5", a.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-snug">{a.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
