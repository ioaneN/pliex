import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/ui/brand-mark";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
      <BrandMark />
      <h1 className="font-serif text-3xl font-semibold text-navy-900">Page not found</h1>
      <p className="max-w-sm text-sm text-ink-soft">
        That page doesn&apos;t exist (or you don&apos;t have access to it).
      </p>
      <Link href="/">
        <Button>Back to Pliex</Button>
      </Link>
    </main>
  );
}
