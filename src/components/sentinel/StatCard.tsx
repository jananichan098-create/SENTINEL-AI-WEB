import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  suffix,
  decimals,
  icon: Icon,
  trend,
  tone = "primary",
}: {
  label: string;
  value: number;
  suffix?: string | undefined;
  decimals?: number | undefined;
  icon: LucideIcon;
  trend?: string | undefined;
  tone?: "primary" | "danger" | "warn" | "safe";
}) {
  const toneMap = {
    primary: "text-primary bg-primary/12 border-primary/25",
    danger: "text-danger bg-danger/12 border-danger/25",
    warn: "text-warn bg-warn/12 border-warn/25",
    safe: "text-safe bg-safe/12 border-safe/25",
  } as const;

  return (
    <div className="glass card-hover rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-bold">
            <AnimatedCounter value={value} suffix={suffix} decimals={decimals} />
          </p>
        </div>
        <span className={cn("grid size-10 place-items-center rounded-xl border", toneMap[tone])}>
          <Icon className="size-5" />
        </span>
      </div>
      {trend && <p className="mt-3 text-xs text-muted-foreground">{trend}</p>}
    </div>
  );
}
