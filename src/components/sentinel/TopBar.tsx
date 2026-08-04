import { useNavigate } from "@tanstack/react-router";
import { Bell, ChevronDown, LogOut, Menu, Search, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useClock, useSentinel } from "@/lib/sentinel-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { severityStyles } from "@/lib/sentinel-data";
import { cn } from "@/lib/utils";

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const now = useClock();
  const navigate = useNavigate();
  const { alerts, triggerTestAlert } = useSentinel();
  const [query, setQuery] = useState("");
  const unread = alerts.filter((a) => a.status === "Active").length;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-panel-border bg-background/70 px-4 backdrop-blur-xl lg:px-6">
      <button
        onClick={onMenu}
        className="grid size-9 place-items-center rounded-lg border border-panel-border text-muted-foreground md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-4" />
      </button>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cameras, zones, events…"
          className="h-9 border-panel-border bg-card/60 pl-9 text-sm placeholder:text-muted-foreground/70"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Button variant="destructive" size="sm" className="hidden gap-2 sm:flex" onClick={triggerTestAlert}>
          <ShieldAlert className="size-4" /> Test Alert
        </Button>

        <div className="hidden text-right lg:block">
          <p className="font-mono text-sm tabular-nums">
            {now ? now.toLocaleTimeString("en-GB") : "--:--:--"}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {now
              ? now.toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative grid size-9 place-items-center rounded-lg border border-panel-border bg-card/60 text-muted-foreground transition-colors hover:text-foreground">
              <Bell className="size-4" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 grid size-4.5 min-w-[18px] place-items-center rounded-full bg-danger px-1 font-mono text-[10px] text-danger-foreground animate-pulse-ring">
                  {unread}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Recent notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {alerts.slice(0, 5).map((a) => (
              <DropdownMenuItem key={a.id} className="items-start gap-2">
                <span
                  className={cn("mt-1.5 size-2 shrink-0 rounded-full", severityStyles[a.severity].dot)}
                />
                <div>
                  <p className="text-sm font-medium">{a.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.building} · {a.cameraId} · {a.time}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
            {alerts.length === 0 && (
              <p className="px-2 py-3 text-sm text-muted-foreground">No notifications</p>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg border border-panel-border bg-card/60 py-1.5 pl-1.5 pr-2.5 transition-colors hover:border-primary/40">
              <span className="grid size-6.5 place-items-center rounded-md bg-primary/15 font-mono text-xs font-bold text-primary">
                AR
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-semibold leading-tight">A. Ramesh</span>
                <span className="block text-[10px] leading-tight text-muted-foreground">
                  Security Admin
                </span>
              </span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>arjun.ramesh@campus.edu</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate({ to: "/app/settings" })}>
              Preferences
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate({ to: "/" })} className="text-danger">
              <LogOut className="size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
