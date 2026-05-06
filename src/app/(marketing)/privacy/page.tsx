import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-5 py-10">
      <Link href="/" className="w-fit">
        <BrandMark />
      </Link>
      <article className="rounded-2xl border border-line bg-white p-6 shadow-sm">
        <h1 className="font-serif text-3xl font-semibold text-navy-900">Privacy Policy</h1>
        <p className="mt-4 text-sm leading-6 text-ink-soft">
          Pliex stores account, workspace, billing, and operational data needed to provide dashboards,
          recommendations, AI assistant answers, and Square POS sync. Google sign-in is handled by Supabase Auth,
          subscription billing by Stripe, and POS authorization by Square OAuth.
        </p>
        <p className="mt-3 text-sm leading-6 text-ink-soft">
          Square access and refresh tokens are encrypted before storage. We do not show stored tokens back to the
          browser. Customer data is scoped by workspace ownership and protected with Supabase row-level security.
        </p>
        <p className="mt-3 text-sm leading-6 text-ink-soft">
          For launch, replace this starter policy with a counsel-reviewed privacy policy covering retention,
          subprocessors, data export, deletion, and regional compliance requirements.
        </p>
      </article>
    </main>
  );
}
