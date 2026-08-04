import { createFileRoute } from "@tanstack/react-router";
import { LiveCameraFeed } from "@/components/sentinel/LiveCameraFeed";
import { CAMERAS } from "@/lib/sentinel-data";
import { useSentinel } from "@/lib/sentinel-store";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Cctv, Gauge, ScanEye, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/live")({
  head: () => ({
    meta: [
      { title: "Live Surveillance — SentinelAI" },
      {
        name: "description",
        content:
          "Watch live camera streams with real-time AI detection overlays for people, fire, smoke and crowd formation, with confidence scoring per object.",
      },
      { property: "og:title", content: "Live Surveillance — SentinelAI" },
      {
        property: "og:description",
        content: "Live AI detection overlays for people, fire, smoke and crowd events.",
      },
    ],
  }),
  component: LivePage,
});

function LivePage() {
  const [selected, setSelected] = useState(CAMERAS[4]!);
  const { triggerTestAlert } = useSentinel();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
            Stream wall
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Live Surveillance</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browser webcam stands in for the RTSP feed until the Flask + OpenCV + YOLO backend is
            attached.
          </p>
        </div>
        <Button variant="destructive" className="gap-2" onClick={triggerTestAlert}>
          <ShieldAlert className="size-4" /> Simulate Emergency
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <LiveCameraFeed
          cameraName={`${selected.id} · ${selected.name}`}
          location={selected.location}
        />

        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Cctv className="size-4 text-primary" /> Stream selector
            </h2>
            <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
              {CAMERAS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  disabled={!c.online}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
                    selected.id === c.id
                      ? "border-primary/50 bg-primary/10"
                      : "border-panel-border bg-card/50 hover:border-primary/30",
                    !c.online && "opacity-45",
                  )}
                >
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      c.online ? "bg-safe" : "bg-danger",
                    )}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {c.id} · {c.name}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {c.location}
                    </span>
                  </span>
                  <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                    {c.fps} fps
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <ScanEye className="size-4 text-primary" /> Detection model
            </h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              {[
                ["Model", "YOLOv8-n"],
                ["Classes", "person, fire, smoke, crowd"],
                ["Latency", "27 ms/frame"],
                ["Threshold", "0.62 IoU"],
                ["Device", "Jetson Orin NX"],
                ["Precision", "FP16"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-panel-border bg-card/50 p-2.5">
                  <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {k}
                  </dt>
                  <dd className="mt-0.5 truncate font-mono text-xs">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-safe/30 bg-safe/10 p-3 text-xs text-safe">
              <Gauge className="size-4" /> Inference healthy · 8 concurrent streams
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
