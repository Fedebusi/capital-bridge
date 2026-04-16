import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  change?: string;
  changeDirection?: "up" | "down";
  icon: LucideIcon;
  highlight?: boolean;
}

export default function MetricCard({ label, value, change, changeDirection = "up", icon: Icon, highlight }: MetricCardProps) {
  return (
    <div className={cn(
      "rounded-2xl bg-slate-50 p-6 transition-all hover:shadow-elevated animate-fade-in",
      highlight && "border-accent/30 shadow-accent"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn("rounded-xl p-2.5", highlight ? "bg-accent/10" : "bg-muted")}>
          <Icon className={cn("h-5 w-5", highlight ? "text-accent" : "text-slate-500")} />
        </div>
        {change && (
          <span className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
            changeDirection === "up" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
          )}>
            {changeDirection === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {change}
          </span>
        )}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={cn("font-display text-2xl font-bold text-primary mt-1", highlight && "text-accent")}>{value}</p>
    </div>
  );
}
