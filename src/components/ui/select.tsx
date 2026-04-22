import * as React from "react";
import { cn } from "@/lib/utils/cn";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink",
      "focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/15",
      className
    )}
    {...props}
  />
));
Select.displayName = "Select";
