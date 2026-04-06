import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  highlight?: boolean;
}

export default function MetricCard({ label, value, subValue, icon: Icon, highlight }: MetricCardProps) {
  return (
    <div className={cn(
      "rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-elevated animate-fade-in",
      highlight && "border-accent/30 shadow-accent"
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className={cn("font-display text-2xl font-bold text-foreground", highlight && "text-accent")}>{value}</p>
          {subValue && <p className="text-sm text-muted-foreground">{subValue}</p>}
        </div>
        <div className={cn("rounded-lg p-2.5", highlight ? "bg-accent/10" : "bg-muted")}>
          <Icon className={cn("h-5 w-5", highlight ? "text-accent" : "text-muted-foreground")} />
        </div>
      </div>
    </div>
  );
}
