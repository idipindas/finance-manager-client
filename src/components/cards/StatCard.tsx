import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export default function StatCard({ label, value, sub, icon, trend, className }: StatCardProps) {
  const trendColor = trend === "up" ? "text-income" : trend === "down" ? "text-expense" : "text-text-muted";

  return (
    <div className={cn("bg-bg-card border border-border rounded-card p-5", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{label}</span>
        {icon && <span className="text-text-muted">{icon}</span>}
      </div>
      <p className={cn("text-2xl font-bold font-heading", trendColor === "text-text-muted" ? "text-text-primary" : trendColor)}>
        {value}
      </p>
      {sub && <p className={cn("text-xs mt-1", trendColor)}>{sub}</p>}
    </div>
  );
}
