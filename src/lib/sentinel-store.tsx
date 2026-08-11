import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ALERT_TEMPLATES,
  BUILDINGS,
  type BuildingId,
  type SecurityAlert,
  type Severity,
} from "./sentinel-data";

interface Settings {
  alarmSound: boolean;
  darkMode: boolean;
  desktopNotifications: boolean;
  emailDigest: boolean;
  smsCritical: boolean;
  refreshRate: number;
}

export interface DetectionInput {
  label: string;
  confidence: number;
  cameraId: string;
  buildingId: BuildingId;
}

export type HistoryEvent = SecurityAlert & { snapshot: string };

interface SentinelContextValue {
  alerts: SecurityAlert[];
  activeEmergency: SecurityAlert | null;
  flashing: boolean;
  emergencyBuildings: BuildingId[];
  warningBuildings: BuildingId[];
  liveHistory: HistoryEvent[];
  sirenActive: boolean;
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  triggerTestAlert: () => void;
  pushAlert: (alert: SecurityAlert) => void;
  reportDetection: (input: DetectionInput) => void;
  dismissEmergency: () => void;
  acknowledgeEmergency: () => void;
  acknowledge: (id: string) => void;
  clearAlerts: () => void;
}

const SentinelContext = createContext<SentinelContextValue | null>(null);


const seedAlerts: SecurityAlert[] = [
  {
    id: "ALR-1004",
    type: "Fire Detected",
    severity: "high",
    cameraId: "CAM-05",
    building: "Engineering Block",
    buildingId: "engineering-block",
    time: "13:21:07",
    confidence: 97.4,
    status: "Active",
  },
  {
    id: "ALR-1003",
    type: "Crowd Forming",
    severity: "medium",
    cameraId: "CAM-02",
    building: "Central Library",
    buildingId: "library",
    time: "11:47:52",
    confidence: 91.2,
    status: "Active",
  },
  {
    id: "ALR-1002",
    type: "Person Detected",
    severity: "low",
    cameraId: "CAM-07",
    building: "North Parking",
    buildingId: "parking",
    time: "07:35:44",
    confidence: 82.9,
    status: "Acknowledged",
  },
];

export function playAlarm() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const master = ctx.createGain();
    master.gain.value = 0.13;
    master.connect(ctx.destination);
    const start = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const t = start + i * 0.62;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(660, t);
      osc.frequency.exponentialRampToValueAtTime(1180, t + 0.3);
      osc.frequency.exponentialRampToValueAtTime(660, t + 0.55);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(1, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.58);
      osc.connect(gain).connect(master);
      osc.start(t);
      osc.stop(t + 0.6);
    }
    window.setTimeout(() => void ctx.close(), 2600);
  } catch {
    /* audio unavailable */
  }
}

/** Looping emergency siren — runs until stopSiren() is called (Acknowledge Alert). */
function createSiren() {
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  const master = ctx.createGain();
  master.gain.value = 0.12;
  master.connect(ctx.destination);
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(660, ctx.currentTime);
  osc.connect(master);
  osc.start();
  const wail = window.setInterval(() => {
    const t = ctx.currentTime;
    osc.frequency.cancelScheduledValues(t);
    osc.frequency.setValueAtTime(660, t);
    osc.frequency.linearRampToValueAtTime(1180, t + 0.45);
    osc.frequency.linearRampToValueAtTime(660, t + 0.9);
  }, 900);
  return () => {
    window.clearInterval(wail);
    try {
      osc.stop();
    } catch {
      /* already stopped */
    }
    void ctx.close();
  };
}

const FIRE_WORDS = ["fire", "smoke", "flame"];
const COOLDOWN_MS = 10_000;

