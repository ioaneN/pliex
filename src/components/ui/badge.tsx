import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeStyles = cva(
  "inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wider",
  {
    variants: {
      tone: {
        good: "bg-good-soft text-good",
        bad: "bg-bad-soft text-bad",
        warn: "bg-warn-soft text-warn",
        sky: "bg-sky-100 text-navy-700",
        brass: "bg-[rgba(201,163,90,0.25)] text-brass-dark",
        neutral: "bg-line-soft text-ink-soft"
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-1 text-[11px]"
      }
    },
    defaultVariants: { tone: "neutral", size: "md" }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeStyles> {}

export function Badge({ className, tone, size, ...props }: BadgeProps) {
  return <span className={cn(badgeStyles({ tone, size }), className)} {...props} />;
}
