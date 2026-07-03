import { cardClass } from "@/lib/form-styles";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
}

export function StatCard({ label, value, hint, icon: Icon, trend }: StatCardProps) {
  return (
    <article className={cardClass}>
      <div className="flex items-start justify-between">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend.value >= 0 ? "text-[var(--color-success)]" : "text-destructive"
            }`}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}% {trend.label}
          </span>
        )}
      </div>
      <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </article>
  );
}
