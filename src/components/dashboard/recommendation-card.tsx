import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RecommendationType } from "@/types/database";

interface RecommendationCardProps {
  type: RecommendationType;
  title: string;
  description: string;
  impactLabel?: string | null;
  actionLabel?: string;
}

const TYPE_LABEL: Record<RecommendationType, string> = {
  growth: "Growth",
  savings: "Savings",
  operations: "Operations",
  risk: "Heads up"
};

const TYPE_TONE: Record<RecommendationType, "good" | "brass" | "sky" | "bad"> = {
  growth: "good",
  savings: "brass",
  operations: "sky",
  risk: "bad"
};

export function RecommendationCard({
  type,
  title,
  description,
  impactLabel,
  actionLabel = "Try it"
}: RecommendationCardProps) {
  return (
    <article className="flex flex-col gap-2 rounded-lg border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow">
      <Badge tone={TYPE_TONE[type]}>{TYPE_LABEL[type]}</Badge>
      <h3 className="font-serif text-[15px] font-semibold leading-snug text-navy-900">{title}</h3>
      <p className="text-[13px] leading-relaxed text-ink-soft">{description}</p>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-dashed border-line pt-2.5">
        <span className="text-[11px] text-muted">
          {impactLabel ? <strong className="text-[12px] text-navy-800">{impactLabel}</strong> : "—"}
        </span>
        <Button variant="ghost" size="sm">{actionLabel}</Button>
      </div>
    </article>
  );
}
