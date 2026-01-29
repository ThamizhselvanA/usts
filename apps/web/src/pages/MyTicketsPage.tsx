import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apiFetch } from "../app/apiClient";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Table, TBody, TD, TH, THead, TR } from "../components/ui/table";
import { Filter, Search, X } from "lucide-react";

type Ticket = {
  id: string;
  subject: string;
  status: string;
  priority?: string | null;
  category?: string | null;
  updatedAt: string;
};

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

function priorityVariant(priority?: string | null) {
  const p = (priority || "").toLowerCase();
  if (p.includes("critical")) return "red";
  if (p.includes("high")) return "amber";
  if (p.includes("medium")) return "violet";
  if (p.includes("low")) return "default";
  return "default";
}

export default function MyTicketsPage() {
  const q = useQuery({
    queryKey: ["tickets", "mine"],
    queryFn: () => apiFetch<{ tickets: Ticket[] }>("/tickets/mine")
  });

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | string>("ALL");
  const [priority, setPriority] = useState<"ALL" | string>("ALL");

  const tickets = q.data?.tickets ?? [];

  const filtered = useMemo(() => {
    const ql = query.trim().toLowerCase();
    return tickets.filter((t) => {
      const matchesQuery =
        !ql ||
        t.subject.toLowerCase().includes(ql) ||
        t.id.toLowerCase().includes(ql) ||
        (t.category || "").toLowerCase().includes(ql);

      const matchesStatus = status === "ALL" ? true : t.status === status;
      const matchesPriority = priority === "ALL" ? true : (t.priority || "").toLowerCase() === priority.toLowerCase();

      return matchesQuery && matchesStatus && matchesPriority;
    });
  }, [tickets, query, status, priority]);

  const clearFilters = () => {
    setQuery("");
    setStatus("ALL");
    setPriority("ALL");
  };

  return (
    <div className="space-y-6">
      {/* Header + filters row like reference */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-100">My Tickets</h1>
          <p className="mt-1 text-sm text-slate-400">Unified visibility across backend systems.</p>
        </div>

        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
          <div className="relative w-full md:w-[360px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              className="pl-10"
              placeholder="Search tickets…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <Button variant="secondary" className="justify-center md:justify-start" disabled>
            <Filter className="h-4 w-4" />
            Advanced Filter (stub)
          </Button>
        </div>
      </div>

      {/* Filter chips row */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="h-11 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-slate-100 outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="ALL">Priority: All</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>

              <select
                className="h-11 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-slate-100 outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="ALL">Status: All</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
                <option value="REOPENED">Reopened</option>
              </select>

              {(query || status !== "ALL" || priority !== "ALL") && (
                <button
                  onClick={clearFilters}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-slate-200 hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                  Clear All
                </button>
              )}
            </div>

            <div className="text-sm text-slate-400">
              {q.isLoading ? "Loading…" : `${filtered.length} result(s)`}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {q.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : q.error ? (
        <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 text-sm text-rose-200">
          {(q.error as any).message}
        </div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH className="w-[140px]">ID</TH>
              <TH>SUBJECT</TH>
              <TH className="w-[140px]">PRIORITY</TH>
              <TH className="w-[160px]">STATUS</TH>
              <TH className="w-[210px]">UPDATED</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((t) => (
              <TR key={t.id}>
                <TD className="text-slate-300">
                  <Link className="text-violet-300 hover:underline" to={`/tickets/${t.id}`}>
                    {t.id.slice(0, 8).toUpperCase()}
                  </Link>
                </TD>
                <TD>
                  <Link to={`/tickets/${t.id}`} className="block">
                    <div className="font-medium text-slate-100">{t.subject}</div>
                    <div className="mt-1 text-xs text-slate-500">{t.category || "General IT"}</div>
                  </Link>
                </TD>
                <TD>
                  <Badge variant={priorityVariant(t.priority) as any}>
                    {t.priority || "—"}
                  </Badge>
                </TD>
                <TD>
                  <Badge variant={statusVariant(t.status) as any}>
                    {t.status}
                  </Badge>
                </TD>
                <TD className="text-slate-400">{new Date(t.updatedAt).toLocaleString()}</TD>
              </TR>
            ))}

            {filtered.length === 0 && (
              <TR>
                <TD colSpan={5} className="py-10 text-center text-slate-400">
                  No tickets match your filters.
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      )}
    </div>
  );
}