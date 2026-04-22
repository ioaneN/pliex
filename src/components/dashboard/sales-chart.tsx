import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from "@/components/ui/card";

interface SalesChartProps {
  weekdayTotals: Array<{ weekday: string; total: number }>;
}

const WIDTH = 600;
const HEIGHT = 170;

/**
 * Pure server-rendered SVG chart of last 7 weekdays.
 * No client JS required; values come from the snapshot.
 */
export function SalesChart({ weekdayTotals }: SalesChartProps) {
  const max = Math.max(...weekdayTotals.map((w) => w.total), 1);
  const stepX = WIDTH / Math.max(1, weekdayTotals.length - 1);
  const points = weekdayTotals.map((w, i) => {
    const x = i * stepX;
    const y = HEIGHT - 20 - (w.total / max) * (HEIGHT - 40);
    return { x, y, label: w.weekday.slice(0, 3) };
  });
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Sales — last 7 days</CardTitle>
          <CardSubtitle>By weekday, all categories</CardSubtitle>
        </div>
      </CardHeader>
      <CardBody>
        <div className="rounded-lg border border-line-soft bg-gradient-to-b from-[#fbf7ec] to-[#f4ecda] p-3">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="h-[170px] w-full">
            <defs>
              <linearGradient id="sales-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5b8bb8" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#5b8bb8" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#sales-area)" />
            <path
              d={linePath}
              fill="none"
              stroke="#1f4e79"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {points.map((p) => (
              <circle key={p.label} cx={p.x} cy={p.y} r={3.5} fill="#fff" stroke="#1f4e79" strokeWidth="2" />
            ))}
          </svg>
          <div className="mt-1 flex justify-between px-1.5 text-[11px] uppercase tracking-wider text-muted">
            {points.map((p) => (
              <span key={p.label}>{p.label}</span>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
