import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="px-5 pb-16">
      <div className="container">
        <div className="rounded-2xl border border-navy-700 bg-gradient-to-br from-navy-800 to-navy-900 px-8 py-12 text-center text-sky-100 shadow-lg">
          <h2 className="font-serif text-[clamp(24px,3.2vw,36px)] font-semibold leading-tight text-white">
            Give your internet café a calmer morning brief.
          </h2>
          <p className="mt-2 text-sm text-sky-200">
            One Google sign-in and sample venue data so you can explore the dashboard and assistant right away. No credit card.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/sign-in">
              <Button size="lg">Continue with Google</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
