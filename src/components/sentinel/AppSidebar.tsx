import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Bell,
  Cctv,
  History,
  LayoutDashboard,
  Map,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SentinelLogo } from "./SentinelLogo";
import { useSentinel } from "@/lib/sentinel-store";

const NAV: { to: string; label: string; icon: typeof Bell; exact?: boolean }[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/live", label: "Live Surveillance", icon: Activity },
  { to: "/app/map", label: "Campus Map", icon: Map },
  { to: "/app/alerts", label: "Alerts", icon: Bell },
  { to: "/app/cameras", label: "Cameras", icon: Cctv },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/history", label: "Event History", icon: History },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export function AppSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { alerts } = useSentinel();
  const activeCount = alerts.filter((a) => a.status === "Active").length;

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar/90 backdrop-blur-xl transition-[width] duration-300 md:flex",
        collapsed ? "w-[76px]" : "w-64",
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <SentinelLogo compact={collapsed} />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to as "/app"}
              title={item.label}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r bg-primary shadow-[0_0_12px_var(--primary)]" />
              )}
              <item.icon
                className={cn("size-[18px] shrink-0", active && "text-primary")}
                strokeWidth={2}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.label === "Alerts" && activeCount > 0 && (
                <span className="ml-auto rounded-full bg-danger/20 px-2 py-0.5 font-mono text-[11px] text-danger">
                  {activeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="mb-3 rounded-lg border border-panel-border bg-card/60 p-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Edge Inference
            </p>
            <p className="mt-1 text-sm font-semibold text-safe">YOLOv8-n · 27 ms</p>
            <p className="text-xs text-muted-foreground">8 streams · GPU 41%</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-[18px]" />
          ) : (
            <PanelLeftClose className="size-[18px]" />
          )}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
