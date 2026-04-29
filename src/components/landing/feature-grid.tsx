import { TrendingUp, BarChart3, Boxes, Sparkles, Lightbulb, Clock } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Sales & sessions in one view",
    body: "Log time blocks, retail, and add-ons in one place so daily revenue isn’t scattered across tabs and notebooks."
  },
  {
    icon: BarChart3,
    title: "Calm dashboards",
    body: "Yesterday, this week, and trends at a glance — built for owners who open early and need answers fast."
  },
  {
    icon: Boxes,
    title: "Snack bar & supplies",
    body: "Track what’s on the shelf and what’s running low before the evening rush empties the fridge."
  },
  {
    icon: Sparkles,
    title: "Ask your AI assistant",
    body: "\"How were sales this week?\" \"What should I reorder?\" Short, practical answers tied to the numbers in Pliex.",
    highlight: true
  },
  {
    icon: Lightbulb,
    title: "Smart recommendations",
    body: "Quiet weekday? Rising power bill? Pliex surfaces growth, savings, and risk ideas you can act on the same day."
  },
  {
    icon: Clock,
    title: "Less admin noise",
    body: "Built-in automations (expense categorization and reorder drafts) cut admin work so you spend more time with customers."
  }
];

export function FeatureGrid() {
  return (
    <section id="what" className="py-16">
      <div className="container">
        <div className="max-w-2xl">
          <Eyebrow>What it does</Eyebrow>
          <h2 className="heading-serif mt-3 text-[clamp(26px,3.2vw,38px)]">
            One place to <em className="font-medium not-italic text-navy-600">run</em> the business.
          </h2>
          <p className="mt-2 text-base text-ink-soft">
            Built for LAN lounges, gaming cafés, and school labs that sell time, snacks, and gear — without
            forcing you to change how you already run the desk.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  highlight?: boolean;
}

function FeatureCard({ icon: Icon, title, body, highlight }: FeatureCardProps) {
  return (
    <article
      className={
        highlight
          ? "rounded-lg border border-navy-700 bg-gradient-to-b from-navy-800 to-navy-900 p-5 text-sky-100 shadow-sm"
          : "rounded-lg border border-line bg-gradient-to-b from-white to-[#faf3e3] p-5 shadow-sm transition hover:-translate-y-1 hover:border-sky-300"
      }
    >
      <div
        className={
          highlight
            ? "mb-3 grid h-9 w-9 place-items-center rounded-md border border-white/20 bg-white/10 text-sky-200"
            : "mb-3 grid h-9 w-9 place-items-center rounded-md border border-sky-200 bg-sky-100 text-navy-700"
        }
      >
        <Icon className="h-5 w-5" />
      </div>
      <h3
        className={
          highlight
            ? "font-serif text-lg font-semibold text-white"
            : "font-serif text-lg font-semibold text-navy-900"
        }
      >
        {title}
      </h3>
      <p className={highlight ? "mt-1.5 text-sm text-sky-200" : "mt-1.5 text-sm text-ink-soft"}>
        {body}
      </p>
    </article>
  );
}
