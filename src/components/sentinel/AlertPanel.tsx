import { AlertTriangle, BellRing, Check, ChevronDown, ShieldCheck, Siren, X } from "lucide-react";
import { useState } from "react";
import { useSentinel } from "@/lib/sentinel-store";
import { severityStyles } from "@/lib/sentinel-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function FloatingAlertPanel() {
  const { alerts, acknowledge, triggerTestAlert } = useSentinel();
  const [open, setOpen] = useState(true);
  const active = alerts.filter((a) => a.status === "Active");
  const highest = active.some((a) => a.severity === "high")
    ? "high"
    : active.some((a) => a.severity === "medium")
      ? "medium"
      : "low";

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40 w-[min(360px,calc(100vw-2rem))]">
      <div
        className={cn(
          "pointer-events-auto overflow-hidden rounded-2xl glass",
          active.length > 0 ? severityStyles[highest].glow : "glow-safe",
        )}
      >
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-2.5 px-4 py-3 text-left"
        >
          <span className="relative grid size-8 place-items-center rounded-lg bg-card/70">
            {active.length ? (
              <Siren className={cn("size-4", highest === "high" ? "text-danger" : "text-warn")} />
            ) : (
              <ShieldCheck className="size-4 text-safe" />
            )}
          </span>
          <span className="flex-1">
            <span className="block text-sm font-semibold">Live Alert Panel</span>
            <span className="block text-[11px] text-muted-foreground">
              {active.length
                ? `${active.length} active incident${active.length > 1 ? "s" : ""}`
                : "All zones nominal"}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        {open && (
          <div className="max-h-[46vh] space-y-2 overflow-y-auto border-t border-panel-border px-3 py-3">
            {alerts.length === 0 && (
              <p className="px-1 py-6 text-center text-sm text-muted-foreground">
                No alerts in the last 24 hours.
              </p>
            )}
            {alerts.map((a) => (
              <div
                key={a.id}
                className={cn(
                  "rounded-xl border bg-card/70 p-3 transition-all",
                  a.status === "Active" ? severityStyles[a.severity].glow : "border-panel-border",
                  a.status !== "Active" && "opacity-70",
                )}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      a.severity === "high"
                        ? "text-danger"
                        : a.severity === "medium"
                          ? "text-warn"
                          : "text-safe",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      🚨 {a.type.toUpperCase()}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {a.time} · {a.cameraId} · {a.building}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                          severityStyles[a.severity].chip,
                        )}
                      >
                        {a.severity}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {a.confidence}% conf.
                      </span>
                      {a.status === "Active" ? (
                        <button
                          onClick={() => acknowledge(a.id)}
                          className="ml-auto flex items-center gap-1 rounded-md border border-panel-border px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                        >
                          <Check className="size-3" /> Ack
                        </button>
                      ) : (
                        <span className="ml-auto text-[11px] text-muted-foreground">
                          {a.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-panel-border p-3">
          <Button variant="destructive" className="w-full gap-2" onClick={triggerTestAlert}>
            <BellRing className="size-4" /> Test Alert
          </Button>
        </div>
      </div>
    </div>
  );
}

export function EmergencyOverlay() {
  const { activeEmergency, flashing, dismissEmergency } = useSentinel();

  return (
    <>
      {flashing && (
        <div className="pointer-events-none fixed inset-0 z-[60] bg-danger/60 animate-red-flash mix-blend-screen" />
      )}
      {activeEmergency && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-danger/50 bg-card p-6 glow-danger animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-danger/15 animate-pulse-ring">
                <Siren className="size-6 text-danger" />
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-danger">
                  Emergency broadcast
                </p>
                <h2 className="mt-1 text-2xl font-bold">{activeEmergency.type}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Detected by {activeEmergency.cameraId} at {activeEmergency.building}.
                  Response team has been paged.
                </p>
              </div>
              <button
                onClick={dismissEmergency}
                className="ml-auto text-muted-foreground hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="size-5" />
              </button>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              {[
                ["Time", activeEmergency.time],
                ["Camera ID", activeEmergency.cameraId],
                ["Building", activeEmergency.building],
                ["Severity", activeEmergency.severity.toUpperCase()],
                ["Confidence", `${activeEmergency.confidence}%`],
                ["Protocol", "EVAC-02"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-panel-border bg-background/60 p-2.5">
                  <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</dt>
                  <dd className="mt-0.5 font-mono text-sm">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 flex gap-2">
              <Button variant="destructive" className="flex-1" onClick={dismissEmergency}>
                Acknowledge &amp; Dispatch
              </Button>
              <Button variant="outline" onClick={dismissEmergency}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
