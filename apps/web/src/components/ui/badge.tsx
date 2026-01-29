

import * as React from "react";
import { cn } from "../../lib/utils";

type Variant = "default" | "violet" | "cyan" | "green" | "red" | "amber";

const styles: Record<Variant, string> = {
  default: "border-white/10 bg-white/5 text-slate-200",
  violet: "border-violet-500/20 bg-violet-500/10 text-violet-200",
  cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
  green: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  amber: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  red: "border-rose-500/20 bg-rose-500/10 text-rose-200"
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium tracking-wide",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}