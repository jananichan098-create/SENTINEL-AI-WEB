import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Fingerprint, Lock, Mail, ShieldCheck } from "lucide-react";
import { SentinelLogo } from "@/components/sentinel/SentinelLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SentinelAI — Secure Operator Sign In" },
      {
        name: "description",
        content:
          "Sign in to SentinelAI, the AI-powered smart surveillance and real-time alert console for campus security operations.",
      },
      { property: "og:title", content: "SentinelAI — Secure Operator Sign In" },
      {
        property: "og:description",
        content: "AI smart surveillance and real-time alerting for campus security teams.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("arjun.ramesh@campus.edu");
  const [password, setPassword] = useState("sentinel2026");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    window.setTimeout(() => navigate({ to: "/app" }), 900);
  };

  return (
    <main
      className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-70" />
      <div className="pointer-events-none absolute -left-40 top-1/4 size-[520px] rounded-full bg-primary/10 blur-[130px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 size-[420px] rounded-full bg-danger/10 blur-[130px]" />

      <div className="relative grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
        <section className="hidden lg:block">
          <SentinelLogo />
          <h1 className="mt-8 font-display text-5xl font-bold leading-[1.05]">
            Every corridor watched.
            <br />
            <span className="text-primary">Every second verified.</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
            SentinelAI fuses 24 campus camera streams with on-edge computer vision to detect fire,
            smoke, crowd surges and unauthorised entry in under 300 milliseconds — then pages the
            right response team automatically.
          </p>
          <dl className="mt-8 grid max-w-md grid-cols-3 gap-3">
            {[
              ["24", "Live streams"],
              ["0.27s", "Detect latency"],
              ["99.98%", "Grid uptime"],
            ].map(([v, k]) => (
              <div key={k} className="glass rounded-xl px-3 py-3">
                <dt className="font-display text-xl font-bold text-primary">{v}</dt>
                <dd className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="glass rounded-3xl p-7 sm:p-9">
          <div className="lg:hidden">
            <SentinelLogo />
          </div>
          <div className="mt-6 lg:mt-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
              Operator access
            </p>
            <h2 className="mt-2 text-2xl font-bold">Sign in to the console</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Credentials are verified against the campus security directory.
            </p>
          </div>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 border-panel-border bg-background/50 pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 border-panel-border bg-background/50 pl-9"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <Checkbox defaultChecked id="remember" />
                Remember this workstation
              </label>
              <button type="button" className="text-sm text-primary hover:underline">
                Forgot Password?
              </button>
            </div>

            <Button type="submit" size="lg" className="mt-2 w-full gap-2" disabled={loading}>
              {loading ? "Authenticating…" : "Login"}
              {!loading && <ArrowRight className="size-4" />}
            </Button>

            <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-safe" />
              <span>TLS 1.3 · SSO enforced · session audited</span>
            </div>
            <button
              type="button"
              onClick={() => navigate({ to: "/app" })}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-panel-border py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <Fingerprint className="size-4" /> Continue with biometric badge
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
