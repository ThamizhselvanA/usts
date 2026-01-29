import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";

function LogoMark() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-400 shadow-glowViolet">
        <div className="h-3 w-3 rounded-sm bg-black/40" />
      </div>
      <div className="text-sm font-semibold tracking-wide">AITicket.</div>
    </div>
  );
}

function TopNav() {
  return (
    <div className="sticky top-0 z-30 border-b border-white/5 bg-black/20 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <LogoMark />

        <div className="hidden items-center gap-6 text-xs text-slate-300 md:flex">
          <a className="hover:text-white" href="#solutions">Solutions</a>
          <a className="hover:text-white" href="#platform">Platform</a>
          <a className="hover:text-white" href="#enterprise">Enterprise</a>
          <a className="hover:text-white" href="#pricing">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login" className="text-xs text-slate-300 hover:text-white">
            Log in
          </Link>
          <Button variant="primary" size="sm" onClick={() => { /* keep as marketing CTA */ }}>
            Book Demo
          </Button>
        </div>
      </div>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />

      {/* fake chart area */}
      <div className="p-6">
        <div className="h-8 w-44 rounded-lg bg-white/5" />
        <div className="mt-4 grid grid-cols-12 gap-2">
          {Array.from({ length: 48 }).map((_, i) => {
            const h = 18 + ((i * 37) % 70);
            return (
              <div
                key={i}
                className="col-span-1 rounded-sm bg-gradient-to-t from-cyan-400/20 to-violet-500/35"
                style={{ height: `${h}px` }}
              />
            );
          })}
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="h-16 rounded-xl bg-white/5" />
          <div className="h-16 rounded-xl bg-white/5" />
          <div className="h-16 rounded-xl bg-white/5" />
        </div>
      </div>

      <div className="absolute inset-0 grid place-items-center">
        <div className="grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-black/30 shadow-glowCyan backdrop-blur">
          <Play className="h-5 w-5 text-slate-100" />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  desc,
  accent
}: {
  title: string;
  desc: string;
  accent: "violet" | "cyan";
}) {
  const ring = accent === "violet" ? "shadow-glowViolet" : "shadow-glowCyan";
  const iconBg =
    accent === "violet"
      ? "bg-violet-500/15 text-violet-200"
      : "bg-cyan-400/15 text-cyan-200";

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${ring}`}>
          <div className="h-4 w-4 rounded-sm bg-white/20" />
        </div>

        <div className="mt-4 text-sm font-semibold text-slate-100">{title}</div>
        <div className="mt-2 text-sm leading-6 text-slate-400">{desc}</div>

        <div className="mt-5 h-28 rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.02] to-black/20" />
      </CardContent>
    </Card>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-slate-200">
      <TopNav />

      {/* HERO */}
      <section className="relative mx-auto max-w-6xl px-4 pb-14 pt-14 md:pt-20">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="mx-auto h-full max-w-6xl bg-grid" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="flex justify-center">
            <Badge className="bg-white/5">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_14px_rgba(99,102,241,0.8)]" />
              NEXT-GEN TASK INTELLIGENCE
            </Badge>
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-100 md:text-6xl">
            Intelligence at the
            <br />
            Edge of{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">
              Service
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
            Unify your ticketing, automate routing, and preserve visibility across GLPI/Solman—without replacing
            existing systems or exposing complexity.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="primary">
              <Link to="/login">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" variant="secondary">
                  <Play className="h-4 w-4" /> Watch Video
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Demo video (placeholder)</DialogTitle>
                </DialogHeader>
                <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black/40 grid place-items-center text-sm text-slate-400">
                  Embed your demo video here
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* preview */}
        <div className="relative mx-auto mt-10 max-w-5xl">
          <div className="absolute -inset-8 -z-10 rounded-[32px] bg-gradient-to-r from-violet-600/15 via-transparent to-cyan-400/15 blur-2xl" />
          <DashboardPreview />
        </div>
      </section>

      {/* trust strip */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="text-center text-[10px] tracking-[0.28em] text-slate-500">
          POWERING THE WORLD’S MOST RESILIENT SUPPORT TEAMS
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 opacity-70 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 rounded-xl border border-white/5 bg-white/[0.02]" />
          ))}
        </div>
      </section>

      {/* core capabilities */}
      <section id="platform" className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-end">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.24em] text-cyan-300">CORE CAPABILITIES</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-100 md:text-4xl">
              AI-Driven Resolution <br className="hidden md:block" /> for Modern Teams
            </h2>
          </div>
          <p className="text-sm leading-6 text-slate-400">
            Enterprise-grade unified ticket intake with AI-assisted classification, priority suggestion, and
            duplicate detection—always backed by rule-based fallbacks.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          <FeatureCard
            accent="violet"
            title="Auto-Routing"
            desc="Intelligently assign tickets to the right queue with AI assist + deterministic rules. No manual triage."
          />
          <FeatureCard
            accent="cyan"
            title="Priority Guidance"
            desc="Recommend urgency from context, keywords, and patterns—without blocking core workflows."
          />
          <FeatureCard
            accent="violet"
            title="Unified Workspace"
            desc="One portal and one ticket view for users, while syncing updates from backend tools like GLPI/Solman."
          />
        </div>
      </section>

      {/* stats strip */}
      <section id="enterprise" className="mx-auto max-w-6xl px-4 pb-12">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div>
              <div className="text-2xl font-semibold text-slate-100">99.9%</div>
              <div className="mt-1 text-[10px] tracking-[0.22em] text-violet-300">UPTIME SLA</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-100">40%</div>
              <div className="mt-1 text-[10px] tracking-[0.22em] text-violet-300">FASTER ROUTING</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-100">2M+</div>
              <div className="mt-1 text-[10px] tracking-[0.22em] text-violet-300">TASKS MANAGED</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-100">150+</div>
              <div className="mt-1 text-[10px] tracking-[0.22em] text-violet-300">INTEGRATIONS</div>
            </div>
          </div>
        </div>
      </section>

      {/* bottom CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-10">
          <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-violet-600/15 blur-2xl animate-pulseGlow" />
          <div className="absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-cyan-400/12 blur-2xl animate-pulseGlow" />

          <div className="relative mx-auto max-w-2xl text-center">
            <h3 className="text-3xl font-semibold tracking-tight text-slate-100 md:text-4xl">
              Ready to evolve your <span className="text-violet-300">service architecture</span>?
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Join enterprise teams unifying IT support intake while keeping their existing GLPI/Solman workflows intact.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" variant="primary">Request Enterprise Demo</Button>
              <Button size="lg" variant="secondary">Contact Sales</Button>
            </div>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-white/5 bg-black/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-400" />
            <span>AITicket.</span>
          </div>
          <div className="flex gap-4">
            <a className="hover:text-slate-300" href="#">Privacy Policy</a>
            <a className="hover:text-slate-300" href="#">Security</a>
            <a className="hover:text-slate-300" href="#">Terms</a>
          </div>
          <div>© {new Date().getFullYear()} USTS. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}