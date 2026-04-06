import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  highlight?: boolean;
}

export default function MetricCard({ label, value, subValue, icon: Icon, highlight }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-elevated",
        highlight && "border-primary/30 shadow-gold"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className={cn(
            "font-display text-2xl font-bold",
            highlight ? "text-gradient-gold" : "text-foreground"
          )}>{value}</p>
          {subValue && <p className="text-sm text-muted-foreground">{subValue}</p>}
        </div>
        <div className={cn(
          "rounded-lg p-2.5",
          highlight ? "bg-primary/15" : "bg-muted"
        )}>
          <Icon className={cn("h-5 w-5", highlight ? "text-primary" : "text-muted-foreground")} />
        </div>
      </div>
    </motion.div>
  );
}
