import { Eyebrow } from "@/components/ui/eyebrow";
import { Check, X } from "lucide-react";

const COMPARISON = [
  {
    spreadsheets: "Numbers live in three places",
    pliex: "One place for sales, expenses and stock"
  },
  {
    spreadsheets: "You have to interpret the data yourself",
    pliex: "Pliex tells you what changed and why"
  },
  {
    spreadsheets: "Reordering relies on memory",
    pliex: "Low-stock alerts and reorder drafts"
  },
  {
    spreadsheets: "No clear next action on Monday morning",
    pliex: "One growth, one savings, one risk — every day"
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
            Most owners stitch together a notebook, a POS, a spreadsheet, and their memory.
            Pliex replaces all of that with one calm workspace.
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
