import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Filter, Search } from "lucide-react";
import { EVENT_HISTORY, severityStyles } from "@/lib/sentinel-data";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/app/history")({
  head: () => ({
    meta: [
      { title: "Event History — SentinelAI" },
      {
        name: "description",
        content:
          "Searchable archive of every AI detection event with timestamp, camera, location, alert type, confidence, status and snapshot preview.",
      },
      { property: "og:title", content: "Event History — SentinelAI" },
      {
        property: "og:description",
        content: "Searchable, exportable archive of campus AI detection events.",
      },
    ],
  }),
  component: HistoryPage,
});

const snapshotTint: Record<string, string> = {
  engineering: "from-danger/40 to-danger/5",
  library: "from-warn/40 to-warn/5",
  biomed: "from-warn/35 to-primary/5",
  gate: "from-danger/35 to-primary/5",
  parking: "from-primary/35 to-primary/5",
  hostel: "from-chart-5/40 to-primary/5",
  sports: "from-warn/30 to-safe/5",
  admin: "from-safe/30 to-primary/5",
};

function HistoryPage() {
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");

  const rows = useMemo(
    () =>
      EVENT_HISTORY.filter((e) => {
        const q = query.trim().toLowerCase();
        const matchesQuery =
          !q ||
          [e.type, e.building, e.cameraId, e.status, e.id].some((v) =>
            v.toLowerCase().includes(q),
          );
        const matchesDate = !date || e.time.startsWith(date);
        return matchesQuery && matchesDate;
      }),
    [query, date],
  );

  const exportCsv = () => {
    const header = "ID,Time,Camera,Location,Alert Type,Confidence,Status\n";
    const body = rows
      .map((r) => [r.id, r.time, r.cameraId, r.building, r.type, `${r.confidence}%`, r.status].join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([header + body], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "sentinelai-event-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
            Forensic archive
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Event History</h1>
        </div>
        <Button className="gap-2" onClick={exportCsv}>
          <Download className="size-4" /> Export CSV
        </Button>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <div className="flex flex-wrap items-center gap-3 border-b border-panel-border p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by alert type, camera, building or status…"
              className="h-10 border-panel-border bg-card/50 pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 w-[170px] border-panel-border bg-card/50"
            />
            {(date || query) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDate("");
                  setQuery("");
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-panel-border hover:bg-transparent">
                <TableHead>Time</TableHead>
                <TableHead>Camera</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Alert Type</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Snapshot</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((e) => (
                <TableRow key={e.id} className="border-panel-border transition-colors hover:bg-card/60">
                  <TableCell className="font-mono text-xs">{e.time}</TableCell>
                  <TableCell className="font-mono text-xs">{e.cameraId}</TableCell>
                  <TableCell className="text-sm">{e.building}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                        severityStyles[e.severity].chip,
                      )}
                    >
                      {e.type}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{e.confidence}%</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        e.status === "Active"
                          ? "text-danger"
                          : e.status === "Acknowledged"
                            ? "text-warn"
                            : "text-safe",
                      )}
                    >
                      {e.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div
                      className={cn(
                        "ml-auto grid h-11 w-20 place-items-center overflow-hidden rounded-md border border-panel-border bg-gradient-to-br grid-backdrop",
                        snapshotTint[e.snapshot] ?? "from-primary/25 to-primary/5",
                      )}
                    >
                      <span className="font-mono text-[9px] uppercase tracking-wider text-foreground/80">
                        {e.cameraId}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                    No events match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
