import { Eyebrow } from "@/components/ui/eyebrow";

const STEPS = [
  {
    num: "01",
    title: "Set up in minutes",
    body: "Sign in with Google, name your venue, and start from sample data tuned for an internet café — no long forms."
  },
  {
    num: "02",
    title: "Keep the numbers current",
    body: "Log sales and expenses as you go (or connect optional POS sync from Integrations when you’re ready)."
  },
  {
    num: "03",
    title: "Ask, decide, repeat",
    body: "Dashboards and the AI assistant read the same snapshot — so advice matches what you see on screen."
  }
];

export function HowItWorks() {
  return (
    <section
      id="how"
      className="border-y border-line-soft bg-gradient-to-b from-transparent via-sky-200/40 to-transparent py-16"
    >
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center">
            <Eyebrow>How it works</Eyebrow>
          </div>
          <h2 className="heading-serif mt-3 text-[clamp(26px,3.2vw,38px)]">
            Record. Understand. <em className="font-medium not-italic text-navy-600">Act.</em>
          </h2>
          <p className="mt-2 text-base text-ink-soft">
            Three simple steps for any internet café owner who wants clarity without another heavy system.
          </p>
        </div>

        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.num}
              className="rounded-lg border border-line bg-white p-5 shadow-sm"
            >
              <span className="font-serif text-2xl italic font-semibold text-brass">{step.num}</span>
              <h3 className="mt-1 font-serif text-lg font-semibold text-navy-900">{step.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
