import { BrandMark } from "@/components/ui/brand-mark";

export function MarketingFooter() {
  return (
    <footer className="border-t border-line bg-paper-deep py-10 text-ink-soft">
      <div className="container flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <BrandMark />
          <p className="mt-2 max-w-xs text-sm text-muted">
            The AI operating layer for cafés, bakeries, and small food businesses.
          </p>
        </div>
        <div className="text-xs text-muted">
          © {new Date().getFullYear()} Pliex. Built with care.
        </div>
      </div>
    </footer>
  );
}
