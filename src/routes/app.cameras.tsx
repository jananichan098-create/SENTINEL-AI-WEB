import { createFileRoute, Link } from "@tanstack/react-router";
import { CAMERAS } from "@/lib/sentinel-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Cctv, MapPin, PlayCircle, Wifi, WifiOff } from "lucide-react";

export const Route = createFileRoute("/app/cameras")({
  head: () => ({
    meta: [
      { title: "Cameras — SentinelAI" },
      {
        name: "description",
        content:
          "Inventory of every campus camera with online status, stream health, resolution, uptime and one-click access to the live AI feed.",
      },
      { property: "og:title", content: "Cameras — SentinelAI" },
      {
        property: "og:description",
        content: "Camera inventory with health, uptime and live-feed access.",
      },
    ],
  }),
  component: CamerasPage,
});

function CamerasPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
          Device registry
        </p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Cameras</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {CAMERAS.filter((c) => c.online).length} of {CAMERAS.length} endpoints streaming to the
          inference cluster.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CAMERAS.map((c) => (
          <div key={c.id} className="glass card-hover rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid size-10 place-items-center rounded-xl border",
                    c.online
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-danger/30 bg-danger/10 text-danger",
                  )}
                >
                  <Cctv className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">
                    {c.id} · {c.name}
                  </p>
                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="size-3" /> {c.location}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  c.online
                    ? "border-safe/40 bg-safe/10 text-safe"
                    : "border-danger/40 bg-danger/10 text-danger",
                )}
              >
                {c.online ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
                {c.online ? "Online" : "Offline"}
              </span>
            </div>

            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                ["Res", c.resolution],
                ["FPS", String(c.fps)],
                ["Uptime", c.uptime],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-panel-border bg-card/50 py-2">
                  <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {k}
                  </dt>
                  <dd className="mt-0.5 font-mono text-xs">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Health indicator</span>
                <span
                  className={cn(
                    "font-mono",
                    c.health > 80 ? "text-safe" : c.health > 50 ? "text-warn" : "text-danger",
                  )}
                >
                  {c.health}%
                </span>
              </div>
              <Progress value={c.health} className="mt-1.5 h-1.5" />
            </div>

            <Button asChild variant={c.online ? "default" : "outline"} className="mt-4 w-full gap-2" disabled={!c.online}>
              <Link to="/app/live">
                <PlayCircle className="size-4" /> View Live
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
