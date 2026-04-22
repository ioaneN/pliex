import { TrendingUp, BarChart3, Boxes, Sparkles, Lightbulb, Clock } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Track sales & expenses",
    body: "Log income and costs in seconds. Pliex auto-categorizes everything so your books stay tidy."
  },
  {
    icon: BarChart3,
    title: "Calm dashboards",
    body: "A real-time view of how the business is doing — easy to read at a glance over morning coffee."
  },
  {
    icon: Boxes,
    title: "Inventory awareness",
    body: "Know what's running low before customers do. Pliex watches stock and nudges you in time."
  },
  {
    icon: Sparkles,
    title: "Ask your AI assistant",
    body: "\"How were sales last week?\" \"What should I reorder?\" Get clear answers in plain language.",
    highlight: true
  },
  {
    icon: Lightbulb,
    title: "Smart recommendations",
    body: "Pliex spots patterns and suggests what to improve — pricing, hours, promotions, restocks."
  },
  {
    icon: Clock,
    title: "Automate routine work",
    body: "Receipts, reminders, weekly reports — done for you, so you can focus on customers."
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
            No more spreadsheets, sticky notes, or guessing. Pliex brings your numbers, your insights,
            and your AI assistant together.
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
