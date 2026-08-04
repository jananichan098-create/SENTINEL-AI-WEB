import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function SentinelLogo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative grid size-10 shrink-0 place-items-center rounded-xl border border-primary/40 bg-primary/10">
        <ShieldCheck className="size-5 text-primary" strokeWidth={2.2} />
        <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-safe shadow-[0_0_10px_var(--safe)]" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className="font-display text-lg font-bold tracking-tight">
            Sentinel<span className="text-primary">AI</span>
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Surveillance Grid
          </p>
        </div>
      )}
    </div>
  );
}
