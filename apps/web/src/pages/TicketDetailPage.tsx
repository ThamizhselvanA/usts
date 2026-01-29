import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../app/apiClient";
import { useAuthStore } from "../app/authStore";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { cn } from "../lib/utils";
import { Check, Clock, FileWarning, Link2, Shield, Sparkles } from "lucide-react";

function statusVariant(status: string) {
  switch (status) {
    case "OPEN":
      return "violet";
    case "IN_PROGRESS":
      return "cyan";
    case "ON_HOLD":
      return "amber";
    case "RESOLVED":
      return "green";
    case "CLOSED":
      return "default";
    case "REOPENED":
      return "red";
    default:
      return "default";
  }
}

function actionDotVariant(action: string) {
  const a = action.toUpperCase();
  if (a.includes("CREATED")) return "bg-violet-400";
  if (a.includes("STATUS")) return "bg-cyan-300";
  if (a.includes("SYNC_SUCCESS")) return "bg-emerald-400";
  if (a.includes("SYNC_FAILED")) return "bg-amber-400";
  if (a.includes("LOGIN") || a.includes("LOGOUT")) return "bg-slate-400";
  return "bg-slate-500";
}

export default function TicketDetailPage() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const role = useAuthStore((s) => s.user?.role);

  const q = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => apiFetch<any>(`/tickets/${id}`)
  });

  // agent update controls (only for IT_AGENT)
  const [newStatus, setNewStatus] = useState("IN_PROGRESS");
  const [note, setNote] = useState("");

  const ticket = q.data?.ticket;

  const externalSummary = useMemo(() => {
    const refs = ticket?.externalRefs || [];
    if (!refs.length) return { label: "Sync pending", variant: "amber" as const };
    return { label: refs.map((r: any) => `${r.system}:${r.externalId}`).join(" · "), variant: "green" as const };
  }, [ticket?.externalRefs]);

  async function updateAsAgent() {
    await apiFetch(`/tickets/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status: newStatus, note })
    });
    setNote("");
    await qc.invalidateQueries({ queryKey: ["ticket", id] });
  }

  if (q.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (q.error) {
    return (
      <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 text-sm text-rose-200">
        {(q.error as any).message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xl font-semibold tracking-tight text-slate-100">
              Ticket Lifecycle
            </div>
            <Badge variant="default">ID: {ticket.id.slice(0, 8).toUpperCase()}</Badge>
            <Badge variant={statusVariant(ticket.status) as any}>{ticket.status}</Badge>
          </div>

          <div className="mt-2 text-sm text-slate-400">
            One unified view. Backend references are abstracted from end users.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={externalSummary.variant}>
            <Link2 className="h-3.5 w-3.5" />
            {externalSummary.label}
          </Badge>

          {role === "ADMIN" && (
            <Badge variant="green">
              <Shield className="h-3.5 w-3.5" />
              Audit Mode
            </Badge>
          )}
        </div>
      </div>

      {/* Two-column layout like reference (main + right panel) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_0.85fr]">
        {/* MAIN */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-lg font-semibold text-slate-100">{ticket.subject}</div>
              <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                {ticket.description}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Badge variant="violet">{ticket.category || "General IT"}</Badge>
                <Badge variant="cyan">Priority: {ticket.priority || "—"}</Badge>
                <Badge variant="default">
                  Created: {new Date(ticket.createdAt).toLocaleString()}
                </Badge>
                <Badge variant="default">
                  Updated: {new Date(ticket.updatedAt).toLocaleString()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Lifecycle timeline (auditLogs) */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-slate-100">Lifecycle Timeline</div>
                <Badge variant="violet">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Assist (audited)
                </Badge>
              </div>

              <div className="mt-5 space-y-3">
                {(ticket.auditLogs || []).map((a: any) => (
                  <div
                    key={a.id}
                    className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1.5 grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-black/20">
                        <div className={cn("h-2.5 w-2.5 rounded-full", actionDotVariant(a.action))} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm font-semibold text-slate-100">{a.action}</div>
                          <div className="text-xs text-slate-500">
                            {new Date(a.createdAt).toLocaleString()}
                          </div>
                        </div>

                        {a.meta && (
                          <pre className="mt-2 overflow-auto rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-300">
                            {JSON.stringify(a.meta, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {(ticket.auditLogs || []).length === 0 && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-slate-400">
                    No audit events yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-4">
          {/* AI assignment logic / external status style card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-base font-semibold text-slate-100">System Notes</div>
                <Badge variant="default">
                  <Clock className="h-3.5 w-3.5" />
                  Live
                </Badge>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                  <Sparkles className="h-4 w-4 text-violet-200" />
                  Assistive Classification
                </div>
                <div className="mt-2 text-sm text-slate-400">
                  Category and priority are suggested by AI when available, with rule-based fallback. Core creation never fails.
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                  <Check className="h-4 w-4 text-emerald-300" />
                  External Sync
                </div>
                <div className="mt-2 text-sm text-slate-400">
                  {ticket.externalRefs?.length
                    ? "Linked to backend system reference(s)."
                    : "Backend system unavailable or pending. Ticket preserved locally; sync will retry."}
                </div>
              </div>

              {!ticket.externalRefs?.length && (
                <div className="mt-3 flex items-start gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-200">
                  <FileWarning className="mt-0.5 h-4 w-4" />
                  External reference not yet available (expected during outages / retries).
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agent controls ONLY if IT_AGENT */}
          {role === "IT_AGENT" && (
            <Card>
              <CardContent className="p-6">
                <div className="text-base font-semibold text-slate-100">Take Action</div>
                <div className="mt-2 text-sm text-slate-400">
                  Update ticket status (audited). Notes are stored in audit metadata.
                </div>

                <div className="mt-5 space-y-3">
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold tracking-[0.22em] text-slate-500">STATUS</div>
                    <select
                      className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-slate-100 outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      {["OPEN", "IN_PROGRESS", "ON_HOLD", "RESOLVED", "CLOSED", "REOPENED"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold tracking-[0.22em] text-slate-500">INTERNAL NOTE</div>
                    <Input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder='e.g. "Investigating logs from 22:00 CET"'
                    />
                  </div>

                  <Button variant="primary" className="w-full" onClick={updateAsAgent}>
                    Save Update
                  </Button>

                  <Button variant="secondary" className="w-full" disabled>
                    Escalate (future)
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin: audit-only hint */}
          {role === "ADMIN" && (
            <Card>
              <CardContent className="p-6">
                <div className="text-base font-semibold text-slate-100">Admin Audit</div>
                <div className="mt-2 text-sm text-slate-400">
                  Admins do not update tickets here (locked scope). Use this page to review audit trail and sync state.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}