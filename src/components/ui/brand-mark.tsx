import { cn } from "@/lib/utils/cn";

/**
 * The "Pliex" wordmark used in headers and the sidebar.
 * Matches the prototype's `.brand` pattern with the navy mark + serif name.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-serif font-bold text-navy-900", className)}>
      <span className="inline-grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-navy-700 to-navy-900 text-paper text-base font-bold shadow-sm">
        P
      </span>
      <span className="italic text-[18px] tracking-tight">Pliex</span>
    </span>
  );
}
