import { lazy, Suspense, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type { BuildingId } from "@/lib/sentinel-data";
import { Loader2 } from "lucide-react";

const CampusMapClient = lazy(() => import("./CampusMapClient"));

function MapSkeleton() {
  return (
    <div className="grid h-full w-full place-items-center rounded-2xl bg-card/50 grid-backdrop">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading campus geospatial layer…
      </div>
    </div>
  );
}

export function CampusMap({
  emergencyBuildings,
  onSelect,
}: {
  emergencyBuildings: BuildingId[];
  onSelect?: ((id: BuildingId) => void) | undefined;
}) {
  const [ready] = useState(true);
  if (!ready) return <MapSkeleton />;
  return (
    <ClientOnly fallback={<MapSkeleton />}>
      <Suspense fallback={<MapSkeleton />}>
        <CampusMapClient emergencyBuildings={emergencyBuildings} onSelect={onSelect} />
      </Suspense>
    </ClientOnly>
  );
}
