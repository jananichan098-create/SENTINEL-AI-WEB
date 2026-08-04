import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { X } from "lucide-react";
import { AppSidebar } from "@/components/sentinel/AppSidebar";
import { TopBar } from "@/components/sentinel/TopBar";
import { SentinelFooter } from "@/components/sentinel/SentinelFooter";
import { EmergencyOverlay, FloatingAlertPanel } from "@/components/sentinel/AlertPanel";
import { SentinelProvider } from "@/lib/sentinel-store";
import { SentinelLogo } from "@/components/sentinel/SentinelLogo";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

const MOBILE_NAV = [
  { to: "/app", label: "Dashboard" },
  { to: "/app/live", label: "Live Surveillance" },
  { to: "/app/map", label: "Campus Map" },
  { to: "/app/alerts", label: "Alerts" },
  { to: "/app/cameras", label: "Cameras" },
  { to: "/app/analytics", label: "Analytics" },
  { to: "/app/history", label: "Event History" },
  { to: "/app/settings", label: "Settings" },
];

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <SentinelProvider>
      <div className="flex min-h-screen bg-background">
        <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-background/80" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-72 border-r border-panel-border bg-sidebar p-4">
              <div className="flex items-center justify-between">
                <SentinelLogo />
                <button onClick={() => setMobileOpen(false)} aria-label="Close navigation">
                  <X className="size-5 text-muted-foreground" />
                </button>
              </div>
              <nav className="mt-6 space-y-1">
                {MOBILE_NAV.map((i) => (
                  <Link
                    key={i.to}
                    to={i.to as "/app"}
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-lg px-3 py-2.5 text-sm ${
                      pathname === i.to
                        ? "bg-sidebar-accent text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {i.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onMenu={() => setMobileOpen(true)} />
          <main className="flex-1 px-4 py-6 lg:px-6">
            <Outlet />
          </main>
          <SentinelFooter />
        </div>

        <FloatingAlertPanel />
        <EmergencyOverlay />
      </div>
    </SentinelProvider>
  );
}
