import * as React from "react";
import { cn } from "@/lib/utils/cn";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink",
        "placeholder:text-muted",
        "focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/15",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
