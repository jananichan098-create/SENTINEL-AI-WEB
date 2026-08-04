import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Cctv,
  Cpu,
  Flame,
  Users,
  Wifi,
} from "lucide-react";
import { StatCard } from "@/components/sentinel/StatCard";
import { LiveCameraFeed } from "@/components/sentinel/LiveCameraFeed";
import { CampusMap } from "@/components/sentinel/CampusMap";
import { useSentinel } from "@/lib/sentinel-store";
import { CAMERAS, DAILY_ALERTS, severityStyles } from "@/lib/sentinel-data";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Operations Dashboard — SentinelAI" },
      {
        name: "description",
        content:
          "Real-time campus security overview: active alerts, live AI camera feed, detection trends and grid health across 24 surveillance streams.",
      },
      { property: "og:title", content: "Operations Dashboard — SentinelAI" },
      {
        property: "og:description",
        content: "Real-time campus security overview with AI detection and instant alerting.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { alerts, emergencyBuildings } = useSentinel();
  const online = CAMERAS.filter((c) => c.online).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
            Security Operations Center
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Campus Situation Overview</h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-safe/30 bg-safe/10 px-3 py-1.5 text-xs font-semibold text-safe">
          <span className="size-2 rounded-full bg-safe" /> Grid operational · {online}/
          {CAMERAS.length} cameras online
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Cameras" value={24} icon={Cctv} trend="20 online · 4 maintenance" />
        <StatCard
          label="People Detected Today"
          value={5081}
          icon={Users}
          tone="safe"
          trend="+12.4% vs yesterday"
        />
        <StatCard
          label="Active Alerts"
          value={alerts.filter((a) => a.status === "Active").length}
          icon={AlertTriangle}
          tone="danger"
          trend="Response SLA 2m 40s"
        />
        <StatCard
          label="System Health"
          value={98.6}
          decimals={1}
          suffix="%"
          icon={Cpu}
          tone="primary"
          trend="Edge GPU load 41%"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <LiveCameraFeed />

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Priority Incidents</h2>
            <Link to="/app/alerts" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {alerts.slice(0, 4).map((a) => (
              <div
                key={a.id}
                className={cn(
                  "rounded-xl border border-panel-border bg-card/60 p-3",
                  a.status === "Active" && severityStyles[a.severity].glow,
                )}
              >
                <div className="flex items-center gap-2">
                  <Flame
                    className={cn(
                      "size-4",
                      a.severity === "high"
                        ? "text-danger"
                        : a.severity === "medium"
                          ? "text-warn"
                          : "text-safe",
                    )}
                  />
                  <p className="text-sm font-semibold">{a.type}</p>
                  <span
                    className={cn(
                      "ml-auto rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider",
                      severityStyles[a.severity].chip,
                    )}
                  >
                    {a.severity}
                  </span>
                </div>
                <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                  {a.time} · {a.cameraId} · {a.building} · {a.confidence}%
                </p>
              </div>
            ))}
            {alerts.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No incidents recorded today.
              </p>
            )}
          </div>

          <div className="mt-5 space-y-3 border-t border-panel-border pt-4">
            {[
              { label: "Edge GPU utilisation", value: 41, icon: Cpu },
              { label: "Network throughput", value: 68, icon: Wifi },
              { label: "Inference queue", value: 12, icon: Activity },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <m.icon className="size-3.5" /> {m.label}
                  </span>
                  <span className="font-mono">{m.value}%</span>
                </div>
                <Progress value={m.value} className="mt-1.5 h-1.5" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
        <div className="glass rounded-2xl p-5">
          <h2 className="text-base font-semibold">Detections this week</h2>
          <p className="text-xs text-muted-foreground">Aggregated across all active streams</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DAILY_ALERTS}>
                <defs>
                  <linearGradient id="dashArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="motion"
                  stroke="var(--color-chart-1)"
                  fill="url(#dashArea)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h2 className="text-base font-semibold">Campus Map</h2>
              <p className="text-xs text-muted-foreground">
                Live building status · red indicates an active emergency
              </p>
            </div>
            <Link to="/app/map" className="text-xs text-primary hover:underline">
              Expand
            </Link>
          </div>
          <div className="h-72 w-full">
            <CampusMap emergencyBuildings={emergencyBuildings} />
          </div>
        </div>
      </div>
    </div>
  );
}
