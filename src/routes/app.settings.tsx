import { createFileRoute } from "@tanstack/react-router";
import {
  BellRing,
  Mail,
  MessageSquare,
  Moon,
  RefreshCw,
  ShieldAlert,
  Volume2,
} from "lucide-react";
import { playAlarm, useSentinel } from "@/lib/sentinel-store";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SentinelAI" },
      {
        name: "description",
        content:
          "Configure SentinelAI alarm sound, notification behaviour, detection sensitivity, refresh interval and operator preferences.",
      },
      { property: "og:title", content: "Settings — SentinelAI" },
      {
        property: "og:description",
        content: "Alarm, notification, sensitivity and refresh preferences for the security grid.",
      },
    ],
  }),
  component: SettingsPage,
});

function Row({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof BellRing;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-panel-border p-5 last:border-b-0">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div className="min-w-[200px] flex-1">
        <Label className="text-sm font-semibold">{title}</Label>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="ml-auto flex min-w-[180px] justify-end">{children}</div>
    </div>
  );
}

function SettingsPage() {
  const { settings, updateSettings, triggerTestAlert } = useSentinel();

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
          Configuration
        </p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Settings</h1>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <Row
          icon={Volume2}
          title="Alarm sound"
          description="Play the siren tone when a high-severity detection is confirmed."
        >
          <Switch
            checked={settings.alarmSound}
            onCheckedChange={(v) => updateSettings({ alarmSound: v })}
          />
        </Row>
        <Row
          icon={BellRing}
          title="Desktop notifications"
          description="Surface floating incident cards on top of every dashboard page."
        >
          <Switch
            checked={settings.desktopNotifications}
            onCheckedChange={(v) => updateSettings({ desktopNotifications: v })}
          />
        </Row>
        <Row
          icon={Mail}
          title="Daily email digest"
          description="Send a 24-hour detection summary to the security supervisor."
        >
          <Switch
            checked={settings.emailDigest}
            onCheckedChange={(v) => updateSettings({ emailDigest: v })}
          />
        </Row>
        <Row
          icon={MessageSquare}
          title="SMS on critical events"
          description="Escalate fire, intrusion and weapon detections to on-call staff."
        >
          <Switch
            checked={settings.smsCritical}
            onCheckedChange={(v) => updateSettings({ smsCritical: v })}
          />
        </Row>
        <Row
          icon={Moon}
          title="Dark control-room theme"
          description="Low-luminance palette tuned for 24/7 operation centres."
        >
          <Switch
            checked={settings.darkMode}
            onCheckedChange={(v) => updateSettings({ darkMode: v })}
          />
        </Row>
        <Row
          icon={RefreshCw}
          title="Refresh rate"
          description="How often the dashboard polls the inference cluster for new events."
        >
          <div className="flex w-full items-center gap-3">
            <Slider
              value={[settings.refreshRate]}
              min={5}
              max={120}
              step={5}
              onValueChange={([v]) => updateSettings({ refreshRate: v ?? settings.refreshRate })}
            />
            <span className="w-12 shrink-0 text-right font-mono text-sm">
              {settings.refreshRate}s
            </span>
          </div>
        </Row>
      </div>

      <div className="glass rounded-2xl p-5">
        <h2 className="text-base font-semibold">Diagnostics</h2>
        <p className="text-xs text-muted-foreground">
          Verify the alerting pipeline without waiting for a live detection.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="destructive" className="gap-2" onClick={triggerTestAlert}>
            <ShieldAlert className="size-4" /> Trigger test emergency
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => playAlarm()}>
            <Volume2 className="size-4" /> Test alarm sound
          </Button>
        </div>
      </div>


      <div className="glass rounded-2xl p-5">
        <h2 className="text-base font-semibold">Backend integration</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          The interface is wired against typed mock services so a Flask + OpenCV + YOLO backend can
          be dropped in by replacing the data layer.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ["Inference endpoint", "POST /api/detect"],
            ["Stream source", "RTSP → OpenCV"],
            ["Model", "YOLOv8n · 640×640"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-panel-border bg-card/50 p-3">
              <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</dt>
              <dd className="mt-1 font-mono text-xs">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
