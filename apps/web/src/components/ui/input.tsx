
import * as React from "react";
import { cn } from "../../lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none",
        "focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

