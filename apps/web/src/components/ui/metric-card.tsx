

import { cn } from "../../lib/utils";

export function MetricCard({
  label,
  value,
  hint,
  accent = "violet"
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "violet" | "cyan" | "green";
}) {
  const ring =
    accent === "cyan"
      ? "shadow-glowCyan"
      : accent === "green"
        ? "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_18px_50px_-30px_rgba(52,211,153,0.55)]"
        : "shadow-glowViolet";

  const line =
    accent === "cyan"
      ? "from-cyan-400/40 to-violet-500/10"
      : accent === "green"
        ? "from-emerald-400/35 to-white/5"
        : "from-violet-500/40 to-cyan-400/10";

  return (
    <div className={cn("rounded-2xl border border-white/10 bg-black/15 p-5", ring)}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs text-slate-400">{label}</div>
        {hint && <div className="text-xs text-emerald-300">{hint}</div>}
      </div>

      <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-100">{value}</div>

      {/* tiny line placeholder */}
      <div className="mt-4 h-10 w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
        <div className={cn("h-full w-full bg-gradient-to-r", line)} />
      </div>
    </div>
  );
}