export function SentinelProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<SecurityAlert[]>(seedAlerts);
  const [activeEmergency, setActiveEmergency] = useState<SecurityAlert | null>(null);
  const [flashing, setFlashing] = useState(false);
  const [liveHistory, setLiveHistory] = useState<HistoryEvent[]>([]);
  const [sirenActive, setSirenActive] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    alarmSound: true,
    darkMode: true,
    desktopNotifications: true,
    emailDigest: false,
    smsCritical: true,
    refreshRate: 30,
  });
  const counter = useRef(1005);
  const stopSirenRef = useRef<(() => void) | null>(null);
  const cooldowns = useRef<Record<string, number>>({});

  const stopSiren = useCallback(() => {
    stopSirenRef.current?.();
    stopSirenRef.current = null;
    setSirenActive(false);
  }, []);

  const startSiren = useCallback(() => {
    if (stopSirenRef.current) return;
    try {
      stopSirenRef.current = createSiren();
      setSirenActive(true);
    } catch {
      /* audio unavailable */
    }
  }, []);

  useEffect(() => () => stopSirenRef.current?.(), []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const logHistory = useCallback((alert: SecurityAlert) => {
    setLiveHistory((prev) =>
      [
        {
          ...alert,
          id: `EVT-${alert.id.replace(/\D/g, "")}`,
          time: new Date().toISOString().slice(0, 19).replace("T", " "),
          snapshot: alert.buildingId.split("-")[0]!,
        },
        ...prev,
      ].slice(0, 50),
    );
  }, []);

  const pushAlert = useCallback(
    (alert: SecurityAlert) => {
      setAlerts((prev) => [alert, ...prev].slice(0, 25));
      logHistory(alert);
    },
    [logHistory],
  );

  const raiseEmergency = useCallback(
    (alert: SecurityAlert) => {
      setActiveEmergency(alert);
      setFlashing(true);
      window.setTimeout(() => setFlashing(false), 1700);
      if (settings.alarmSound) startSiren();
    },
    [settings.alarmSound, startSiren],
  );

  /** Classify an incoming YOLO/backend detection into an alert (10s cooldown per camera+type). */
  const reportDetection = useCallback(
    ({ label, confidence, cameraId, buildingId }: DetectionInput) => {
      const l = label.toLowerCase();
      const isFire = FIRE_WORDS.some((w) => l.includes(w));
      const isCrowd = l.includes("crowd");
      // Normal person detection never raises an alert.
      if (!isFire && !isCrowd) return;

      const key = `${cameraId}:${isFire ? "fire" : "crowd"}`;
      const now = Date.now();
      if (cooldowns.current[key] && now - cooldowns.current[key]! < COOLDOWN_MS) return;
      cooldowns.current[key] = now;

      const building = BUILDINGS.find((b) => b.id === buildingId);
      const alert: SecurityAlert = {
        id: `ALR-${counter.current++}`,
        type: isFire ? (l.includes("smoke") ? "Smoke Detected" : "Fire Detected") : "Crowd Forming",
        severity: isFire ? "high" : "medium",
        cameraId,
        building: building?.name ?? cameraId,
        buildingId,
        time: new Date().toLocaleTimeString("en-GB"),
        confidence: Number(confidence.toFixed(1)),
        status: "Active",
      };
      pushAlert(alert);
      if (isFire) raiseEmergency(alert);
    },
    [pushAlert, raiseEmergency],
  );

  const triggerTestAlert = useCallback(() => {
    const template = ALERT_TEMPLATES[Math.floor(Math.random() * 3)]!;
    const building = BUILDINGS.find((b) => b.id === template.buildingId)!;
    const alert: SecurityAlert = {
      id: `ALR-${counter.current++}`,
      type: template.type,
      severity: template.severity as Severity,
      cameraId: building.cameraId,
      building: building.name,
      buildingId: building.id,
      time: new Date().toLocaleTimeString("en-GB"),
      confidence: Number((88 + Math.random() * 11).toFixed(1)),
      status: "Active",
    };
    pushAlert(alert);
    raiseEmergency(alert);
  }, [pushAlert, raiseEmergency]);

  const acknowledge = useCallback(
    (id: string) => {
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "Acknowledged" as const } : a)),
      );
      setLiveHistory((prev) =>
        prev.map((e) =>
          e.id === `EVT-${id.replace(/\D/g, "")}` ? { ...e, status: "Acknowledged" as const } : e,
        ),
      );
      setActiveEmergency((cur) => (cur?.id === id ? null : cur));
      stopSiren();
    },
    [stopSiren],
  );

  const acknowledgeEmergency = useCallback(() => {
    stopSiren();
    setActiveEmergency((cur) => {
      if (cur) acknowledge(cur.id);
      return null;
    });
  }, [acknowledge, stopSiren]);

  const dismissEmergency = useCallback(() => {
    stopSiren();
    setActiveEmergency(null);
  }, [stopSiren]);

  const value = useMemo<SentinelContextValue>(
    () => ({
      alerts,
      activeEmergency,
      flashing,
      emergencyBuildings: alerts
        .filter((a) => a.status === "Active" && a.severity === "high")
        .map((a) => a.buildingId),
      warningBuildings: alerts
        .filter((a) => a.status === "Active" && a.severity === "medium")
        .map((a) => a.buildingId),
      liveHistory,
      sirenActive,
      settings,
      updateSettings,
      triggerTestAlert,
      pushAlert,
      reportDetection,
      dismissEmergency,
      acknowledgeEmergency,
      acknowledge,
      clearAlerts: () => setAlerts([]),
    }),
    [
      alerts,
      activeEmergency,
      flashing,
      liveHistory,
      sirenActive,
      settings,
      updateSettings,
      triggerTestAlert,
      pushAlert,
      reportDetection,
      dismissEmergency,
      acknowledgeEmergency,
      acknowledge,
    ],
  );

  return <SentinelContext.Provider value={value}>{children}</SentinelContext.Provider>;
}


export function useSentinel() {
  const ctx = useContext(SentinelContext);
  if (!ctx) throw new Error("useSentinel must be used inside SentinelProvider");
  return ctx;
}

export function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);
  return now;
}
