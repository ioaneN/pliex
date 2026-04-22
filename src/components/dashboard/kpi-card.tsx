import { cn } from "@/lib/utils/cn";

interface KpiCardProps {
  label: string;
  value: string;
  trendLabel?: string;
  trendDirection?: "up" | "down" | "flat";
  footnote?: string;
}

export function KpiCard({ label, value, trendLabel, trendDirection, footnote }: KpiCardProps) {
  return (
    <article className="flex flex-col gap-1 rounded-lg border border-line bg-gradient-to-b from-white to-[#faf3e3] p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-navy-700">
          {label}
        </span>
        {trendLabel && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-bold",
              trendDirection === "up" && "bg-good-soft text-good",
              trendDirection === "down" && "bg-bad-soft text-bad",
              trendDirection === "flat" && "bg-line-soft text-ink-soft"
            )}
          >
            {trendLabel}
          </span>
        )}
      </div>
      <div className="font-serif text-2xl font-semibold leading-tight text-navy-900">{value}</div>
      {footnote && <div className="text-[11px] text-muted">{footnote}</div>}
    </article>
  );
}
