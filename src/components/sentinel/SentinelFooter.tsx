export function SentinelFooter() {
  return (
    <footer className="mt-auto border-t border-panel-border px-4 py-5 lg:px-6">
      <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <p className="font-mono uppercase tracking-[0.18em]">SentinelAI © 2026</p>
        <p>AI Smart Surveillance Platform</p>
        <p className="font-mono">
          Grid status: <span className="text-safe">operational</span> · v2.4.1
        </p>
      </div>
    </footer>
  );
}
