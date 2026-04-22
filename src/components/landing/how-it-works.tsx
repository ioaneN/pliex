import { Eyebrow } from "@/components/ui/eyebrow";

const STEPS = [
  {
    num: "01",
    title: "Record what's happening",
    body: "Connect your sales channel or log entries by hand. Pliex collects everything in one tidy place."
  },
  {
    num: "02",
    title: "Understand what it means",
    body: "Dashboards and AI explanations turn raw numbers into a story you can actually read."
  },
  {
    num: "03",
    title: "Know what to do next",
    body: "Get clear, friendly recommendations — and let Pliex handle the routine bits for you."
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
            Three simple steps. The same loop every day, getting smarter as it goes.
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
