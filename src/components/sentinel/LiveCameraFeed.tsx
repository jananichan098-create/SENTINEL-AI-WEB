import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CircleStop, Play, Radio, Signal, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSentinel } from "@/lib/sentinel-store";
import type { BuildingId } from "@/lib/sentinel-data";

interface Detection {
  id: number;
  label: string;
  confidence: number;
  x: number;
  y: number;
  w: number;
  h: number;
  tone: "danger" | "warn" | "primary" | "safe";
}

const LABELS: { label: string; tone: Detection["tone"] }[] = [
  { label: "Person Detected", tone: "primary" },
  { label: "Person Detected", tone: "primary" },
  { label: "Crowd Detected", tone: "warn" },
  { label: "Fire Detected", tone: "danger" },
  { label: "Smoke Detected", tone: "warn" },
];

const toneClass = {
  danger: "border-danger text-danger bg-danger/12",
  warn: "border-warn text-warn bg-warn/12",
  primary: "border-primary text-primary bg-primary/12",
  safe: "border-safe text-safe bg-safe/12",
} as const;

export function LiveCameraFeed({
  cameraName = "CAM-05 · Engg. Workshop",
  location = "Engineering Block — Bay 3",
  cameraId = "CAM-05",
  buildingId = "engineering-block",
}: {
  cameraName?: string;
  location?: string;
  cameraId?: string;
  buildingId?: BuildingId;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<"idle" | "starting" | "live" | "error">("idle");
  const [detections, setDetections] = useState<Detection[]>([]);
  const [fps, setFps] = useState(0);
  const { pushAlert, reportDetection } = useSentinel();

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
    setDetections([]);
    setFps(0);
  }, []);

  const start = useCallback(async () => {
    setStatus("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("live");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  // Simulated YOLO inference loop — swap for a Flask/OpenCV/YOLO websocket later.
  useEffect(() => {
    if (status !== "live") return;
    const tick = window.setInterval(() => {
      const count = 1 + Math.floor(Math.random() * 3);
      const next: Detection[] = Array.from({ length: count }, (_, i) => {
        const pick = LABELS[Math.floor(Math.random() * LABELS.length)]!;
        return {
          id: Date.now() + i,
          label: pick.label,
          tone: pick.tone,
          confidence: Number((72 + Math.random() * 27).toFixed(1)),
          x: 6 + Math.random() * 55,
          y: 8 + Math.random() * 45,
          w: 18 + Math.random() * 24,
          h: 24 + Math.random() * 28,
        };
      });
      setDetections(next);
      // Auto alert routing: fire/smoke -> emergency, crowd -> warning, person -> ignored.
      next.forEach((d) =>
        reportDetection({
          label: d.label,
          confidence: d.confidence,
          cameraId,
          buildingId,
        }),
      );
      setFps(Number((23 + Math.random() * 7).toFixed(0)));
    }, 1800);
    return () => window.clearInterval(tick);
  }, [status, pushAlert, reportDetection, cameraId, buildingId]);

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="flex flex-wrap items-center gap-3 border-b border-panel-border px-4 py-3">
        <span
          className={cn(
            "grid size-9 place-items-center rounded-lg border",
            status === "live"
              ? "border-safe/40 bg-safe/10 text-safe"
              : "border-panel-border bg-card/60 text-muted-foreground",
          )}
        >
          <Camera className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{cameraName}</p>
          <p className="truncate text-xs text-muted-foreground">{location}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider",
              status === "live"
                ? "border-danger/40 bg-danger/10 text-danger"
                : status === "error"
                  ? "border-warn/40 bg-warn/10 text-warn"
                  : "border-panel-border text-muted-foreground",
            )}
          >
            <Radio className="size-3" />
            {status === "live"
              ? "Recording"
              : status === "starting"
                ? "Connecting"
                : status === "error"
                  ? "No access"
                  : "Standby"}
          </span>
          <span className="hidden items-center gap-1.5 rounded-full border border-panel-border px-2.5 py-1 font-mono text-[11px] text-muted-foreground sm:flex">
            <Signal className="size-3" /> {fps} FPS
          </span>
        </div>
      </div>

      <div className="relative aspect-video w-full overflow-hidden bg-black scan-sweep">
        <video
          ref={videoRef}
          muted
          playsInline
          className={cn("size-full object-cover", status !== "live" && "opacity-0")}
        />

        {status !== "live" && (
          <div className="absolute inset-0 grid place-items-center grid-backdrop">
            <div className="text-center">
              <VideoOff className="mx-auto size-10 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">
                {status === "error"
                  ? "Camera access denied by browser"
                  : status === "starting"
                    ? "Establishing encrypted stream…"
                    : "Stream idle — press Start Camera"}
              </p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                Inference engine ready · YOLOv8-n
              </p>
            </div>
          </div>
        )}

        {status === "live" &&
          detections.map((d) => (
            <div
              key={d.id}
              className={cn(
                "absolute rounded-md border-2 transition-all duration-700",
                toneClass[d.tone],
              )}
              style={{ left: `${d.x}%`, top: `${d.y}%`, width: `${d.w}%`, height: `${d.h}%` }}
            >
              <span
                className={cn(
                  "absolute -top-6 left-0 whitespace-nowrap rounded border px-1.5 py-0.5 font-mono text-[11px] font-semibold backdrop-blur-sm",
                  toneClass[d.tone],
                )}
              >
                {d.label} · {d.confidence}%
              </span>
            </div>
          ))}

        <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-black/55 px-2 py-1 font-mono text-[11px] text-foreground/90 backdrop-blur">
          {cameraName} · 1920×1080 · AI overlay ON
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-panel-border p-4">
        <Button onClick={start} disabled={status === "live" || status === "starting"} className="gap-2">
          <Play className="size-4" /> Start Camera
        </Button>
        <Button onClick={stop} variant="outline" disabled={status !== "live"} className="gap-2">
          <CircleStop className="size-4" /> Stop Camera
        </Button>
        <p className="ml-auto font-mono text-[11px] text-muted-foreground">
          {detections.length} object{detections.length === 1 ? "" : "s"} tracked
        </p>
      </div>
    </div>
  );
}
