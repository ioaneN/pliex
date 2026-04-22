import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Small "label above the headline" tag with a brass dot.
 * Mirrors the prototype's `.eyebrow` pattern.
 */
export function Eyebrow({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-sky-300",
        "bg-sky-200/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-700",
        className
      )}
      {...props}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-brass shadow-[0_0_0_3px_rgba(201,163,90,0.25)]" />
      {children}
    </span>
  );
}
