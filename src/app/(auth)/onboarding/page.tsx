import { redirect } from "next/navigation";
import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";
import { Eyebrow } from "@/components/ui/eyebrow";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { getOwnedBusiness } from "@/lib/services/businesses";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const business = await getOwnedBusiness();
  if (business) redirect("/dashboard");

  const ownerFirstName = (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? null;

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-xl rounded-2xl border border-line bg-white p-8 shadow-lg">
        <div className="flex justify-center">
          <Link href="/">
            <BrandMark />
          </Link>
        </div>

        <div className="mt-6 flex justify-center">
          <Eyebrow>Set up your workspace</Eyebrow>
        </div>

        <h1 className="heading-serif mt-3 text-center text-3xl">
          {ownerFirstName ? `Welcome, ${ownerFirstName}.` : "Welcome to Pliex."}
        </h1>
        <p className="mt-2 text-center text-sm text-ink-soft">
          A few quick details so Pliex understands your business.
        </p>

        <div className="mt-8">
          <OnboardingForm />
        </div>
      </div>
    </main>
  );
}
