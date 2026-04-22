import { Eyebrow } from "@/components/ui/eyebrow";

interface PageHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="heading-serif mt-2 text-[clamp(22px,2.6vw,32px)] leading-tight">
          {title}
        </h1>
        {subtitle && <p className="mt-1 max-w-[600px] text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
