import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/ui/brand-mark";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GoogleSignInButton } from "@/components/landing/google-sign-in-button";
import { getCurrentUser } from "@/lib/supabase/get-current-user";

export default async function SignInPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 shadow-lg">
        <div className="flex justify-center">
          <Link href="/">
            <BrandMark />
          </Link>
        </div>

        <div className="mt-6 flex justify-center">
          <Eyebrow>Sign in</Eyebrow>
        </div>

        <h1 className="heading-serif mt-3 text-center text-3xl">
          Welcome back to <em className="font-medium not-italic text-navy-600">Pliex</em>
        </h1>
        <p className="mt-2 text-center text-sm text-ink-soft">
          One click in. No passwords. No complicated setup.
        </p>

        <div className="mt-6 flex justify-center">
          <Suspense fallback={null}>
            <GoogleSignInButton />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          By continuing you agree to our{" "}
          <Link href="/terms" className="font-medium text-navy-700 underline-offset-2 hover:underline">
            terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-medium text-navy-700 underline-offset-2 hover:underline">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
