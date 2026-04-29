import { Eyebrow } from "@/components/ui/eyebrow";
import { Check, X } from "lucide-react";

const COMPARISON = [
  {
    spreadsheets: "Numbers live in three places",
    pliex: "One workspace for sales, expenses, and stock"
  },
  {
    spreadsheets: "You interpret exports and gut feel alone",
    pliex: "Dashboards and AI read the same live snapshot"
  },
  {
    spreadsheets: "Hard to spot weak days or creeping costs",
    pliex: "Trends and categories surface before they hurt the month"
  },
  {
    spreadsheets: "No single place for “what should I do today?”",
    pliex: "One growth, one savings, one risk — grounded in your numbers"
  }
];

export function WhyPliex() {
  return (
    <section id="why" className="py-16">
      <div className="container">
        <div className="max-w-2xl">
          <Eyebrow>Why Pliex</Eyebrow>
          <h2 className="heading-serif mt-3 text-[clamp(26px,3.2vw,38px)]">
            Better than spreadsheets and <em className="font-medium not-italic text-navy-600">disconnected</em> tools.
          </h2>
          <p className="mt-2 text-base text-ink-soft">
            Most owners stitch together a POS, spreadsheets, and memory. Pliex is the calm layer on top —
            summarize, nudge, and coach without replacing how you take payments today.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          <div className="grid grid-cols-2 border-b border-line bg-paper-deep px-5 py-3 text-xs font-semibold uppercase tracking-widest text-muted">
            <span>Spreadsheets &amp; disconnected tools</span>
            <span>Pliex</span>
          </div>
          {COMPARISON.map((row) => (
            <div
              key={row.pliex}
              className="grid grid-cols-2 items-start gap-4 border-b border-line-soft px-5 py-4 last:border-b-0"
            >
              <div className="flex items-start gap-2 text-sm text-ink-soft">
                <X className="mt-0.5 h-4 w-4 flex-none text-bad" />
                <span>{row.spreadsheets}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-navy-900">
                <Check className="mt-0.5 h-4 w-4 flex-none text-good" />
                <span>{row.pliex}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
