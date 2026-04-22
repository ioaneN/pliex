import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { DashboardPreview } from "@/components/landing/dashboard-preview";

export function HeroSection() {
  return (
    <section className="relative pb-12 pt-14">
      <div className="container grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <Eyebrow>AI for small food businesses</Eyebrow>
          <h1 className="heading-serif mt-4 text-[clamp(34px,4.6vw,56px)] leading-[1.04]">
            Stop managing tools.<br />
            <em className="font-medium not-italic text-navy-600">Start running your business.</em>
          </h1>
          <p className="mt-3 max-w-[520px] text-base text-ink-soft">
            Pliex is the AI operating layer for cafés, bakeries, and small food businesses.
            It brings your numbers, stock, and next actions into one calm workspace.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href="/sign-in">
              <Button size="lg">Continue with Google</Button>
            </Link>
            <Link href="#how">
              <Button variant="link" size="lg">See how it works →</Button>
            </Link>
          </div>
          <p className="mt-3 text-xs text-muted">No passwords. No complicated setup.</p>
        </div>

        <DashboardPreview />
      </div>
    </section>
  );
}
