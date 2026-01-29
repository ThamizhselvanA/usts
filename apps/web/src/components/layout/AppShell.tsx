

import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, LayoutDashboard, Plus, ShieldCheck, Ticket, LogOut, Search } from "lucide-react";
import { useAuthStore } from "../../app/authStore";
import { apiFetch } from "../../app/apiClient";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";

function Brand() {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-400 shadow-glowViolet">
        <div className="h-4 w-4 rounded-md bg-black/40" />
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-wide text-slate-100">USTS</div>
        <div className="text-[11px] text-slate-500">Unified Smart Ticketing</div>
      </div>
    </div>
  );
}

function NavItem({
  to,
  icon: Icon,
  label
}: {
  to: string;
  icon: any;
  label: string;
}) {
  const loc = useLocation();
  const active = loc.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
        active
          ? "bg-gradient-to-r from-violet-600/20 to-cyan-400/10 text-slate-100 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
          : "text-slate-300 hover:bg-white/5 hover:text-slate-100"
      )}
    >
      <div
        className={cn(
          "grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5",
          active && "border-violet-500/30 bg-violet-500/10"
        )}
      >
        <Icon className={cn("h-4 w-4", active ? "text-violet-200" : "text-slate-300")} />
      </div>
      <span className="font-medium">{label}</span>
    </Link>
  );
}

function RolePill({ role }: { role?: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    END_USER: { label: "END USER", cls: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200" },
    IT_AGENT: { label: "IT AGENT", cls: "border-violet-500/20 bg-violet-500/10 text-violet-200" },
    ADMIN: { label: "ADMIN", cls: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" }
  };

  const m = role ? map[role] : undefined;
  if (!m) return null;

  return (
    <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.22em]", m.cls)}>
      {m.label}
    </span>
  );
}

export default function AppShell() {
  const { user, clear, refreshToken } = useAuthStore();
  const nav = useNavigate();

  async function logout() {
    try {
      if (refreshToken) {
        await apiFetch("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken })
        });
      }
    } finally {
      clear();
      nav("/login");
    }
  }

  return (
    <div className="min-h-screen bg-bg text-slate-200">
      {/* ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-200px] top-[-120px] h-[480px] w-[480px] rounded-full bg-violet-600/18 blur-3xl" />
        <div className="absolute right-[-220px] top-[120px] h-[520px] w-[520px] rounded-full bg-cyan-400/12 blur-3xl" />
      </div>

      <div className="mx-auto max-w-[1320px] px-4 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr]">
          {/* SIDEBAR */}
          <aside className="rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur">
            <div className="border-b border-white/10 p-3">
              <Brand />
              <div className="mt-3 flex items-center justify-between px-3">
                <RolePill role={user?.role} />
                <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.55)]" />
                  SYSTEM ACTIVE
                </Badge>
              </div>
            </div>

            <div className="p-3">
              <div className="px-3 pb-2 text-[11px] font-semibold tracking-[0.22em] text-slate-500">
                NAVIGATION
              </div>

              <div className="space-y-1">
                <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />

                {/* LOCKED ACCESS: END_USER only */}
                {user?.role === "END_USER" && (
                  <>
                    <NavItem to="/tickets" icon={Ticket} label="My Tickets" />
                    <NavItem to="/tickets/new" icon={Plus} label="Create Ticket" />
                  </>
                )}

                {/* LOCKED ACCESS: ADMIN only */}
                {user?.role === "ADMIN" && (
                  <NavItem to="/admin" icon={ShieldCheck} label="Admin / Audit" />
                )}
              </div>

              {/* user card */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-black/20" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-100">{user?.email}</div>
                    <div className="text-xs text-slate-500">Enterprise workspace</div>
                  </div>
                </div>

                <Button
                  onClick={logout}
                  variant="secondary"
                  className="mt-3 w-full justify-center"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </aside>

          {/* MAIN */}
          <div className="space-y-6">
            {/* TOPBAR */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-xl">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    className="pl-10"
                    placeholder="Search tickets, logs, or agents (Ctrl + K)"
                    disabled
                  />
                </div>

                <div className="flex items-center justify-between gap-3 md:justify-end">
                  <button
                    className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                    title="Notifications (placeholder)"
                  >
                    <Bell className="h-4 w-4" />
                  </button>

                  {user?.role === "END_USER" && (
                    <Button asChild size="md" variant="primary">
                      <Link to="/tickets/new">
                        <Plus className="h-4 w-4" />
                        New Ticket
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* PAGE CONTENT */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur md:p-7">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}