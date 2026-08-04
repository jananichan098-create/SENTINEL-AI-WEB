import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CampusMap } from "@/components/sentinel/CampusMap";
import { useSentinel } from "@/lib/sentinel-store";
import { BUILDINGS, type BuildingId } from "@/lib/sentinel-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MapPin, ShieldAlert, Users } from "lucide-react";

export const Route = createFileRoute("/app/map")({
  head: () => ({
    meta: [
      { title: "Campus Map — SentinelAI" },
      {
        name: "description",
        content:
          "Geospatial campus view with camera markers on every building; emergency zones turn red in real time while secure zones stay green.",
      },
      { property: "og:title", content: "Campus Map — SentinelAI" },
      {
        property: "og:description",
        content: "Live geospatial view of campus cameras, people counts and emergency zones.",
      },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const { emergencyBuildings, triggerTestAlert } = useSentinel();
  const [selected, setSelected] = useState<BuildingId>("engineering-block");
  const building = BUILDINGS.find((b) => b.id === selected)!;
  const danger = emergencyBuildings.includes(selected);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
            Geospatial layer
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Campus Map</h1>
        </div>
        <Button variant="destructive" className="gap-2" onClick={triggerTestAlert}>
          <ShieldAlert className="size-4" /> Simulate Emergency
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="glass overflow-hidden rounded-2xl p-1.5">
          <div className="h-[560px] w-full overflow-hidden rounded-xl">
            <CampusMap emergencyBuildings={emergencyBuildings} onSelect={setSelected} />
          </div>
        </div>

        <div className="space-y-4">
          <div
            className={cn(
              "glass rounded-2xl p-5",
              danger ? "glow-danger" : "glow-safe",
            )}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Selected zone
            </p>
            <h2 className="mt-1 text-xl font-bold">{building.name}</h2>
            <p className="text-sm text-muted-foreground">{building.cameraName}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-panel-border bg-card/50 p-3">
                <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Current status
                </dt>
                <dd className={cn("mt-1 font-semibold", danger ? "text-danger" : "text-safe")}>
                  {danger ? "EMERGENCY" : "SECURE"}
                </dd>
              </div>
              <div className="rounded-lg border border-panel-border bg-card/50 p-3">
                <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  People count
                </dt>
                <dd className="mt-1 font-mono font-semibold">{building.peopleCount}</dd>
              </div>
              <div className="col-span-2 rounded-lg border border-panel-border bg-card/50 p-3">
                <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Last alert
                </dt>
                <dd className="mt-1 font-mono text-sm">{building.lastAlert}</dd>
              </div>
            </dl>
          </div>

          <div className="glass rounded-2xl p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <MapPin className="size-4 text-primary" /> Monitored buildings
            </h2>
            <div className="mt-3 space-y-2">
              {BUILDINGS.map((b) => {
                const isDanger = emergencyBuildings.includes(b.id);
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelected(b.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
                      selected === b.id
                        ? "border-primary/50 bg-primary/10"
                        : "border-panel-border bg-card/50 hover:border-primary/30",
                    )}
                  >
                    <span
                      className={cn(
                        "size-2.5 shrink-0 rounded-full",
                        isDanger ? "bg-danger animate-pulse-ring" : "bg-safe",
                      )}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{b.name}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {b.cameraId}
                      </span>
                    </span>
                    <span className="ml-auto flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                      <Users className="size-3" /> {b.peopleCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
