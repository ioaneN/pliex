import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";

export default function TermsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-5 py-10">
      <Link href="/" className="w-fit">
        <BrandMark />
      </Link>
      <article className="rounded-2xl border border-line bg-white p-6 shadow-sm">
        <h1 className="font-serif text-3xl font-semibold text-navy-900">Terms of Service</h1>
        <p className="mt-4 text-sm leading-6 text-ink-soft">
          Pliex helps business owners review sales, expenses, inventory, recommendations, and POS sync data.
          You are responsible for the accuracy of information you enter or connect, for maintaining access to
          your Square and Stripe accounts, and for using Pliex in compliance with applicable laws.
        </p>
        <p className="mt-3 text-sm leading-6 text-ink-soft">
          Subscriptions are billed through Stripe. You can manage billing from the app settings. Pliex may suspend
          access when a subscription is canceled, unpaid, or otherwise inactive.
        </p>
        <p className="mt-3 text-sm leading-6 text-ink-soft">
          For production use, replace this starter policy with counsel-reviewed terms tailored to your company,
          jurisdiction, refund policy, and support commitments.
        </p>
      </article>
    </main>
  );
}
