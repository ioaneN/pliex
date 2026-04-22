import { Sparkles } from "lucide-react";

interface SummaryCardProps {
  message: string;
}

export function SummaryCard({ message }: SummaryCardProps) {
  return (
    <article className="rounded-2xl border border-line bg-gradient-to-br from-white via-paper to-[#f4ecda] p-5 shadow-sm">
      <div className="flex items-center gap-2 text-navy-700">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-navy-700 to-navy-900 text-sky-200">
          <Sparkles className="h-4 w-4" />
        </div>
        <h2 className="font-serif text-base font-semibold text-navy-900">Today, in one paragraph</h2>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{message}</p>
    </article>
  );
}
