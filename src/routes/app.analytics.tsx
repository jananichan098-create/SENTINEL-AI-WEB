import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Cctv,
  Cpu,
  Flame,
  UserCheck,
  Users,
  UsersRound,
} from "lucide-react";
import { StatCard } from "@/components/sentinel/StatCard";
import {
  ALERT_TYPE_SPLIT,
  CAMERA_USAGE,
  DAILY_ALERTS,
  PEOPLE_FLOW,
} from "@/lib/sentinel-data";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/app/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — SentinelAI" },
      {
        name: "description",
        content:
          "Surveillance analytics for campus security: detection volumes, footfall curves, alert-type distribution and per-camera utilisation.",
      },
      { property: "og:title", content: "Analytics — SentinelAI" },
      {
        property: "og:description",
        content: "Detection volumes, footfall curves and camera utilisation analytics.",
      },
    ],
  }),
  component: AnalyticsPage,
});

const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  fontSize: 12,
};

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
      <div className="mt-4 h-64">{children}</div>
    </div>
  );
}

function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
          Intelligence
        </p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Analytics</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Cameras" value={24} icon={Cctv} trend="20 online · 4 maintenance" />
        <StatCard label="People Detected Today" value={5081} icon={Users} tone="safe" trend="Peak 16:00 — 1,104" />
        <StatCard label="Fire Alerts" value={7} icon={Flame} tone="danger" trend="4 verified · 3 false positive" />
        <StatCard label="Crowd Alerts" value={57} icon={UsersRound} tone="warn" trend="Library and stadium dominant" />
        <StatCard label="Visitors" value={412} icon={UserCheck} trend="Badge-issued at Main Gate" />
        <StatCard label="Active Alerts" value={3} icon={AlertTriangle} tone="danger" trend="Avg. response 2m 40s" />
        <StatCard label="System Health" value={98.6} decimals={1} suffix="%" icon={Cpu} tone="primary" trend="Cluster stable 42 days" />
        <StatCard label="Detections / hour" value={186} icon={Activity} trend="+8.1% week over week" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Daily Alerts" subtitle="Alert volume by category over the past 7 days">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DAILY_ALERTS}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)", opacity: 0.35 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="motion" stackId="a" fill="var(--color-chart-1)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="crowd" stackId="a" fill="var(--color-chart-3)" />
              <Bar dataKey="intrusion" stackId="a" fill="var(--color-chart-5)" />
              <Bar dataKey="fire" stackId="a" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="People Count" subtitle="Campus-wide footfall detected across all streams">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={PEOPLE_FLOW}>
              <defs>
                <linearGradient id="peopleArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-4)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--color-chart-4)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="hour" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="people" stroke="var(--color-chart-4)" strokeWidth={2} fill="url(#peopleArea)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Alert Types" subtitle="Distribution of detections in the last 30 days">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ALERT_TYPE_SPLIT}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={92}
                paddingAngle={3}
                stroke="var(--color-background)"
              >
                {ALERT_TYPE_SPLIT.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Camera Usage" subtitle="Streaming hours captured per endpoint (last 24h)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CAMERA_USAGE} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis dataKey="camera" type="category" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={58} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)", opacity: 0.35 }} />
              <Bar dataKey="hours" fill="var(--color-chart-1)" radius={[0, 6, 6, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}
