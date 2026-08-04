import { createFileRoute } from "@tanstack/react-router";
import { useSentinel } from "@/lib/sentinel-store";
import { severityStyles } from "@/lib/sentinel-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BellRing, Check, ShieldCheck, Trash2 } from "lucide-react";

export const Route = createFileRoute("/app/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — SentinelAI" },
      {
        name: "description",
        content:
          "Triage live security alerts by severity with camera ID, building, timestamp and AI confidence, and acknowledge incidents in one click.",
      },
      { property: "og:title", content: "Alerts — SentinelAI" },
      {
        property: "og:description",
        content: "Live security alert triage with severity, camera and confidence detail.",
      },
    ],
  }),
  component: AlertsPage,
});

function AlertsPage() {
  const { alerts, acknowledge, triggerTestAlert, clearAlerts } = useSentinel();
  const counts = {
    high: alerts.filter((a) => a.severity === "high").length,
    medium: alerts.filter((a) => a.severity === "medium").length,
    low: alerts.filter((a) => a.severity === "low").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
            Incident queue
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Alerts</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={clearAlerts}>
            <Trash2 className="size-4" /> Clear queue
          </Button>
          <Button variant="destructive" className="gap-2" onClick={triggerTestAlert}>
            <BellRing className="size-4" /> Test Alert
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {(
          [
            ["High severity", counts.high, "high"],
            ["Medium severity", counts.medium, "medium"],
            ["Low / informational", counts.low, "low"],
          ] as const
        ).map(([label, count, sev]) => (
          <div key={label} className={cn("glass rounded-2xl p-5", severityStyles[sev].glow)}>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
            <p className="mt-2 font-display text-3xl font-bold">{count}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {alerts.length === 0 && (
          <div className="glass glow-safe grid place-items-center rounded-2xl py-16 text-center">
            <ShieldCheck className="size-10 text-safe" />
            <p className="mt-3 text-lg font-semibold">All zones nominal</p>
            <p className="text-sm text-muted-foreground">
              No open incidents across the surveillance grid.
            </p>
          </div>
        )}
        {alerts.map((a) => (
          <div
            key={a.id}
            className={cn(
              "glass flex flex-wrap items-center gap-4 rounded-2xl p-5",
              a.status === "Active" ? severityStyles[a.severity].glow : "",
            )}
          >
            <span className={cn("size-3 shrink-0 rounded-full", severityStyles[a.severity].dot)} />
            <div className="min-w-[200px] flex-1">
              <p className="text-base font-semibold">🚨 {a.type.toUpperCase()}</p>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                {a.id} · {a.time} · {a.cameraId} · {a.building}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm">{a.confidence}%</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                confidence
              </p>
            </div>
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider",
                severityStyles[a.severity].chip,
              )}
            >
              {a.severity}
            </span>
            {a.status === "Active" ? (
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => acknowledge(a.id)}>
                <Check className="size-3.5" /> Acknowledge
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">{a.status}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
