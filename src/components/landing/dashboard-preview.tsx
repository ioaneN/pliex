/**
 * Static decorative dashboard preview for the marketing hero.
 * No data, just a believable mock so the visitor sees the product feel.
 */
export function DashboardPreview() {
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-white to-[#f6efe1] shadow-lg">
        <div className="flex items-center gap-3 bg-gradient-to-b from-navy-800 to-navy-900 px-4 py-3 text-sky-200">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ef6a5a]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#e8c25c]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#6fcf97]" />
          </div>
          <span className="font-serif text-[12px] italic opacity-80">Pliex · Today</span>
        </div>

        <div className="p-5">
          <div className="mb-4 grid grid-cols-3 gap-3">
            <PreviewStat label="Sales" value="$4,820" trend="+12.4%" trendTone="good" />
            <PreviewStat label="Expenses" value="$1,210" trend="−3.1%" trendTone="bad" />
            <PreviewStat label="Profit" value="$3,610" trend="+18.0%" trendTone="good" />
          </div>

          <div className="mb-4 rounded-lg border border-line-soft bg-gradient-to-b from-[#fbf7ec] to-[#f4ecda] p-3">
            <svg viewBox="0 0 320 120" preserveAspectRatio="none" className="h-28 w-full">
              <defs>
                <linearGradient id="hero-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7fb3d5" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#7fb3d5" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,90 L40,72 L80,80 L120,55 L160,62 L200,38 L240,45 L280,22 L320,30 L320,120 L0,120 Z"
                fill="url(#hero-area)"
              />
              <path
                d="M0,90 L40,72 L80,80 L120,55 L160,62 L200,38 L240,45 L280,22 L320,30"
                fill="none"
                stroke="#1f4e79"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="flex gap-3 rounded-lg border border-dashed border-navy-500 bg-paper p-3">
            <div className="grid h-8 w-8 flex-none place-items-center rounded-full bg-gradient-to-br from-navy-700 to-navy-900 font-serif text-[11px] font-bold text-paper">
              AI
            </div>
            <p className="text-sm text-ink-soft">
              <strong className="text-navy-800">Tuesdays are your best day.</strong>{" "}
              Try a small Monday promo — could lift weekly sales ~9%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewStat({
  label,
  value,
  trend,
  trendTone
}: {
  label: string;
  value: string;
  trend: string;
  trendTone: "good" | "bad";
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-sky-200 bg-sky-100 px-3 py-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-navy-700">{label}</span>
      <span className="font-serif text-lg font-semibold text-navy-900">{value}</span>
      <span
        className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          trendTone === "good" ? "bg-good-soft text-good" : "bg-bad-soft text-bad"
        }`}
      >
        {trend}
      </span>
    </div>
  );
}
