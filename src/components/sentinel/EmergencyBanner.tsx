import { AlertTriangle, BellOff, MapPin, Volume2 } from "lucide-react";
import { useSentinel } from "@/lib/sentinel-store";
import { Button } from "@/components/ui/button";

/** Red emergency banner — shows type, camera, location, confidence, timestamp. */
export function EmergencyBanner() {
  const { activeEmergency, acknowledgeEmergency, sirenActive } = useSentinel();
  if (!activeEmergency) return null;
  const a = activeEmergency;

  return (
    <div className="sticky top-0 z-30 border-b border-danger/50 bg-danger/15 backdrop-blur-md glow-danger">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 lg:px-6">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-danger/20 animate-pulse-ring">
          <AlertTriangle className="size-5 text-danger" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold uppercase tracking-wide text-danger">
            🚨 Emergency — {a.type}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 font-mono text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="size-3" /> {a.building}
            </span>
            <span>{a.cameraId}</span>
            <span>{a.confidence}% confidence</span>
            <span>{a.time}</span>
          </p>
        </div>
        {sirenActive && (
          <span className="hidden items-center gap-1.5 rounded-full border border-danger/40 px-2.5 py-1 font-mono text-[11px] text-danger sm:flex">
            <Volume2 className="size-3 animate-pulse" /> Siren active
          </span>
        )}
        <Button variant="destructive" className="gap-2" onClick={acknowledgeEmergency}>
          <BellOff className="size-4" /> Acknowledge Alert
        </Button>
      </div>
    </div>
  );
}
