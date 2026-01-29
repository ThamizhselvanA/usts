import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../app/authStore";
import { apiFetch } from "../app/apiClient";
import { MetricCard } from "../components/ui/metric-card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Clock, Sparkles, Zap, Activity, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function initials(email?: string) {
  if (!email) return "U";
  const name = email.split("@")[0] || "U";
  return name.slice(0, 2).toUpperCase();
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role;

  // role-based data
  const qUserTickets = useQuery({
    queryKey: ["tickets", "mine"],
    queryFn: () => apiFetch<{ tickets: any[] }>("/tickets/mine"),
    enabled: role === "END_USER"
  });

  const qAgentQueue = useQuery({
    queryKey: ["tickets", "assigned"],
    queryFn: () => apiFetch<{ tickets: any[] }>("/tickets/assigned"),
    enabled: role === "IT_AGENT"
  });

  const qAdminMetrics = useQuery({
    queryKey: ["admin", "metrics"],
    queryFn: () => apiFetch<any>("/admin/metrics"),
    enabled: role === "ADMIN"
  });

  const qAdminTickets = useQuery({
    queryKey: ["admin", "tickets"],
    queryFn: () => apiFetch<{ tickets: any[] }>("/admin/tickets"),
    enabled: role === "ADMIN"
  });

  // derive numbers (use placeholders where data doesn't exist in MVP)
  const derived = useMemo(() => {
    if (role === "END_USER") {
      const total = qUserTickets.data?.tickets?.length ?? 0;
      const open = (qUserTickets.data?.tickets || []).filter((t) => t.status !== "CLOSED").length;
      return {
        kpi1: { label: "Active Tickets", value: String(open), hint: total ? `~${total} total` : undefined },
        kpi2: { label: "Task Completion", value: "—", hint: "+0%" },
        kpi3: { label: "AI Efficiency", value: "—", hint: "+0h saved" }
      };
    }

    if (role === "IT_AGENT") {
      const assigned = qAgentQueue.data?.tickets?.length ?? 0;
      const high = (qAgentQueue.data?.tickets || []).filter((t) => (t.priority || "").toLowerCase() === "high").length;
      return {
        kpi1: { label: "Assigned Queue", value: String(assigned), hint: high ? `${high} high` : undefined },
        kpi2: { label: "Resolved Today", value: "—", hint: "+0%" },
        kpi3: { label: "AI Assist", value: "—", hint: "+0h saved" }
      };
    }

    if (role === "ADMIN") {
      const tickets = qAdminMetrics.data?.tickets ?? 0;
      const users = qAdminMetrics.data?.users ?? 0;
      const uptime = "99.99%";
      return {
        kpi1: { label: "Open Tickets", value: String(tickets), hint: "live" },
        kpi2: { label: "Users", value: String(users), hint: "org" },
        kpi3: { label: "System Health", value: uptime, hint: "stable" }
      };
    }

    return {
      kpi1: { label: "Active Tickets", value: "—" },
      kpi2: { label: "Task Completion", value: "—" },
      kpi3: { label: "AI Efficiency", value: "—" }
    };
  }, [role, qUserTickets.data, qAgentQueue.data, qAdminMetrics.data]);

  const loading =
    (role === "END_USER" && qUserTickets.isLoading) ||
    (role === "IT_AGENT" && qAgentQueue.isLoading) ||
    (role === "ADMIN" && (qAdminMetrics.isLoading || qAdminTickets.isLoading));

  const displayName = user?.email ? user.email.split("@")[0] : "User";

  return (
    <div className="space-y-8">
      {/* Header row like screenshot */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-100 md:text-4xl">
            {timeGreeting()}, {displayName}
          </h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
            <span className="h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_18px_rgba(99,102,241,0.65)]" />
            {role === "END_USER" && (
              <>
                You have {qUserTickets.data?.tickets?.length ?? "…"} tickets. AI suggests focusing on{" "}
                <span className="text-violet-300">high-priority incidents</span> first.
              </>
            )}
            {role === "IT_AGENT" && (
              <>
                You have {qAgentQueue.data?.tickets?.length ?? "…"} assigned tickets. AI suggests starting with{" "}
                <span className="text-violet-300">routing failures</span>.
              </>
            )}
            {role === "ADMIN" && (
              <>
                Visibility across operations. {qAdminTickets.data?.tickets?.length ?? "…"} total tickets detected in system.
              </>
            )}
          </div>
        </div>

        {/* right: avatar circle + quick action */}
        <div className="flex items-center gap-3 md:pt-1">
          <button
            className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-slate-100 hover:bg-white/10"
            title="Profile (not a page in locked scope)"
          >
            {initials(user?.email)}
          </button>

          {role === "END_USER" && (
            <Button asChild variant="primary">
              <Link to="/tickets/new">
                <Zap className="h-4 w-4" /> Create Ticket
              </Link>
            </Button>
          )}

          {role === "ADMIN" && (
            <Button asChild variant="secondary">
              <Link to="/admin">
                <ArrowRight className="h-4 w-4" /> Admin / Audit
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* AI suggestion banner */}
      <Card className="overflow-hidden">
        <CardContent className="relative p-6">
          <div className="absolute -left-16 -top-20 h-56 w-56 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="absolute -right-20 -bottom-20 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-violet-500/10 shadow-glowViolet">
                <Sparkles className="h-5 w-5 text-violet-200" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-100">AI Focus Suggestion</div>
                <div className="mt-1 text-sm leading-6 text-slate-400">
                  {role === "END_USER" && "If you’re blocked, add screenshots/logs. This improves triage accuracy and reduces duplicates."}
                  {role === "IT_AGENT" && "Start with tickets tagged Network/Outage. Use notes for audit-grade handoffs."}
                  {role === "ADMIN" && "Watch for spikes in volume and repeated categories. Audit trail provides complete traceability."}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" disabled>
                View Insight (locked)
              </Button>
              {role === "END_USER" ? (
                <Button asChild variant="primary">
                  <Link to="/tickets">Open Tickets</Link>
                </Button>
              ) : role === "IT_AGENT" ? (
                <Button variant="primary" disabled>
                  Queue View (locked to Dashboard)
                </Button>
              ) : (
                <Button asChild variant="primary">
                  <Link to="/admin">Review Audit</Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI row */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton className="h-[160px]" />
          <Skeleton className="h-[160px]" />
          <Skeleton className="h-[160px]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricCard
            label={derived.kpi1.label}
            value={derived.kpi1.value}
            hint={derived.kpi1.hint}
            accent="violet"
          />
          <MetricCard
            label={derived.kpi2.label}
            value={derived.kpi2.value}
            hint={derived.kpi2.hint}
            accent="cyan"
          />
          <MetricCard
            label={derived.kpi3.label}
            value={derived.kpi3.value}
            hint={derived.kpi3.hint}
            accent="green"
          />
        </div>
      )}

      {/* main grid: recent activity + right widgets */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_0.9fr]">
        {/* Recent Activity */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-slate-100">Recent Activity</div>
              <Badge variant="violet">
                <Activity className="h-3.5 w-3.5" />
                Live
              </Badge>
            </div>

            <div className="mt-4 space-y-3">
              {(role === "END_USER" ? qUserTickets.data?.tickets : role === "IT_AGENT" ? qAgentQueue.data?.tickets : qAdminTickets.data?.tickets)?.slice(0, 3).map((t: any) => (
                <Link
                  key={t.id}
                  to={`/tickets/${t.id}`}
                  className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.06] transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5">
                      <Clock className="h-4 w-4 text-slate-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="truncate text-sm font-semibold text-slate-100">{t.subject}</div>
                        <div className="text-xs text-slate-500">
                          {new Date(t.updatedAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="mt-1 line-clamp-2 text-sm text-slate-400">
                        {t.description}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="default">Status: {t.status}</Badge>
                        {t.priority && <Badge variant="cyan">Priority: {t.priority}</Badge>}
                        {t.category && <Badge variant="violet">{t.category}</Badge>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              {/* empty state */}
              {role === "END_USER" && (qUserTickets.data?.tickets?.length ?? 0) === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-slate-400">
                  No activity yet. Create your first ticket.
                </div>
              )}

              {role === "IT_AGENT" && (qAgentQueue.data?.tickets?.length ?? 0) === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-slate-400">
                  No tickets assigned right now.
                </div>
              )}

              {role === "ADMIN" && (qAdminTickets.data?.tickets?.length ?? 0) === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-slate-400">
                  No tickets found in the system.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right widgets */}
        <div className="space-y-4">
          {/* Focus Session */}
          <Card>
            <CardContent className="p-6">
              <div className="text-lg font-semibold text-slate-100">Focus Session</div>
              <div className="mt-2 text-sm leading-6 text-slate-400">
                Deep work mode will mute non-priority distractions and keep you aligned with the next critical actions.
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Session length</span>
                  <Badge variant="violet">45 min</Badge>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-white/5">
                  <div className="h-2 w-[55%] rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 shadow-[0_0_18px_rgba(99,102,241,0.45)]" />
                </div>
              </div>

              <Button className="mt-4 w-full" variant="primary" disabled>
                Start Session (placeholder)
              </Button>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardContent className="p-6">
              <div className="text-lg font-semibold text-slate-100">Quick Links</div>
              <div className="mt-4 space-y-2">
                {role === "END_USER" && (
                  <>
                    <Link className="block rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300 hover:bg-white/[0.06]" to="/tickets">
                      My Tickets
                    </Link>
                    <Link className="block rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300 hover:bg-white/[0.06]" to="/tickets/new">
                      Create Ticket
                    </Link>
                  </>
                )}

                {role === "IT_AGENT" && (
                  <>
                    <div className="block rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                      Assigned Queue (via Dashboard)
                    </div>
                    <div className="block rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                      SLA/Heatmaps (future)
                    </div>
                  </>
                )}

                {role === "ADMIN" && (
                  <>
                    <Link className="block rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300 hover:bg-white/[0.06]" to="/admin">
                      System Logs / Audit
                    </Link>
                    <div className="block rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                      SLA Rules (future)
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}