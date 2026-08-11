import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CircleStop, Play, Radio, Signal, Users, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSentinel } from "@/lib/sentinel-store";
import type { BuildingId } from "@/lib/sentinel-data";

interface Detection {
  id: string;
  label: string;
  confidence: number;
  x: number;
  y: number;
  w: number;
  h: number;
  tone: "danger" | "warn" | "primary" | "safe";
}

const toneClass = {
  danger: "border-danger text-danger bg-danger/12",
  warn: "border-warn text-warn bg-warn/12",
  primary: "border-primary text-primary bg-primary/12",
  safe: "border-safe text-safe bg-safe/12",
} as const;

/** Flask + YOLOv8 inference endpoint. */
const DETECT_URL = "http://127.0.0.1:5000/detect";
/** People in one frame required to classify the scene as a crowd. */
const CROWD_THRESHOLD = 8;

type RawBox = Record<string, unknown>;

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/** Tolerant parser for common Flask/YOLO response shapes. */
function parseDetections(payload: unknown, frameW: number, frameH: number): Detection[] {
  const root = payload as Record<string, unknown> | unknown[] | null;
  const list: RawBox[] = Array.isArray(root)
    ? (root as RawBox[])
    : ((((root as Record<string, unknown>)?.["detections"] ??
        (root as Record<string, unknown>)?.["boxes"] ??
        (root as Record<string, unknown>)?.["results"] ??
        (root as Record<string, unknown>)?.["predictions"]) as RawBox[] | undefined) ?? []);

  return list.flatMap((raw, i) => {
    const label = String(raw["label"] ?? raw["class"] ?? raw["name"] ?? "person");
    const conf = num(raw["confidence"]) ?? num(raw["conf"]) ?? num(raw["score"]) ?? 0;

    // bbox as array [x1,y1,x2,y2] or explicit fields
    const arr = (raw["bbox"] ?? raw["box"] ?? raw["xyxy"]) as unknown;
    let x1: number | null = null;
    let y1: number | null = null;
    let x2: number | null = null;
    let y2: number | null = null;

    if (Array.isArray(arr) && arr.length >= 4) {
      x1 = num(arr[0]);
      y1 = num(arr[1]);
      x2 = num(arr[2]);
      y2 = num(arr[3]);
    } else {
      x1 = num(raw["x1"]) ?? num(raw["x"]) ?? num(raw["xmin"]);
      y1 = num(raw["y1"]) ?? num(raw["y"]) ?? num(raw["ymin"]);
      const w = num(raw["w"]) ?? num(raw["width"]);
      const h = num(raw["h"]) ?? num(raw["height"]);
      x2 = num(raw["x2"]) ?? num(raw["xmax"]) ?? (x1 !== null && w !== null ? x1 + w : null);
      y2 = num(raw["y2"]) ?? num(raw["ymax"]) ?? (y1 !== null && h !== null ? y1 + h : null);
    }

    if (x1 === null || y1 === null || x2 === null || y2 === null) return [];

    // Normalised coords (0..1) come through as-is; pixel coords scale by frame size.
    const normalised = x2 <= 1 && y2 <= 1;
    const sx = normalised ? 100 : 100 / frameW;
    const sy = normalised ? 100 : 100 / frameH;

    return [
      {
        id: `${i}-${label}`,
        label: label === "person" ? "Person" : label,
        confidence: Number(((conf <= 1 ? conf * 100 : conf) || 0).toFixed(1)),
        x: x1 * sx,
        y: y1 * sy,
        w: (x2 - x1) * sx,
        h: (y2 - y1) * sy,
        tone: label.toLowerCase() === "person" ? "primary" : "warn",
      } satisfies Detection,
    ];
  });
}

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const busyRef = useRef(false);
  const [status, setStatus] = useState<"idle" | "starting" | "live" | "error">("idle");
  const [detections, setDetections] = useState<Detection[]>([]);
  const [peopleCount, setPeopleCount] = useState(0);
  const [crowd, setCrowd] = useState(false);
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const [fps, setFps] = useState(0);
  const { reportDetection } = useSentinel();

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
    setDetections([]);
    setPeopleCount(0);
    setCrowd(false);
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

  /** Real inference loop: browser frame → Flask → YOLOv8 person detection → crowd logic. */
  useEffect(() => {
    if (status !== "live") return;
    let cancelled = false;

    const sendFrame = async () => {
      const video = videoRef.current;
      if (!video || busyRef.current || video.readyState < 2) return;
      busyRef.current = true;
      const t0 = performance.now();
      try {
        const canvas = (canvasRef.current ??= document.createElement("canvas"));
        const w = video.videoWidth || 640;
        const h = video.videoHeight || 480;
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")?.drawImage(video, 0, 0, w, h);
        const blob: Blob | null = await new Promise((res) =>
          canvas.toBlob((b) => res(b), "image/jpeg", 0.7),
        );
        if (!blob) return;

        const form = new FormData();
        form.append("image", blob, "frame.jpg");
        form.append("file", blob, "frame.jpg");
        form.append("camera_id", cameraId);

        const res = await fetch(DETECT_URL, { method: "POST", body: form });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload: unknown = await res.json();
        if (cancelled) return;

        const boxes = parseDetections(payload, w, h);
        const people = boxes.filter((b) => b.label.toLowerCase() === "person");
        const isCrowd = people.length >= CROWD_THRESHOLD;

        setBackendOk(true);
        setDetections(boxes);
        setPeopleCount(people.length);
        setCrowd(isCrowd);
        setFps(Number((1000 / Math.max(1, performance.now() - t0)).toFixed(0)));

        // Crowd → warning alert (store applies the 10s per-camera cooldown).
        if (isCrowd) {
          const avg =
            people.reduce((s, p) => s + (p.confidence || 0), 0) / (people.length || 1) || 90;
          reportDetection({
            label: "Crowd Detected",
            confidence: avg,
            cameraId,
            buildingId,
            peopleCount: people.length,
          });
        }

        // Forward any non-person YOLO classes (e.g. fire/smoke models) untouched.
        boxes
          .filter((b) => b.label.toLowerCase() !== "person")
          .forEach((b) =>
            reportDetection({
              label: b.label,
              confidence: b.confidence,
              cameraId,
              buildingId,
            }),
          );
      } catch {
        if (!cancelled) {
          setBackendOk(false);
          setDetections([]);
          setPeopleCount(0);
          setCrowd(false);
        }
      } finally {
        busyRef.current = false;
      }
    };

    void sendFrame();
    const tick = window.setInterval(() => void sendFrame(), 700);
    return () => {
      cancelled = true;
      window.clearInterval(tick);
    };
  }, [status, reportDetection, cameraId, buildingId]);

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
                Inference engine ready · YOLOv8 via Flask
              </p>
            </div>
          </div>
        )}

        {status === "live" &&
          detections.map((d) => (
            <div
              key={d.id}
              className={cn("absolute rounded-md border-2", toneClass[d.tone])}
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

        {status === "live" && crowd && (
          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center p-3">
            <div className="flex items-center gap-2 rounded-lg border-2 border-warn bg-warn/20 px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider text-warn backdrop-blur-md animate-pulse">
              <Users className="size-4" /> Crowd Detected · {peopleCount} people
            </div>
          </div>
        )}

        {status === "live" && (
          <div className="pointer-events-none absolute right-3 top-3 rounded-md border border-panel-border bg-black/55 px-2 py-1 font-mono text-[11px] text-foreground/90 backdrop-blur">
            People: {peopleCount} / crowd ≥ {CROWD_THRESHOLD}
          </div>
        )}

        <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-black/55 px-2 py-1 font-mono text-[11px] text-foreground/90 backdrop-blur">
          {cameraName} · YOLOv8 overlay ON
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-panel-border p-4">
        <Button onClick={start} disabled={status === "live" || status === "starting"} className="gap-2">
          <Play className="size-4" /> Start Camera
        </Button>
        <Button onClick={stop} variant="outline" disabled={status !== "live"} className="gap-2">
          <CircleStop className="size-4" /> Stop Camera
        </Button>
        {status === "live" && backendOk === false && (
          <span className="font-mono text-[11px] text-danger">
            Flask detector unreachable at {DETECT_URL}
          </span>
        )}
        <p className="ml-auto font-mono text-[11px] text-muted-foreground">
          {peopleCount} person{peopleCount === 1 ? "" : "s"} tracked
        </p>
      </div>
    </div>
  );
}
