import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { useAuthStore } from "../app/authStore";

const API = import.meta.env.VITE_API_BASE_URL;

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-400 shadow-glowViolet">
        <div className="h-4 w-4 rounded-md bg-black/40" />
      </div>
      <div className="text-lg font-semibold tracking-tight text-slate-100">Nexus AI</div>
    </div>
  );
}

function OrbPanel() {
  // SVG-based “neural orb” placeholder (no external asset needed).
  // If you provide the exact orb image from reference, we can swap it in 1 line.
  const nodes = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2;
      const r = 42 + (i % 4) * 5;
      pts.push({ x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r });
    }
    return pts;
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-400/10" />
      <div className="relative grid place-items-center">
        <div className="relative h-[260px] w-[260px] rounded-2xl bg-black/30 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <defs>
              <radialGradient id="g" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="rgba(251,146,60,0.95)" />
                <stop offset="45%" stopColor="rgba(251,146,60,0.20)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>

              <filter id="blur">
                <feGaussianBlur stdDeviation="0.6" />
              </filter>
            </defs>

            {/* links */}
            {nodes.map((p, i) => {
              const q = nodes[(i + 3) % nodes.length];
              return (
                <line
                  key={i}
                  x1={p.x}
                  y1={p.y}
                  x2={q.x}
                  y2={q.y}
                  stroke="rgba(255,255,255,0.10)"
                  strokeWidth="0.4"
                />
              );
            })}

            {/* nodes */}
            {nodes.map((p, i) => (
              <circle
                key={`c-${i}`}
                cx={p.x}
                cy={p.y}
                r={1.2}
                fill={i % 5 === 0 ? "rgba(251,146,60,0.95)" : "rgba(255,255,255,0.22)"}
                filter="url(#blur)"
              />
            ))}

            {/* core */}
            <circle cx="50" cy="50" r="22" fill="url(#g)" />
            <circle cx="50" cy="50" r="3" fill="rgba(251,146,60,0.95)" />
          </svg>
        </div>

        <div className="mt-6 text-center">
          <div className="text-xl font-semibold text-slate-100">The Future of Tasks</div>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Harness distributed intelligence to unify enterprise workflows into a single, calm, operational stream.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="h-1.5 w-10 rounded-full bg-violet-500" />
            <span className="h-1.5 w-3 rounded-full bg-white/15" />
            <span className="h-1.5 w-3 rounded-full bg-white/10" />
          </div>

          <div className="mt-6 flex justify-center">
            <Badge className="border-white/10 bg-black/20 text-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.6)]" />
              ENTERPRISE SECURED SOC2
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const nav = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("user@powergrid.com");
  const [password, setPassword] = useState("User123!");
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Login failed");
      }

      const data = await res.json();
      setAuth({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
      nav("/dashboard");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg text-slate-200">
      {/* top bar */}
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <Brand />
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <a className="hover:text-slate-200" href="#">Documentation</a>
          <Button variant="secondary" size="sm">Help Center</Button>
        </div>
      </div>

      {/* main glass container */}
      <div className="mx-auto max-w-6xl px-4 pb-14">
        <Card className="overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* left */}
            <div className="p-6 md:p-10">
              <Tabs defaultValue="signin">
                <TabsList className="w-full">
                  <TabsTrigger value="signin" className="flex-1">Sign In</TabsTrigger>
                  <TabsTrigger value="create" className="flex-1">Create Account</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-100">
                    Welcome Back
                  </h1>
                  <p className="mt-2 text-sm text-slate-400">
                    Access your enterprise AI ticketing workspace.
                  </p>

                  <form onSubmit={submit} className="mt-7 space-y-4">
                    <div>
                      <div className="mb-2 text-[11px] font-semibold tracking-[0.22em] text-slate-400">
                        ENTERPRISE EMAIL
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <Input
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@company.com"
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-[11px] font-semibold tracking-[0.22em] text-slate-400">
                          PASSWORD
                        </div>
                        <a className="text-xs text-violet-300 hover:text-violet-200" href="#">
                          Forgot?
                        </a>
                      </div>

                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <Input
                          className="pl-10 pr-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          type={showPass ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                          aria-label="Toggle password"
                        >
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {err && (
                      <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-200">
                        {err}
                      </div>
                    )}

                    <Button className="w-full" size="lg" variant="primary" disabled={loading}>
                      {loading ? "Signing in..." : "Sign In to Nexus"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-3 py-2">
                      <div className="h-px flex-1 bg-white/10" />
                      <div className="text-[11px] tracking-[0.22em] text-slate-500">
                        OR CONTINUE WITH SSO
                      </div>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {["Okta", "Azure", "Google"].map((s) => (
                        <button
                          key={s}
                          type="button"
                          className="h-12 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-300 hover:bg-white/10"
                          title="SSO (placeholder)"
                        >
                          {s}
                        </button>
                      ))}
                    </div>

                    <div className="pt-4 text-xs text-slate-500">
                      By signing in, you agree to enterprise security policies.
                      <span className="ml-2 text-slate-400">
                        <Link to="/" className="hover:text-slate-200">Back to landing</Link>
                      </span>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="create">
                  <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-100">
                    Join Nexus
                  </h1>
                  <p className="mt-2 text-sm text-slate-400">
                    Create your enterprise account to get started.
                  </p>

                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setErr(null);
                    setLoading(true);
                    try {
                      const res = await fetch(`${API}/auth/register`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password })
                      });
                      if (!res.ok) {
                        const t = await res.text().catch(() => "");
                        throw new Error(t || "Registration failed");
                      }
                      const data = await res.json();
                      setAuth({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
                      nav("/dashboard");
                    } catch (e: any) {
                      setErr(e.message);
                    } finally {
                      setLoading(false);
                    }
                  }} className="mt-7 space-y-4">
                    <div>
                      <div className="mb-2 text-[11px] font-semibold tracking-[0.22em] text-slate-400">
                        WORK EMAIL
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <Input
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@company.com"
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-[11px] font-semibold tracking-[0.22em] text-slate-400">
                        CHOOSE PASSWORD
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <Input
                          className="pl-10 pr-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          type={showPass ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {err && (
                      <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-200">
                        {err}
                      </div>
                    )}

                    <Button className="w-full" size="lg" variant="primary" disabled={loading}>
                      {loading ? "Creating Account..." : "Create Account"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>

                    <div className="pt-4 text-center text-xs text-slate-500">
                      Already have an account? switch to Sign In tab.
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </div>

            {/* right */}
            <div className="border-t border-white/10 p-6 md:border-l md:border-t-0 md:p-10">
              <OrbPanel />
            </div>
          </div>
        </Card>

        {/* footer */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-[11px] tracking-[0.18em] text-slate-600">
          <a href="#" className="hover:text-slate-400">PRIVACY POLICY</a>
          <a href="#" className="hover:text-slate-400">TERMS OF SERVICE</a>
          <a href="#" className="hover:text-slate-400">TRUST CENTER</a>
        </div>
      </div>
    </div>
  );
}