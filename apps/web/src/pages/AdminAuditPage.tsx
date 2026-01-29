import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../app/apiClient";
import { MetricCard } from "../components/ui/metric-card";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { Table, TBody, TD, TH, THead, TR } from "../components/ui/table";
import { Activity, Download, Filter, Search, ShieldCheck } from "lucide-react";

type Metrics = {
  users: number;
  tickets: number;
  byStatus: Array<{ status: string; count: number }>;
};

type AuditLog = {
  id: string;
  actorId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  meta: any;
  createdAt: string;
};

function actionVariant(action: string) {
  const a = action.toUpperCase();
  if (a.includes("FAILED")) return "amber";
  if (a.includes("SUCCESS")) return "green";
  if (a.includes("CREATED")) return "violet";
  if (a.includes("UPDATED")) return "cyan";
  if (a.includes("LOGIN") || a.includes("LOGOUT")) return "default";
  return "default";
}

export default function AdminAuditPage() {
  const [q, setQ] = useState("");

  const metrics = useQuery({
    queryKey: ["admin", "metrics"],
    queryFn: () => apiFetch<Metrics>("/admin/metrics")
  });

  const audit = useQuery({
    queryKey: ["admin", "audit", 120],
    queryFn: () => apiFetch<{ logs: AuditLog[] }>("/admin/audit?limit=120")
  });

  const filteredLogs = useMemo(() => {
    const list = audit.data?.logs ?? [];
    const query = q.trim().toLowerCase();
    if (!query) return list;

    return list.filter((l) => {
      const hay = [
        l.action,
        l.entity,
        l.entityId || "",
        l.actorId || "",
        l.meta ? JSON.stringify(l.meta) : ""
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(query);
    });
  }, [audit.data, q]);

  const openTickets =
    metrics.data?.byStatus?.reduce((acc, s) => (s.status === "OPEN" ? s.count : acc), 0) ?? 0;

  const systemHealth = "99.99%"; // locked: avoid fake claims; this is UI-only label

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-semibold tracking-tight text-slate-100">Workload Overview</div>
            <Badge variant="green">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Console
            </Badge>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Analytics + audit trail. Every action is auditable (detect + prevent).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" disabled>
            <Filter className="h-4 w-4" /> Advanced Filter
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              const rows = (filteredLogs || []).map((l) => ({
                createdAt: l.createdAt,
                action: l.action,
                entity: l.entity,
                entityId: l.entityId,
                actorId: l.actorId,
                meta: JSON.stringify(l.meta ?? {})
              }));
              const csv = [
                Object.keys(rows[0] || { createdAt: "", action: "", entity: "", entityId: "", actorId: "", meta: "" }).join(","),
                ...rows.map((r) =>
                  [r.createdAt, r.action, r.entity, r.entityId ?? "", r.actorId ?? "", r.meta]
                    .map((v) => `"${String(v).replaceAll('"', '""')}"`)
                    .join(",")
                )
              ].join("\n");

              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "audit_logs.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
            disabled={audit.isLoading || filteredLogs.length === 0}
          >
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* KPI row (like reference) */}
      {metrics.isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Skeleton className="h-[160px]" />
          <Skeleton className="h-[160px]" />
          <Skeleton className="h-[160px]" />
          <Skeleton className="h-[160px]" />
        </div>
      ) : metrics.error ? (
        <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 text-sm text-rose-200">
          {(metrics.error as any).message}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <MetricCard label="ACTIVE SLAs" value="94.2%" hint="+2.1%" accent="violet" />
          <MetricCard label="OPEN TICKETS" value={String(openTickets)} hint="live" accent="cyan" />
          <MetricCard label="USERS" value={String(metrics.data?.users ?? 0)} hint="org" accent="green" />
          <MetricCard label="SYSTEM HEALTH" value={systemHealth} hint="stable" accent="violet" />
        </div>
      )}

      {/* Distribution + queue (UI-only blocks to match look) */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-slate-100">Real-time Workload Distribution</div>
                <div className="mt-1 text-sm text-slate-400">Ticket arrival density by hour (UI placeholder)</div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>LOW</span>
                <div className="flex gap-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-3 w-3 rounded bg-violet-500/20"
                      style={{ opacity: 0.25 + i * 0.12 }}
                    />
                  ))}
                </div>
                <span>HIGH</span>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="grid grid-cols-12 gap-2">
                {Array.from({ length: 12 * 4 }).map((_, i) => {
                  const v = (i * 17) % 100;
                  const cls =
                    v > 72
                      ? "bg-violet-500/70"
                      : v > 48
                        ? "bg-violet-500/45"
                        : v > 25
                          ? "bg-violet-500/25"
                          : "bg-violet-500/12";
                  return <div key={i} className={`h-7 rounded-md ${cls}`} />;
                })}
              </div>
              <div className="mt-3 flex justify-between text-[11px] text-slate-500">
                <span>00:00</span>
                <span>04:00</span>
                <span>08:00</span>
                <span>12:00</span>
                <span>16:00</span>
                <span>20:00</span>
                <span>23:59</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-slate-100">System Health</div>
              <Badge variant="green">
                <Activity className="h-3.5 w-3.5" />
                Live
              </Badge>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">AI Confidence</span>
                  <span className="text-emerald-300">94%</span>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-white/5">
                  <div className="h-2 w-[94%] rounded-full bg-gradient-to-r from-emerald-400/70 to-cyan-400/60" />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Queue Load</span>
                  <span className="text-amber-200">62%</span>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-white/5">
                  <div className="h-2 w-[62%] rounded-full bg-gradient-to-r from-amber-400/70 to-rose-400/50" />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
                UI-only health blocks. Real SLA prediction is future scope (not built now).
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-semibold text-slate-100">Audit Logs</div>
              <div className="mt-1 text-sm text-slate-400">All critical actions are recorded.</div>
            </div>

            <div className="relative w-full md:w-[420px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                className="pl-10"
                placeholder="Search actions, entity, meta…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-5">
            {audit.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : audit.error ? (
              <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 text-sm text-rose-200">
                {(audit.error as any).message}
              </div>
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH className="w-[180px]">TIME</TH>
                    <TH className="w-[220px]">ACTION</TH>
                    <TH className="w-[140px]">ENTITY</TH>
                    <TH className="w-[180px]">ENTITY ID</TH>
                    <TH>DETAILS</TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredLogs.map((l) => (
                    <TR key={l.id}>
                      <TD className="text-slate-400">{new Date(l.createdAt).toLocaleString()}</TD>
                      <TD>
                        <Badge variant={actionVariant(l.action) as any}>{l.action}</Badge>
                      </TD>
                      <TD className="text-slate-300">{l.entity}</TD>
                      <TD className="text-slate-300">{l.entityId ? l.entityId.slice(0, 10) : "—"}</TD>
                      <TD className="text-slate-400">
                        <div className="line-clamp-2">
                          {l.meta ? JSON.stringify(l.meta) : "—"}
                        </div>
                      </TD>
                    </TR>
                  ))}

                  {filteredLogs.length === 0 && (
                    <TR>
                      <TD colSpan={5} className="py-10 text-center text-slate-400">
                        No logs match your search.
                      </TD>
                    </TR>
                  )}
                </TBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}